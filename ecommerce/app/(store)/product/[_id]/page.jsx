"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Check, ChevronRight, Heart, Loader2, Minus, PackageX, Plus, Share2 } from "lucide-react";

import Toast from "@/ui/Toast";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import RelatedItems from "@/components/card/RelatedItems";
import ProductGallery from "@/components/product/ProductGallery";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { fetchProduct, isNotFound } from "@/lib/productsApi";
import { formatCedis } from "@/lib/formatCurrency";
import { DEFAULT_SIZE, getUnitPrice, hasDiscount } from "@/lib/pricing";
import { categoryLabel, findStoreCategory, shopCategoryHref } from "@/lib/categories";
import { useWishlistToggle } from "@/lib/useWishlistToggle";

const LOW_STOCK = 5;
const MAX_PER_ADD = 99;

function DetailsSkeleton() {
  return (
    <div className="page-x py-6 lg:py-10" aria-busy="true" aria-label="Loading product">
      <div className="skeleton mb-6 h-3.5 w-48" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div className="skeleton -mx-4 aspect-3/4 sm:-mx-6 md:mx-0" />
        <div className="space-y-4 pt-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-4/5" />
          <div className="skeleton h-6 w-32" />
          <div className="skeleton mt-8 h-3 w-16" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-12" />
            ))}
          </div>
          <div className="skeleton mt-6 h-12 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const productRouteId = Array.isArray(params._id) ? params._id[0] : params._id;

  const [reloadKey, setReloadKey] = useState(0);
  // Result of the last finished request: status is ready | notFound | error
  const [loaded, setLoaded] = useState({ key: null, status: null, product: null });

  const requestKey = `${productRouteId}#${reloadKey}`;
  const status = loaded.key === requestKey ? loaded.status : "loading";
  const productData = loaded.product;

  const [quantity, setQuantity] = useState(1);
  const wishlist = useWishlistToggle(productRouteId);
  const isLiked = wishlist.saved;
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState(null); // "cart" | "buy" | null
  const [justAdded, setJustAdded] = useState(false);

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const showSuccess = (message) => setToast({ message, success: true, error: false });
  const showError = (message) => setToast({ message, success: false, error: true });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);

  const { addItems, handleAddToCart } = useEcommerce();

  // Current delivery fee from the admin settings (display only; checkout recalculates)
  const [deliveryFee, setDeliveryFee] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store-info", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.store?.deliveryFee != null) setDeliveryFee(data.store.deliveryFee);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  /* ---------------------------------------------------------
     Load the product from MongoDB via /api/products/[id]
  --------------------------------------------------------- */
  useEffect(() => {
    if (!productRouteId) return;

    const controller = new AbortController();

    fetchProduct(productRouteId, { signal: controller.signal })
      .then((product) => {
        setLoaded({ key: requestKey, status: "ready", product });
        // No automatic selection. Sized products require a choice.
        setSelectedSize("");
        setSizeError(false);
        setQuantity(1);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        if (!isNotFound(error)) console.error(error);
        setLoaded({
          key: requestKey,
          status: isNotFound(error) ? "notFound" : "error",
          product: null,
        });
      });

    return () => controller.abort();
  }, [productRouteId, requestKey]);

  if (status === "loading") return <DetailsSkeleton />;

  if (status === "notFound") {
    return (
      <EmptyState
        icon={PackageX}
        title="We couldn't find this product"
        message="It may have been removed from the store, or the link may be incomplete."
        actionLabel="Browse the shop"
        actionHref="/shop"
      />
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        title="This product didn't load."
        message="Please check your connection and try again."
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  const { _id: productId, name, price, category, subCategory, images = [], description } = productData;

  const stock = Number(productData.stock) || 0;
  const productSizes = (productData.sizes || []).filter(Boolean);
  const hasSizes = productSizes.length > 0;

  // Products without sizes use "default" automatically.
  const sizeKey = hasSizes ? selectedSize : DEFAULT_SIZE;

  // Stock is per product, so count this product across every size in the cart
  const inCartTotal = Object.values(addItems?.[productId] || {}).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0,
  );
  const inCartThisSize = addItems?.[productId]?.[sizeKey] || 0;
  const canAddMore = Math.max(0, Math.min(stock - inCartTotal, MAX_PER_ADD));

  const outOfStock = stock <= 0;
  const unitPrice = getUnitPrice(productData);
  const onSale = hasDiscount(productData);
  const discount = onSale ? Math.round(((price - unitPrice) / price) * 100) : 0;
  const storeCategory = findStoreCategory(category);
  const categoryHref = storeCategory ? shopCategoryHref(storeCategory.slug) : `/shop?category=${encodeURIComponent(category)}`;

  const addSelectedToCart = async (intent) => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      return false;
    }
    if (canAddMore === 0) {
      showError(outOfStock ? "This product is sold out." : "You already have all available stock in your bag.");
      return false;
    }

    setAdding(intent);
    const result = await handleAddToCart(productId, sizeKey, Math.min(quantity, canAddMore));
    setAdding(null);

    if (result.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    if (!result.success) {
      showError(result.message);
      return false;
    }

    setQuantity(1);
    return true;
  };

  const handleAddToBag = async () => {
    if (await addSelectedToCart("cart")) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
      showSuccess(`${name}${hasSizes ? ` (size ${selectedSize})` : ""} is in your bag.`);
    }
  };

  const handleBuyNow = async () => {
    if (await addSelectedToCart("buy")) router.push("/shopping-cart");
  };

  const handleWishlist = async () => {
    const result = await wishlist.toggle();
    if (!result || result.pending) return;
    if (result.success) showSuccess(result.message);
    else showError(result.message);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url: window.location.href });
      } catch {
        // Share sheet was closed.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess("Link copied.");
    } catch {
      showError("Couldn't copy the link.");
    }
  };

  const stockStatus = outOfStock
    ? { text: "Sold out", dot: "bg-danger", tone: "text-danger" }
    : stock <= LOW_STOCK
      ? { text: `Only ${stock} left`, dot: "bg-warning", tone: "text-warning" }
      : { text: "In stock", dot: "bg-success", tone: "text-success" };

  const badge = outOfStock ? (
    <span className="badge bg-ink text-cream">Sold out</span>
  ) : onSale ? (
    <span className="badge bg-paper text-rose-deep">{discount}% off</span>
  ) : null;

  return (
    <>
      <div className="page-x pt-4 pb-16 sm:pt-6 lg:pt-8 lg:pb-24">
        <nav aria-label="Breadcrumb" className="mb-4 hidden md:block lg:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            <li>
              <Link href="/" className="hover:text-ink">Home</Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link href="/shop" className="hover:text-ink">Shop</Link>
            </li>
            {category && (
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <Link href={categoryHref} className="hover:text-ink">{categoryLabel(category)}</Link>
              </li>
            )}
            <li className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span aria-current="page" className="truncate text-ink">{name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10 lg:gap-16">
          <ProductGallery images={images} name={name} badge={badge} />

          {/* Information and purchase */}
          <div className="md:sticky md:top-24 md:self-start lg:top-28">
            {category && (
              <Link href={categoryHref} className="eyebrow hover:text-ink">
                {categoryLabel(category)}
                {subCategory && ` · ${subCategory}`}
              </Link>
            )}
            <h1 className="heading-display mt-2 text-[34px] sm:text-4xl lg:text-[44px]">{name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={`text-2xl ${onSale ? "text-rose-deep" : "text-ink"}`}>{formatCedis(unitPrice)}</span>
              {onSale && (
                <>
                  <span className="text-base text-muted line-through">
                    <span className="sr-only">Was </span>
                    {formatCedis(price)}
                  </span>
                  <span className="text-[13px] text-rose-deep">Save {formatCedis(price - unitPrice)}</span>
                </>
              )}
            </div>

            <p className={`mt-3 flex items-center gap-2 text-[14px] ${stockStatus.tone}`}>
              <span className={`h-2 w-2 rounded-full ${stockStatus.dot}`} aria-hidden="true" />
              {stockStatus.text}
            </p>

            {/* Size */}
            {hasSizes && (
              <fieldset className="mt-8">
                <legend className="mb-3 text-[13px] font-medium tracking-[0.08em] uppercase">
                  Size
                  {selectedSize && (
                    <span className="ml-2 font-normal tracking-normal normal-case text-muted">{selectedSize}</span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
                  {productSizes.map((size) => {
                    const selected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        disabled={outOfStock}
                        className={`flex h-12 min-w-12 items-center justify-center rounded-[3px] border px-3 text-[15px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink hover:border-ink"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p role="alert" className="field-error">
                    Please choose a size.
                  </p>
                )}
              </fieldset>
            )}

            {/* Quantity, add to bag, save */}
            <div className="mt-8 flex gap-3">
              {!outOfStock && (
                <div className="flex h-12 shrink-0 items-center rounded-[3px] border border-line bg-white" role="group" aria-label="Quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-full w-11 items-center justify-center text-ink disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-[15px]" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(Math.max(canAddMore, 1), q + 1))}
                    disabled={quantity >= canAddMore}
                    className="flex h-full w-11 items-center justify-center text-ink disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToBag}
                disabled={outOfStock || Boolean(adding)}
                className="btn-primary min-h-12 flex-1"
              >
                {adding === "cart" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : justAdded ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : null}
                {outOfStock ? "Sold out" : adding === "cart" ? "Adding" : justAdded ? "Added" : "Add to bag"}
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                disabled={wishlist.pending}
                aria-pressed={isLiked}
                aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] border border-line bg-white text-ink transition-colors hover:border-ink disabled:opacity-50"
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-rose-deep text-rose-deep" : ""}`} strokeWidth={1.6} />
              </button>
            </div>

            {!outOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={Boolean(adding)}
                className="btn-secondary mt-3 min-h-12 w-full"
              >
                {adding === "buy" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Buy now
              </button>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
              <span>{inCartThisSize > 0 ? `${inCartThisSize} already in your bag` : " "}</span>
              <button type="button" onClick={handleShare} className="inline-flex min-h-9 items-center gap-1.5 hover:text-ink">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share
              </button>
            </div>

            {/* Details */}
            <div className="mt-8 divide-y divide-line border-y border-line">
              <section className="py-5">
                <h2 className="text-[13px] font-medium tracking-[0.08em] uppercase">Details</h2>
                <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">
                  {description || "No description has been added for this product yet."}
                </p>
              </section>
              <section className="py-5">
                <h2 className="text-[13px] font-medium tracking-[0.08em] uppercase">Delivery & payment</h2>
                <ul className="mt-3 space-y-1.5 text-[15px] text-ink-soft">
                  <li>
                    {deliveryFee == null
                      ? "One flat delivery fee per order, shown in your cart."
                      : deliveryFee > 0
                        ? `Flat ${formatCedis(deliveryFee)} delivery on every order.`
                        : "Free delivery on every order."}
                  </li>
                  <li>Pay by card, Mobile Money or cash on delivery.</li>
                  <li>Follow your order&apos;s progress from My Orders.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-16 sm:pb-24">
        <RelatedItems category={category} currentProductId={productId} />
      </div>

      <div className="toast-region">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Loader2, Plus, X } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import ProductImage from "@/components/card/ProductImage";
import { formatCedis } from "@/lib/formatCurrency";
import { categoryLabel } from "@/lib/categories";
import { DEFAULT_SIZE, getUnitPrice, hasDiscount } from "@/lib/pricing";
import { useWishlistToggle } from "@/lib/useWishlistToggle";
import { messageVariants } from "@/lib/storeMotion";
import Bump from "@/components/motion/Bump";

const LOW_STOCK = 5;

/*
  Catalogue card. product comes from /api/products (MongoDB); stock is
  re-checked by the server on add and at checkout.

  - Quick add: one tap for products without sizes; sized products open
    a row of size buttons on the card instead of leaving the page.
  - The heart is always visible on touch screens and on hover/focus
    with a mouse (or whenever the product is saved).

  showActions:      keep the heart visible (e.g. on the wishlist page)
  soldOutLabel:     wording for a product that can't be bought right now
  onWishlistResult: receives the API result of a heart click (else errors show inline)
  priority:         load the image eagerly (first row above the fold)
*/
export default function ProductCard({
  product,
  showActions = false,
  soldOutLabel = "Sold out",
  onWishlistResult,
  priority = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { handleAddToCart } = useEcommerce();
  const wishlist = useWishlistToggle(product._id);

  const { _id, name, price, images = [] } = product;
  const sizes = (product.sizes || []).filter(Boolean);
  const stock = Number(product.stock) || 0;

  const [pickingSize, setPickingSize] = useState(false);
  const [addingSize, setAddingSize] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type, message }

  const unitPrice = getUnitPrice(product);
  const onSale = hasDiscount(product);
  const discount = onSale ? Math.round(((price - unitPrice) / price) * 100) : 0;
  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= LOW_STOCK;
  const hasSizes = sizes.length > 0;
  const href = `/product/${_id}`;
  const saved = wishlist.saved;

  const flash = (next) => {
    setFeedback(next);
    setTimeout(() => setFeedback(null), 2600);
  };

  const addToBag = async (size) => {
    if (soldOut || addingSize) return;

    setAddingSize(size);
    const result = await handleAddToCart(_id, size);
    setAddingSize(null);

    if (result.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (result.success) {
      setPickingSize(false);
      flash({ type: "success", message: hasSizes ? `Size ${size} added to your bag` : "Added to your bag" });
    } else {
      flash({ type: "error", message: result.message });
    }
  };

  const handleQuickAdd = () => {
    if (hasSizes) setPickingSize((open) => !open);
    else addToBag(DEFAULT_SIZE);
  };

  const handleWishlist = async () => {
    const result = await wishlist.toggle();
    if (!result || result.pending) return;
    if (onWishlistResult) onWishlistResult(result);
    else if (!result.success) flash({ type: "error", message: result.message });
  };

  const sizeButtons = (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Choose a size for ${name}`}>
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => addToBag(size)}
          disabled={Boolean(addingSize)}
          className="flex h-9 min-w-9 items-center justify-center rounded-full border border-line bg-white px-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {addingSize === size ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Adding" /> : size}
        </button>
      ))}
    </div>
  );

  return (
    <article className="group relative flex flex-col transition-transform duration-500 ease-out-soft lg:hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-4/5 overflow-hidden rounded-card bg-sand transition-shadow duration-500 lg:group-hover:shadow-lift">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <ProductImage
            src={images[0]}
            alt=""
            priority={priority}
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className={`object-cover transition-[opacity,transform] duration-700 ease-out-soft group-hover:scale-[1.045] ${
              images[1] ? "group-hover:opacity-0" : ""
            } ${soldOut ? "opacity-70 grayscale-35" : ""}`}
          />
          {images[1] && (
            <ProductImage
              src={images[1]}
              alt=""
              sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
              className="scale-[1.02] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out-soft group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          {/* Faint shade at the foot of the photo so the controls always read */}
          <span
            className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-espresso/18 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
        </Link>

        {/* Status label */}
        {soldOut ? (
          <span className="badge absolute top-3 left-3 bg-ink/85 text-paper backdrop-blur-md">{soldOutLabel}</span>
        ) : onSale ? (
          <span className="badge absolute top-3 left-3 bg-terracotta-deep text-white">{discount}% off</span>
        ) : (
          product.newArrival && <span className="badge glass-light absolute top-3 left-3 shadow-none">New</span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlist.pending}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          className={`glass-light absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full shadow-none transition-[opacity,transform,background-color] duration-300 hover:scale-105 hover:bg-paper focus-visible:opacity-100 disabled:opacity-60 ${
            saved || showActions ? "opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
          }`}
        >
          <Bump value={saved} scale={1.15}>
            <Heart
              className={`h-4.5 w-4.5 transition-colors ${saved ? "fill-terracotta-deep text-terracotta-deep" : ""}`}
              strokeWidth={1.6}
            />
          </Bump>
        </button>

        {/* Touch screens: add button on the photo, opposite the heart (44px target) */}
        {!soldOut && (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={Boolean(addingSize)}
            aria-expanded={hasSizes ? pickingSize : undefined}
            aria-label={hasSizes ? `Choose a size for ${name}` : `Add ${name} to bag`}
            className="glass-light absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-paper disabled:opacity-60 lg:hidden"
          >
            {addingSize ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : pickingSize ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4.5 w-4.5" strokeWidth={1.6} />
            )}
          </button>
        )}

        {/* Desktop quick add, revealed on hover or keyboard focus */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-[opacity,transform] duration-300 ease-out-soft group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            {pickingSize ? (
              <div className="glass-light rounded-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">Select size</span>
                  <button
                    type="button"
                    onClick={() => setPickingSize(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-cream"
                    aria-label="Close sizes"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {sizeButtons}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={Boolean(addingSize)}
                className="btn-sm glass-light flex w-full items-center justify-center gap-2 rounded-full text-[11.5px] font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-paper disabled:opacity-60"
              >
                {addingSize ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                )}
                {addingSize ? "Adding" : hasSizes ? "Quick add" : "Add to bag"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details: full card width on every screen */}
      <div className="flex min-w-0 flex-1 flex-col pt-3 sm:pt-3.5">
        {product.category && (
          <p className="mb-1 truncate text-[10.5px] font-semibold tracking-[0.16em] text-muted uppercase">
            {categoryLabel(product.category)}
          </p>
        )}
        {/* Two lines are always reserved so prices line up across a row */}
        <h3 className="line-clamp-2 min-h-[2.75em] text-[13.5px] leading-snug wrap-break-word text-ink-soft sm:text-[15px]">
          <Link href={href} className="decoration-terracotta/50 underline-offset-4 transition-colors hover:text-ink hover:underline">
            {name}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[15px] sm:text-[16px]">
          <span className={`font-semibold tabular-nums ${onSale ? "text-terracotta-deep" : "text-ink"}`}>
            {formatCedis(unitPrice)}
          </span>
          {onSale && (
            <span className="text-[12px] text-muted line-through sm:text-[13px]">
              <span className="sr-only">was </span>
              {formatCedis(price)}
            </span>
          )}
        </p>

        {pickingSize && (
          <div className="mt-2.5 lg:hidden">
            <p className="mb-1.5 text-[12px] text-muted">Choose a size</p>
            {sizeButtons}
          </div>
        )}

        {lowStock && !feedback && (
          <p className="mt-1 text-[12px] text-warning">Only {stock} left</p>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.p
              key={feedback.message}
              variants={messageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              role={feedback.type === "error" ? "alert" : "status"}
              className={`mt-1.5 flex items-center gap-1.5 text-[12px] ${
                feedback.type === "error" ? "text-danger" : "text-success"
              }`}
            >
              {feedback.type === "success" && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {feedback.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

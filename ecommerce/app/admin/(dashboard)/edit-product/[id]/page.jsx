"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, PackageX, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import Badge, { StockBadge } from "@/components/admin/ui/Badge";
import { Card, CardHeader, CARD, CARD_X } from "@/components/admin/ui/Card";
import { ConfirmDialog } from "@/components/admin/ui/Dialog";
import { useToast } from "@/components/admin/ui/Toast";
import { EmptyState, ErrorState, Skeleton, friendlyError } from "@/components/admin/ui/States";
import ProductForm from "@/components/admin/products/ProductForm";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

function EditSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
      <div className="space-y-4">
        {[5, 3, 2].map((rows, i) => (
          <div key={i} className={`${CARD} space-y-4 p-5`}>
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: rows }, (_, j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </div>
        ))}
      </div>
      <div className={`${CARD} space-y-3 p-5`}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  );
}

// Side card: what's live now, and the destructive action kept apart from saving
function ProductInfo({ product, onDelete }) {
  return (
    <Card aria-labelledby="product-info-title">
      <CardHeader id="product-info-title" title="Live in the store" border />
      <dl className={`${CARD_X} space-y-2.5 py-4 text-[13px]`}>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Stock</dt>
          <dd>
            <StockBadge stock={product.stock} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Added</dt>
          <dd className="text-ink">{formatDate(product.createdAt)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Last saved</dt>
          <dd className="text-right text-ink">{formatDateTime(product.updatedAt)}</dd>
        </div>
      </dl>
      <div className={`${CARD_X} flex flex-col gap-2 border-t border-line py-3`}>
        <Button
          variant="ghost"
          icon={ExternalLink}
          href={`/product/${product._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full justify-start"
        >
          View in store
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
        <Button
          variant="ghost"
          icon={Trash2}
          onClick={onDelete}
          className="w-full justify-start text-danger hover:bg-danger-tint hover:text-danger"
        >
          Delete product
        </Button>
      </div>
    </Card>
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing | error
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* Load the product */
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { signal: controller.signal });
        if (res.status === 401 || res.status === 403) {
          router.replace("/admin/admin-login");
          return;
        }
        if (res.status === 404) {
          setStatus("missing");
          return;
        }
        if (!res.ok) throw Object.assign(new Error("Failed to load product"), { status: res.status });

        const data = await res.json();
        setProduct(data.product);
        setStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error(error);
        setLoadError(friendlyError(error, "This product couldn't be loaded."));
        setStatus("error");
      }
    };

    load();
    return () => controller.abort();
  }, [id, reloadKey, router]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  /* Save */
  const updateProduct = async (formData) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "PATCH", body: formData });

    if (res.status === 401 || res.status === 403) {
      router.replace("/admin/admin-login");
      return null;
    }

    const data = await res.json().catch(() => null);

    if (res.status === 404) {
      throw new Error("This product no longer exists. It may have been deleted in another tab.");
    }
    if (!res.ok) {
      const error = new Error(
        res.status === 400
          ? "Some details need fixing before the changes can be saved."
          : "Your changes couldn't be saved. They're still here, so you can try again.",
      );
      if (res.status === 400 && data?.errors) error.fieldErrors = data.errors;
      throw error;
    }

    setProduct(data.product);
    toast.success(`Changes to "${data.product.name}" were saved.`);
    return data.product;
  };

  /* Delete */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch("/api/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401 || res.status === 403) {
        router.replace("/admin/admin-login");
        return;
      }
      if (!res.ok) throw Object.assign(new Error("Failed to delete product"), { status: res.status });

      toast.success(`"${product.name}" was deleted.`);
      router.replace("/admin/list");
    } catch (error) {
      console.error(error);
      toast.error(`Couldn't delete "${product.name}". Please try again.`);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const backButton = (
    <Button variant="ghost" icon={ArrowLeft} href="/admin/list">
      Back to products
    </Button>
  );

  if (status === "missing") {
    return (
      <>
        <PageHeader title="Edit product" actions={backButton} />
        <Card>
          <EmptyState
            icon={PackageX}
            title="Product not found"
            message="It may have been deleted, or the link is out of date."
            action={
              <Button variant="primary" href="/admin/list">
                Go to products
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <PageHeader title="Edit product" actions={backButton} />
        <Card>
          <ErrorState title="Couldn't load this product" message={loadError} onRetry={retry} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            Edit product
            <Badge tone="info" dot={false}>
              Editing
            </Badge>
          </span>
        }
        description={
          product ? (
            <>
              Changes go live when you save <span className="font-medium text-ink">{product.name}</span>.
            </>
          ) : (
            "Loading product details..."
          )
        }
        actions={backButton}
      />

      {status === "loading" || !product ? (
        <EditSkeleton />
      ) : (
        <ProductForm
          key={product._id}
          mode="edit"
          product={product}
          onSubmit={updateProduct}
          aside={<ProductInfo product={product} onDelete={() => setConfirmDelete(true)} />}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        message={
          product && (
            <p>
              <span className="font-medium text-ink">{product.name}</span> will be permanently removed from your
              catalog and the storefront. Any unsaved edits are lost too. This can&apos;t be undone.
            </p>
          )
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

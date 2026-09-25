"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Package, Pencil, Trash2 } from "lucide-react";
import { formatCedis } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { stockLevel, LOW_STOCK_THRESHOLD } from "@/lib/orderStatus";
import Badge, { StockBadge } from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import { Modal } from "@/components/admin/ui/Dialog";
import { fadeVariants } from "@/lib/adminMotion";

const hasOffer = (p) => Number(p.offerPrice) > 0 && Number(p.offerPrice) < Number(p.price);

// Label / value row in the details list
function Detail({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium text-ink">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{children}</h3>;
}

// Photos: one large image, thumbnails underneath to switch between them
function Gallery({ product }) {
  const photos = (product.images || []).filter(Boolean);
  const [active, setActive] = useState(0);
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div>
      <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-ink/8 bg-paper">
        {current ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={current}
              className="absolute inset-0"
              variants={fadeVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Image
                src={current}
                alt={`${product.name}, photo ${active + 1} of ${photos.length}`}
                fill
                sizes="(max-width: 767px) 90vw, 320px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
            <Package className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs">No photos</span>
          </div>
        )}
        {photos.length > 1 && (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-ink tabular-nums backdrop-blur-md">
            {active + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Choose a photo">
          {photos.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={`relative block aspect-4/5 w-full overflow-hidden rounded-lg border bg-paper transition-[opacity,border-color] duration-200 ${
                  i === active ? "border-ink ring-1 ring-ink" : "border-ink/8 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/*
  Everything stored for one product, from the admin list data
  (/api/list returns full documents, so nothing extra is fetched).
  Actions reuse the list page's own: edit route, storefront page, and
  the delete confirmation.
*/
export default function ProductDetailsModal({ product, onClose, onDelete }) {
  const open = Boolean(product);
  const id = product?._id || product?.id;

  const onSale = product ? hasOffer(product) : false;
  const unitPrice = onSale ? Number(product.offerPrice) : Number(product?.price);
  const discount = onSale ? Math.round((1 - Number(product.offerPrice) / Number(product.price)) * 100) : 0;
  const sizes = (product?.sizes || []).filter(Boolean);
  const level = product ? stockLevel(product.stock) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={product?.name || "Product"}
      description={product && `Added ${formatDate(product.createdAt)}`}
      footer={
        product && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="danger-outline"
              icon={Trash2}
              onClick={() => onDelete(product)}
              aria-label={`Delete ${product.name}`}
            >
              Delete
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                icon={ExternalLink}
                href={`/product/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${product.name} in the store (opens in a new tab)`}
              >
                View in store
              </Button>
              <Button variant="primary" icon={Pencil} href={`/admin/edit-product/${id}`}>
                Edit product
              </Button>
            </div>
          </div>
        )
      }
    >
      {product && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-6">
          <Gallery key={id} product={product} />

          <div className="min-w-0 space-y-5">
            {/* Category, flags, price, stock */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                {product.category}
                {product.subCategory && ` · ${product.subCategory}`}
              </p>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
                <span className={`text-2xl font-semibold ${onSale ? "text-terracotta-deep" : "text-ink"}`}>
                  {formatCedis(unitPrice)}
                </span>
                {onSale && (
                  <>
                    <span className="text-sm text-muted line-through">
                      <span className="sr-only">was </span>
                      {formatCedis(product.price)}
                    </span>
                    <Badge tone="accent" dot={false}>
                      -{discount}% · save {formatCedis(Number(product.price) - unitPrice)}
                    </Badge>
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <StockBadge stock={product.stock} />
                {product.bestseller && (
                  <Badge tone="accent" dot={false}>
                    Bestseller
                  </Badge>
                )}
                {product.newArrival && <Badge dot={false}>New arrival</Badge>}
              </div>
              {level === "low" && (
                <p className="mt-2 text-[13px] text-warning">
                  At or below the low-stock level of {LOW_STOCK_THRESHOLD}.
                </p>
              )}
            </div>

            {/* Sizes */}
            <div>
              <SectionTitle>Sizes</SectionTitle>
              {sizes.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {sizes.map((size) => (
                    <li
                      key={size}
                      className="flex h-8 min-w-8 items-center justify-center rounded-full border border-ink/12 bg-white px-3 text-[13px] font-medium text-ink"
                    >
                      {size}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted">One size (no size options).</p>
              )}
            </div>

            {/* Description */}
            <div>
              <SectionTitle>Description</SectionTitle>
              <p className="text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                {product.description || "No description."}
              </p>
            </div>

            {/* Record details */}
            <div>
              <SectionTitle>Details</SectionTitle>
              <dl className="divide-y divide-ink/8 rounded-xl border border-ink/8 bg-white/70 px-4">
                <Detail label="Regular price">{formatCedis(product.price)}</Detail>
                <Detail label="Offer price">{onSale ? formatCedis(product.offerPrice) : "None"}</Detail>
                <Detail label="Stock">
                  <span className="tabular-nums">{Number(product.stock) || 0} units</span>
                </Detail>
                <Detail label="Photos">{(product.images || []).filter(Boolean).length}</Detail>
                <Detail label="Added">{formatDate(product.createdAt)}</Detail>
                <Detail label="Last updated">{formatDate(product.updatedAt)}</Detail>
                <Detail label="Product ID">
                  <span className="font-mono text-[12px] break-all">{id}</span>
                </Detail>
              </dl>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

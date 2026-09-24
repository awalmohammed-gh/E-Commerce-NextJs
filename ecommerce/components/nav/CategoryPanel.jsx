"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryList from "@/components/nav/CategoryList";
import editorialImage from "@/data/images/aboutStory.jpg";

const DISCOVER = [
  { label: "Shop all", href: "/shop" },
  { label: "New in", href: "/shop?sort=newest" },
  { label: "On sale", href: "/shop?onSale=true" },
];

// Desktop "Categories" dropdown: categories, quick routes and one image
export default function CategoryPanel({ onNavigate }) {
  return (
    <div className="page-x grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-10 py-9">
      <div>
        <p className="eyebrow mb-4">Categories</p>
        <CategoryList onNavigate={onNavigate} />
      </div>

      <div className="border-l border-line pl-10">
        <p className="eyebrow mb-4">Discover</p>
        <ul>
          {DISCOVER.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-10 items-center text-[15px] text-ink-soft decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/shop"
        onClick={onNavigate}
        className="group relative block aspect-16/10 overflow-hidden rounded-sm bg-sand"
      >
        <Image
          src={editorialImage}
          alt=""
          fill
          sizes="360px"
          className="object-cover object-[50%_25%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/60 to-transparent px-4 pt-10 pb-3.5 text-[13px] font-medium tracking-[0.08em] text-cream uppercase">
          The full collection
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}

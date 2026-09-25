"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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
    <div className="page-x grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-10 py-10">
      <div>
        <p className="eyebrow mb-4">Categories</p>
        <CategoryList onNavigate={onNavigate} />
      </div>

      <div className="border-l border-line pl-10">
        <p className="eyebrow mb-4">Discover</p>
        <ul className="space-y-1">
          {DISCOVER.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="group flex min-h-11 items-center gap-2 font-display text-[26px] leading-none text-ink transition-colors hover:text-terracotta-deep"
              >
                {item.label}
                <ArrowUpRight
                  className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/shop"
        onClick={onNavigate}
        className="group relative block aspect-16/10 overflow-hidden rounded-card bg-sand"
      >
        <Image
          src={editorialImage}
          alt=""
          fill
          sizes="360px"
          className="object-cover object-[50%_25%] transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-0 bottom-0 h-2/3 scrim-bottom" aria-hidden="true" />
        <span className="glass-dark absolute right-3 bottom-3 left-3 flex min-h-11 items-center justify-between rounded-full pr-2 pl-4 text-[11.5px] font-semibold tracking-[0.14em] uppercase">
          The full collection
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </div>
  );
}

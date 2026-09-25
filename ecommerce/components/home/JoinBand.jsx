"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { Reveal } from "@/components/motion/Reveal";

/*
  Stay-in-touch band. There is no separate newsletter: news of arrivals
  and offers is the "Promotions" preference in account settings, so
  guests are invited to join and members are sent to that setting.
*/
export default function JoinBand() {
  const { isLoggedIn, authChecked } = useEcommerce();
  const member = authChecked && isLoggedIn;

  return (
    <section className="page-x" aria-labelledby="join-title">
      <Reveal variant="fadeScale" className="on-dark bg-terracotta-band relative overflow-hidden rounded-plate px-6 py-12 text-paper sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        {/* Fine concentric rings, a quiet texture in the corner */}
        <span
          className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full border border-white/10 shadow-[0_0_0_48px_rgba(255,255,255,0.03),0_0_0_96px_rgba(255,255,255,0.02)]"
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-paper/70 uppercase">The Eleoka list</p>
            <h2 id="join-title" className="mt-4 font-display text-[40px] leading-[1] font-medium sm:text-[56px]">
              Be the first to know.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/75 sm:text-base">
              {member
                ? "Turn on Promotions in your settings to hear about new arrivals, restocks and offers."
                : "Create a free account, then choose Promotions to hear about new arrivals, restocks and offers."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
            {member ? (
              <Link href="/account/settings" className="btn-light group">
                Email preferences
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn-light group">
                  Create an account
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link href="/login" className="btn-glass">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

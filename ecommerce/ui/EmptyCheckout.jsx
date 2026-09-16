"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EmptyCheckout({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}) {
  const ActionWrapper = onAction ? "button" : Link;

  const actionProps = onAction
    ? { type: "button", onClick: onAction }
    : { href: actionHref };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap");
        .font-editorial {
          font-family: "Cormorant Garamond", serif;
        }
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

      <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#F7F4EE] flex items-center justify-center">
            {Icon && <Icon className="w-7 h-7 text-[#8A6A52]" />}
          </div>

          <div>
            <h2 className="font-editorial font-semibold text-3xl sm:text-4xl text-[#1C1A17] leading-tight">
              {title}
            </h2>
            <p className="font-utility text-sm text-[#8A6A52] mt-3">
              {message}
            </p>
          </div>

          {actionLabel && (
            <ActionWrapper
              {...actionProps}
              className="mt-2 inline-flex items-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-7 py-3.5 rounded-full font-utility text-sm font-medium hover:bg-[#332F29] transition-colors"
            >
              {actionLabel}
              <ArrowRight className="w-4 h-4" />
            </ActionWrapper>
          )}
        </div>
      </div>
    </>
  );
}

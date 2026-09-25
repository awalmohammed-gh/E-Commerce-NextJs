import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/common/Logo";
import sideImage from "@/data/images/aboutStory.jpg";

/*
  Frame for sign-in and sign-up: the form on the left, a brand
  photograph on the right from lg (with a frosted caption). Phones get
  a short strip of the same photograph above the form.
*/
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-ivory-fade lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/shop"
            className="group inline-flex min-h-10 items-center gap-2 text-[12px] font-semibold tracking-[0.12em] text-ink-soft uppercase transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
            Shop
          </Link>
        </div>

        {/* Phones and tablets: a strip of the brand photograph */}
        <div className="relative mt-6 h-36 overflow-hidden rounded-card bg-sand sm:h-44 lg:hidden">
          <Image
            src={sideImage}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 1023px) 100vw, 1px"
            className="object-cover object-[50%_18%]"
          />
          <span className="scrim-bottom absolute inset-0 opacity-70" aria-hidden="true" />
          <span className="glass-dark absolute bottom-3 left-3 rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-[0.2em] uppercase">
            Eleoka · Accra
          </span>
        </div>

        <div className="flex flex-1 items-start justify-center pt-10 pb-10 sm:items-center sm:py-12">
          {/* A short CSS sequence: heading, words, form, footer. The form is
              one block, so it is usable almost at once. */}
          <div className="w-full max-w-sm">
            <p className="kicker mb-4 animate-rise">Your account</p>
            <h1 className="heading-display animate-rise text-[44px] [animation-delay:60ms] sm:text-[56px]">{title}</h1>
            {subtitle && (
              <p className="mt-3 animate-rise text-[15px] leading-relaxed text-muted [animation-delay:120ms]">{subtitle}</p>
            )}
            <div className="mt-9 animate-rise [animation-delay:180ms]">{children}</div>
            {footer && (
              <div className="mt-9 animate-rise border-t border-line pt-6 text-[15px] text-ink-soft [animation-delay:240ms]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden p-4 lg:block">
        <div className="relative h-full animate-[settle-in_700ms_var(--ease-out-soft)_both] overflow-hidden rounded-plate bg-sand">
          <Image
            src={sideImage}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="52vw"
            className="object-cover object-[50%_20%]"
          />
          <span className="scrim-bottom absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true" />
          <figure className="glass-dark on-dark absolute right-8 bottom-8 left-8 max-w-md rounded-card p-6">
            <blockquote className="font-display text-[28px] leading-[1.1] text-paper">
              Clothes made for the woman you are.
            </blockquote>
            <figcaption className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-paper/70 uppercase">
              Eleoka · Born in Accra
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}

// Labelled input with an inline error, shared by the auth forms
export function AuthField({ id, label, error, hint, trailing, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          className={`field ${trailing ? "pr-12" : ""}`}
          {...inputProps}
        />
        {trailing && <div className="absolute top-1/2 right-1 -translate-y-1/2">{trailing}</div>}
      </div>
      {(error || hint) && (
        <p id={`${id}-note`} className={error ? "field-error" : "field-hint"}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

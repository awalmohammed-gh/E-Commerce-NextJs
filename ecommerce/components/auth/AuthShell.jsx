import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import sideImage from "@/data/images/aboutStory.jpg";

/*
  Frame for sign-in and sign-up: the form on the left, a brand
  photograph on the right from lg. Phones get the form alone.
*/
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/shop" className="link text-[14px] text-ink-soft">
            Continue shopping
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center pt-12 pb-10 sm:items-center sm:py-12">
          <div className="w-full max-w-sm">
            <h1 className="heading-display text-4xl sm:text-[44px]">{title}</h1>
            {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-line pt-6 text-[15px] text-ink-soft">{footer}</div>}
          </div>
        </div>
      </div>

      <div className="relative hidden bg-sand lg:block">
        <Image
          src={sideImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="50vw"
          className="object-cover object-[50%_20%]"
        />
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

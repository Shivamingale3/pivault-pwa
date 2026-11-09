import { AppLogo } from "@/components/modules/brand/app-logo";

interface BrandHeroProps {
  /** Mono caption beside the logo, e.g. "Self-hosted on your Pi". */
  eyebrow: string;
}

/** The dark brand card from the sign-in artboard. */
export function BrandHero({ eyebrow }: BrandHeroProps) {
  return (
    <div className="relative isolate flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl bg-hero p-5.5 text-hero-foreground">
      <span
        aria-hidden="true"
        className="absolute -top-18 -right-22 -z-10 size-75 rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-hero-foreground)/16%),transparent_72%)]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-48 -left-18 -z-10 size-85 rounded-full border border-hero-foreground/14"
      />
      <div className="flex items-center gap-3">
        <AppLogo surface="dark" decorative className="size-11" />
        <span className="font-mono text-[0.59375rem] font-bold tracking-[0.22em] text-hero-foreground/50 uppercase">
          {eyebrow}
        </span>
      </div>
      <h1 className="mt-3.5 text-[2.125rem] leading-none font-extrabold tracking-[-0.04em]">
        PiVault
      </h1>
    </div>
  );
}

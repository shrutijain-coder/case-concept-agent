import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

/*
 * Interface primitives.
 *
 * Deliberately plain: 1px borders, radii capped at 8px, no gradients, no
 * glass, no transform animations, colour/opacity transitions only. Closer to
 * GitHub or Linear than to a generated dashboard.
 */

// --- buttons ----------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md border font-medium " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-brand bg-brand text-white hover:bg-brand-hover hover:border-brand-hover",
  secondary:
    "border-line-strong bg-surface text-ink hover:bg-sunken",
  ghost: "border-transparent bg-transparent text-ink-muted hover:bg-sunken hover:text-ink",
  danger: "border-line-strong bg-surface text-danger hover:bg-sunken",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

// --- surfaces ---------------------------------------------------------------

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-lg border border-line bg-surface", className)}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  action,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
      <div className="min-w-0">
        <h2>{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PanelBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

// --- form fields ------------------------------------------------------------

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("block text-[13px] font-medium text-ink", className)}
      {...props}
    />
  );
}

const CONTROL =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink " +
  "placeholder:text-ink-subtle transition-colors duration-150 " +
  "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand " +
  "disabled:bg-sunken disabled:text-ink-subtle";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-9 py-0", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "min-h-24 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(CONTROL, "h-9 py-0", className)} {...props}>
      {children}
    </select>
  );
}

/** Label above the field, hint under it. No floating labels. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {hint ? <p className="text-[13px] text-ink-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

// --- feedback ---------------------------------------------------------------

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: "neutral" | "brand" | "caution" }) {
  const tones = {
    neutral: "border-line-strong bg-sunken text-ink-muted",
    brand: "border-brand/30 bg-brand-tint text-brand",
    caution: "border-caution/30 bg-caution-tint text-caution",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "caution";
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-line-strong bg-sunken text-ink-muted",
    caution: "border-caution/35 bg-caution-tint text-caution",
  } as const;
  return (
    <div className={cn("rounded-md border px-4 py-3 text-[13px]", tones[tone], className)}>
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <div className="[&_p]:mb-2 [&_p:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-[13px] text-danger">
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {children ? (
        <p className="mx-auto mt-1 max-w-md text-[13px] text-ink-muted">{children}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Key/value row used in case metadata and record summaries. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 text-[13px]">
      <dt className="w-40 shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-ink">{children}</dd>
    </div>
  );
}

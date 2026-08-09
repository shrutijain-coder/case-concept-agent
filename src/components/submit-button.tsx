"use client";

import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui";

/**
 * Submit control that reports pending state. Used for anything that hits the
 * network, so the interface never looks inert while work is happening.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
  name,
  value,
  disabled,
  formAction,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  /**
   * Overrides the enclosing form's action for this button only — the
   * supported way to have two server actions share one form. Never nest a
   * second <form> to get a second action; nested forms are invalid HTML and
   * browsers resolve the submit target inconsistently.
   */
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      formAction={formAction}
      className={buttonClass(variant, size, className)}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

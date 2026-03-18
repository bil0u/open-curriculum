import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from "react-aria-components";

import { type ButtonVariant, variantClasses } from "./button-variants";

export interface ButtonProps extends AriaButtonProps {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-default outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed";

  const staticClasses = [base, variantClasses[variant], sizeClasses[size]]
    .join(" ");

  return (
    <AriaButton
      {...props}
      className={(renderProps) => {
        const extra =
          typeof className === "function"
            ? className(renderProps)
            : className;
        return [staticClasses, extra].filter(Boolean).join(" ");
      }}
    />
  );
}

import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from "react-aria-components";

import { type ButtonVariant, variantClasses } from "./button-variants";

export interface IconButtonProps extends AriaButtonProps {
  "aria-label": string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const sizeClasses: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "w-7 h-7 text-sm",
  md: "w-9 h-9 text-base",
  lg: "w-11 h-11 text-lg",
};

export function IconButton({
  variant = "ghost",
  size = "md",
  className,
  children,
  ...props
}: IconButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md transition-colors cursor-default outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed";

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
    >
      {children}
    </AriaButton>
  );
}

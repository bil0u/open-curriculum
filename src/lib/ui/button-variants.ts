export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 data-[pressed]:bg-blue-800 data-[focused]:outline-2 data-[focused]:outline-blue-500 data-[focused]:outline-offset-2",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 data-[pressed]:bg-gray-100 data-[focused]:outline-2 data-[focused]:outline-blue-500 data-[focused]:outline-offset-2",
  danger:
    "bg-red-600 text-white hover:bg-red-700 data-[pressed]:bg-red-800 data-[focused]:outline-2 data-[focused]:outline-red-500 data-[focused]:outline-offset-2",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 data-[pressed]:bg-gray-200 data-[focused]:outline-2 data-[focused]:outline-blue-500 data-[focused]:outline-offset-2",
};

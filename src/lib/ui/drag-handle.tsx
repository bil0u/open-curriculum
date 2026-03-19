import { GripVerticalIcon } from "./icons";

interface DragHandleProps {
  ref?: (element: Element | null) => void;
  "aria-label": string;
}

export function DragHandle({ ref, "aria-label": ariaLabel }: DragHandleProps) {
  return (
    <button
      ref={(el) => ref?.(el)}
      type="button"
      aria-label={ariaLabel}
      className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600 touch-none"
    >
      <GripVerticalIcon />
    </button>
  );
}

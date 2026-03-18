import {
  Button,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectValue,
  Text,
} from "react-aria-components";

export interface SelectItem {
  id: string;
  label: string;
}

export interface SelectProps extends Omit<
  AriaSelectProps<SelectItem>,
  "children"
> {
  label: string;
  items: SelectItem[];
  placeholder?: string;
  selectedKey?: Key | null;
  onSelectionChange?: (key: Key | null) => void;
  isRequired?: boolean;
  description?: string;
  errorMessage?: string;
}

export function Select({
  label,
  items,
  placeholder = "Select an option",
  description,
  errorMessage,
  ...props
}: SelectProps) {
  return (
    <AriaSelect
      {...props}
      isInvalid={!!errorMessage || props.isInvalid}
      className="flex flex-col gap-1"
    >
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {props.isRequired && (
          <span className="ms-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Button className="flex items-center justify-between gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white transition-colors outline-none cursor-default hover:bg-gray-50 data-[pressed]:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-0 data-[invalid]:border-red-500 data-[disabled]:bg-gray-50 data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed">
        <SelectValue className="flex-1 text-start data-[placeholder]:text-gray-400">
          {({ selectedText, defaultChildren }) =>
            selectedText ?? placeholder ?? defaultChildren
          }
        </SelectValue>
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-gray-500 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>
      {description && !errorMessage && (
        <Text slot="description" className="text-xs text-gray-500">
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text slot="errorMessage" className="text-xs text-red-600">
          {errorMessage}
        </Text>
      )}
      <Popover className="w-(--trigger-width) rounded-md border border-gray-200 bg-white shadow-lg outline-none overflow-auto max-h-60">
        <ListBox items={items} className="p-1 outline-none">
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              className="px-3 py-2 text-sm text-gray-900 rounded cursor-default outline-none data-[focused]:bg-blue-50 data-[focused]:text-blue-700 data-[selected]:font-medium data-[disabled]:text-gray-400"
            >
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

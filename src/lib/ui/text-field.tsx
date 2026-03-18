import {
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

export interface TextFieldProps extends AriaTextFieldProps {
  label: string;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
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
      <Input
        placeholder={placeholder}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-0 data-[invalid]:border-red-500 data-[disabled]:bg-gray-50 data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed"
      />
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
    </AriaTextField>
  );
}

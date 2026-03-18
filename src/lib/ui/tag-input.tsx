import { useRef, useState } from "react";

export interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  isRequired?: boolean;
  description?: string;
  errorMessage?: string;
  isDisabled?: boolean;
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder,
  isRequired,
  description,
  errorMessage,
  isDisabled,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInputValue("");
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function handleContainerClick() {
    inputRef.current?.focus();
  }

  const containerClasses = [
    "flex flex-wrap gap-1.5 rounded-md border px-3 py-2 text-sm",
    isFocused
      ? "border-blue-500 ring-2 ring-blue-500/30"
      : "border-gray-300",
    isDisabled ? "cursor-not-allowed bg-gray-50" : "bg-white cursor-text",
  ].join(" ");

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {isRequired && (
          <span aria-hidden="true" className="ms-1 text-red-500">
            *
          </span>
        )}
      </label>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- clicking the container focuses the input */}
      <div className={containerClasses} onClick={handleContainerClick}>
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              aria-label={`Remove ${tag}`}
              disabled={isDisabled}
              className="ms-0.5 rounded text-blue-600 hover:text-blue-900 disabled:cursor-not-allowed"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (inputValue.trim()) addTag(inputValue);
          }}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={isDisabled}
          className="min-w-[6rem] flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
        />
      </div>

      {description && !errorMessage && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

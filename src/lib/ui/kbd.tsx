export interface KbdProps {
  keys: string;
}

export function Kbd({ keys }: KbdProps) {
  const parts = keys.split("+");

  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((key, index) => (
        <span key={index} className="inline-flex items-center gap-1">
          {index > 0 && (
            <span className="text-xs text-gray-400" aria-hidden="true">
              +
            </span>
          )}
          <kbd className="inline-flex items-center justify-center rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 min-w-[1.5rem]">
            {key.trim()}
          </kbd>
        </span>
      ))}
    </span>
  );
}

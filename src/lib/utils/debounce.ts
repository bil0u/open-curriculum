// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFn<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  flush: () => void;
  cancel: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number,
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;

  const debounced = (...args: Parameters<T>): void => {
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      lastArgs = undefined;
      fn(...args);
    }, delayMs);
  };

  debounced.flush = (): void => {
    if (timer !== undefined && lastArgs !== undefined) {
      clearTimeout(timer);
      const args = lastArgs;
      timer = undefined;
      lastArgs = undefined;
      fn(...args);
    }
  };

  debounced.cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
  };

  return debounced;
}

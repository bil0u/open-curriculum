import type { Translatable } from "@/lib/types";

import type { ExportContext } from "./types";

function firstLocaleValue(t: Translatable | undefined): string | undefined {
  if (!t) return undefined;
  const values = Object.values(t);
  return values.find((v) => typeof v === "string" && v.length > 0);
}

export function resolveProfileName(context: ExportContext): string {
  const overrideName = context.cv.profileOverrides?.name as
    | Translatable
    | undefined;
  const fromOverride = firstLocaleValue(overrideName);
  if (fromOverride) return fromOverride;

  const fromProfile = firstLocaleValue(context.profile?.name);
  if (fromProfile) return fromProfile;

  return context.cv.name;
}

export function triggerDownload(
  content: string,
  mimeType: string,
  fileName: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function triggerFileInput(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    document.body.appendChild(input);

    let resolved = false;
    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      if (input.parentNode) input.parentNode.removeChild(input);
    };

    input.addEventListener("change", () => {
      const file = input.files?.[0] ?? null;
      cleanup();
      resolve(file);
    });

    // "cancel" event fallback: not supported in all browsers.
    // Use window focus as a backstop — when the file dialog closes,
    // the window regains focus. A short delay allows the "change"
    // event to fire first if a file was selected.
    input.addEventListener("cancel", () => {
      cleanup();
      resolve(null);
    });

    const onWindowFocus = () => {
      window.removeEventListener("focus", onWindowFocus);
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          resolve(null);
        }
      }, 300);
    };

    // Delay attaching the focus listener so the initial click
    // doesn't trigger it immediately.
    setTimeout(() => {
      if (!resolved) {
        window.addEventListener("focus", onWindowFocus);
      }
    }, 100);

    input.click();
  });
}

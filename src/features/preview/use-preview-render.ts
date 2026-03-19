import { useCallback, useEffect, useRef, useState } from "react";

import { db } from "@/lib/db";
import { useCvStore } from "@/lib/store";
import { renderCv, type RenderResult } from "@/lib/template-engine";
import { getTheme } from "@/lib/theme-registry";
import type { Profile, ThemeDefinition } from "@/lib/types";
import { debounce, type DebouncedFn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

interface PreviewRenderState {
  renderResult: RenderResult | null;
  isRendering: boolean;
  error: string | null;
  theme: ThemeDefinition | null;
  profile: Profile | null;
}

/**
 * Subscribes to CvStore state, resolves theme + profile,
 * and calls renderCv() with debouncing to produce live preview output.
 */
export function usePreviewRender(): PreviewRenderState {
  const document = useCvStore((s) => s.document);
  const activeLocale = useCvStore((s) => s.activeLocale);

  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeDefinition | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const renderIdRef = useRef(0);

  const doRender = useCallback(async () => {
    if (!document) {
      setRenderResult(null);
      setError(null);
      setTheme(null);
      setProfile(null);
      return;
    }

    const renderId = ++renderIdRef.current;
    setIsRendering(true);
    setError(null);

    try {
      const [resolvedTheme, profile] = await Promise.all([
        getTheme(document.themeId),
        document.profileId
          ? db.profiles.get(document.profileId).then((p) => p ?? null)
          : Promise.resolve(null as Profile | null),
      ]);
      if (renderId !== renderIdRef.current) return;

      if (!resolvedTheme) {
        setError(`Theme not found: ${document.themeId}`);
        setIsRendering(false);
        return;
      }

      setTheme(resolvedTheme);
      setProfile(profile);

      const result = await renderCv(
        document,
        profile,
        resolvedTheme,
        activeLocale,
      );
      if (renderId !== renderIdRef.current) return;

      setRenderResult(result);
      setIsRendering(false);
    } catch (err) {
      if (renderId !== renderIdRef.current) return;
      setError(err instanceof Error ? err.message : "Render failed");
      setRenderResult(null);
      setIsRendering(false);
    }
  }, [document, activeLocale]);

  const debouncedRef = useRef<DebouncedFn<() => void> | null>(null);

  useEffect(() => {
    debouncedRef.current?.cancel();
    debouncedRef.current = null;

    // When document is cleared, reset immediately (no debounce)
    if (!document) {
      doRender();
      return;
    }

    const debouncedRender = debounce(doRender, DEBOUNCE_MS);
    debouncedRef.current = debouncedRender;
    debouncedRender();

    return () => {
      debouncedRender.cancel();
    };
  }, [doRender]);

  return { renderResult, isRendering, error, theme, profile };
}

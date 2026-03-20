import { Suspense, lazy } from "react";

import { CreateCvDialog, CvList } from "@/features/cv-management";
import { EditorPanel } from "@/features/editor";
import { PreviewPanel } from "@/features/preview";
import { ShortcutCheatsheet } from "@/features/settings";
import { useTranslation } from "@/lib/i18n";
import { useGlobalKeyboardShortcuts } from "@/lib/keyboard";
import { useCvStore, useUiStore } from "@/lib/store";

const OnboardingWizard = lazy(() =>
  import("@/features/onboarding/onboarding-wizard").then((m) => ({
    default: m.OnboardingWizard,
  })),
);
const ThemeEditor = lazy(() =>
  import("@/features/themes/components/theme-editor").then((m) => ({
    default: m.ThemeEditor,
  })),
);
const VersionsPanel = lazy(() =>
  import("@/features/versioning/versions-panel").then((m) => ({
    default: m.VersionsPanel,
  })),
);

function Sidebar({ hasDocument }: { hasDocument: boolean }) {
  const { t } = useTranslation("common");
  const activePanel = useUiStore((s) => s.activePanel);
  const setActivePanel = useUiStore((s) => s.setActivePanel);

  const tabs = [
    { id: "editor", label: t("nav.editor") },
    { id: "theme", label: t("nav.theme") },
    { id: "versions", label: t("nav.versions") },
  ] as const;

  return (
    <aside
      className="flex h-full w-64 shrink-0 flex-col border-e border-gray-200 bg-white"
      aria-label={t("app_name")}
    >
      <div className="border-b border-gray-200 px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">
          {t("app_name")}
        </span>
      </div>
      <nav className="flex gap-1 border-b border-gray-200 px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activePanel === tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={[
              "flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors",
              activePanel === tab.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto">
        {activePanel === "editor" && <CvList />}
        {activePanel === "theme" && (
          <Suspense>
            <ThemeEditor />
          </Suspense>
        )}
        {activePanel === "versions" && hasDocument && (
          <Suspense>
            <VersionsPanel />
          </Suspense>
        )}
      </div>
    </aside>
  );
}

function EmptyState() {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <p className="text-base font-medium text-gray-700">
        {t("empty_state.heading")}
      </p>
      <p className="text-sm text-gray-500">{t("empty_state.description")}</p>
    </div>
  );
}

export function AppShell() {
  const { t } = useTranslation("common");
  const hasDocument = useCvStore((s) => s.document !== null);
  const isCreateCvDialogOpen = useUiStore((s) => s.isCreateCvDialogOpen);
  const setCreateCvDialogOpen = useUiStore((s) => s.setCreateCvDialogOpen);
  const isOnboardingOpen = useUiStore((s) => s.isOnboardingOpen);

  useGlobalKeyboardShortcuts();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar hasDocument={hasDocument} />
      <main className="flex flex-1 overflow-hidden">
        {!hasDocument ? (
          <EmptyState />
        ) : (
          <>
            <section
              aria-label={t("panels.editor")}
              className="flex h-full flex-1 overflow-hidden border-e border-gray-200"
            >
              <EditorPanel />
            </section>
            <section
              aria-label={t("panels.preview")}
              className="flex h-full flex-1 overflow-hidden"
            >
              <PreviewPanel />
            </section>
          </>
        )}
      </main>
      <CreateCvDialog
        isOpen={isCreateCvDialogOpen}
        onClose={() => setCreateCvDialogOpen(false)}
      />
      <ShortcutCheatsheet />
      {isOnboardingOpen && (
        <Suspense>
          <OnboardingWizard />
        </Suspense>
      )}
    </div>
  );
}

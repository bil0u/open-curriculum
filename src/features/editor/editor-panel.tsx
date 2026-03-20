import { useCvStore } from "@/lib/store";

import { EditorToolbar } from "./components/editor-toolbar";
import { ProfileEditor } from "./components/profile-editor";
import { SectionList } from "./components/section-list";
import { ThemeWarnings } from "./components/theme-warnings";
import { useThemeWarnings } from "./hooks/use-theme-warnings";

export function EditorPanel() {
  const hasDocument = useCvStore((s) => s.document !== null);
  const themeWarnings = useThemeWarnings();

  if (!hasDocument) return null;

  return (
    <div className="flex h-full w-full flex-col">
      <EditorToolbar />
      <div className="flex-1 overflow-y-auto">
        <ProfileEditor />
        <div className="border-t border-gray-200" />
        <ThemeWarnings warnings={themeWarnings} />
        <SectionList />
      </div>
    </div>
  );
}

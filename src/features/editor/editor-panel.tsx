import { useCvStore } from "@/lib/store";

import { ProfileEditor } from "./components/profile-editor";
import { SectionList } from "./components/section-list";
import { ThemeWarnings } from "./components/theme-warnings";
import { useThemeWarnings } from "./hooks/use-theme-warnings";

export function EditorPanel() {
  const document = useCvStore((s) => s.document);
  const themeWarnings = useThemeWarnings();

  if (!document) return null;

  return (
    <div className="h-full w-full overflow-y-auto">
      <ProfileEditor />
      <div className="border-t border-gray-200" />
      <ThemeWarnings warnings={themeWarnings} />
      <SectionList />
    </div>
  );
}

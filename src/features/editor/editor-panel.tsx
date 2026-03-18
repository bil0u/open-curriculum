import { useCvStore } from "@/lib/store";

import { ProfileEditor } from "./components/profile-editor";
import { SectionList } from "./components/section-list";

export function EditorPanel() {
  const document = useCvStore((s) => s.document);

  if (!document) return null;

  return (
    <div className="h-full w-full overflow-y-auto">
      <ProfileEditor />
      <div className="border-t border-gray-200" />
      <SectionList />
    </div>
  );
}

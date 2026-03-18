import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { db } from "@/lib/db";
import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { CvDocument } from "@/lib/types";
import { IconButton, PencilIcon, TrashIcon } from "@/lib/ui";
import { generateISODateTime } from "@/lib/utils";

import { DeleteCvDialog } from "./delete-cv-dialog";

interface CvListItemProps {
  cv: CvDocument;
  isActive: boolean;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function CvListItem({ cv, isActive }: CvListItemProps) {
  const { t } = useTranslation("cv-management");
  const loadCv = useCvStore((s) => s.loadCv);
  const updateDocument = useCvStore((s) => s.updateDocument);

  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(cv.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditName(cv.name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, cv.name]);

  const commitRename = async () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== cv.name) {
      if (isActive) {
        updateDocument({ name: trimmed });
      } else {
        const now = generateISODateTime();
        await db.cvs.update(cv.id, { name: trimmed, updatedAt: now });
      }
    }
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void commitRename();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  return (
    <>
      <div
        className={[
          "group flex items-start gap-2 rounded-md px-2 py-2 transition-colors",
          isActive
            ? "bg-blue-50 text-blue-900"
            : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        <button
          type="button"
          className="min-w-0 flex-1 text-start"
          onClick={() => {
            if (!editing) void loadCv(cv.id);
          }}
          onDoubleClick={() => setEditing(true)}
          aria-current={isActive ? "true" : undefined}
        >
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded border border-blue-400 px-1 py-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label={t("rename.label")}
            />
          ) : (
            <p className="truncate text-sm font-medium">{cv.name}</p>
          )}
          <p className="mt-0.5 text-start text-xs text-gray-400">
            {t("item.updated", { date: formatDate(cv.updatedAt) })}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconButton
            aria-label={t("item.edit")}
            variant="ghost"
            size="sm"
            onPress={() => setEditing(true)}
          >
            <PencilIcon />
          </IconButton>
          <IconButton
            aria-label={t("item.delete")}
            variant="danger"
            size="sm"
            onPress={() => setShowDelete(true)}
          >
            <TrashIcon />
          </IconButton>
        </div>
      </div>

      <DeleteCvDialog
        cvId={cv.id}
        cvName={cv.name}
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
      />
    </>
  );
}

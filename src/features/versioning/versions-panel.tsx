import { useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { EntityId } from "@/lib/types";
import type { Snapshot } from "@/lib/types/versioning";
import { Button, ConfirmDialog } from "@/lib/ui";

import { formatRelativeTime } from "./format-relative-time";
import { useHasUnsavedChanges } from "./use-last-saved";
import { useSnapshots } from "./use-snapshots";

interface SnapshotItemProps {
  snapshot: Snapshot;
  onRestore: (id: EntityId) => void;
}

function SnapshotItem({ snapshot, onRestore }: SnapshotItemProps) {
  const { t } = useTranslation("versioning");
  const { t: tCommon } = useTranslation("common");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800">
          {new Date(snapshot.timestamp).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">
          {formatRelativeTime(snapshot.timestamp)}
        </p>
        {snapshot.tag && (
          <span className="mt-1 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
            {snapshot.tag}
          </span>
        )}
      </div>
      <Button size="sm" variant="secondary" onPress={() => setConfirmOpen(true)}>
        {t("snapshots.restore")}
      </Button>
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t("snapshots.restore_confirm_title")}
        message={t("snapshots.restore_confirm_message")}
        confirmLabel={t("snapshots.restore")}
        cancelLabel={tCommon("actions.cancel")}
        onConfirm={() => {
          setConfirmOpen(false);
          onRestore(snapshot.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export function VersionsPanel() {
  const { t } = useTranslation("versioning");
  const { t: tCommon } = useTranslation("common");
  const activeCvId = useCvStore((s) => s.activeCvId);
  const createSnapshot = useCvStore((s) => s.createSnapshot);
  const restoreSnapshot = useCvStore((s) => s.restoreSnapshot);
  const discardChanges = useCvStore((s) => s.discardChanges);

  const snapshots = useSnapshots(activeCvId);
  const hasUnsavedChanges = useHasUnsavedChanges(activeCvId);

  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const canDiscard = hasUnsavedChanges && snapshots.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {t("snapshots.title")}
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => void createSnapshot()}
        >
          {t("snapshots.save")}
        </Button>
      </div>

      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <Button
          size="sm"
          variant="secondary"
          isDisabled={!canDiscard}
          onPress={() => setDiscardConfirmOpen(true)}
        >
          {t("snapshots.discard_changes")}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={discardConfirmOpen}
        title={t("snapshots.discard_confirm_title")}
        message={t("snapshots.discard_confirm_message")}
        confirmLabel={t("snapshots.discard_changes")}
        cancelLabel={tCommon("actions.cancel")}
        variant="danger"
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          void discardChanges();
        }}
        onCancel={() => setDiscardConfirmOpen(false)}
      />

      <div className="flex-1 overflow-y-auto">
        {snapshots.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            {t("snapshots.empty")}
          </p>
        ) : (
          snapshots.map((snapshot) => (
            <SnapshotItem
              key={snapshot.id}
              snapshot={snapshot}
              onRestore={(id) => void restoreSnapshot(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

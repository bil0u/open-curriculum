import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { EntityId } from "@/lib/types";
import { ConfirmDialog } from "@/lib/ui";

interface DeleteCvDialogProps {
  cvId: EntityId;
  cvName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteCvDialog({
  cvId,
  cvName,
  isOpen,
  onClose,
}: DeleteCvDialogProps) {
  const { t } = useTranslation("cv-management");
  const { t: tCommon } = useTranslation("common");
  const deleteCv = useCvStore((s) => s.deleteCv);

  const handleConfirm = async () => {
    await deleteCv(cvId);
    onClose();
  };

  return (
    <ConfirmDialog
      title={t("delete.title")}
      message={t("delete.message", { name: cvName })}
      confirmLabel={t("delete.confirm")}
      cancelLabel={tCommon("actions.cancel")}
      onConfirm={() => void handleConfirm()}
      onCancel={onClose}
      isOpen={isOpen}
      variant="danger"
    />
  );
}

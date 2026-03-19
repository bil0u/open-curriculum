import { type FormEvent, useState } from "react";

import { i18n, useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import { getDefaultThemeId } from "@/lib/theme-registry";
import { Button, Dialog, TextField } from "@/lib/ui";

interface CreateCvDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCvDialog({ isOpen, onClose }: CreateCvDialogProps) {
  const { t } = useTranslation("cv-management");
  const { t: tCommon } = useTranslation("common");
  const createCv = useCvStore((s) => s.createCv);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("create.name_required"));
      return;
    }
    await createCv({
      name: trimmed,
      themeId: getDefaultThemeId(),
      defaultLocale: i18n.language,
    });
    setName("");
    setError(undefined);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setError(undefined);
    onClose();
  };

  return (
    <Dialog
      title={t("create.title")}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4"
      >
        <TextField
          label={t("create.name_label")}
          placeholder={t("create.name_placeholder")}
          value={name}
          onChange={setName}
          errorMessage={error}
          isRequired
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onPress={handleClose}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="submit" isDisabled={!name.trim()}>
            {tCommon("actions.create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

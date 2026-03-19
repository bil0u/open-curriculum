import { type FormEvent, useEffect, useRef, useState } from "react";

import { db } from "@/lib/db";
import { i18n, useTranslation } from "@/lib/i18n";
import { SHORTCUTS } from "@/lib/keyboard";
import { useCvStore, useUiStore } from "@/lib/store";
import { getDefaultThemeId } from "@/lib/theme-registry";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { Button, Dialog, TextField } from "@/lib/ui";

const TOTAL_STEPS = 3;

async function markOnboardingComplete(): Promise<void> {
  const existing = await db.settings.get("singleton");
  const patch = { onboardingCompleted: true };
  if (existing) {
    await db.settings.update("singleton", patch);
  } else {
    await db.settings.put({ ...DEFAULT_SETTINGS, ...patch });
  }
}

function WelcomeStep() {
  const { t } = useTranslation("onboarding");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("steps.welcome.heading")}
      </h2>
      <p className="text-sm text-gray-600">{t("steps.welcome.description")}</p>
      <ul className="flex flex-col gap-2 ps-5 list-disc">
        <li className="text-sm text-gray-700">
          {t("steps.welcome.features.themes")}
        </li>
        <li className="text-sm text-gray-700">
          {t("steps.welcome.features.export")}
        </li>
        <li className="text-sm text-gray-700">
          {t("steps.welcome.features.versioning")}
        </li>
      </ul>
    </div>
  );
}

interface CreateStepProps {
  cvName: string;
  onChangeName: (value: string) => void;
  error: string | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function CreateStep({
  cvName,
  onChangeName,
  error,
  containerRef,
}: CreateStepProps) {
  const { t } = useTranslation("onboarding");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("steps.create.heading")}
      </h2>
      <p className="text-sm text-gray-600">{t("steps.create.description")}</p>
      <div ref={containerRef}>
        <TextField
          label={t("steps.create.name_label")}
          placeholder={t("steps.create.name_placeholder")}
          value={cvName}
          onChange={onChangeName}
          errorMessage={error}
          isRequired
        />
      </div>
    </div>
  );
}

function TipsStep() {
  const { t } = useTranslation("onboarding");

  const shortcutKey =
    SHORTCUTS.find((s) => s.id === "show-shortcuts")?.displayKeys ?? "";
  const saveKey =
    SHORTCUTS.find((s) => s.id === "save-snapshot")?.displayKeys ?? "";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("steps.tips.heading")}
      </h2>
      <p className="text-sm text-gray-600">{t("steps.tips.description")}</p>
      <ul className="flex flex-col gap-2 ps-5 list-disc">
        <li className="text-sm text-gray-700">
          {t("steps.tips.tip_shortcuts", { shortcutKey })}
        </li>
        <li className="text-sm text-gray-700">{t("steps.tips.tip_theme")}</li>
        <li className="text-sm text-gray-700">{t("steps.tips.tip_export")}</li>
        <li className="text-sm text-gray-700">
          {t("steps.tips.tip_autosave", { saveKey })}
        </li>
      </ul>
    </div>
  );
}

export function OnboardingWizard() {
  const { t } = useTranslation("onboarding");
  const isOpen = useUiStore((s) => s.isOnboardingOpen);
  const setOnboardingOpen = useUiStore((s) => s.setOnboardingOpen);
  const createCv = useCvStore((s) => s.createCv);

  const [step, setStep] = useState(1);
  const [cvName, setCvName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createInputContainerRef = useRef<HTMLDivElement | null>(null);

  // Focus the input inside the create step when it mounts
  useEffect(() => {
    if (step === 2 && createInputContainerRef.current) {
      const input = createInputContainerRef.current.querySelector("input");
      input?.focus();
    }
  }, [step]);

  const reset = () => {
    setStep(1);
    setCvName("");
    setNameError(undefined);
    setIsSubmitting(false);
  };

  const close = async () => {
    await markOnboardingComplete();
    setOnboardingOpen(false);
    reset();
  };

  const handleSkip = () => {
    void close();
  };

  const handleNext = () => {
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleCreateAndContinue = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = cvName.trim();
    if (!trimmed) {
      setNameError(t("steps.create.name_required"));
      return;
    }
    setIsSubmitting(true);
    try {
      await createCv({
        name: trimmed,
        themeId: getDefaultThemeId(),
        defaultLocale: i18n.language,
      });
      setNameError(undefined);
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    void close();
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent dismiss by clicking outside — only Skip or completion closes the wizard
    if (!open) return;
    setOnboardingOpen(true);
  };

  return (
    <Dialog title={t("title")} isOpen={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-col gap-6">
        {step === 1 && <WelcomeStep />}
        {step === 2 && (
          <form
            id="create-cv-form"
            onSubmit={(e) => void handleCreateAndContinue(e)}
          >
            <CreateStep
              cvName={cvName}
              onChangeName={(value) => {
                setCvName(value);
                if (nameError) setNameError(undefined);
              }}
              error={nameError}
              containerRef={createInputContainerRef}
            />
          </form>
        )}
        {step === 3 && <TipsStep />}

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" onPress={handleBack}>
                {t("actions.back")}
              </Button>
            )}
            <Button variant="ghost" onPress={handleSkip}>
              {t("actions.skip")}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {t("progress", { current: step, total: TOTAL_STEPS })}
            </span>
            {step === 1 && (
              <Button variant="primary" onPress={handleNext}>
                {t("actions.next")}
              </Button>
            )}
            {step === 2 && (
              <Button
                variant="primary"
                type="submit"
                form="create-cv-form"
                isDisabled={isSubmitting || !cvName.trim()}
              >
                {t("actions.create_and_continue")}
              </Button>
            )}
            {step === 3 && (
              <Button variant="primary" onPress={handleGetStarted}>
                {t("actions.get_started")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

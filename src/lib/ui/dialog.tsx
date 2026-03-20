import {
  Dialog as AriaDialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";

export interface DialogProps {
  title?: string;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dialog({ title, children, isOpen, onOpenChange }: DialogProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <Modal className="w-full max-w-md rounded-xl bg-white shadow-2xl outline-none">
        <AriaDialog className="p-6 outline-none" aria-label={title}>
          {({ close }) => (
            <>
              {title && (
                <Heading
                  slot="title"
                  className="mb-4 text-lg font-semibold text-gray-900"
                >
                  {title}
                </Heading>
              )}
              {typeof children === "function" ? children(close) : children}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}


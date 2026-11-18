"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Quay lại",
  destructive = false,
  loading = false,
  size = "sm",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size={size}
      closeOnOverlayClick={!loading}
      footer={
        <>
          <Button
            variant="outlined"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="h-9 px-4 text-xs font-semibold whitespace-nowrap rounded-xl"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
            className="h-9 px-4 text-xs font-semibold whitespace-nowrap rounded-xl"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-neutral-700">{description}</p>
    </Modal>
  );
}


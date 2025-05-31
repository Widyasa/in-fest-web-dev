"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ModalType = "create" | "update" | "delete" | "detail";

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  type: ModalType;
  title?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  loading?: boolean;
}

const defaultTitles = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  detail: "Details",
};

const defaultButtons = {
  create: "Submit",
  update: "Save Changes",
  delete: "Delete",
  detail: "Close",
};

export function ActionModal({
  open,
  onClose,
  type,
  title,
  children,
  onSubmit,
  loading = false,
}: ActionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? defaultTitles[type]}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
          {type !== "detail" && (
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Loading..." : defaultButtons[type]}
            </Button>
          )}
          {type === "detail" && (
            <Button variant="outline" onClick={onClose}>
              {defaultButtons.detail}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
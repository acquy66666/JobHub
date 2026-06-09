"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  width?: string;
}

export function SidePanel({
  open,
  onOpenChange,
  title,
  meta,
  children,
  width = "640px",
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="fixed top-0 right-0 z-50 h-full w-full md:max-w-[var(--side-panel-w)] bg-[var(--bg-0)] border-l border-[var(--border)] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-200"
          style={{ ["--side-panel-w" as string]: width }}
        >
          <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--border)] shrink-0">
            <div className="min-w-0 flex-1">
              {title && (
                <Dialog.Title className="text-[20px] font-semibold text-[var(--t0)] leading-tight">
                  {title}
                </Dialog.Title>
              )}
              {meta && (
                <div className="text-[13px] text-[var(--t1)] mt-1 font-mono">
                  {meta}
                </div>
              )}
            </div>
            <Dialog.Close
              aria-label="Đóng"
              className="shrink-0 p-2 -mr-2 text-[var(--t1)] hover:text-[var(--t0)] transition-colors"
            >
              <X size={18} />
            </Dialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

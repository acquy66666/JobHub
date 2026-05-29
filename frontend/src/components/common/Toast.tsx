"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, Toast, ToastType } from "@/store/toastStore";

const STYLES: Record<ToastType, { border: string; iconColor: string; icon: string }> = {
  success: { border: "border-l-green-500",       iconColor: "text-green-400",  icon: "✓" },
  error:   { border: "border-l-red-500",          iconColor: "text-red-400",    icon: "✕" },
  info:    { border: "border-l-[#7C3AED]",        iconColor: "text-[#B09BF8]",  icon: "ℹ" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const { border, iconColor, icon } = STYLES[toast.type];

  return (
    <div
      className={`flex items-start gap-3 bg-[#13131E] border border-[#252538] border-l-[3px] ${border} rounded-xl px-4 py-3 shadow-2xl w-[320px]`}
    >
      <span className={`text-[14px] font-bold mt-px shrink-0 ${iconColor}`}>{icon}</span>
      <p className="text-[13px] text-t0 flex-1 leading-[1.5]">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-t2 hover:text-t1 text-[18px] leading-none shrink-0 -mt-0.5 transition-colors"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <ToastItem toast={t} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

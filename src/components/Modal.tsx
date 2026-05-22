import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string; // e.g., 'max-w-md', 'max-w-lg', 'max-w-xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className={`relative bg-white border-2 border-black text-black rounded-lg shadow-subtle-2 w-full ${maxWidth} overflow-hidden z-[2001] p-6`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            style={{ transformOrigin: "center" }}
          >
            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
                {title && (
                  <h3 className="text-lg font-bold tracking-tight text-black">
                    {title}
                  </h3>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded border-2 border-black bg-white hover:bg-zinc-100 text-black hover:shadow-subtle-3 transition active:translate-x-[0.5px] active:translate-y-[0.5px]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

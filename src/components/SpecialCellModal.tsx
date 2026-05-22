import { useEffect } from "react";
import { motion } from "motion/react";
import Modal from "./Modal";
import { ArrowRightLeft, ArrowRight, ArrowLeft } from "lucide-react";

interface SpecialCellModalProps {
  isOpen: boolean;
  startCell: number;
  endCell: number;
  playerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SpecialCellModal({
  isOpen,
  startCell,
  endCell,
  playerName,
  onConfirm,
  onCancel,
}: SpecialCellModalProps) {
  const isForward = endCell > startCell;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const isFocusedInput =
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA";

        if (!isFocusedInput) {
          e.preventDefault();
          e.stopPropagation();
          onConfirm();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onConfirm]);

  return (
    <Modal isOpen={isOpen} title="Особая клетка! 🛸">
      <div className="flex flex-col items-center py-4 text-center">
        {/* Animated cell transition block */}
        <div className="flex items-center gap-4 justify-center mb-6 w-full">
          {/* Start Cell */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
            transition={{ y: { type: "tween", repeat: Infinity, duration: 2, ease: "easeInOut" } }}
            className="w-16 h-16 rounded-lg bg-card-lavender border-2 border-black shadow-subtle-3 flex flex-col items-center justify-center"
          >
            <span className="text-neutral-700 text-[10px] font-black uppercase tracking-wider">Откуда</span>
            <span className="text-xl font-mono font-black text-black">{startCell}</span>
          </motion.div>

          {/* Transition indicator */}
          <motion.div
            animate={
              isForward
                ? { x: [-5, 5, -5] }
                : { x: [5, -5, 5] }
            }
            transition={{ type: "tween", repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex items-center justify-center p-2 rounded-full border-2 border-black bg-white text-black"
          >
            {isForward ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </motion.div>

          {/* End Cell */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, 4, 0] }}
            transition={{ y: { type: "tween", repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 } }}
            className="w-16 h-16 rounded-lg bg-card-mint border-2 border-black shadow-subtle-3 flex flex-col items-center justify-center"
          >
            <span className="text-neutral-700 text-[10px] font-black uppercase tracking-wider">Куда</span>
            <span className="text-xl font-mono font-black text-black">{endCell}</span>
          </motion.div>
        </div>

        {/* Explain dialog */}
        <div className="mb-6 max-w-sm">
          <h4 className="text-lg font-black text-black mb-2">Телепортация!</h4>
          <p className="text-neutral-700 font-bold text-sm leading-relaxed">
            Игрок <span className="font-extrabold text-black bg-highlight-yellow px-1.5 py-0.5 border-2 border-black rounded shadow-subtle-3">{playerName}</span> попал на особую клетку{" "}
            <span className="font-extrabold font-mono text-black">{startCell}</span>!<br />
            По правилам поля, он перемещается на клетку{" "}
            <span className="font-black font-mono text-black underline decoration-2 decoration-accent-green">
              {endCell}
            </span>
            .
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full justify-center">
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-10 py-2.5 rounded border-2 border-black bg-accent-green text-black font-black shadow-subtle hover:shadow-subtle-2 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition"
          >
            Поехали! 🚀
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

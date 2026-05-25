import { motion } from "motion/react";
import Modal from "./Modal";
import { Player } from "../types";
import { Dices, ArrowDown, ArrowUp } from "lucide-react";

interface LotteryPromptModalProps {
  isOpen: boolean;
  activePlayer: Player;
  onResolve: (accepted: boolean) => void;
}

export default function LotteryPromptModal({
  isOpen,
  activePlayer,
  onResolve,
}: LotteryPromptModalProps) {
  return (
    <Modal isOpen={isOpen} title={`🎰 Лотерея для ${activePlayer.name}`} maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-black bg-[#fff3c4] text-black text-sm font-black uppercase mb-4 shadow-subtle-3"
        >
          <Dices className="w-4 h-4" />
          ЛОТЕРЕЯ
        </motion.div>

        {/* Description */}
        <p className="text-black text-xs font-bold text-center bg-[#fff3c4] border-2 border-black rounded-lg p-3 w-full mb-5 shadow-subtle-3">
          Хочешь рискнуть и крутануть кубик от <span className="font-mono bg-white px-1 py-0.5 border border-black rounded">−6</span> до <span className="font-mono bg-white px-1 py-0.5 border border-black rounded">+6</span>?
        </p>

        {/* Visual: outcomes preview */}
        <div className="w-full grid grid-cols-3 gap-2 mb-5">
          <div className="bg-rose-100 border-2 border-black rounded-lg p-2 flex flex-col items-center shadow-subtle-3">
            <ArrowDown className="w-5 h-5 text-rose-700 mb-1" />
            <span className="text-[10px] font-black text-rose-800 uppercase">Назад</span>
            <span className="text-[10px] font-bold text-neutral-700">от −1 до −6</span>
          </div>
          <div className="bg-zinc-100 border-2 border-black rounded-lg p-2 flex flex-col items-center shadow-subtle-3">
            <span className="text-lg font-black text-zinc-700 leading-none mb-0.5">0</span>
            <span className="text-[10px] font-black text-zinc-800 uppercase">Пас</span>
            <span className="text-[10px] font-bold text-neutral-700">остаёшься</span>
          </div>
          <div className="bg-emerald-100 border-2 border-black rounded-lg p-2 flex flex-col items-center shadow-subtle-3">
            <ArrowUp className="w-5 h-5 text-emerald-700 mb-1" />
            <span className="text-[10px] font-black text-emerald-800 uppercase">Вперёд</span>
            <span className="text-[10px] font-bold text-neutral-700">от +1 до +6</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full justify-center">
          <motion.button
            onClick={() => onResolve(false)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold shadow-subtle-3 hover:shadow-subtle cursor-pointer text-sm transition"
          >
            Пройти мимо
          </motion.button>
          <motion.button
            onClick={() => onResolve(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded border-2 border-black bg-highlight-yellow hover:bg-amber-300 text-black font-black shadow-subtle hover:shadow-subtle-2 cursor-pointer text-sm transition"
          >
            <Dices className="w-4 h-4" />
            Рискнуть!
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

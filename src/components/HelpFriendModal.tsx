import { motion } from "motion/react";
import Modal from "./Modal";
import { Player } from "../types";
import { HeartHandshake, ArrowRightLeft } from "lucide-react";

interface HelpFriendModalProps {
  isOpen: boolean;
  activePlayer: Player;
  otherPlayers: Player[];
  onResolve: (chosenFriendId: number | null) => void;
}

export default function HelpFriendModal({
  isOpen,
  activePlayer,
  otherPlayers,
  onResolve,
}: HelpFriendModalProps) {
  return (
    <Modal isOpen={isOpen} title={`Помощь другу — ход игрока ${activePlayer.name}`} maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Category Header Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-black bg-[#ffe4e6] text-black text-sm font-black uppercase mb-4 shadow-subtle-3"
        >
          <HeartHandshake className="w-4 h-4" />
          ПОМОЩЬ ДРУГУ
        </motion.div>

        {/* Rule summary */}
        <p className="text-black text-xs font-bold text-center bg-[#ffe4e6] border-2 border-black rounded-lg p-3 w-full mb-5 shadow-subtle-3">
          Выберите любого игрока — он будет <span className="underline">перемещён к вашей клетке</span> (как спереди, так и сзади). Сила дружбы!
        </p>

        {/* Active player current position */}
        <div className="flex items-center gap-3 justify-center mb-4 border-b-2 border-black pb-3 w-full">
          <span className="font-extrabold text-black bg-[#fae9ff] px-2 py-1 rounded border-2 border-black shadow-subtle-3 text-xs">
            {activePlayer.name}
          </span>
          <span className="text-black text-xs font-black flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3" />
            клетка {activePlayer.position}
          </span>
        </div>

        {/* Friend selection */}
        <div className="w-full flex flex-col items-center">
          <h4 className="text-black font-extrabold mb-3 text-center text-sm">Кого притянем?</h4>
          {otherPlayers.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center italic py-2">
              Других игроков нет — некого спасать!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {otherPlayers.map((p) => {
                const delta = activePlayer.position - p.position;
                const direction =
                  delta === 0
                    ? "уже рядом"
                    : delta > 0
                    ? `вперёд на ${delta}`
                    : `назад на ${Math.abs(delta)}`;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => onResolve(p.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center p-3 bg-white hover:bg-rose-50 border-2 border-black rounded-lg shadow-subtle-3 hover:shadow-subtle cursor-pointer transition text-center"
                  >
                    <div
                      className="w-10 h-10 rounded border-2 border-black mb-2 bg-cover bg-center"
                      style={{ backgroundImage: `url('/assets/images/${Math.min(13, p.id)}.png')` }}
                    />
                    <span className="text-sm font-black truncate max-w-full text-black">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-600 mt-0.5">
                      клетка {p.position} ({direction})
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          <p className="mt-4 w-full text-center text-[11px] font-bold text-rose-700 bg-rose-50 border-2 border-dashed border-rose-300 rounded p-2">
            ⚠ Отказаться нельзя — выбрать друга придётся!
          </p>
        </div>
      </div>
    </Modal>
  );
}

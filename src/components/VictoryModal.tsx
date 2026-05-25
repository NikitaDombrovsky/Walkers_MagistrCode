import { motion } from "motion/react";
import Modal from "./Modal";
import { Player } from "../types";
import { Trophy, RotateCcw, ArrowRight } from "lucide-react";

interface VictoryModalProps {
  isOpen: boolean;
  winners: Player[]; // ordered by finish time (1st = winner, etc.)
  allPlayers: Player[];
  onContinue: () => void;
  onNewGame: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function VictoryModal({
  isOpen,
  winners,
  allPlayers,
  onContinue,
  onNewGame,
}: VictoryModalProps) {
  // Build top-3: finished players first (in finish order), then leaders among the rest by position
  const finishedIds = new Set(winners.map((w) => w.id));
  const stillPlaying = allPlayers
    .filter((p) => !finishedIds.has(p.id))
    .sort((a, b) => b.position - a.position);

  const podium = [...winners, ...stillPlaying].slice(0, 3);
  const remaining = allPlayers.length - winners.length;
  const everyoneFinished = remaining === 0;

  return (
    <Modal isOpen={isOpen} title="🎉 Финиш!" maxWidth="max-w-sm">
      <div className="flex flex-col items-center gap-3">
        {/* Compact winner banner */}
        {winners.length > 0 && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-black bg-accent-green text-black text-sm font-black uppercase shadow-subtle-3"
          >
            <Trophy className="w-4 h-4" />
            Победитель: {winners[0].name}
          </motion.div>
        )}

        {/* Compact Top-3 list */}
        <div className="w-full flex flex-col gap-1.5">
          {podium.map((p, idx) => {
            const isWinner = finishedIds.has(p.id);
            const place = idx + 1;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`flex items-center gap-2 p-2 rounded-md border-2 border-black shadow-subtle-3
                  ${
                    place === 1
                      ? "bg-[#fff3c4]"
                      : place === 2
                      ? "bg-[#e7e5e4]"
                      : place === 3
                      ? "bg-[#fde2c4]"
                      : "bg-white"
                  }`}
              >
                <span className="text-lg leading-none w-6 text-center">{MEDALS[idx]}</span>
                <div
                  className="w-7 h-7 rounded border-2 border-black bg-cover bg-center flex-none"
                  style={{ backgroundImage: `url('/assets/images/${Math.min(13, p.id)}.png')` }}
                />
                <span className="text-xs font-black text-black truncate flex-1">
                  {p.name}
                </span>
                <span className="text-[10px] font-bold font-mono text-neutral-700 bg-white px-1.5 py-0.5 rounded border border-black">
                  {isWinner ? "финиш" : `кл. ${p.position}`}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Helper hint */}
        <p className="text-[10px] text-neutral-600 font-bold text-center">
          {everyoneFinished
            ? "Все игроки добрались до финиша!"
            : `Осталось доиграть: ${remaining}`}
        </p>

        {/* Actions */}
        <div className="flex gap-2 w-full mt-1">
          {!everyoneFinished && (
            <motion.button
              onClick={onContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold shadow-subtle-3 cursor-pointer text-xs transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Доиграть
            </motion.button>
          )}
          <motion.button
            onClick={onNewGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded border-2 border-black bg-accent-green hover:bg-lime-400 text-black font-black shadow-subtle hover:shadow-subtle-2 cursor-pointer text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Новая игра
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

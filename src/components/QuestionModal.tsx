import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { Player, Question } from "../types";
import { Award, ShieldAlert, Swords, Check, X } from "lucide-react";

interface QuestionModalProps {
  isOpen: boolean;
  category: "blitz" | "question" | "duel" | null;
  question: Question | null;
  activePlayer: Player;
  otherPlayers: Player[];
  onResolve: (correct: boolean, duelWinnerId?: number | null) => void;
}

const CATEGORY_CONFIGS = {
  blitz: {
    label: "БЛИЦ",
    bgClass: "bg-[#fae9ff]",
    rule: "Правильный ответ хотя бы на один вопрос → +1 клетка вперёд",
    icon: Award,
  },
  question: {
    label: "ВОПРОС",
    bgClass: "bg-[#fef3c8]",
    rule: "Правильный ответ → +2 клетки, неправильный → −1 клетка",
    icon: ShieldAlert,
  },
  duel: {
    label: "ДУЭЛЬ",
    bgClass: "bg-[#d2fae5]",
    rule: "Игрок, которому выпала дуэль, выбирает соперника в реальном мире. Ведущий отмечает его на экране. Затем они соревнуются по правилам дуэли, а ведущий отмечает победителя, который получает +2 шага вперёд!",
    icon: Swords,
  },
};

export default function QuestionModal({
  isOpen,
  category,
  question,
  activePlayer,
  otherPlayers,
  onResolve,
}: QuestionModalProps) {
  const [selectedOpponentId, setSelectedOpponentId] = useState<number | null>(null);
  const [duelStage, setDuelStage] = useState<"choose_opponent" | "answer">("choose_opponent");
  const [duelWinnerId, setDuelWinnerId] = useState<number | null | "none">(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedOpponentId(null);
      setDuelWinnerId(null);
      setDuelStage("choose_opponent");
    }
  }, [isOpen]);

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

          if (category !== "duel") {
            // Simple Question / Blitz: Trigger "Верно"
            onResolve(true);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, category, onResolve]);

  if (!category) return null;
  const config = CATEGORY_CONFIGS[category];
  const IconComponent = config.icon;

  const handleDuelOpponentSelect = (id: number) => {
    setSelectedOpponentId(id);
    setDuelStage("answer");
  };

  const handleDuelResolution = (winner: number | "none") => {
    onResolve(winner === activePlayer.id, winner === "none" ? null : winner);
  };

  return (
    <Modal isOpen={isOpen} title={`${config.label} для игрока ${activePlayer.name}`} maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Category Header Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-black ${config.bgClass} text-black text-sm font-black uppercase mb-4 shadow-subtle-3`}
        >
          <IconComponent className="w-4 h-4" />
          {config.label} {question ? `#${question.id}` : ""}
        </motion.div>

        {/* Categories rules summary */}
        <p className={`text-black text-xs font-bold text-center ${config.bgClass} border-2 border-black rounded-lg p-3 w-full mb-6 shadow-subtle-3`}>
          {config.rule}
        </p>

        {/* DUEL: Stage 1 - Choose Opponent */}
        {category === "duel" && duelStage === "choose_opponent" ? (
          <div className="w-full flex flex-col items-center">
            <h4 className="text-black font-extrabold mb-4 text-center">Выберите соперника для дуэли:</h4>
            {otherPlayers.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center italic py-2">
                Нет других игроков в игре! Вы выиграли дуэль автоматически?!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {otherPlayers.map((p) => (
                  <motion.button
                    key={p.id}
                    onClick={() => handleDuelOpponentSelect(p.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center p-3.5 bg-white hover:bg-neutral-50 border-2 border-black rounded-lg shadow-subtle-3 hover:shadow-subtle cursor-pointer transition text-center"
                  >
                    <div
                      className="w-10 h-10 rounded border-2 border-black mb-2 flex items-center justify-center font-bold bg-cover bg-center"
                      style={{ backgroundImage: `url('/assets/images/${Math.min(13, p.id)}.png')` }}
                    />
                    <span className="text-sm font-black truncate max-w-full text-black">
                      {p.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end w-full border-t border-black/10 pt-3">
              <button
                onClick={() => onResolve(false, null)}
                className="px-4 py-2 border-2 border-black bg-white text-black font-bold text-sm rounded shadow-subtle-3 hover:bg-neutral-50 cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] transition"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          /* Question Display Stage */
          <div className="w-full flex flex-col items-center">
            {/* Duel detail info */}
            {category === "duel" && selectedOpponentId && (
              <div className="flex items-center gap-3 justify-center mb-5 border-b-2 border-black pb-3 w-full">
                <span className="font-extrabold text-black bg-[#fae9ff] px-2 py-1 rounded border-2 border-black shadow-subtle-3 text-xs">{activePlayer.name}</span>
                <span className="text-black text-xs font-black">VS</span>
                <span className="font-extrabold text-black bg-[#fef3c8] px-2 py-1 rounded border-2 border-black shadow-subtle-3 text-xs">
                  {otherPlayers.find((p) => p.id === selectedOpponentId)?.name}
                </span>
              </div>
            )}

            {/* Question Text Card */}
            <div className="w-full bg-white border-2 border-black shadow-subtle-2 rounded-lg p-6 mb-6 flex flex-col min-h-36 justify-center">
              <p className="text-black text-center font-bold leading-relaxed text-md font-sans">
                {question ? question.question : "(Идет загрузка вопросов...)"}
              </p>
            </div>

            {/* Resolutions */}
            {category === "duel" ? (
              /* Duel resolution: select winner */
              <div className="w-full flex flex-col items-center select-none">
                <p className="text-neutral-500 text-xs font-bold mb-3">Кто победил в этой мини-игре?</p>
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <motion.button
                    onClick={() => handleDuelResolution(activePlayer.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="py-3 bg-white hover:bg-neutral-50 border-2 border-black hover:shadow-subtle shadow-subtle-3 rounded-lg font-black text-black cursor-pointer text-sm text-center transition"
                  >
                    🏆 {activePlayer.name}
                  </motion.button>
                  {selectedOpponentId && (
                    <motion.button
                      onClick={() => handleDuelResolution(selectedOpponentId)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="py-3 bg-white hover:bg-neutral-50 border-2 border-black hover:shadow-subtle shadow-subtle-3 rounded-lg font-black text-black cursor-pointer text-sm text-center transition"
                    >
                      🏆 {otherPlayers.find((p) => p.id === selectedOpponentId)?.name}
                    </motion.button>
                  )}
                </div>

                <div className="mt-4 flex w-full justify-between items-center bg-zinc-50 border-t-2 border-black p-3 rounded-md border-x-2">
                  <button
                    onClick={() => handleDuelResolution("none")}
                    className="text-neutral-500 hover:text-black hover:underline text-xs font-bold cursor-pointer transition"
                  >
                    Никто / Ничья
                  </button>
                  <button
                    onClick={() => setDuelStage("choose_opponent")}
                    className="text-neutral-500 hover:text-black hover:underline text-xs font-bold cursor-pointer transition"
                  >
                    Перевыбрать соперника
                  </button>
                </div>
              </div>
            ) : (
              /* Simple Question resolution: correct vs wrong */
              <div className="flex gap-4 w-full">
                <motion.button
                  onClick={() => onResolve(false)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded border-2 border-black bg-white hover:bg-red-50 text-black font-bold shadow-subtle-3 hover:shadow-subtle cursor-pointer text-sm transition"
                >
                  <X className="w-4 h-4 text-red-500" />
                  Неверно
                </motion.button>

                <motion.button
                  onClick={() => onResolve(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded border-2 border-black bg-accent-green hover:bg-lime-400 text-black font-black shadow-subtle hover:shadow-subtle-2 cursor-pointer text-sm transition"
                >
                  <Check className="w-5 h-5" />
                  Верно
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { Sparkles } from "lucide-react";

interface DiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (val: number) => void;
  mode?: "normal" | "lottery";
}

const LOTTERY_VALUES = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

export default function DiceModal({ isOpen, onClose, onConfirm, mode = "normal" }: DiceModalProps) {
  const [isRolling, setIsRolling] = useState(true);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [currentLotteryValue, setCurrentLotteryValue] = useState(0);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  const isLottery = mode === "lottery";

  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setIsRolling(true);
    setDiceResult(null);
    setCurrentFaceIndex(0);
    setCurrentLotteryValue(0);

    let ticks = 0;
    const maxTicks = 22;
    let speed = 50;

    const roll = () => {
      if (isLottery) {
        setCurrentLotteryValue(LOTTERY_VALUES[Math.floor(Math.random() * LOTTERY_VALUES.length)]);
      } else {
        setCurrentFaceIndex(Math.floor(Math.random() * 6));
      }
      ticks++;

      if (ticks < maxTicks) {
        // Slow down the speed as it reaches the end
        if (ticks > maxTicks - 8) {
          speed += 25;
        }
        setTimeout(roll, speed);
      } else {
        const finalVal = isLottery
          ? LOTTERY_VALUES[Math.floor(Math.random() * LOTTERY_VALUES.length)]
          : Math.floor(Math.random() * 6) + 1;
        if (isLottery) {
          setCurrentLotteryValue(finalVal);
        } else {
          setCurrentFaceIndex(finalVal - 1);
        }
        setDiceResult(finalVal);
        setIsRolling(false);
      }
    };

    // Delay start of roll slightly
    const startTimeout = setTimeout(roll, 150);
    return () => {
      clearTimeout(startTimeout);
    };
  }, [isOpen, isLottery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const isFocusedInput =
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA";

        if (!isFocusedInput && diceResult !== null && !isRolling) {
          e.preventDefault();
          e.stopPropagation();
          onConfirm(diceResult);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, diceResult, isRolling, onConfirm, onClose]);

  const handleConfirm = () => {
    if (diceResult !== null) {
      onConfirm(diceResult);
      onClose();
    }
  };

  const lotteryBg =
    !isRolling && diceResult !== null
      ? diceResult > 0
        ? "bg-accent-green"
        : diceResult < 0
        ? "bg-rose-300"
        : "bg-zinc-200"
      : "bg-highlight-yellow";

  return (
    <Modal isOpen={isOpen} title={isLottery ? "Лотерея: -6 ... +6" : "Бросок кубика 🎲"}>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        {/* Dice visual container */}
        <div className="h-44 flex items-center justify-center relative w-full mb-4">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={isRolling ? "rolling" : `result-${diceResult}`}
              className={`w-28 h-28 p-4 rounded-lg border-4 border-black select-none cursor-default flex items-center justify-center
                ${
                  isLottery
                    ? `${lotteryBg} text-black shadow-subtle-2`
                    : isRolling
                    ? "bg-highlight-yellow text-black shadow-subtle-2"
                    : "bg-accent-green text-black shadow-subtle-2"
                }`}
              style={{ transformStyle: "preserve-3d" }}
              animate={
                isRolling
                  ? {
                      rotate: [0, 90, 180, 270, 360],
                      scale: [1, 1.2, 0.9, 1.1, 1],
                      y: [0, -25, 10, -5, 0],
                    }
                  : {
                      rotate: [0, 5, -5, 0],
                      scale: [0.9, 1.12, 0.98, 1],
                    }
              }
              transition={
                isRolling
                  ? {
                      type: "tween",
                      duration: 1.1,
                      ease: "easeInOut",
                    }
                  : {
                      rotate: { type: "tween", duration: 0.5, ease: "easeOut" },
                      scale: { type: "tween", duration: 0.5, ease: "easeOut" },
                    }
              }
            >
              {isLottery ? (
                <span
                  className={`font-black font-mono leading-none ${
                    Math.abs(currentLotteryValue) >= 10 ? "text-4xl" : "text-5xl"
                  }`}
                >
                  {currentLotteryValue > 0 ? `+${currentLotteryValue}` : currentLotteryValue}
                </span>
              ) : (
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1.5 items-center justify-items-center">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const currentValue = currentFaceIndex + 1;
                    const activeDots =
                      currentValue === 1 ? [4] :
                      currentValue === 2 ? [0, 8] :
                      currentValue === 3 ? [0, 4, 8] :
                      currentValue === 4 ? [0, 2, 6, 8] :
                      currentValue === 5 ? [0, 2, 4, 6, 8] :
                      currentValue === 6 ? [0, 2, 3, 5, 6, 8] : [];
                    
                    const isActive = activeDots.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full bg-black transition-all duration-150 ${
                          isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sparkles on rolling completion */}
          {!isRolling && diceResult !== null && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute text-orange-500 pointer-events-none"
            >
              <div className="flex gap-24 justify-between w-64">
                <Sparkles className="w-8 h-8 animate-pulse text-orange-500" />
                <Sparkles className="w-8 h-8 animate-pulse text-orange-600" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Rolling Status / Result */}
        <div className="h-10 mb-6">
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.p
                key="rolling-text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-neutral-500 font-bold text-sm animate-pulse"
              >
                {isLottery ? "Лотерея крутится... фортуна решает..." : "Кубик вертится... крутится..."}
              </motion.p>
            ) : (
              <motion.div
                key="result-text"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-black"
              >
                {isLottery ? (
                  <>
                    <span className="text-zinc-500 font-bold">
                      {diceResult! > 0 ? "Вперёд на" : diceResult! < 0 ? "Назад на" : "Пропуск:"}
                    </span>{" "}
                    <span
                      className={`text-2xl font-black font-mono px-2 py-0.5 rounded border-2 border-black inline-block text-black
                        ${diceResult! > 0 ? "bg-accent-green" : diceResult! < 0 ? "bg-rose-200" : "bg-zinc-100"}`}
                    >
                      {diceResult! > 0 ? `+${diceResult}` : diceResult}
                    </span>{" "}
                    {diceResult !== 0 && (
                      <span className="text-zinc-500 font-bold">
                        {Math.abs(diceResult!) === 1 ? "шаг" : Math.abs(diceResult!) <= 4 ? "шага" : "шагов"}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-zinc-500 font-bold">Вам выпало:</span>{" "}
                    <span className="text-2xl font-black text-black font-mono bg-accent-green px-2 py-0.5 rounded border-2 border-black inline-block">
                      {diceResult}
                    </span>{" "}
                    <span className="text-zinc-500 font-bold">
                      {diceResult === 1 || diceResult === 5 || diceResult === 6 ? "шагов" : "шага"}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex w-full gap-3 justify-center">
          {!isLottery && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded border-2 border-black bg-white text-black font-bold shadow-subtle-3 hover:bg-neutral-50 cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] transition"
            >
              Отмена
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isRolling}
            className={`px-8 py-2.5 rounded border-2 border-black font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5
              ${
                isRolling
                  ? "bg-zinc-100 text-zinc-400 border-zinc-300 cursor-not-allowed"
                  : "bg-accent-green text-black shadow-subtle hover:shadow-subtle-2 active:translate-x-[1px] active:translate-y-[1px]"
              }`}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </Modal>
  );
}

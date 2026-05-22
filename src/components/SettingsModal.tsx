import { useState, useEffect } from "react";
import Modal from "./Modal";
import { GameSettings } from "../types";
import { RotateCcw, Save, Sliders, Settings } from "lucide-react";
import { motion } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
}

const DEFAULT_CELLS = {
  blitz: [14, 22, 30, 38, 64, 70, 75, 88],
  question: [50, 53, 80, 86],
  duel: [29, 42, 25, 46],
};

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [enableBlitz, setEnableBlitz] = useState(settings.enableBlitz);
  const [enableQuestions, setEnableQuestions] = useState(settings.enableQuestions);
  const [enableDuels, setEnableDuels] = useState(settings.enableDuels);
  const [moveSpeed, setMoveSpeed] = useState(settings.moveSpeed);

  // States for comma-separated cell lists
  const [blitzInput, setBlitzInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [duelInput, setDuelInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEnableBlitz(settings.enableBlitz);
      setEnableQuestions(settings.enableQuestions);
      setEnableDuels(settings.enableDuels);
      setMoveSpeed(settings.moveSpeed);
      setBlitzInput(settings.blitzCells.join(", "));
      setQuestionInput(settings.questionCells.join(", "));
      setDuelInput(settings.duelCells.join(", "));
    }
  }, [isOpen, settings]);

  const parseCells = (val: string) => {
    return val
      .split(",")
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num) && num >= 0 && num < 91);
  };

  const handleSave = () => {
    onSave({
      enableBlitz,
      enableQuestions,
      enableDuels,
      moveSpeed,
      blitzCells: parseCells(blitzInput),
      questionCells: parseCells(questionInput),
      duelCells: parseCells(duelInput),
    });
    onClose();
  };

  const resetCategoryCells = (category: "blitz" | "question" | "duel") => {
    const defaults = DEFAULT_CELLS[category].join(", ");
    if (category === "blitz") setBlitzInput(defaults);
    if (category === "question") setQuestionInput(defaults);
    if (category === "duel") setDuelInput(defaults);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки игры ⚙️" maxWidth="max-w-md">
      <div className="flex flex-col gap-4 text-sm max-h-[500px] overflow-y-auto pr-1">
        {/* Switches */}
        <div className="bg-[#fef3c8] border-2 border-black rounded-lg p-4 flex flex-col gap-3.5 shadow-subtle-3">
          <h4 className="text-black font-black uppercase text-[11px] tracking-wider mb-1 flex items-center gap-1.5 border-b border-black/10 pb-1.5">
            <Sliders className="w-4 h-4 text-black" />
            Специальные Клетки
          </h4>

          {/* Blitz Switch */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div className="flex flex-col">
              <span className="font-extrabold text-black text-sm">Включить БЛИЦ</span>
              <span className="text-neutral-700 text-[11px]">Клетки с микро-заданием</span>
            </div>
            <input
              type="checkbox"
              checked={enableBlitz}
              onChange={(e) => setEnableBlitz(e.target.checked)}
              className="w-4 h-4 accent-black rounded bg-white border-2 border-black cursor-pointer"
            />
          </label>

          {/* Question Switch */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div className="flex flex-col">
              <span className="font-extrabold text-black text-sm">Включить ВОПРОСЫ</span>
              <span className="text-neutral-700 text-[11px]">Штрафы или бонусы за ответы</span>
            </div>
            <input
              type="checkbox"
              checked={enableQuestions}
              onChange={(e) => setEnableQuestions(e.target.checked)}
              className="w-4 h-4 accent-black rounded bg-white border-2 border-black cursor-pointer"
            />
          </label>

          {/* Duel Switch */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div className="flex flex-col">
              <span className="font-extrabold text-black text-sm">Включить ДУЭЛИ</span>
              <span className="text-neutral-700 text-[11px]">Случайные дуэли с противниками</span>
            </div>
            <input
              type="checkbox"
              checked={enableDuels}
              onChange={(e) => setEnableDuels(e.target.checked)}
              className="w-4 h-4 accent-black rounded bg-white border-2 border-black cursor-pointer"
            />
          </label>
        </div>

        {/* Animation speed slider */}
        <div className="bg-[#fae9ff] border-2 border-black rounded-lg p-4 flex flex-col gap-2 shadow-subtle-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-extrabold text-black">Скорость перемещения</span>
            <span className="text-black font-mono text-xs font-black bg-white px-1.5 py-0.5 border-2 border-black rounded">
              {moveSpeed} мс / шаг
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={1500}
            step={50}
            value={moveSpeed}
            onChange={(e) => setMoveSpeed(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-white border-2 border-black rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        {/* Mapping setup */}
        <div className="bg-[#d2fae5] border-2 border-black rounded-lg p-4 flex flex-col gap-3 shadow-subtle-3">
          <h4 className="text-black font-black uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-black/10 pb-1.5">
            <Settings className="w-4 h-4 text-black" />
            Расположение Спец-Фишек
          </h4>

          {/* Blitz Cells */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-extrabold text-black">Клетки БЛИЦ (0 - 90)</span>
              <button
                onClick={() => resetCategoryCells("blitz")}
                className="text-neutral-700 hover:text-black flex items-center gap-1 font-bold cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            </div>
            <input
              type="text"
              value={blitzInput}
              onChange={(e) => setBlitzInput(e.target.value)}
              className="bg-white border-2 border-black rounded-md px-3 py-1.5 text-black text-xs font-mono font-bold focus:outline-none focus:bg-neutral-50 shadow-subtle-3"
              placeholder="e.g. 14, 22, 30"
              disabled={!enableBlitz}
            />
          </div>

          {/* Question Cells */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-extrabold text-black">Клетки ВОПРОС</span>
              <button
                onClick={() => resetCategoryCells("question")}
                className="text-neutral-700 hover:text-black flex items-center gap-1 font-bold cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            </div>
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="bg-white border-2 border-black rounded-md px-3 py-1.5 text-black text-xs font-mono font-bold focus:outline-none focus:bg-neutral-50 shadow-subtle-3"
              placeholder="e.g. 50, 53, 80"
              disabled={!enableQuestions}
            />
          </div>

          {/* Duel Cells */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-extrabold text-black">Клетки ДУЭЛЬ</span>
              <button
                onClick={() => resetCategoryCells("duel")}
                className="text-neutral-700 hover:text-black flex items-center gap-1 font-bold cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            </div>
            <input
              type="text"
              value={duelInput}
              onChange={(e) => setDuelInput(e.target.value)}
              className="bg-white border-2 border-black rounded-md px-3 py-1.5 text-black text-xs font-mono font-bold focus:outline-none focus:bg-neutral-50 shadow-subtle-3"
              placeholder="e.g. 29, 42, 25"
              disabled={!enableDuels}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-2 justify-end pt-3 border-t-2 border-black">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-black bg-white text-black hover:bg-neutral-50 font-bold text-sm rounded shadow-subtle-3 hover:shadow-subtle cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] transition"
          >
            Закрыть
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="bg-accent-green text-black px-5 py-2 rounded border-2 border-black font-black flex items-center gap-1.5 text-sm cursor-pointer shadow-subtle hover:shadow-subtle-2 active:translate-x-[1px] active:translate-y-[1px] transition"
          >
            <Save className="w-4 h-4" />
            Сохранить
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

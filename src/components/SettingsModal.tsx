import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { GameSettings, QuestionsDB } from "../types";
import { PRESET_MAP } from "../presetsData";
import { 
  RotateCcw, 
  Save, 
  Sliders, 
  Settings, 
  Upload, 
  Download, 
  Check, 
  AlertTriangle, 
  HelpCircle,
  FileJson 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  questionsDB: QuestionsDB;
  onSaveQuestionsDB: (newQuestions: QuestionsDB) => void;
}

const DEFAULT_CELLS = {
  blitz: [14, 22, 30, 38, 64, 70, 75, 88],
  question: [50, 53, 80, 86],
  duel: [29, 42, 25, 46],
  help: [11, 47, 73],
  lottery: [9, 35, 60, 81],
};

const PRESETS_INFO = [
  { key: "default", name: "Стандарт", desc: "Универсальный" },
  { key: "pk", name: "ПК", desc: "Железо и Софт" },
  { key: "games", name: "Игры", desc: "Гейминг и Лор" },
  { key: "web", name: "Веб", desc: "HTML, CSS & JS" },
  { key: "python", name: "Питон", desc: "Синтаксис Python" },
  { key: "web2", name: "Веб2", desc: "React, Vite, CSS" },
];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  questionsDB,
  onSaveQuestionsDB,
}: SettingsModalProps) {
  const [enableBlitz, setEnableBlitz] = useState(settings.enableBlitz);
  const [enableQuestions, setEnableQuestions] = useState(settings.enableQuestions);
  const [enableDuels, setEnableDuels] = useState(settings.enableDuels);
  const [enableHelp, setEnableHelp] = useState(settings.enableHelp);
  const [enableLottery, setEnableLottery] = useState(settings.enableLottery);
  const [moveSpeed, setMoveSpeed] = useState(settings.moveSpeed);

  // States for comma-separated cell lists
  const [blitzInput, setBlitzInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [duelInput, setDuelInput] = useState("");
  const [helpInput, setHelpInput] = useState("");
  const [lotteryInput, setLotteryInput] = useState("");

  // Questions DB state management
  const [localQuestionsDB, setLocalQuestionsDB] = useState<QuestionsDB>(questionsDB);
  const [activePreset, setActivePreset] = useState<string>("custom");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEnableBlitz(settings.enableBlitz);
      setEnableQuestions(settings.enableQuestions);
      setEnableDuels(settings.enableDuels);
      setEnableHelp(settings.enableHelp ?? true);
      setEnableLottery(settings.enableLottery ?? true);
      setMoveSpeed(settings.moveSpeed);
      setBlitzInput(settings.blitzCells.join(", "));
      setQuestionInput(settings.questionCells.join(", "));
      setDuelInput(settings.duelCells.join(", "));
      setHelpInput((settings.helpCells ?? DEFAULT_CELLS.help).join(", "));
      setLotteryInput((settings.lotteryCells ?? DEFAULT_CELLS.lottery).join(", "));

      setLocalQuestionsDB(questionsDB);
      setSuccessMsg(null);
      setErrorMsg(null);

      // Determine preset key by comparing questionsCount or contents
      const matchedKey = Object.entries(PRESET_MAP).find(([_, db]) => {
        return (
          db.blitz.length === questionsDB.blitz.length &&
          db.question.length === questionsDB.question.length &&
          db.duel.length === questionsDB.duel.length &&
          (db.blitz[0]?.question === questionsDB.blitz[0]?.question)
        );
      });
      setActivePreset(matchedKey ? matchedKey[0] : "custom");
    }
  }, [isOpen, settings, questionsDB]);

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
      enableHelp,
      enableLottery,
      moveSpeed,
      blitzCells: parseCells(blitzInput),
      questionCells: parseCells(questionInput),
      duelCells: parseCells(duelInput),
      helpCells: parseCells(helpInput),
      lotteryCells: parseCells(lotteryInput),
    });
    onSaveQuestionsDB(localQuestionsDB);
    onClose();
  };

  const resetCategoryCells = (category: "blitz" | "question" | "duel" | "help" | "lottery") => {
    const defaults = DEFAULT_CELLS[category].join(", ");
    if (category === "blitz") setBlitzInput(defaults);
    if (category === "question") setQuestionInput(defaults);
    if (category === "duel") setDuelInput(defaults);
    if (category === "help") setHelpInput(defaults);
    if (category === "lottery") setLotteryInput(defaults);
  };

  // Preset Selection
  const applyPreset = (presetKey: string) => {
    const db = PRESET_MAP[presetKey];
    if (db) {
      setLocalQuestionsDB(db);
      setActivePreset(presetKey);
      setSuccessMsg(`Пакет вопросов "${PRESETS_INFO.find(p => p.key === presetKey)?.name}" успешно выбран!`);
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Custom JSON Input handler
  const handleJSONImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || (typeof parsed !== "object")) {
          throw new Error("Неверная структура JSON");
        }

        const blitz = Array.isArray(parsed.blitz) ? parsed.blitz : [];
        const question = Array.isArray(parsed.question) ? parsed.question : [];
        const duel = Array.isArray(parsed.duel) ? parsed.duel : [];

        if (blitz.length === 0 && question.length === 0 && duel.length === 0) {
          throw new Error("JSON пуст или не содержит разделы blitz, question, duel");
        }

        const newlyImported: QuestionsDB = {
          blitz: blitz.map((q: any, i: number) => ({ id: q.id || (i + 1), question: String(q.question) })),
          question: question.map((q: any, i: number) => ({ id: q.id || (i + 1), question: String(q.question) })),
          duel: duel.map((q: any, i: number) => ({ id: q.id || (i + 1), question: String(q.question) })),
        };

        setLocalQuestionsDB(newlyImported);
        setActivePreset("custom");
        setSuccessMsg(`Успешно импортировано вопросов: Блиц (${blitz.length}), Вопросы (${question.length}), Дуэли (${duel.length})!`);
        setErrorMsg(null);
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err: any) {
        setErrorMsg(err?.message || "Неверный формат JSON файла");
        setSuccessMsg(null);
        setTimeout(() => setErrorMsg(null), 5000);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be double-loaded
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // JSON Export handler
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localQuestionsDB, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `board_game_questions_${activePreset}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки игры ⚙️" maxWidth="max-w-md">
      <div className="flex flex-col gap-4 text-sm max-h-[550px] overflow-y-auto pr-1">
        {/* Toggle Switches */}
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

          {/* Help-a-friend Switch */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div className="flex flex-col">
              <span className="font-extrabold text-black text-sm">Включить ПОМОЩЬ</span>
              <span className="text-neutral-700 text-[11px]">Притянуть любого игрока к себе</span>
            </div>
            <input
              type="checkbox"
              checked={enableHelp}
              onChange={(e) => setEnableHelp(e.target.checked)}
              className="w-4 h-4 accent-black rounded bg-white border-2 border-black cursor-pointer"
            />
          </label>

          {/* Lottery Switch */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div className="flex flex-col">
              <span className="font-extrabold text-black text-sm">Включить ЛОТЕРЕЮ</span>
              <span className="text-neutral-700 text-[11px]">Кубик от −6 до +6 — риск!</span>
            </div>
            <input
              type="checkbox"
              checked={enableLottery}
              onChange={(e) => setEnableLottery(e.target.checked)}
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

        {/* Dynamic Questions Database Settings Module */}
        <div className="bg-[#dfeeff] border-2 border-black rounded-lg p-4 flex flex-col gap-3 shadow-subtle-3">
          <h4 className="text-black font-black uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-black/15 pb-1.5">
            <FileJson className="w-4 h-4 text-black" />
            База Вопросов Викторины 🧠
          </h4>

          {/* Stats Info */}
          <div className="text-xs bg-white/70 border-2 border-black border-dashed rounded px-3 py-2 flex justify-between font-mono font-bold text-black">
            <span>Блиц: {localQuestionsDB.blitz.length}</span>
            <span>Вопрос: {localQuestionsDB.question.length}</span>
            <span>Дуэль: {localQuestionsDB.duel.length}</span>
          </div>

          {/* Presets List */}
          <div className="flex flex-col gap-1.5 mt-0.5">
            <span className="text-xs font-black text-black uppercase tracking-wider">Выберите Пресет:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS_INFO.map((pack) => {
                const isSelected = activePreset === pack.key;
                return (
                  <button
                    key={pack.key}
                    onClick={() => applyPreset(pack.key)}
                    className={`py-1.5 px-1 rounded-md border-2 border-black text-center transition cursor-pointer select-none active:translate-y-[0.5px]
                      ${
                        isSelected 
                          ? "bg-accent-green text-black font-black shadow-subtle-2"
                          : "bg-white text-black font-medium hover:bg-neutral-50 shadow-subtle-3"
                      }`}
                  >
                    <div className="text-xs truncate font-black leading-tight">{pack.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Import/Export buttons */}
          <div className="flex gap-2 mt-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleJSONImport} 
              accept=".json" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 bg-white border-2 border-black rounded-md text-xs font-black text-black hover:bg-neutral-50 shadow-subtle-3 active:translate-y-[0.5px] flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Импорт .json
            </button>
            <button
              onClick={handleExportJSON}
              className="py-2 px-3 bg-white border-2 border-black rounded-md text-xs font-black text-black hover:bg-neutral-50 shadow-subtle-3 active:translate-y-[0.5px] flex items-center justify-center gap-1 cursor-pointer transition"
              title="Скачать текущий набор вопросов в UTF-8 JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Экспорт
            </button>
          </div>

          {/* Status feedback animation messages */}
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-100 border-2 border-black text-emerald-800 text-xs px-2.5 py-2.5 rounded font-black flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-rose-100 border-2 border-black text-rose-800 text-xs px-2.5 py-1.5 rounded font-black flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
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

          {/* Help Cells */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-extrabold text-black">Клетки ПОМОЩЬ</span>
              <button
                onClick={() => resetCategoryCells("help")}
                className="text-neutral-700 hover:text-black flex items-center gap-1 font-bold cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            </div>
            <input
              type="text"
              value={helpInput}
              onChange={(e) => setHelpInput(e.target.value)}
              className="bg-white border-2 border-black rounded-md px-3 py-1.5 text-black text-xs font-mono font-bold focus:outline-none focus:bg-neutral-50 shadow-subtle-3"
              placeholder="e.g. 11, 47, 73"
              disabled={!enableHelp}
            />
          </div>

          {/* Lottery Cells */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-extrabold text-black">Клетки ЛОТЕРЕЯ</span>
              <button
                onClick={() => resetCategoryCells("lottery")}
                className="text-neutral-700 hover:text-black flex items-center gap-1 font-bold cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            </div>
            <input
              type="text"
              value={lotteryInput}
              onChange={(e) => setLotteryInput(e.target.value)}
              className="bg-white border-2 border-black rounded-md px-3 py-1.5 text-black text-xs font-mono font-bold focus:outline-none focus:bg-neutral-50 shadow-subtle-3"
              placeholder="e.g. 9, 35, 60"
              disabled={!enableLottery}
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

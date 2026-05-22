import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PATH_COORDINATES,
  SPECIAL_MOVES,
} from "./coordinates";
import { Player, GameSettings, Question, QuestionsDB } from "./types";
import { DEFAULT_QUESTIONS_DB } from "./questionsData";
import {
  Dice5,
  Users,
  Settings,
  RotateCcw,
  SkipForward,
  Play,
  RotateCw,
  HelpCircle,
  Sparkles,
  Maximize2,
  Minimize2,
  Swords,
  Award,
  CircleHelp,
  ArrowRight,
  ChevronRight,
  Info
} from "lucide-react";

// Modal Components
import DiceModal from "./components/DiceModal";
import QuestionModal from "./components/QuestionModal";
import SpecialCellModal from "./components/SpecialCellModal";
import PlayersModal from "./components/PlayersModal";
import SettingsModal from "./components/SettingsModal";

// Player Config mapping for visual styles
const PLAYER_CONFIGS: Record<number, { name: string; color: string; shadow: string; glowColor: string }> = {
  1:  { name: "Игрок 1", color: "from-red-500 to-rose-600", shadow: "shadow-red-500/50", glowColor: "rgba(239, 68, 68, 0.6)" },
  2:  { name: "Игрок 2", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/50", glowColor: "rgba(59, 130, 246, 0.6)" },
  3:  { name: "Игрок 3", color: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/50", glowColor: "rgba(16, 185, 129, 0.6)" },
  4:  { name: "Игрок 4", color: "from-amber-400 to-yellow-500", shadow: "shadow-yellow-500/50", glowColor: "rgba(245, 158, 11, 0.6)" },
  5:  { name: "Игрок 5", color: "from-purple-500 to-fuchsia-600", shadow: "shadow-purple-500/50", glowColor: "rgba(168, 85, 247, 0.6)" },
  6:  { name: "Игрок 6", color: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/50", glowColor: "rgba(249, 115, 22, 0.6)" },
  7:  { name: "Игрок 7", color: "from-pink-400 to-rose-500", shadow: "shadow-pink-500/50", glowColor: "rgba(244, 63, 94, 0.6)" },
  8:  { name: "Игрок 8", color: "from-cyan-400 to-teal-500", shadow: "shadow-cyan-400/50", glowColor: "rgba(34, 211, 238, 0.6)" },
  9:  { name: "Игрок 9", color: "from-amber-700 to-yellow-800", shadow: "shadow-amber-800/50", glowColor: "rgba(180, 83, 9, 0.6)" },
  10: { name: "Игрок 10", color: "from-lime-400 to-lime-600", shadow: "shadow-lime-500/50", glowColor: "rgba(163, 230, 53, 0.6)" },
  11: { name: "Игрок 11", color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/50", glowColor: "rgba(217, 70, 239, 0.6)" },
  12: { name: "Игрок 12", color: "from-stone-500 to-stone-700", shadow: "shadow-stone-500/50", glowColor: "rgba(120, 113, 108, 0.6)" },
  13: { name: "Игрок 13", color: "from-violet-600 to-purple-800", shadow: "shadow-violet-600/50", glowColor: "rgba(124, 58, 237, 0.6)" },
};

export default function App() {
  // Game state
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
  const [settings, setSettings] = useState<GameSettings>({
    enableBlitz: true,
    enableQuestions: true,
    enableDuels: true,
    moveSpeed: 500,
    blitzCells: [14, 22, 30, 38, 64, 70, 75, 88],
    questionCells: [50, 53, 80, 86],
    duelCells: [29, 42, 25, 46],
  });

  const [questionsDB, setQuestionsDB] = useState<QuestionsDB>(DEFAULT_QUESTIONS_DB);
  const [usedQuestions, setUsedQuestions] = useState<Record<string, number[]>>({
    blitz: [],
    question: [],
    duel: [],
  });

  // UI States
  const [stepsInput, setStepsInput] = useState<number | "">("");
  const [isMoving, setIsMoving] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isFitToScreen, setIsFitToScreen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Active Modals States
  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Question resolution modal state helper
  const [activeQuestionCategory, setActiveQuestionCategory] = useState<"blitz" | "question" | "duel" | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const questionResolveRef = useRef<((correct: boolean, duelWinnerId?: number | null | undefined) => void) | null>(null);

  // Special cell modal state details
  const [specialCellModalData, setSpecialCellModalData] = useState<{
    isOpen: boolean;
    start: number;
    end: number;
  } | null>(null);
  const specialCellResolveRef = useRef<((approved: boolean) => void) | null>(null);

  // Load state and load questions.json on startup
  useEffect(() => {
    // Determine initial configs or load from LocalStorage
    const savedGameState = localStorage.getItem("gameState");
    if (savedGameState) {
      try {
        const parsed = JSON.parse(savedGameState);
        if (parsed.players && parsed.players.length > 0) {
          setPlayers(parsed.players);
        } else {
          setPlayers([
            { id: 1, name: "Игрок 1", position: 0 },
            { id: 2, name: "Игрок 2", position: 0 },
            { id: 3, name: "Игрок 3", position: 0 },
          ]);
        }
        if (typeof parsed.currentPlayerTurn === "number") {
          setCurrentPlayerTurn(parsed.currentPlayerTurn);
        }
      } catch (e) {
        console.error("Ошибка чтения сохраненного состояния игры", e);
      }
    } else {
      setPlayers([
        { id: 1, name: "Игрок 1", position: 0 },
        { id: 2, name: "Игрок 2", position: 0 },
        { id: 3, name: "Игрок 3", position: 0 },
      ]);
    }

    // Load settings
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Ошибка чтения настроек", e);
      }
    }

    // Try to fetch external questions.json
    fetch("/questions.json")
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.blitz || data.question || data.duel)) {
          // Merge fetched questions with fallbacks to avoid blank pools
          setQuestionsDB({
            blitz: data.blitz && data.blitz.length > 0 ? data.blitz : DEFAULT_QUESTIONS_DB.blitz,
            question: data.question && data.question.length > 0 ? data.question : DEFAULT_QUESTIONS_DB.question,
            duel: data.duel && data.duel.length > 0 ? data.duel : DEFAULT_QUESTIONS_DB.duel,
          });
        }
      })
      .catch((err) => {
        console.log("questions.json не найден или содержит ошибки. Используем встроенный список готовых вопросов.", err);
      });
  }, []);

  // Sync game state to localStorage
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem(
        "gameState",
        JSON.stringify({
          players,
          currentPlayerTurn,
        })
      );
    }
  }, [players, currentPlayerTurn]);

  // Adjust scaling factor when fit screen is updated
  useEffect(() => {
    if (!isFitToScreen) {
      setScaleFactor(1);
      return;
    }

    const handler = () => {
      const parent = document.getElementById("board-container-wrapper");
      if (!parent) return;

      const viewportWidth = parent.clientWidth - 32; // padding
      const scale = viewportWidth / 1920;
      setScaleFactor(Math.min(scale, 1));
    };

    window.addEventListener("resize", handler);
    handler(); // Run immediately

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [isFitToScreen]);

  // Helper to roll random question
  const getRandomQuestion = (category: "blitz" | "question" | "duel"): Question | null => {
    const pool = questionsDB[category];
    if (!pool || pool.length === 0) return null;

    let used = usedQuestions[category] || [];
    // Reset if all are used
    if (used.length >= pool.length) {
      used = [];
    }

    const available = pool.filter((q) => !used.includes(q.id));
    if (available.length === 0) return pool[0];

    const target = available[Math.floor(Math.random() * available.length)];

    setUsedQuestions((prev) => ({
      ...prev,
      [category]: [...used, target.id],
    }));

    return target;
  };

  // Prompts
  const triggerSpecialCellPrompt = (start: number, end: number): Promise<boolean> => {
    return new Promise((resolve) => {
      specialCellResolveRef.current = resolve;
      setSpecialCellModalData({ isOpen: true, start, end });
    });
  };

  const triggerQuestionPrompt = (category: "blitz" | "question" | "duel"): Promise<{ correct: boolean; winnerId?: number | null }> => {
    return new Promise((resolve) => {
      const question = getRandomQuestion(category);
      setActiveQuestionCategory(category);
      setActiveQuestion(question);
      setQuestionModalOpen(true);

      questionResolveRef.current = (correct: boolean, duelWinnerId?: number | null) => {
        resolve({ correct, winnerId: duelWinnerId });
      };
    });
  };

  // Movement animation sequentially cell-by-cell
  const runSequenceMovement = async (playerIndex: number, speedMs: number, amount: number, direction: "forward" | "backward") => {
    setIsMoving(true);

    const startPos = players[playerIndex].position;
    let targetPos = direction === "forward"
      ? Math.min(startPos + amount, PATH_COORDINATES.length - 1)
      : Math.max(startPos - amount, 0);

    const step = direction === "forward" ? 1 : -1;
    let current = startPos;

    // Sequential walk
    while (current !== targetPos) {
      current += step;
      // React state update
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIndex ? { ...p, position: current } : p))
      );
      await new Promise((resolve) => setTimeout(resolve, speedMs));
    }

    // Special jump cells check
    if (SPECIAL_MOVES.hasOwnProperty(targetPos)) {
      const jumpDestination = SPECIAL_MOVES[targetPos];
      const approved = await triggerSpecialCellPrompt(targetPos, jumpDestination);

      if (approved) {
        setPlayers((prev) =>
          prev.map((p, idx) => (idx === playerIndex ? { ...p, position: jumpDestination } : p))
        );
        targetPos = jumpDestination;
        await new Promise((resolve) => setTimeout(resolve, speedMs));
      }
    }

    // Event checking (Blitz, Question, Duel)
    let finalCell = targetPos;

    if (settings.enableBlitz && settings.blitzCells.includes(finalCell)) {
      const { correct } = await triggerQuestionPrompt("blitz");
      if (correct) {
        finalCell = Math.min(finalCell + 1, PATH_COORDINATES.length - 1);
        setPlayers((prev) =>
          prev.map((p, idx) => (idx === playerIndex ? { ...p, position: finalCell } : p))
        );
        await new Promise((resolve) => setTimeout(resolve, speedMs));
      }
    }

    if (settings.enableQuestions && settings.questionCells.includes(finalCell)) {
      const { correct } = await triggerQuestionPrompt("question");
      if (correct) {
        finalCell = Math.min(finalCell + 2, PATH_COORDINATES.length - 1);
      } else {
        finalCell = Math.max(finalCell - 1, 0);
      }
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIndex ? { ...p, position: finalCell } : p))
      );
      await new Promise((resolve) => setTimeout(resolve, speedMs));
    }

    if (settings.enableDuels && settings.duelCells.includes(finalCell)) {
      const { winnerId } = await triggerQuestionPrompt("duel");
      if (winnerId !== undefined && winnerId !== null) {
        // Duel winner moves forward by 2!
        setPlayers((prev) =>
          prev.map((p) => {
            if (p.id === winnerId) {
              return { ...p, position: Math.min(p.position + 2, PATH_COORDINATES.length - 1) };
            }
            return p;
          })
        );
        await new Promise((resolve) => setTimeout(resolve, speedMs));
      }
    }

    // Next round
    setIsMoving(false);
    setStepsInput("");
    if (players.length > 0) {
      setCurrentPlayerTurn((prev) => (prev + 1) % players.length);
    }
  };

  const handleMoveForward = () => {
    if (stepsInput === "" || isMoving) return;
    runSequenceMovement(currentPlayerTurn, settings.moveSpeed, stepsInput, "forward");
  };

  const handleMoveBackward = () => {
    if (stepsInput === "" || isMoving) return;
    runSequenceMovement(currentPlayerTurn, settings.moveSpeed, stepsInput, "backward");
  };

  const handleSkipTurn = () => {
    if (isMoving || players.length === 0) return;
    setStepsInput("");
    setCurrentPlayerTurn((prev) => (prev + 1) % players.length);
  };

  const handleResetGame = () => {
    if (isMoving) return;
    if (confirm("Вы уверены, что хотите сбросить игроков в начало карты и начать новую игру?")) {
      setPlayers((prev) => prev.map((p) => ({ ...p, position: 0 })));
      setCurrentPlayerTurn(0);
      setStepsInput("");
    }
  };

  // Add, Remove, Rename players
  const handleAddPlayer = () => {
    if (players.length >= 13) return;
    const usedIds = players.map((p) => p.id);
    let newId = 1;
    while (usedIds.includes(newId)) {
      newId++;
    }

    setPlayers((prev) => [
      ...prev,
      {
        id: newId,
        name: `Игрок ${newId}`,
        position: 0,
      },
    ]);
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length <= 1) return;
    const isRemovingCurrent = currentPlayerTurn === index;

    setPlayers((prev) => prev.filter((_, idx) => idx !== index));

    if (isRemovingCurrent) {
      setCurrentPlayerTurn(0);
    } else if (currentPlayerTurn > index) {
      setCurrentPlayerTurn((prev) => prev - 1);
    }
  };

  const handleRenamePlayer = (index: number, newName: string) => {
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newName } : p))
    );
  };

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem("gameSettings", JSON.stringify(newSettings));
  };

  // Player helper coordinate calculation
  const getPlayerCoords = (player: Player, idx: number) => {
    const coordinates = PATH_COORDINATES[player.position] || PATH_COORDINATES[0];
    const radius = 42; // Position offset radius
    const circleSize = 40;
    const totalPlayers = players.length;

    const angleInDegrees = -90 + (360 / totalPlayers) * idx;
    const angleInRadians = (angleInDegrees * Math.PI) / 180;

    const x = coordinates.x + circleSize / 2 + radius * Math.cos(angleInRadians);
    const y = coordinates.y + circleSize / 2 + radius * Math.sin(angleInRadians);

    return { x: x - 20, y: y - 20 };
  };

  const activePlayer = players[currentPlayerTurn];

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-black overflow-hidden flex flex-col antialiased">
      {/* Top Glassmorphism Navigation Controls */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b-2 border-black z-50 flex items-center px-4 md:px-6 justify-between shadow-subtle-3">
        {/* Left Info: Current player and status */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 h-5">
              {activePlayer ? (
                <>
                  <span className="text-xs text-neutral-500 font-bold uppercase mr-1">Ходит:</span>
                  <div
                    className="w-3.5 h-3.5 rounded border border-black bg-cover bg-center"
                    style={{ backgroundImage: `url('/assets/images/${Math.min(13, activePlayer.id)}.jpg')` }}
                  />
                  <span className="text-xs font-black text-black truncate max-w-[120px]">
                    {activePlayer.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-neutral-400">Ожидание...</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Walk Controls */}
        <div className="flex items-center gap-2 bg-white border-2 border-black p-1.5 rounded-lg shadow-subtle-3">
          {/* Preset Buttons for steps input */}
          <div className="hidden lg:flex gap-1">
            {[1, 2].map((num) => (
              <button
                key={num}
                onClick={() => !isMoving && setStepsInput(num)}
                disabled={isMoving}
                className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded border-2 border-black cursor-pointer transition active:translate-x-[0.5px] active:translate-y-[0.5px]
                  ${
                    stepsInput === num
                      ? "bg-accent-green text-black"
                      : "bg-white hover:bg-neutral-50 text-black shadow-subtle-3"
                  }`}
              >
                +{num}
              </button>
            ))}
          </div>

          {/* Number of steps input */}
          <input
            type="number"
            min={1}
            max={90}
            disabled={isMoving}
            value={stepsInput}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
              if (val === "" || (!isNaN(val) && val >= 1)) {
                setStepsInput(val);
              }
            }}
            placeholder="0"
            className="w-12 h-8 text-center bg-white border-2 border-black rounded-md text-sm font-black placeholder-neutral-400 text-black focus:outline-none focus:bg-neutral-50"
          />

          {/* Walk forward button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMoveForward}
            disabled={isMoving || stepsInput === ""}
            className={`h-8 px-4 rounded border-2 border-black flex items-center gap-1 text-xs font-black text-black transition cursor-pointer
              ${
                isMoving || stepsInput === ""
                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                  : "bg-accent-green shadow-subtle hover:shadow-subtle-2"
              }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Ход
          </motion.button>

          {/* Backward button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMoveBackward}
            disabled={isMoving || stepsInput === ""}
            className={`h-8 px-3 rounded border-2 border-black flex items-center gap-1 text-xs font-black bg-white text-black cursor-pointer transition
              ${
                isMoving || stepsInput === ""
                  ? "border-neutral-200 text-neutral-300 cursor-not-allowed bg-zinc-50"
                  : "hover:bg-neutral-50 shadow-subtle-3 hover:shadow-subtle"
              }`}
            title="Ход назад"
          >
            Назад
          </motion.button>

          <div className="w-[2px] h-6 bg-black" />

          {/* Roll Dice Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isMoving && setIsDiceOpen(true)}
            disabled={isMoving}
            className={`h-8 px-3.5 gap-1.5 rounded border-2 border-black font-black text-xs flex items-center text-black bg-highlight-yellow active:scale-95 transition cursor-pointer shadow-subtle hover:shadow-subtle-2
              ${isMoving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Dice5 className="w-4 h-4" />
            Кубик
          </motion.button>
        </div>

        {/* Right Menu: View Scaling, Players and Settings */}
        <div className="flex items-center gap-1.5">
          {/* Fit to screen toggle */}
          <button
            onClick={() => setIsFitToScreen(!isFitToScreen)}
            className={`p-2 rounded border-2 border-black transition cursor-pointer flex items-center justify-center shadow-subtle-3 active:translate-x-[0.5px] active:translate-y-[0.5px]
              ${
                isFitToScreen
                  ? "bg-accent-green text-black"
                  : "bg-white text-black hover:bg-neutral-50"
              }`}
            title={isFitToScreen ? "Показать в масштабе 1:1" : "Масштабировать под экран"}
          >
            {isFitToScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Players configuration */}
          <button
            onClick={() => !isMoving && setIsPlayersOpen(true)}
            disabled={isMoving}
            className="p-2 rounded border-2 border-black bg-white text-black hover:bg-neutral-50 transition cursor-pointer shadow-subtle-3 flex items-center justify-center disabled:opacity-50"
            title="Игроки"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Settings trigger */}
          <button
            onClick={() => !isMoving && setIsSettingsOpen(true)}
            disabled={isMoving}
            className="p-2 rounded border-2 border-black bg-white text-black hover:bg-neutral-50 transition cursor-pointer shadow-subtle-3 flex items-center justify-center disabled:opacity-50"
            title="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="w-[2px] h-6 bg-black mx-1 md:block hidden" />

          {/* Skip Turn */}
          <button
            onClick={handleSkipTurn}
            disabled={isMoving || players.length === 0}
            className="h-9 px-3.5 rounded border-2 border-black bg-white hover:bg-neutral-50 text-black text-xs font-black md:flex hidden items-center gap-1 cursor-pointer transition shadow-subtle-3 disabled:opacity-40"
            title="Пропустить ход"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Пас
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetGame}
            disabled={isMoving}
            className="h-9 w-9 rounded border-2 border-black bg-white text-black hover:bg-rose-50 hover:text-rose-600 md:flex hidden items-center justify-center cursor-pointer transition shadow-subtle-3 disabled:opacity-40"
            title="Новая игра"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 mt-16 flex flex-col items-center justify-start overflow-hidden relative">
        {/* Playboard Wrapper with scroll or scale */}
        <div
          id="board-container-wrapper"
          className="w-full flex-1 overflow-auto p-4 flex justify-start items-start md:justify-center md:items-center bg-neutral-100"
        >
          {/* Scaled workspace box matching exact coordinates scale */}
          <div
            id="board-outer-container"
            className="origin-top-left md:origin-center relative transition-transform duration-350 bg-[#ffffff] border-4 border-black shadow-subtle rounded-lg"
            style={{
              width: "1920px",
              height: "1300px",
              backgroundImage: `url('/assets/images/f.jpg')`,
              backgroundSize: "1920px 1300px",
              backgroundRepeat: "no-repeat",
              transform: `scale(${scaleFactor})`,
              minWidth: "1920px",
              minHeight: "1300px",
            }}
          >
            {/* Visual Tint Layer (opacity overlay matching f.jpg brightness calibration) */}
            <div className="absolute inset-0 bg-black/15 rounded-md pointer-events-none z-[1]" />

            {/* Board Cells Canvas Highlights */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {PATH_COORDINATES.map((coord, i) => {
                const isBlitz = settings.enableBlitz && settings.blitzCells.includes(i);
                const isQuestion = settings.enableQuestions && settings.questionCells.includes(i);
                const isDuel = settings.enableDuels && settings.duelCells.includes(i);
                const isSpecial = SPECIAL_MOVES.hasOwnProperty(i);

                // Get custom styles for cell highlights based on types
                let cellGlow = "";
                let indicatorName = "";
                let indicatorColor = "";

                if (isBlitz) {
                  cellGlow = "border-2 border-black bg-[#fae9ff] shadow-subtle-3 text-black";
                  indicatorName = "БЛИЦ";
                  indicatorColor = "text-[#ea580c]";
                } else if (isQuestion) {
                  cellGlow = "border-2 border-black bg-[#fef3c8] shadow-subtle-3 text-black";
                  indicatorName = "ВОПРОС";
                  indicatorColor = "text-[#b45309]";
                } else if (isDuel) {
                  cellGlow = "border-2 border-black bg-[#d2fae5] shadow-subtle-3 text-black";
                  indicatorName = "ДУЭЛЬ";
                  indicatorColor = "text-[#047857]";
                } else if (isSpecial) {
                  cellGlow = "border-2 border-black bg-[#e0f2fe] shadow-subtle-3 text-black";
                  indicatorName = "ТЕЛЕПОРТ";
                  indicatorColor = "text-[#0369a1]";
                }

                if (!cellGlow) return null;

                return (
                  <div
                    key={i}
                    className={`absolute flex flex-col items-center justify-center rounded-full pointer-events-auto cursor-help transition-all duration-300
                      ${hoveredCell === i ? "scale-125 z-20 brightness-110" : "scale-100"}`}
                    style={{
                      left: `${coord.x}px`,
                      top: `${coord.y}px`,
                      width: "40px",
                      height: "40px",
                    }}
                    onMouseEnter={() => setHoveredCell(i)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <span className={`absolute inset-0 rounded-full ${cellGlow}`} />

                    {/* Miniature cell number */}
                    <span className="text-[11px] font-black font-mono text-black z-10">
                      {i}
                    </span>

                    {/* Hover Card info popup */}
                    <AnimatePresence>
                      {hoveredCell === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute bottom-11 p-3 bg-white border-2 border-black rounded shadow-subtle z-[500] text-left text-xs pointer-events-none text-black w-44"
                        >
                          <div className={`font-black uppercase tracking-wider text-[10px] mb-1 ${indicatorColor}`}>
                            ◆ {indicatorName}
                          </div>
                          <p className="text-neutral-700 font-bold leading-normal">
                            {isBlitz && "Промт-вопрос с мгновенной наградой +1 шаг вперёд."}
                            {isQuestion && "Бонус +2 шага при успехе, либо штраф −1 шаг при провале!"}
                            {isDuel && "Интерактивная дуэль с любым игроком на поле!"}
                            {isSpecial && `Трамплин! Перебрасывает фишку сразу на клетку ${SPECIAL_MOVES[i]}`}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Players Figures overlay rendering */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              {players.map((p, idx) => {
                const coords = getPlayerCoords(p, idx);
                const isCurrent = currentPlayerTurn === idx;

                return (
                  <motion.div
                    key={p.id}
                    className="absolute pointer-events-auto"
                    style={{ width: "40px", height: "40px" }}
                    animate={{ left: coords.x, top: coords.y }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  >
                    {/* Pulsing card marker if active */}
                    {isCurrent && (
                      <span
                        className="absolute inset-[-6px] rounded border-2 border-black bg-accent-green/30 animate-pulse pointer-events-none"
                      />
                    )}

                    <div
                      className="relative w-10 h-10 rounded border-2 border-black flex flex-col items-center justify-center p-0.5 shadow-subtle-2 bg-white cursor-pointer group hover:scale-110 transition duration-200 overflow-hidden"
                    >
                      {/* Character image avatar fallback */}
                      <div
                        className="w-full h-full bg-cover bg-center rounded bg-blend-normal brightness-105"
                        style={{ backgroundImage: `url('/assets/images/${Math.min(13, p.id)}.jpg')` }}
                      />

                      {/* Display player name tooltip in board scale */}
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-white text-black text-[10px] font-black border-2 border-black opacity-0 group-hover:opacity-100 transition truncate max-w-[120px] pointer-events-none whitespace-nowrap shadow-subtle-3">
                        {p.name}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Corner: Quick player score sheet panel */}
        <aside className="fixed bottom-4 right-4 max-w-xs w-64 bg-white border-2 border-black rounded-lg p-4 shadow-subtle z-40">
          <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-black pb-2 mb-2.5">
            <Users className="w-3.5 h-3.5 text-black" />
            Список Игроков
          </h3>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5">
            {players.map((p, idx) => {
              const active = currentPlayerTurn === idx;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2 rounded border-2 transition-all duration-200
                    ${
                      active
                        ? "bg-accent-green border-black text-black shadow-subtle-3 font-semibold"
                        : "bg-white border-black text-black"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded bg-cover bg-center border border-black flex-none"
                      style={{ backgroundImage: `url('/assets/images/${Math.min(13, p.id)}.jpg')` }}
                    />
                    <span className="text-xs truncate font-black text-black">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black font-mono bg-white py-0.5 px-2 rounded border-2 border-black shadow-subtle-3">
                      {p.position}
                    </span>
                    {active && <span className="text-[10px] font-black text-black uppercase bg-[#fae9ff] px-1 py-0.5 rounded border border-black shadow-subtle-3 ml-1 animate-pulse">Ход</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </main>

      {/* --- Visual Animated Modals & Popups --- */}

      {/* Dice spinning modal */}
      <DiceModal
        isOpen={isDiceOpen}
        onClose={() => setIsDiceOpen(false)}
        onConfirm={(val) => {
          setStepsInput(val);
          runSequenceMovement(currentPlayerTurn, settings.moveSpeed, val, "forward");
        }}
      />

      {/* Players Setup */}
      <PlayersModal
        isOpen={isPlayersOpen}
        onClose={() => setIsPlayersOpen(false)}
        players={players}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onRenamePlayer={handleRenamePlayer}
      />

      {/* Global Settings */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Question / Duel Modal */}
      <QuestionModal
        isOpen={questionModalOpen}
        category={activeQuestionCategory}
        question={activeQuestion}
        activePlayer={players[currentPlayerTurn] || { id: 1, name: "Игрок", position: 0 }}
        otherPlayers={players.filter((_, i) => i !== currentPlayerTurn)}
        onResolve={(correct, duelWinnerId) => {
          setQuestionModalOpen(false);
          if (questionResolveRef.current) {
            questionResolveRef.current(correct, duelWinnerId);
            questionResolveRef.current = null;
          }
        }}
      />

      {/* Special Cell Jump Modal */}
      <SpecialCellModal
        isOpen={!!specialCellModalData?.isOpen}
        startCell={specialCellModalData?.start || 0}
        endCell={specialCellModalData?.end || 0}
        playerName={players[currentPlayerTurn]?.name || "Игрок"}
        onConfirm={() => {
          setSpecialCellModalData(null);
          if (specialCellResolveRef.current) {
            specialCellResolveRef.current(true);
            specialCellResolveRef.current = null;
          }
        }}
        onCancel={() => {
          setSpecialCellModalData(null);
          if (specialCellResolveRef.current) {
            specialCellResolveRef.current(false);
            specialCellResolveRef.current = null;
          }
        }}
      />
    </div>
  );
}

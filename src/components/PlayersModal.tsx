import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { Player } from "../types";
import { Trash2, Edit2, Plus, Check, X } from "lucide-react";

interface PlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onRenamePlayer: (index: number, newName: string) => void;
}

export default function PlayersModal({
  isOpen,
  onClose,
  players,
  onAddPlayer,
  onRemovePlayer,
  onRenamePlayer,
}: PlayersModalProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  const startEditing = (index: number, name: string) => {
    setEditingIndex(index);
    setTempName(name);
  };

  const saveEditing = (index: number) => {
    if (tempName.trim()) {
      onRenamePlayer(index, tempName.trim());
    }
    setEditingIndex(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управление игроками 👥" maxWidth="max-w-md">
      <div className="flex flex-col max-h-[480px]">
        {/* Dynamic Players List */}
        <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-2 min-h-[150px] max-h-[380px] mb-4">
          <AnimatePresence initial={false}>
            {players.length === 0 ? (
              <p className="text-zinc-500 italic text-center py-6 text-sm">
                Нет активных игроков. Добавьте хотя бы одного!
              </p>
            ) : (
              players.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-lg shadow-subtle-3 group hover:shadow-subtle transition"
                >
                  {/* Left Side: Avatar + Name Input / Text */}
                  <div className="flex items-center gap-3 flex-1 mr-2">
                    {/* Character avatar */}
                    <div
                      className="w-10 h-10 rounded border-2 border-black flex-none bg-cover bg-center"
                      style={{ backgroundImage: `url('/assets/images/${Math.min(13, p.id)}.png')` }}
                    />

                    {editingIndex === idx ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEditing(idx)}
                          className="w-full bg-white border-2 border-black rounded px-2.5 py-1 text-sm text-black focus:outline-none font-bold"
                          autoFocus
                          maxLength={20}
                        />
                        <button
                          onClick={() => saveEditing(idx)}
                          className="p-1 rounded border-2 border-black bg-accent-green text-black hover:bg-lime-400 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1 rounded border-2 border-black bg-white text-black hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold truncate text-black">{p.name}</span>
                        <span className="text-[10px] text-black font-mono font-bold bg-white border-2 border-black px-2 py-0.5 rounded-full shadow-subtle-3">
                          Клетка {p.position}
                        </span>
                        <button
                          onClick={() => startEditing(idx, p.name)}
                          className="p-1 rounded text-neutral-500 hover:text-black hover:bg-neutral-100 transition md:opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Редактировать имя"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onRemovePlayer(idx)}
                    disabled={players.length <= 1}
                    className={`p-2 rounded border-2 transition flex items-center justify-center
                      ${
                        players.length <= 1
                          ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                          : "border-black bg-white hover:bg-rose-100 text-black hover:shadow-subtle-3 cursor-pointer"
                      }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add Player Control */}
        <div className="flex w-full gap-3 pt-3 border-t-2 border-black">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 py-2.5 rounded border-2 border-black bg-white text-black font-bold text-sm shadow-subtle-3 hover:bg-neutral-50 transition"
          >
            Закрыть
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddPlayer}
            disabled={players.length >= 13}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border-2 border-black text-sm font-bold transition
              ${
                players.length >= 13
                  ? "bg-zinc-100 text-zinc-400 border-zinc-300 cursor-not-allowed"
                  : "bg-accent-green text-black shadow-subtle hover:shadow-subtle-2 cursor-pointer"
              }`}
          >
            <Plus className="w-4 h-4" />
            Добавить игрока ({players.length}/13)
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

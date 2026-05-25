export interface Player {
  id: number;
  name: string;
  position: number; // 0 to 89
  finishedAt?: number; // timestamp when player reached finish, undefined if still playing
}

export interface GameSettings {
  enableDuels: boolean;
  enableQuestions: boolean;
  enableBlitz: boolean;
  enableHelp: boolean;
  enableLottery: boolean;
  moveSpeed: number; // in milliseconds
  blitzCells: number[];
  questionCells: number[];
  duelCells: number[];
  helpCells: number[];
  lotteryCells: number[];
}

export interface Question {
  id: number;
  question: string;
}

export interface QuestionsDB {
  blitz: Question[];
  question: Question[];
  duel: Question[];
}

export interface GameState {
  players: Player[];
  currentPlayerTurn: number;
}

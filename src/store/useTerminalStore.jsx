import { create } from "zustand";

const useTerminalStore = create((set) => ({

  logs: [
    "🚀 AI Terminal Ready",
  ],

  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, log],
    })),

  clearLogs: () =>
    set({
      logs: [],
    }),

}));

export default useTerminalStore;
import { useState, useRef, useEffect } from "react";
import useTerminalStore from "../store/useTerminalStore";
import { getWebContainer } from "../lib/webcontainer";

function Terminal() {
  const { logs, addLog, clearLogs } = useTerminalStore();
  const [command, setCommand] = useState("");
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [logs]);

  async function runCommand(e) {
    if (e.key !== "Enter") return;

    const trimmed = command.trim();
    if (!trimmed) return;

    // Echo the command to the logs screen
    addLog(`$ ${trimmed}`);

    // FIX: Clear the input state IMMEDIATELY here to prevent stuck strings
    setCommand("");

    if (trimmed === "clear") {
      clearLogs();
      return;
    }

    try {
      const webcontainer = await getWebContainer();
      const parts = trimmed.split(" ");
      
      const process = await webcontainer.spawn(
        parts[0],
        parts.slice(1)
      );

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog(data);
          },
        })
      );

      await process.exit;
    } catch (error) {
      addLog(`❌ ${error.message}`);
    }
  }

  return (
    /* FIX: w-full, h-full, and relative overflow locks isolate this panel completely 
       so it respects your resizable grid boundaries and never bleeds over the sidebar */
    <div className="w-full h-full relative bg-[#020617] flex flex-col overflow-hidden select-text">
      
      {/* HEADER */}
      <div className="h-11 min-h-11 border-b border-white/10 flex items-center justify-between px-4 bg-[#0b1120] flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-300 font-medium">
            Terminal
          </span>
        </div>
        <button
          onClick={clearLogs}
          className="text-xs text-gray-400 hover:text-red-400 transition cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* TERMINAL BODY */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        
        {/* LOGS DISPLAY ENGINE */}
        <div
          className="
            flex-1
            overflow-y-auto
            overflow-x-auto
            px-4
            py-3
            font-mono
            text-sm
            text-green-400
            space-y-1
            bg-black
            custom-scrollbar
          "
        >
          {logs.length === 0 && (
            <div className="text-gray-500 italic select-none">
              WebContainer Terminal Ready...
            </div>
          )}

          {logs.map((log, index) => (
            <div
              key={index}
              className="whitespace-pre-wrap break-words leading-relaxed"
            >
              {log}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* CONTROLLED INPUT BAR */}
        <div
          className="
            border-t
            border-white/10
            bg-[#0b1120]
            px-4
            py-3
            flex-shrink-0
          "
        >
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-mono select-none">
              $
            </span>

            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={runCommand}
              placeholder="Type command (e.g., npm run dev)..."
              className="
                flex-1
                bg-transparent
                outline-none
                text-white
                placeholder:text-gray-600
                font-mono
                text-sm
                border-none
                p-0
              "
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Terminal;
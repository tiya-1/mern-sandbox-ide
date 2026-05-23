import { useEffect, useState, useRef } from "react";

import { files } from "../files";

import { getWebContainer } from "../lib/webcontainer";

function Preview() {

  const iframeRef = useRef(null);

  const [url, setUrl] = useState("");

  const [loading, setLoading] =
    useState(false);

  const webcontainerRef = useRef(null);

  const installProcessRef = useRef(null);

  const devProcessRef = useRef(null);

  async function startServer() {

    try {

      setLoading(true);

      const webcontainer =
        await getWebContainer();

      webcontainerRef.current =
        webcontainer;

      await webcontainer.mount(files);

      installProcessRef.current =
        await webcontainer.spawn(
          "npm",
          ["install"]
        );

      await installProcessRef.current.exit;

      devProcessRef.current =
        await webcontainer.spawn(
          "npm",
          ["run", "dev"]
        );

      webcontainer.on(
        "server-ready",
        (port, serverUrl) => {

          setUrl(serverUrl);

          setLoading(false);
        }
      );

    } catch (error) {

      console.error(error);

      setLoading(false);
    }
  }

  async function stopServer() {

    try {

      if (devProcessRef.current) {

        devProcessRef.current.kill();
      }

      if (installProcessRef.current) {

        installProcessRef.current.kill();
      }

      setUrl("");

    } catch (error) {

      console.error(error);
    }
  }

  async function restartServer() {

    await stopServer();

    await startServer();
  }

  useEffect(() => {

    startServer();

    return () => {

      stopServer();
    };

  }, []);

  return (
    <div className="h-full bg-[#0b1120] flex flex-col">

      {/* Toolbar */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#0f172a]">

        <div className="flex items-center gap-3">

          <button
            onClick={startServer}
            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition text-sm"
          >
            ▶ Run
          </button>

          <button
            onClick={stopServer}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition text-sm"
          >
            ■ Stop
          </button>

          <button
            onClick={restartServer}
            className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition text-sm"
          >
            ↻ Restart
          </button>

        </div>

        {url && (

          <button
            onClick={() =>
              window.open(url, "_blank")
            }
            className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition text-sm"
          >
            🌐 Open
          </button>

        )}

      </div>

      {/* Preview */}
      <div className="flex-1 bg-white">

        {loading ? (

          <div className="h-full flex items-center justify-center bg-[#020617] text-gray-400">

            Booting Sandbox...

          </div>

        ) : url ? (

          <iframe
            ref={iframeRef}
            src={url}
            title="preview"
            className="w-full h-full border-0"
          />

        ) : (

          <div className="h-full flex items-center justify-center bg-[#020617] text-gray-500">

            Server Stopped

          </div>

        )}

      </div>

    </div>
  );
}

export default Preview;
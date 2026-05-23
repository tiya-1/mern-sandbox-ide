import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Terminal from "./components/Terminal";

function VerticalHandle() {

  return (
    <PanelResizeHandle
      className="
        h-[4px]
        bg-white/5
        hover:bg-blue-500
        transition-colors
        flex-shrink-0
      "
    />
  );

}

function HorizontalHandle() {

  return (
    <PanelResizeHandle
      className="
        w-[4px]
        bg-white/5
        hover:bg-blue-500
        transition-colors
        flex-shrink-0
      "
    />
  );

}

function App() {

  return (

    <div className="h-screen w-screen overflow-hidden bg-[#020617] text-white">

      {/* ROOT */}
      <PanelGroup direction="vertical">

        {/* TOP IDE AREA */}
        <Panel
          defaultSize={75}
          minSize={35}
        >

          <div className="h-full min-h-0">

            <PanelGroup direction="horizontal">

              {/* SIDEBAR */}
              <Panel
                defaultSize={18}
                minSize={12}
                maxSize={28}
              >

                <div className="h-full min-h-0 overflow-hidden border-r border-white/10 bg-[#0b1120]">

                  <Sidebar />

                </div>

              </Panel>

              <HorizontalHandle />

              {/* EDITOR */}
              <Panel
                defaultSize={47}
                minSize={25}
              >

                <div className="h-full min-h-0 overflow-hidden border-r border-white/10 bg-[#0f172a]">

                  <Editor />

                </div>

              </Panel>

              <HorizontalHandle />

              {/* PREVIEW */}
              <Panel
                defaultSize={35}
                minSize={20}
              >

                <div className="h-full min-h-0 overflow-hidden bg-[#0b1120]">

                  <Preview />

                </div>

              </Panel>

            </PanelGroup>

          </div>

        </Panel>

        <VerticalHandle />

        {/* TERMINAL AREA */}
        <Panel
          defaultSize={25}
          minSize={10}
          maxSize={60}
        >

          <div
            className="
              h-full
              min-h-0
              overflow-hidden
              bg-black
              border-t
              border-white/10
            "
          >

            <Terminal />

          </div>

        </Panel>

      </PanelGroup>

    </div>

  );

}

export default App;
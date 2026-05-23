import Editor
from "@monaco-editor/react";

import useProjectStore
from "../store/useProjectStore";

function EditorComponent() {

  const {
    files,
    activeFileId,
    openTabs,
    setActiveFile,
    closeTab,
    updateFileContent,
  } = useProjectStore();

  const activeFile =
    findFileById(
      files,
      activeFileId
    );

  return (

    <div className="h-full flex flex-col">

      {/* Tabs */}
      <div className="h-11 border-b border-white/10 flex items-center bg-[#111827] overflow-x-auto flex-shrink-0">

        {openTabs.map((tabId) => {

          const tab =
            findFileById(
              files,
              tabId
            );

          if (!tab) return null;

          return (

            <div
              key={tab.id}
              onClick={() =>
                setActiveFile(tab.id)
              }
              className={`
                h-full
                px-4
                flex
                items-center
                gap-3
                border-r
                border-white/10
                cursor-pointer
                text-sm
                whitespace-nowrap
                ${
                  activeFileId === tab.id
                    ? "bg-[#0f172a] text-white"
                    : "text-gray-400"
                }
              `}
            >

              <span>

                {tab.name}

              </span>

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  closeTab(tab.id);

                }}
                className="
                  text-xs
                  hover:text-red-400
                "
              >
                ✕
              </button>

            </div>

          );

        })}

      </div>

      {/* Monaco */}
      <div className="flex-1">

        <Editor
          height="100%"
          theme="vs-dark"
          language="javascript"
          value={
            activeFile?.content || ""
          }
          onChange={(value) =>
            updateFileContent(
              activeFileId,
              value
            )
          }
          options={{
            fontSize: 14,
            minimap: {
              enabled: false,
            },
          }}
        />

      </div>

    </div>

  );

}

function findFileById(
  items,
  id
) {

  for (const item of items) {

    if (
      item.type === "file" &&
      item.id === id
    ) {

      return item;

    }

    if (
      item.type === "folder"
    ) {

      const found =
        findFileById(
          item.children,
          id
        );

      if (found) {

        return found;

      }

    }

  }

  return null;

}

export default EditorComponent;
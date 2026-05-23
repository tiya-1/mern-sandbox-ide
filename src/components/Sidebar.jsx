import { useState } from "react";
import useProjectStore from "../store/useProjectStore";

function Sidebar() {
  const {
    files,
    activeFileId,
    setActiveFile,
    toggleFolder,
    addFile,
    addFolder,
    deleteItem,
    renameItem,
  } = useProjectStore();

  // State handles for creating new items
  const [creatingIn, setCreatingIn] = useState(null); // 'root' or folder ID
  const [newName, setNewName] = useState("");
  const [creatingType, setCreatingType] = useState(null); // 'file' or 'folder'

  // State handles for editing existing items inline
  const [editingId, setEditingId] = useState(null); // ID of file/folder being renamed
  const [editName, setEditName] = useState("");

  // Handle saving new file/folder additions
  function handleCreateSubmit() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreatingIn(null);
      setNewName("");
      return;
    }

    if (creatingIn === "root") {
      useProjectStore.setState((state) => ({
        files: [
          ...state.files,
          creatingType === "file"
            ? { id: Date.now().toString(), name: trimmed, type: "file", content: `// ${trimmed}` }
            : { id: Date.now().toString(), name: trimmed, type: "folder", isOpen: false, children: [] }
        ]
      }));
    } else {
      if (creatingType === "file") {
        addFile(creatingIn, trimmed);
      } else {
        addFolder(creatingIn, trimmed);
      }
    }

    setNewName("");
    setCreatingIn(null);
  }

  // Handle saving inline name modifications
  function handleRenameSubmit(id) {
    const trimmed = editName.trim();
    if (trimmed) {
      renameItem(id, trimmed);
    }
    setEditingId(null);
    setEditName("");
  }

  function renderTree(items, depth = 0) {
    return items.map((item) => {
      if (item.type === "folder") {
        return (
          <div key={item.id}>
            {/* Folder Component Row */}
            <div
              onClick={() => toggleFolder(item.id)}
              className="flex items-center justify-between hover:bg-white/5 px-2 py-1.5 text-sm text-gray-300 cursor-pointer group"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base flex-shrink-0">{item.isOpen ? "📂" : "📁"}</span>
                
                {editingId === item.id ? (
                  /* INLINE RENAME INPUT FOR FOLDER */
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Stop folder from closing on click
                    onBlur={() => handleRenameSubmit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(item.id);
                      if (e.key === "Escape") { setEditingId(null); setEditName(""); }
                    }}
                    className="bg-[#1e293b] text-white text-xs px-1 py-0.5 rounded outline-none border border-blue-500 w-full max-w-[120px]"
                  />
                ) : (
                  <span
                    className="truncate select-none"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingId(item.id);
                      setEditName(item.name);
                    }}
                    title="Double click to rename"
                  >
                    {item.name}
                  </span>
                )}
              </div>

              {/* Folder Actions Panel */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Pencil Rename Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(item.id);
                    setEditName(item.name);
                  }}
                  className="p-0.5 hover:bg-white/10 rounded text-xs"
                  title="Rename Folder"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingIn(item.id);
                    setCreatingType("file");
                    setNewName("");
                  }}
                  className="p-0.5 hover:bg-white/10 rounded text-xs"
                  title="New File"
                >
                  📄
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingIn(item.id);
                    setCreatingType("folder");
                    setNewName("");
                  }}
                  className="p-0.5 hover:bg-white/10 rounded text-xs"
                  title="New Folder"
                >
                  📁
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete folder '${item.name}'?`)) deleteItem(item.id);
                  }}
                  className="p-0.5 hover:bg-red-500/20 rounded text-xs text-red-400"
                  title="Delete Folder"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Nested Item Creation Input Box */}
            {creatingIn === item.id && (
              <div className="py-1 px-2" style={{ paddingLeft: (depth + 1) * 16 + 12 }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleCreateSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSubmit();
                    if (e.key === "Escape") { setCreatingIn(null); setNewName(""); }
                  }}
                  placeholder={creatingType === "file" ? "file name..." : "folder name..."}
                  className="w-full bg-[#1e293b] text-white text-xs px-2 py-1 rounded outline-none border border-blue-500"
                />
              </div>
            )}

            {item.isOpen && item.children && renderTree(item.children, depth + 1)}
          </div>
        );
      }

      /* FILE COMPONENT ROW */
      return (
        <div
          key={item.id}
          onClick={() => setActiveFile(item.id)}
          className={`flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer group hover:bg-white/5 ${
            activeFileId === item.id ? "bg-blue-500/15 text-blue-300 border-l-2 border-blue-500" : "text-gray-400"
          }`}
          style={{ paddingLeft: depth * 16 + 12 }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm flex-shrink-0">📄</span>
            
            {editingId === item.id ? (
              /* INLINE RENAME INPUT FOR FILE */
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => handleRenameSubmit(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(item.id);
                  if (e.key === "Escape") { setEditingId(null); setEditName(""); }
                }}
                className="bg-[#1e293b] text-white text-xs px-1 py-0.5 rounded outline-none border border-blue-500 w-full max-w-[140px]"
              />
            ) : (
              <span
                className="truncate select-none"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(item.id);
                  setEditName(item.name);
                }}
                title="Double click to rename"
              >
                {item.name}
              </span>
            )}
          </div>

          {/* File Action Layout */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Pencil Rename Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(item.id);
                setEditName(item.name);
              }}
              className="p-0.5 hover:bg-white/10 rounded text-xs"
              title="Rename File"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete file '${item.name}'?`)) deleteItem(item.id);
              }}
              className="p-0.5 hover:bg-red-500/20 rounded text-xs text-red-400"
              title="Delete File"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="h-full flex flex-col bg-[#0b1120] select-none">
      {/* Workspace Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 text-xs font-bold tracking-wider text-gray-400 uppercase flex-shrink-0">
        <span>Workspace Explorer</span>
        <div className="flex items-center gap-1.5 normal-case font-normal">
          <button
            onClick={() => { setCreatingIn("root"); setCreatingType("file"); setNewName(""); }}
            className="p-1 hover:bg-white/10 rounded text-xs text-gray-300"
            title="New Root File"
          >
            +📄
          </button>
          <button
            onClick={() => { setCreatingIn("root"); setCreatingType("folder"); setNewName(""); }}
            className="p-1 hover:bg-white/10 rounded text-xs text-gray-300"
            title="New Root Folder"
          >
            +📁
          </button>
        </div>
      </div>

      {/* Root Creation Input Box */}
      {creatingIn === "root" && (
        <div className="p-2 border-b border-white/5 bg-slate-900/50">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleCreateSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSubmit();
              if (e.key === "Escape") { setCreatingIn(null); setNewName(""); }
            }}
            placeholder={creatingType === "file" ? "Root file name..." : "Root folder name..."}
            className="w-full bg-[#1e293b] text-white text-xs px-2 py-1 rounded outline-none border border-blue-500"
          />
        </div>
      )}

      {/* Main Folder/File List Viewport */}
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {files.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 text-center italic">Empty Directory</div>
        ) : (
          renderTree(files)
        )}
      </div>
    </div>
  );
}

export default Sidebar;
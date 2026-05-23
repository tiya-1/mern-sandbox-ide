import { create } from "zustand";

const initialCode = `
import React from "react";

export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        color: "white",
        fontFamily: "sans-serif"
      }}
    >
      <h1>🚀 AI IDE Running</h1>

      <p>VS Code Style Explorer Enabled</p>
    </div>
  );
}
`;

const initialFiles = [
  {
    id: "1",
    name: "client",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "2",
        name: "src",
        type: "folder",
        isOpen: true,
        children: [
          {
            id: "3",
            name: "App.jsx",
            type: "file",
            content: initialCode,
          },
        ],
      },
    ],
  },
];

// 🌐 Dynamic API URL router (Handles Localhost vs Vercel Serverless environment out-of-the-box)
const getApiUrl = () => {
  const isLocal = window.location.hostname === "localhost";
  return isLocal ? "http://localhost:5000/api/projects/save" : "/api/projects/save";
};

// 💾 Isolated Background API Sync Pipeline
const saveToBackend = async (files) => {
  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Workspace Assessment Sandbox",
        files: files,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📥 [MERN Sync] Workspace Saved to MongoDB Successfully:", data);
  } catch (error) {
    console.error("❌ [MERN Sync] Failed to write file-tree changes to Atlas:", error);
  }
};

// Debounce reference container for managing high-frequency code text updates
let saveDebounceTimeout = null;

const useProjectStore = create((set, get) => ({
  files: initialFiles,
  activeFileId: "3",
  openTabs: ["3"],

  setActiveFile: (id) =>
    set((state) => ({
      activeFileId: id,
      openTabs: state.openTabs.includes(id)
        ? state.openTabs
        : [...state.openTabs, id],
    })),

  toggleFolder: (folderId) => {
    set((state) => {
      const updatedFiles = toggleFolderRecursive(state.files, folderId);
      saveToBackend(updatedFiles); // Track folder closure states
      return { files: updatedFiles };
    });
  },

  addFile: (folderId, name) => {
    set((state) => {
      const updatedFiles = addFileRecursive(state.files, folderId, name);
      saveToBackend(updatedFiles);
      return { files: updatedFiles };
    });
  },

  addFolder: (folderId, name) => {
    set((state) => {
      const updatedFiles = addFolderRecursive(state.files, folderId, name);
      saveToBackend(updatedFiles);
      return { files: updatedFiles };
    });
  },

  deleteItem: (id) => {
    set((state) => {
      const updatedFiles = deleteRecursive(state.files, id);
      saveToBackend(updatedFiles);
      return {
        files: updatedFiles,
        openTabs: state.openTabs.filter((tabId) => tabId !== id),
      };
    });
  },

  closeTab: (id) =>
    set((state) => ({
      openTabs: state.openTabs.filter((tabId) => tabId !== id),
    })),

  updateFileContent: (id, content) => {
    set((state) => {
      const updatedFiles = updateFileRecursive(state.files, id, content);
      
      // ⏱️ Debounce logic: Delay save by 1 second while typing to preserve server processing power
      if (saveDebounceTimeout) clearTimeout(saveDebounceTimeout);
      saveDebounceTimeout = setTimeout(() => {
        saveToBackend(updatedFiles);
      }, 1000);

      return { files: updatedFiles };
    });
  },

  renameItem: (id, newName) => {
    set((state) => {
      const updatedFiles = renameRecursive(state.files, id, newName);
      saveToBackend(updatedFiles);
      return { files: updatedFiles };
    });
  },
}));

// --- RECURSIVE FILE SYSTEM MANAGEMENT HELPER FUNCTIONS ---

function toggleFolderRecursive(items, folderId) {
  return items.map((item) => {
    if (item.type === "folder") {
      if (item.id === folderId) {
        return { ...item, isOpen: !item.isOpen };
      }
      return {
        ...item,
        children: toggleFolderRecursive(item.children, folderId),
      };
    }
    return item;
  });
}

function addFileRecursive(items, folderId, name) {
  return items.map((item) => {
    if (item.type === "folder") {
      if (item.id === folderId) {
        return {
          ...item,
          isOpen: true,
          children: [
            ...item.children,
            {
              id: Date.now().toString(),
              name,
              type: "file",
              content: `export default function App() {\n  return (\n    <h1>${name}</h1>\n  );\n}\n`,
            },
          ],
        };
      }
      return {
        ...item,
        children: addFileRecursive(item.children, folderId, name),
      };
    }
    return item;
  });
}

function addFolderRecursive(items, folderId, name) {
  return items.map((item) => {
    if (item.type === "folder") {
      if (item.id === folderId) {
        return {
          ...item,
          isOpen: true,
          children: [
            ...item.children,
            {
              id: Date.now().toString(),
              name,
              type: "folder",
              isOpen: false,
              children: [],
            },
          ],
        };
      }
      return {
        ...item,
        children: addFolderRecursive(item.children, folderId, name),
      };
    }
    return item;
  });
}

function deleteRecursive(items, id) {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.type === "folder") {
        return {
          ...item,
          children: deleteRecursive(item.children, id),
        };
      }
      return item;
    });
}

function updateFileRecursive(items, id, content) {
  return items.map((item) => {
    if (item.type === "file" && item.id === id) {
      return { ...item, content };
    }
    if (item.type === "folder") {
      return {
        ...item,
        children: updateFileRecursive(item.children, id, content),
      };
    }
    return item;
  });
}

function renameRecursive(items, id, newName) {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, name: newName };
    }
    if (item.type === "folder") {
      return {
        ...item,
        children: renameRecursive(item.children, id, newName),
      };
    }
    return item;
  });
}

export default useProjectStore;
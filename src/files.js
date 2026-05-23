export const files = {

  "package.json": {
    file: {
      contents: `
{
  "name": "sandbox-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
`,
    },
  },

  "index.html": {
    file: {
      contents: `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>AI IDE</title>

</head>

<body>

  <div id="root"></div>

  <script
    type="module"
    src="/src/main.jsx"
  ></script>

</body>

</html>
`,
    },
  },

  src: {
    directory: {

      "main.jsx": {
        file: {
          contents: `
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <App />
);
`,
        },
      },

      "App.jsx": {
        file: {
          contents: `
import React from "react";
import Button from "./Button";
import "./styles.css";

export default function App() {

  return (

    <div className="container">

      <h1>
        🚀 AI IDE
      </h1>

      <p>
        Multi File Support Enabled
      </p>

      <Button />

    </div>

  );
}
`,
        },
      },

      "Button.jsx": {
        file: {
          contents: `
import React from "react";

export default function Button() {

  return (

    <button className="btn">

      Click Me

    </button>

  );
}
`,
        },
      },

      "styles.css": {
        file: {
          contents: `
body {
  margin: 0;
  font-family: sans-serif;
  background: #020617;
}

.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
}

.btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #2563eb;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: 0.3s;
}

.btn:hover {
  background: #1d4ed8;
  transform: scale(1.05);
}
`,
        },
      },

    },
  },
};
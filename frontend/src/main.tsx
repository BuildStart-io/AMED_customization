import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (typeof window !== "undefined") {
  if (!window.crypto) {
    // @ts-ignore
    window.crypto = {};
  }
  if (typeof window.crypto.randomUUID !== "function") {
    // @ts-ignore
    window.crypto.randomUUID = function () {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
  }
}

createRoot(document.getElementById("root")!).render(<App />);

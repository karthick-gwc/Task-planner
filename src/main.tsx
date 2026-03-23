import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./components/styles/globals.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./components/store";
import { loadUserFromStorage } from "./components/store/slices/authSlice";

// Apply saved theme to <html> before first paint to avoid flash
const savedTheme = localStorage.getItem("theme") ?? "dark";
document.documentElement.classList.toggle("dark", savedTheme === "dark");

// Re-hydrate user from localStorage so a hard refresh keeps the session alive
store.dispatch(loadUserFromStorage());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

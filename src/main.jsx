import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import GrahaApp from "./GrahaApp.jsx";

// Route: /graha-eksekutif → GrahaApp, otherwise → App
const isGraha = window.location.pathname
  .replace(/\/+$/, "")
  .toLowerCase()
  .includes("/graha-eksekutif");

createRoot(document.getElementById("root")).render(
  <StrictMode>{isGraha ? <GrahaApp /> : <App />}</StrictMode>,
);

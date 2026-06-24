import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import GrahaApp from "./GrahaApp.jsx";
import GrahaLanding from "./GrahaLanding.jsx";

// Normalize path: lowercase, no trailing slashes
const path = window.location.pathname
  .replace(/\/+$/, "")
  .toLowerCase();

// Route: determine which component to render
let component;
if (path.endsWith("/graha-eksekutif/ranap")) {
  component = <GrahaApp tipe="ranap" />;
} else if (path.endsWith("/graha-eksekutif/rajal")) {
  component = <GrahaApp tipe="rajal" />;
} else if (path.endsWith("/graha-eksekutif")) {
  component = <GrahaLanding />;
} else {
  component = <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>{component}</StrictMode>,
);

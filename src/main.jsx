import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { C7OneProvider, I18nProvider } from "@levkobe/c7one";
import { dark } from "@levkobe/c7one";
import { SkillWebProvider } from "./context/SkillContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nProvider defaultLocale="en" storageKey="skill-web-locale">
      <C7OneProvider
        defaultMode="classic"
        config={{ colors: dark }}
        storageKey="skill-web-theme"
      >
        <SkillWebProvider>
          <App />
        </SkillWebProvider>
      </C7OneProvider>
    </I18nProvider>
  </StrictMode>,
);

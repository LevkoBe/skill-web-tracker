import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { C7OneProvider, I18nProvider } from "@levkobe/c7one";
import { SkillWebProvider } from "./context/SkillContext";
import { MESSAGES_EN, MESSAGES_UK } from "./messages";
import { DARK_COLORS } from "./themes";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nProvider
      defaultLocale="en"
      storageKey="skill-web-locale"
      messages={{ en: MESSAGES_EN, uk: MESSAGES_UK }}
    >
      <C7OneProvider
        defaultMode="classic"
        config={{ colors: DARK_COLORS }}
        storageKey="skill-web-theme"
      >
        <SkillWebProvider>
          <App />
        </SkillWebProvider>
      </C7OneProvider>
    </I18nProvider>
  </StrictMode>,
);

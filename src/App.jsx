import { useMemo } from "react";
import { DynamicPanelRoot, useI18n } from "@levkobe/c7one";
import { Activity, List, TrendingUp, Settings } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { CanvasWindow } from "./windows/CanvasWindow";
import { RolesWindow } from "./windows/RolesWindow";
import { ProgressionWindow } from "./windows/ProgressionWindow";
import { SettingsWindow } from "./windows/SettingsWindow";

const LAYOUT = {
  type: "group",
  direction: "horizontal",
  sizes: [22, 56, 22],
  children: [
    { type: "leaf", windowId: "roles" },
    { type: "leaf", windowId: "canvas", isDefault: true },
    { type: "leaf", windowId: "progression" },
  ],
};

function App() {
  const { t } = useI18n();

  const windows = useMemo(
    () => [
      {
        id: "canvas",
        title: t("window.canvas"),
        icon: <Activity size={16} />,
        component: CanvasWindow,
      },
      {
        id: "roles",
        title: t("window.roles"),
        icon: <List size={16} />,
        component: RolesWindow,
      },
      {
        id: "progression",
        title: t("window.progression"),
        icon: <TrendingUp size={16} />,
        component: ProgressionWindow,
      },
      {
        id: "settings",
        title: t("window.settings"),
        icon: <Settings size={16} />,
        component: SettingsWindow,
      },
    ],
    [t],
  );

  return (
    <div className="w-screen h-screen bg-bg-base text-fg-primary overflow-hidden flex flex-col">
      <AppHeader />
      <div className="flex-1 min-h-0">
        <DynamicPanelRoot
          windows={windows}
          layout={LAYOUT}
          storageKey="skill-web-layout"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default App;

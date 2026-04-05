import { useMemo } from "react";
import { DynamicPanelRoot } from "@levkobe/c7one";
import { Activity, List, TrendingUp, Settings } from "lucide-react";
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
  const windows = useMemo(
    () => [
      {
        id: "canvas",
        title: "Canvas",
        icon: <Activity size={16} />,
        component: CanvasWindow,
      },
      {
        id: "roles",
        title: "Roles",
        icon: <List size={16} />,
        component: RolesWindow,
      },
      {
        id: "progression",
        title: "Progression",
        icon: <TrendingUp size={16} />,
        component: ProgressionWindow,
      },
      {
        id: "settings",
        title: "Settings",
        icon: <Settings size={16} />,
        component: SettingsWindow,
      },
    ],
    [],
  );

  return (
    <div className="w-screen h-screen bg-bg-base text-fg-primary overflow-hidden">
      <DynamicPanelRoot
        windows={windows}
        layout={LAYOUT}
        storageKey="skill-web-layout"
        className="w-full h-full"
      />
    </div>
  );
}

export default App;

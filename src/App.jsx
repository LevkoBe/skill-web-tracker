import { useMemo } from "react";
import { DynamicPanelRoot, useI18n } from "@levkobe/c7one";
import { Waypoints, List, TrendingUp, Settings, BarChart2, History, Zap, Network, BookOpen } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { CanvasWindow } from "./windows/CanvasWindow";
import { RolesWindow } from "./windows/RolesWindow";
import { ProgressionWindow } from "./windows/ProgressionWindow";
import { SettingsWindow } from "./windows/SettingsWindow";
import { StatsWindow } from "./windows/StatsWindow";
import { HistoryWindow } from "./windows/HistoryWindow";
import { TechniquesWindow } from "./windows/TechniquesWindow";
import { RolesCatalogueWindow } from "./windows/RolesCatalogueWindow";
import { DiagramWindow } from "./windows/DiagramWindow";

const LAYOUT = {
  type: "group",
  direction: "horizontal",
  sizes: [64, 18, 18],
  children: [
    { type: "leaf", windowId: "canvas", isDefault: true },
    { type: "leaf", windowId: "roles" },
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
        icon: <Waypoints size={16} />,
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
      {
        id: "stats",
        title: t("window.stats"),
        icon: <BarChart2 size={16} />,
        component: StatsWindow,
      },
      {
        id: "history",
        title: t("window.history"),
        icon: <History size={16} />,
        component: HistoryWindow,
      },
      {
        id: "techniques",
        title: t("window.techniques"),
        icon: <Zap size={16} />,
        component: TechniquesWindow,
      },
      {
        id: "rolesCatalogue",
        title: t("window.rolesCatalogue"),
        icon: <BookOpen size={16} />,
        component: RolesCatalogueWindow,
      },
      {
        id: "diagram",
        title: t("window.diagram"),
        icon: <Network size={16} />,
        component: DiagramWindow,
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

import { useRef, useEffect, useMemo, useState } from "react";
import { Body, Select, useI18n, useC7One, detectIsDark } from "@levkobe/c7one";
import {
  GitBranch,
  Clock,
  Layers,
  Circle,
  Play,
  Palette,
  Shield,
  Wrench,
  Disc,
} from "lucide-react";
import { useSkillContext } from "../context/SkillContext";
import { useRoleStats } from "../hooks/useRoleStats";
import { buildDiagramDsl, getEmbedUrl, EMBED_ORIGIN } from "../utils/diagram";
import { THEMES } from "../data/themes";
import { DEFAULT_DIAGRAM_THEME_ID, DEFAULT_SETTINGS } from "../config";

const LAYOUT_OPTIONS = [
  {
    value: "hierarchical",
    label: "Hierarchical",
    icon: <GitBranch size={12} />,
  },
  { value: "timeline", label: "Timeline", icon: <Clock size={12} /> },
  { value: "pipeline", label: "Pipeline", icon: <Layers size={12} /> },
  { value: "radial", label: "Radial", icon: <Disc size={12} /> },
  { value: "circular", label: "Circular", icon: <Circle size={12} /> },
];

const THEME_OPTIONS = [
  { value: "default", label: "Default", icon: <Palette size={12} /> },
  { value: "battle", label: "Battle", icon: <Shield size={12} /> },
  { value: "craft", label: "Craft", icon: <Wrench size={12} /> },
];

export function DiagramWindow() {
  const { t } = useI18n();
  const { colors } = useC7One();
  const embedTheme = detectIsDark(colors["--color-bg-base"]) ? "dark" : "light";
  const { roles, points, activeRole, unlockedNodes, settings } =
    useSkillContext();
  const { pointCounts } = useRoleStats(roles, points);
  const isGradual =
    (settings.gameMode ?? DEFAULT_SETTINGS.gameMode) === "gradual";
  const effectiveUnlocked = isGradual ? unlockedNodes : null;
  const iframeRef = useRef(null);
  const dslRef = useRef(null);
  const isLoadedRef = useRef(false);
  const [themeId, setThemeId] = useState(DEFAULT_DIAGRAM_THEME_ID);
  const [layout, setLayout] = useState("timeline");

  const theme = useMemo(
    () => THEMES.find((th) => th.id === themeId) ?? THEMES[0],
    [themeId],
  );

  const dsl = useMemo(
    () =>
      buildDiagramDsl(
        roles,
        pointCounts,
        activeRole,
        theme,
        effectiveUnlocked,
        colors,
      ),
    [roles, pointCounts, activeRole, theme, effectiveUnlocked, colors],
  );

  useEffect(() => {
    dslRef.current = dsl;
  });

  useEffect(() => {
    isLoadedRef.current = false;
  }, [layout]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => {
      isLoadedRef.current = true;
      iframe.contentWindow?.postMessage(
        { type: "SET_DIAGRAM", diagram: dslRef.current },
        EMBED_ORIGIN,
      );
    };
    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SET_DIAGRAM", diagram: dsl },
      EMBED_ORIGIN,
    );
  }, [dsl]);

  return (
    <div className="h-full flex flex-col bg-bg-base">
      <div className="px-4 py-2 border-b border-border shrink-0 flex items-center justify-between gap-3">
        <Body
          size="sm"
          className="text-fg-disabled uppercase tracking-widest font-semibold"
        >
          {t("diagram.title")}
        </Body>
        <div className="flex items-center gap-2">
          <Select
            options={LAYOUT_OPTIONS}
            value={layout}
            onValueChange={setLayout}
            className="w-38"
          />
          <Select
            options={THEME_OPTIONS}
            value={themeId}
            onValueChange={setThemeId}
            className="w-30"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl(colors, embedTheme, layout)}
          className="w-full h-full border-0"
          title="Role progression diagram"
        />
      </div>
    </div>
  );
}

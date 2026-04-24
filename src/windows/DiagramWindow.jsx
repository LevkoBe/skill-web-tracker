import { useRef, useEffect, useMemo, useState } from "react";
import { Body, useI18n } from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";
import { useRoleStats } from "../hooks/useRoleStats";
import { buildDiagramDsl, EMBED_URL, EMBED_ORIGIN } from "../utils/diagram";
import { THEMES } from "../data/themes";

export function DiagramWindow() {
  const { t } = useI18n();
  const { roles, points, activeRole, unlockedNodes, settings } = useSkillContext();
  const { pointCounts } = useRoleStats(roles, points);
  const isGradual = (settings.gameMode ?? "immediate") === "gradual";
  const effectiveUnlocked = isGradual ? unlockedNodes : null;
  const iframeRef = useRef(null);
  const dslRef = useRef(null);
  const isLoadedRef = useRef(false);
  const [themeId, setThemeId] = useState("craft");

  const theme = useMemo(
    () => THEMES.find((th) => th.id === themeId) ?? THEMES[0],
    [themeId],
  );

  const dsl = useMemo(
    () => buildDiagramDsl(roles, pointCounts, activeRole, theme, effectiveUnlocked),
    [roles, pointCounts, activeRole, theme, effectiveUnlocked],
  );

  useEffect(() => {
    dslRef.current = dsl;
  });

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
        <div className="flex items-center gap-1">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => setThemeId(th.id)}
              className={[
                "px-2 py-0.5 rounded text-xs transition-colors",
                themeId === th.id
                  ? "bg-accent text-white"
                  : "text-fg-muted hover:text-fg-primary hover:bg-bg-elevated",
              ].join(" ")}
            >
              {t(`diagram.theme.${th.id}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeRef}
          src={EMBED_URL}
          className="w-full h-full border-0"
          title="Role progression diagram"
        />
      </div>
    </div>
  );
}

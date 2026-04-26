import { useEffect } from "react";
import { Moon, Sun, BarChart2, History } from "lucide-react";
import {
  Badge,
  Button,
  Modal,
  RandomizeButton,
  SettingsModalButton,
  ThemeToggleButton,
  useC7One,
  useI18n,
} from "@levkobe/c7one";
import { DARK_COLORS, LIGHT_COLORS } from "../themes";
import { SUPPORTED_LOCALES } from "../config";
import { AppSettings } from "../windows/SettingsWindow";
import { StatsWindow } from "../windows/StatsWindow";
import { HistoryWindow } from "../windows/HistoryWindow";

export function AppHeader() {
  const { t, locale, setLocale } = useI18n();
  const { mode } = useC7One();

  // R key → click the hidden randomize button (balanced, 50%)
  useEffect(() => {
    function onKey(e) {
      if (
        e.key === "r" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        document.getElementById("randomize-main-btn")?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="shrink-0 z-40 flex items-center justify-between px-5 h-10 bg-bg-base border-b border-border transition-[background-color,border-color] duration-(--transition-speed)">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-fg-primary tracking-tight">
          SKILL <span className="text-accent">WEB</span>
        </span>
        <span className="text-[10px] text-fg-disabled hidden sm:block">
          {t("app.subtitle")}
        </span>
        <div className="hidden sm:flex items-center gap-1.5 ml-1">
          <Badge variant="neutral">{mode}</Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Locale toggle */}
        <div className="flex items-center rounded-[calc(var(--radius)*0.75)] border border-border overflow-hidden">
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={[
                "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                "transition-colors duration-(--transition-speed)",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
                locale === loc
                  ? "bg-accent text-bg-base"
                  : "text-fg-muted hover:text-fg-primary hover:bg-bg-elevated",
              ].join(" ")}
            >
              {loc}
            </button>
          ))}
        </div>

        <ThemeToggleButton
          dark={DARK_COLORS}
          light={LIGHT_COLORS}
          size="sm"
          variant="secondary"
          title={t("app.toggleTheme")}
          darkIcon={<Moon size={14} />}
          lightIcon={<Sun size={14} />}
        />

        {/* Three randomize buttons — desktop */}
        <div className="hidden md:flex items-center gap-1">
          <RandomizeButton
            freedom={20}
            size="sm"
            variant="secondary"
            title={t("app.randomizeTame")}
          />
          <RandomizeButton
            id="randomize-main-btn"
            freedom={50}
            size="sm"
            title={t("app.randomize")}
          />
          <RandomizeButton
            freedom={100}
            size="sm"
            variant="destructive"
            title={t("app.randomizeChaos")}
          />
        </div>
        {/* Mobile: balanced only */}
        <div className="flex md:hidden">
          <RandomizeButton
            id="randomize-main-btn"
            freedom={50}
            size="sm"
            title={t("app.randomize")}
          />
        </div>

        <Modal>
          <Modal.Trigger asChild>
            <Button size="sm" variant="secondary" title={t("window.stats")}>
              <BarChart2 size={14} />
            </Button>
          </Modal.Trigger>
          <Modal.Content className="max-w-5xl w-[90vw] h-[80vh] p-0 overflow-hidden">
            <StatsWindow />
          </Modal.Content>
        </Modal>

        <Modal>
          <Modal.Trigger asChild>
            <Button size="sm" variant="secondary" title={t("window.history")}>
              <History size={14} />
            </Button>
          </Modal.Trigger>
          <Modal.Content className="max-w-5xl w-[90vw] h-[80vh] p-0 overflow-hidden">
            <HistoryWindow />
          </Modal.Content>
        </Modal>

        <SettingsModalButton
          label={t("app.openSettings")}
          expose={[
            "mode",
            "colors",
            "--radius",
            "--border-width",
            "--transition-speed",
            "--shadow-intensity",
          ]}
          presets={[
            {
              label: t("theme.dark"),
              icon: <Moon size={12} />,
              apply: (ctx) => ctx.setColors(DARK_COLORS),
            },
            {
              label: t("theme.light"),
              icon: <Sun size={12} />,
              apply: (ctx) => ctx.setColors(LIGHT_COLORS),
            },
          ]}
          renderAppSettings={() => <AppSettings />}
        />
      </div>
    </header>
  );
}

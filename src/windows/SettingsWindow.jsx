import { Moon, Sun } from "lucide-react";
import {
  SettingsPanel,
  Slider,
  Toggle,
  Label,
  Body,
  Divider,
  useI18n,
} from "@levkobe/c7one";
import { DARK_COLORS, LIGHT_COLORS } from "../themes";
import { useSkillContext } from "../context/SkillContext";

export function AppSettings() {
  const { t } = useI18n();
  const { settings, handleSettingsChange } = useSkillContext();
  const set = (key, val) => handleSettingsChange({ ...settings, [key]: val });

  const durationScaleFactor = settings.durationScaleFactor ?? 1;
  const breathingStrength = settings.breathingStrength ?? 0.3;

  return (
    <div className="space-y-4">
      <Body
        size="sm"
        className="text-fg-disabled uppercase tracking-widest font-semibold"
      >
        {t("settings.canvas.section")}
      </Body>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            {t("settings.connectionRange", {
              value: settings.connectionRange,
            })}
          </Label>
          <Slider
            min={50}
            max={300}
            step={1}
            value={[settings.connectionRange]}
            onValueChange={([v]) => set("connectionRange", v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            {t("settings.driftRadius", { value: settings.pointDriftRadius })}
          </Label>
          <Slider
            min={0}
            max={5}
            step={0.5}
            value={[settings.pointDriftRadius]}
            onValueChange={([v]) => set("pointDriftRadius", v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            {t("settings.driftSpeed", { value: settings.pointDriftSpeed })}
          </Label>
          <Slider
            min={0}
            max={3}
            step={0.1}
            value={[settings.pointDriftSpeed]}
            onValueChange={([v]) => set("pointDriftSpeed", v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            {t("settings.maxConnections", {
              value: settings.maxProximityConnections,
            })}
          </Label>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[settings.maxProximityConnections]}
            onValueChange={([v]) => set("maxProximityConnections", v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            {durationScaleFactor === 1
              ? t("settings.durationScale.off")
              : t("settings.durationScale", {
                  value: Number(durationScaleFactor).toFixed(1) + "×",
                })}
          </Label>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[durationScaleFactor]}
            onValueChange={([v]) => set("durationScaleFactor", v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            {breathingStrength === 0
              ? t("settings.breathingStrength.off")
              : t("settings.breathingStrength", {
                  value: Number(breathingStrength).toFixed(1) + "×",
                })}
          </Label>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={[breathingStrength]}
            onValueChange={([v]) => set("breathingStrength", v)}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <Toggle
          checked={settings.timerActiveByDefault ?? false}
          onCheckedChange={(v) => set("timerActiveByDefault", v)}
          label={t("settings.timer.default")}
        />
        <Toggle
          checked={settings.showClusterLabels ?? true}
          onCheckedChange={(v) => set("showClusterLabels", v)}
          label={t("settings.clusterLabels")}
        />
        <Toggle
          checked={settings.showNoteLabels ?? true}
          onCheckedChange={(v) => set("showNoteLabels", v)}
          label={t("settings.noteLabels")}
        />
      </div>
    </div>
  );
}

export function SettingsWindow() {
  const { t } = useI18n();

  return (
    <div className="h-full overflow-y-auto p-4">
      <SettingsPanel
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
  );
}

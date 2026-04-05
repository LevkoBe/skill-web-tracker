import { Moon, Sun } from "lucide-react";
import {
  SettingsPanel,
  Slider,
  Toggle,
  Label,
  Body,
  Divider,
  dark,
  light,
} from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";

function AppSettings() {
  const { settings, handleSettingsChange } = useSkillContext();
  const set = (key, val) => handleSettingsChange({ ...settings, [key]: val });

  return (
    <div className="space-y-4">
      <Body
        size="sm"
        className="text-fg-disabled uppercase tracking-widest font-semibold"
      >
        Canvas
      </Body>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-fg-muted">
            Connection Range: {settings.connectionRange}px
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
            Drift Radius: {settings.pointDriftRadius}
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
            Drift Speed: {settings.pointDriftSpeed}x
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
            Max Connections: {settings.maxProximityConnections}
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
            Duration Scale:{" "}
            {(settings.durationScaleFactor ?? 1) === 1
              ? "off"
              : `${Number(settings.durationScaleFactor).toFixed(1)}×`}
          </Label>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[settings.durationScaleFactor ?? 1]}
            onValueChange={([v]) => set("durationScaleFactor", v)}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <Toggle
          checked={settings.timerActiveByDefault ?? false}
          onCheckedChange={(v) => set("timerActiveByDefault", v)}
          label="Timer active by default"
        />
        <Toggle
          checked={settings.showClusterLabels ?? true}
          onCheckedChange={(v) => set("showClusterLabels", v)}
          label="Show cluster labels"
        />
        <Toggle
          checked={settings.showNoteLabels ?? true}
          onCheckedChange={(v) => set("showNoteLabels", v)}
          label="Show notes on canvas"
        />
      </div>
    </div>
  );
}

export function SettingsWindow() {
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
            label: "Dark",
            icon: <Moon size={12} />,
            apply: (ctx) => ctx.setColors(dark),
          },
          {
            label: "Light",
            icon: <Sun size={12} />,
            apply: (ctx) => ctx.setColors(light),
          },
        ]}
        renderAppSettings={() => <AppSettings />}
      />
    </div>
  );
}

const SliderField = ({ label, min, max, step, value, onChange, format }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full"
    />
    <span className="text-xs text-gray-600">
      {format ? format(value) : value}
    </span>
  </div>
);

const ToggleField = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-xs text-gray-500">{label}</label>
    <button
      onClick={() => onChange(!value)}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: 10,
        background: value ? "#4b5563" : "#1f2937",
        flexShrink: 0,
        border: "none",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: value ? 18 : 2,
          transform: "translateY(-50%)",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: value ? "#d1d5db" : "#6b7280",
          transition: "left 0.15s ease",
        }}
      />
    </button>
  </div>
);

export const SettingsPanel = ({ settings, onSettingsChange }) => {
  const set = (key, parse) => (e) =>
    onSettingsChange({ ...settings, [key]: parse(e.target.value) });

  return (
    <div className="absolute top-16 right-4 bg-zinc-950 p-4 rounded border border-gray-800 shadow-lg w-72">
      <h3 className="text-sm font-medium mb-3 text-gray-400">SETTINGS</h3>
      <div className="space-y-3">
        <SliderField
          label="Connection Range"
          min={50}
          max={300}
          value={settings.connectionRange}
          onChange={set("connectionRange", parseInt)}
          format={(v) => `${v}px`}
        />
        <SliderField
          label="Drift Radius"
          min={0}
          max={5}
          step={0.5}
          value={settings.pointDriftRadius}
          onChange={set("pointDriftRadius", parseFloat)}
        />
        <SliderField
          label="Drift Speed"
          min={0}
          max={3}
          step={0.1}
          value={settings.pointDriftSpeed}
          onChange={set("pointDriftSpeed", parseFloat)}
          format={(v) => `${v}x`}
        />
        <SliderField
          label="Max Proximity Connections"
          min={1}
          max={10}
          value={settings.maxProximityConnections}
          onChange={set("maxProximityConnections", parseInt)}
        />
        <SliderField
          label="Duration Scale Factor"
          min={1}
          max={41}
          step={0.1}
          value={settings.durationScaleFactor ?? 1}
          onChange={set("durationScaleFactor", parseFloat)}
          format={(v) => (v === 1 ? "off" : `${parseFloat(v).toFixed(1)}x`)}
        />
        <ToggleField
          label="Timer active by default"
          value={settings.timerActiveByDefault ?? false}
          onChange={(v) =>
            onSettingsChange({ ...settings, timerActiveByDefault: v })
          }
        />
      </div>
    </div>
  );
};

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
      </div>
    </div>
  );
};

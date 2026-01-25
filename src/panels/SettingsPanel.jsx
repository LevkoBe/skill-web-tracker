export const SettingsPanel = ({ settings, onSettingsChange }) => (
  <div className="absolute top-16 right-4 bg-zinc-950 p-4 rounded border border-gray-800 shadow-lg w-72">
    <h3 className="text-sm font-medium mb-3 text-gray-400">SETTINGS</h3>
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Connection Range
        </label>
        <input
          type="range"
          min="50"
          max="300"
          value={settings.connectionRange}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              connectionRange: parseInt(e.target.value),
            })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-600">
          {settings.connectionRange}px
        </span>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Drift Radius</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={settings.pointDriftRadius}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              pointDriftRadius: parseFloat(e.target.value),
            })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-600">
          {settings.pointDriftRadius}
        </span>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Drift Speed</label>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={settings.pointDriftSpeed}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              pointDriftSpeed: parseFloat(e.target.value),
            })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-600">
          {settings.pointDriftSpeed}x
        </span>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Max Proximity Connections
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={settings.maxProximityConnections}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              maxProximityConnections: parseInt(e.target.value),
            })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-600">
          {settings.maxProximityConnections}
        </span>
      </div>
    </div>
  </div>
);

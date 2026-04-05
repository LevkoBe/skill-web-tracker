import React, { useRef, useEffect as useLayoutEffect } from "react";

// ─── Color helpers ────────────────────────────────────────────────────────────

/** Return perceived luminance (0–1) of a hex color. */
function hexLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Convert HSL (0-360, 0-100, 0-100) → 6-char hex string. */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toB = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toB(f(0))}${toB(f(8))}${toB(f(4))}`;
}

/**
 * Re-pin the HSL value (lightness) of a hex or hsl color so it reads well
 * against the canvas background. Always returns a 6-char hex string so that
 * hex alpha suffixes like "30", "60" remain valid canvas colors.
 *   isDark = true  → bright nodes (L ≈ 65%)
 *   isDark = false → dark  nodes (L ≈ 38%)
 */
function shiftColorForBg(color, isDark) {
  const targetL = isDark ? 65 : 38;
  const minS = 55;

  // ── hex input ──────────────────────────────────────────────────────────────
  if (color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const lVal = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = lVal > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return hslToHex(
      Math.round(h * 360),
      Math.round(Math.max(s, minS / 100) * 100),
      targetL,
    );
  }

  // ── hsl(h, s%, l%) input ───────────────────────────────────────────────────
  const m = color.match(
    /hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*[\d.]+%\s*\)/,
  );
  if (m) {
    return hslToHex(
      parseFloat(m[1]),
      Math.max(parseFloat(m[2]), minS),
      targetL,
    );
  }

  return color;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WebCanvas = ({
  points,
  connections,
  offset,
  scale,
  activeRole,
  settings,
  roles,
  bgColor,
  onCanvasClick,
  dragHandlers,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const pointOffsetsRef = useRef([]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dragHandlers.onWheel) return;
    canvas.addEventListener("wheel", dragHandlers.onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", dragHandlers.onWheel);
  }, [dragHandlers.onWheel]);

  React.useEffect(() => {
    while (pointOffsetsRef.current.length < points.length) {
      pointOffsetsRef.current.push({
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        speedX: 0.01 + Math.random() * 0.02,
        speedY: 0.01 + Math.random() * 0.02,
        radiusX: 1 + Math.random() * 2,
        radiusY: 1 + Math.random() * 2,
      });
    }
  }, [points.length]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bg = bgColor || "#0f0f0f";

    // Compute once per effect run (only changes when bgColor changes)
    const isDark =
      !bg.startsWith("#") || hexLuminance(bg) < 0.5;

    // Ghost label color (inactive cluster centroid label)
    const ghostLabel = isDark ? "#ffffff28" : "#00000018";

    const roleMap = new Map(roles.map((r) => [r.id, r]));

    // Cache shifted colors per role id so we don't recompute every frame
    const shiftedRoleColor = new Map();
    roles.forEach((r) => {
      shiftedRoleColor.set(r.id, shiftColorForBg(r.color, isDark));
    });

    const animate = () => {
      timeRef.current += 0.01 * settings.pointDriftSpeed;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      const driftMult = settings.pointDriftRadius / 2;
      const animatedPoints = points.map((point, idx) => {
        const o = pointOffsetsRef.current[idx];
        if (!o) return point;
        return {
          ...point,
          displayX:
            point.x +
            Math.sin(timeRef.current * o.speedX + o.x) * o.radiusX * driftMult,
          displayY:
            point.y +
            Math.sin(timeRef.current * o.speedY + o.y) * o.radiusY * driftMult,
        };
      });

      // Cluster labels
      if (settings.showClusterLabels ?? true) {
        const clusters = new Map();
        animatedPoints.forEach((p) => {
          if (!clusters.has(p.roleId)) clusters.set(p.roleId, []);
          clusters.get(p.roleId).push(p);
        });

        clusters.forEach((pts, roleId) => {
          const role = roleMap.get(roleId);
          if (!role) return;
          const cx = pts.reduce((s, p) => s + p.displayX, 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p.displayY, 0) / pts.length;
          const isActive = roleId === activeRole;
          const shifted = shiftedRoleColor.get(roleId) ?? role.color;

          ctx.font = isActive ? "bold 11px monospace" : "11px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = isActive ? shifted + "60" : ghostLabel;
          ctx.fillText(role.name.toUpperCase(), cx, cy);
        });
      }

      // Connections
      connections.forEach((conn) => {
        const from = animatedPoints[conn.fromIdx];
        const to = animatedPoints[conn.toIdx];
        if (!from || !to) return;

        const [fx, fy] = [from.displayX, from.displayY];
        const [tx, ty] = [to.displayX, to.displayY];
        const dist = Math.sqrt((tx - fx) ** 2 + (ty - fy) ** 2);
        const curve = Math.sin(timeRef.current + conn.fromIdx * 0.3) * 5;
        const ctrlX = (fx + tx) / 2 + (-(ty - fy) / dist) * curve;
        const ctrlY = (fy + ty) / 2 + ((tx - fx) / dist) * curve;

        const highlighted =
          activeRole &&
          (from.roleId === activeRole || to.roleId === activeRole);

        const shiftedConn =
          shiftedRoleColor.get(from.roleId) ?? conn.color;
        ctx.strokeStyle = shiftedConn + (highlighted ? "70" : "38");
        ctx.lineWidth = highlighted ? 0.8 : 0.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(ctrlX, ctrlY, tx, ty);
        ctx.stroke();
      });

      // Nodes
      const scaleFactor = settings.durationScaleFactor ?? 1;
      animatedPoints.forEach((point) => {
        const highlighted = activeRole === point.roleId;
        const baseRadius = highlighted ? 3.5 : 2;
        const durationMs =
          point.endedAt === null
            ? Date.now() - point.startedAt
            : point.endedAt - point.startedAt;
        const durationSec = Math.max(0, durationMs) / 1000;
        const radius =
          baseRadius *
          (1 + (scaleFactor - 1) * Math.log10(durationSec / 1000 + 1));

        const shifted = shiftedRoleColor.get(point.roleId) ?? point.color;
        ctx.fillStyle = shifted + (highlighted ? "ff" : "cc");
        ctx.shadowBlur = highlighted ? 6 : 3;
        ctx.shadowColor = shifted;
        ctx.beginPath();
        ctx.arc(point.displayX, point.displayY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (point.note && (settings.showNoteLabels ?? true)) {
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = shifted + (highlighted ? "cc" : "66");
          ctx.fillText(
            point.note,
            point.displayX,
            point.displayY + radius + 3,
          );
        }
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [points, connections, offset, scale, activeRole, settings, roles, bgColor]);

  const { onWheel: _onWheel, ...mouseHandlers } = dragHandlers;

  return (
    <canvas
      ref={canvasRef}
      onClick={onCanvasClick}
      {...mouseHandlers}
      className="w-full h-full cursor-crosshair"
    />
  );
};

import React, { useRef, useEffect as useLayoutEffect } from "react";

function hexLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toB = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toB(f(0))}${toB(f(8))}${toB(f(4))}`;
}

function shiftColorForBg(color, isDark) {
  const targetL = isDark ? 65 : 38;
  const minS = 55;

  if (color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const lVal = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = lVal > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    return hslToHex(
      Math.round(h * 360),
      Math.round(Math.max(s, minS / 100) * 100),
      targetL,
    );
  }

  const m = color.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*[\d.]+%\s*\)/);
  if (m) {
    return hslToHex(
      parseFloat(m[1]),
      Math.max(parseFloat(m[2]), minS),
      targetL,
    );
  }

  return color;
}

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
  const mouseRef = useRef(null);
  const hoverScalesRef = useRef([]);

  const pointsRef = useRef(points);
  const connectionsRef = useRef(connections);
  const offsetRef = useRef(offset);
  const scaleRef = useRef(scale);
  const activeRoleRef = useRef(activeRole);
  const settingsRef = useRef(settings);
  const rolesRef = useRef(roles);
  const bgColorRef = useRef(bgColor);

  pointsRef.current = points;
  connectionsRef.current = connections;
  offsetRef.current = offset;
  scaleRef.current = scale;
  activeRoleRef.current = activeRole;
  settingsRef.current = settings;
  rolesRef.current = roles;
  bgColorRef.current = bgColor;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dragHandlers.onWheel) return;
    canvas.addEventListener("wheel", dragHandlers.onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", dragHandlers.onWheel);
  }, [dragHandlers.onWheel]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e) => {
      mouseRef.current = { x: e.offsetX, y: e.offsetY };
    };
    const onLeave = () => {
      mouseRef.current = null;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  React.useEffect(() => {
    while (pointOffsetsRef.current.length < points.length) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.1;
      pointOffsetsRef.current.push({
        dx: 0,
        dy: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        breathPhase: Math.random() * Math.PI * 2,
      });
    }
    while (hoverScalesRef.current.length < points.length) {
      hoverScalesRef.current.push(1);
    }
  }, [points.length]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const animate = () => {
      if (
        canvas.offsetWidth > 0 &&
        canvas.offsetHeight > 0 &&
        (canvas.width !== canvas.offsetWidth ||
          canvas.height !== canvas.offsetHeight)
      ) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      const points = pointsRef.current;
      const connections = connectionsRef.current;
      const offset = offsetRef.current;
      const scale = scaleRef.current;
      const activeRole = activeRoleRef.current;
      const settings = settingsRef.current;
      const roles = rolesRef.current;
      const bg = bgColorRef.current || "#0f0f0f";

      const isDark = !bg.startsWith("#") || hexLuminance(bg) < 0.5;
      const ghostLabel = isDark ? "#ffffff28" : "#00000018";
      const roleMap = new Map(roles.map((r) => [r.id, r]));
      const shiftedRoleColor = new Map();
      roles.forEach((r) => {
        shiftedRoleColor.set(r.id, shiftColorForBg(r.color, isDark));
      });

      timeRef.current += 0.01;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      const maxRadius = settings.pointDriftRadius * 5;
      const maxSpeed = settings.pointDriftSpeed * 0.25;
      const accelMag = settings.pointDriftSpeed * 0.012;

      const animatedPoints = points.map((point, idx) => {
        const o = pointOffsetsRef.current[idx];
        if (!o) return { ...point, displayX: point.x, displayY: point.y };

        if (maxRadius > 0) {
          o.vx += (Math.random() - 0.5) * accelMag;
          o.vy += (Math.random() - 0.5) * accelMag;

          const spd = Math.hypot(o.vx, o.vy);
          if (spd > maxSpeed) {
            o.vx = (o.vx / spd) * maxSpeed;
            o.vy = (o.vy / spd) * maxSpeed;
          }

          o.dx += o.vx;
          o.dy += o.vy;

          const dist = Math.hypot(o.dx, o.dy);
          if (dist > maxRadius) {
            const over = dist - maxRadius;
            o.vx -= (o.dx / dist) * over * 0.08;
            o.vy -= (o.dy / dist) * over * 0.08;
            o.dx = (o.dx / dist) * maxRadius;
            o.dy = (o.dy / dist) * maxRadius;
          }
        } else {
          o.vx *= 0.85;
          o.vy *= 0.85;
          o.dx *= 0.85;
          o.dy *= 0.85;
        }

        return {
          ...point,
          displayX: point.x + o.dx,
          displayY: point.y + o.dy,
        };
      });

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

        const shiftedConn = shiftedRoleColor.get(from.roleId) ?? conn.color;
        ctx.strokeStyle = shiftedConn + (highlighted ? "70" : "38");
        ctx.lineWidth = highlighted ? 0.8 : 0.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(ctrlX, ctrlY, tx, ty);
        ctx.stroke();
      });

      const scaleFactor = settings.durationScaleFactor ?? 1;
      const breathAmp = settings.breathingStrength ?? 0.3;
      const mouse = mouseRef.current;
      const hoverThreshSq = (20 / scale) ** 2;

      animatedPoints.forEach((point, idx) => {
        const highlighted = activeRole === point.roleId;
        const baseRadius = highlighted ? 3.5 : 2;
        const durationMs =
          point.endedAt === null
            ? Date.now() - point.startedAt
            : point.endedAt - point.startedAt;
        const durationSec = Math.max(0, durationMs) / 1000;
        const durationRadius =
          baseRadius *
          (1 + (scaleFactor - 1) * Math.log10(durationSec / 1000 + 1));

        const o = pointOffsetsRef.current[idx];
        const breathMult = o
          ? 1 +
            breathAmp * 0.35 * Math.sin(timeRef.current * 1.8 + o.breathPhase)
          : 1;

        const wx = mouse ? (mouse.x - offset.x) / scale : Infinity;
        const wy = mouse ? (mouse.y - offset.y) / scale : Infinity;
        const dSq = (point.displayX - wx) ** 2 + (point.displayY - wy) ** 2;
        const hovered = dSq < hoverThreshSq;
        const targetHover = hovered ? 2.5 : 1;
        hoverScalesRef.current[idx] = hoverScalesRef.current[idx] ?? 1;
        hoverScalesRef.current[idx] +=
          (targetHover - hoverScalesRef.current[idx]) * 0.12;
        const hoverMult = hoverScalesRef.current[idx];

        const radius = durationRadius * breathMult * hoverMult;

        const shifted = shiftedRoleColor.get(point.roleId) ?? point.color;
        ctx.fillStyle = shifted + (highlighted || hovered ? "ff" : "cc");
        ctx.shadowBlur = hovered ? 14 : highlighted ? 6 : 3;
        ctx.shadowColor = shifted;
        ctx.beginPath();
        ctx.arc(point.displayX, point.displayY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (point.note && (settings.showNoteLabels ?? true)) {
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = shifted + (highlighted || hovered ? "cc" : "66");
          ctx.fillText(point.note, point.displayX, point.displayY + radius + 3);
        }
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

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

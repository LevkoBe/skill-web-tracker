import React, { useRef, useEffect as useLayoutEffect } from "react";

export const WebCanvas = ({
  points,
  connections,
  offset,
  scale,
  activeRole,
  settings,
  roles,
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

    const roleMap = new Map(roles.map((r) => [r.id, r]));

    const animate = () => {
      timeRef.current += 0.01 * settings.pointDriftSpeed;
      ctx.fillStyle = "#0a0a0a";
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

          ctx.font = isActive ? "bold 11px monospace" : "11px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = isActive ? role.color + "40" : "#ffffff28";
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
        ctx.strokeStyle = conn.color + (highlighted ? "60" : "30");
        ctx.lineWidth = highlighted ? 0.8 : 0.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(ctrlX, ctrlY, tx, ty);
        ctx.stroke();
      });

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

        ctx.fillStyle = point.color + (highlighted ? "ff" : "cc");
        ctx.shadowBlur = highlighted ? 6 : 3;
        ctx.shadowColor = point.color;
        ctx.beginPath();
        ctx.arc(point.displayX, point.displayY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (point.note && (settings.showNoteLabels ?? true)) {
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = point.color + (highlighted ? "cc" : "66");
          ctx.fillText(point.note, point.displayX, point.displayY + radius + 3);
        }
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [points, connections, offset, scale, activeRole, settings, roles]);

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

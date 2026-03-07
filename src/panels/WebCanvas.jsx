import React, { useRef } from "react";

export const WebCanvas = ({
  points,
  connections,
  offset,
  activeRole,
  settings,
  onCanvasClick,
  dragHandlers,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const pointOffsetsRef = useRef([]);

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

    const animate = () => {
      timeRef.current += 0.01 * settings.pointDriftSpeed;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      connections.forEach((conn) => {
        const from = animatedPoints[conn.fromIdx];
        const to = animatedPoints[conn.toIdx];
        if (!from || !to) return;

        const [fx, fy] = [from.displayX + offset.x, from.displayY + offset.y];
        const [tx, ty] = [to.displayX + offset.x, to.displayY + offset.y];
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

      animatedPoints.forEach((point) => {
        const highlighted = activeRole === point.roleId;
        ctx.fillStyle = point.color + (highlighted ? "ff" : "cc");
        ctx.shadowBlur = highlighted ? 6 : 3;
        ctx.shadowColor = point.color;
        ctx.beginPath();
        ctx.arc(
          point.displayX + offset.x,
          point.displayY + offset.y,
          highlighted ? 3.5 : 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [points, connections, offset, activeRole, settings]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onCanvasClick}
      {...dragHandlers}
      className="w-full h-full cursor-crosshair"
    />
  );
};

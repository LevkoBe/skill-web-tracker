import React, { useRef } from "react";

export const WebCanvas = ({
  points,
  connections,
  offset,
  activeRole,
  settings,
  onCanvasClick,
  onDragHandlers,
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

      const animatedPoints = points.map((point, idx) => {
        const offsets = pointOffsetsRef.current[idx];
        if (!offsets) return point;
        const driftMultiplier = settings.pointDriftRadius / 2;
        return {
          ...point,
          displayX:
            point.x +
            Math.sin(timeRef.current * offsets.speedX + offsets.x) *
              offsets.radiusX *
              driftMultiplier,
          displayY:
            point.y +
            Math.sin(timeRef.current * offsets.speedY + offsets.y) *
              offsets.radiusY *
              driftMultiplier,
        };
      });

      connections.forEach((conn) => {
        const from = animatedPoints[conn.fromIdx];
        const to = animatedPoints[conn.toIdx];
        if (!from || !to) return;

        const fromX = from.displayX + offset.x;
        const fromY = from.displayY + offset.y;
        const toX = to.displayX + offset.x;
        const toY = to.displayY + offset.y;

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const curve = Math.sin(timeRef.current + conn.fromIdx * 0.3) * 5;
        const ctrlX = midX + perpX * curve;
        const ctrlY = midY + perpY * curve;

        const isHighlighted =
          activeRole &&
          (from.roleId === activeRole || to.roleId === activeRole);
        ctx.strokeStyle = conn.color + (isHighlighted ? "60" : "30");
        ctx.lineWidth = isHighlighted ? 0.8 : 0.5;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, toX, toY);
        ctx.stroke();
      });

      animatedPoints.forEach((point) => {
        const isHighlighted = activeRole === point.roleId;
        const radius = isHighlighted ? 3.5 : 2;
        ctx.fillStyle = point.color + (isHighlighted ? "ff" : "cc");
        ctx.shadowBlur = isHighlighted ? 6 : 3;
        ctx.shadowColor = point.color;
        ctx.beginPath();
        ctx.arc(
          point.displayX + offset.x,
          point.displayY + offset.y,
          radius,
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
      onMouseDown={onDragHandlers.onMouseDown}
      onMouseMove={onDragHandlers.onMouseMove}
      onMouseUp={onDragHandlers.onMouseUp}
      onMouseLeave={onDragHandlers.onMouseUp}
      className="w-full h-full cursor-crosshair"
    />
  );
};

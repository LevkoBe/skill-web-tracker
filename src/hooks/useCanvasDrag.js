import { useState, useRef } from "react";

const SCALE_MIN = 0.05;
const SCALE_MAX = 5;
const FIT_PADDING = 1.2;

export const useCanvasDrag = (offset, setOffset) => {
  const [isDragging, setIsDragging] = useState(false);
  const scaleRef = useRef(1);
  const [scale, setScaleState] = useState(1);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove = (e) => {
    const rect = e.currentTarget?.getBoundingClientRect?.();
    if (rect)
      lastMousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragOrigin.current.x,
      y: e.clientY - dragOrigin.current.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  const zoom = (delta, cx, cy) => {
    const px = cx ?? lastMousePos.current.x;
    const py = cy ?? lastMousePos.current.y;
    const prev = scaleRef.current;
    const next = Math.min(SCALE_MAX, Math.max(SCALE_MIN, prev * delta));
    scaleRef.current = next;
    setScaleState(next);
    setOffset((o) => ({
      x: px - (px - o.x) * (next / prev),
      y: py - (py - o.y) * (next / prev),
    }));
  };

  const getPointsDimensions = (points) => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    return {
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      w: maxX - minX,
      h: maxY - minY,
    };
  };

  const zoomReset = (points, containerRect) => {
    scaleRef.current = 1;
    setScaleState(1);
    const { width: vw, height: vh } = containerRect;
    const { centerX, centerY } = getPointsDimensions(points);
    setOffset({ x: vw / 2 - centerX, y: vh / 2 - centerY });
  };

  const zoomToFit = (points, containerRect) => {
    if (!points.length) return;
    const { width: vw, height: vh } = containerRect;
    const { centerX, centerY, w, h } = getPointsDimensions(points);

    const newScale = Math.min(
      SCALE_MAX,
      Math.max(
        SCALE_MIN,
        Math.min(vw / (w * FIT_PADDING), vh / (h * FIT_PADDING)),
      ),
    );
    scaleRef.current = newScale;
    setScaleState(newScale);
    setOffset({
      x: vw / 2 - centerX * newScale,
      y: vh / 2 - centerY * newScale,
    });
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (e.ctrlKey) {
      zoom(1 - e.deltaY * 0.005, cx, cy);
    } else {
      setOffset((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  return {
    isDragging,
    scale,
    zoom,
    zoomReset,
    zoomToFit,
    dragHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onWheel,
    },
  };
};

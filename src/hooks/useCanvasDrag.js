import { useState, useRef } from "react";

export const useCanvasDrag = (offset, setOffset) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragOrigin.current.x,
      y: e.clientY - dragOrigin.current.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  return {
    isDragging,
    dragHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
    },
  };
};

import { useState, useEffect, useRef } from "react";

export const useTimer = () => {
  const [sessionStart, setSessionStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  const isRunning = sessionStart !== null;

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(
      () => setElapsed(Date.now() - sessionStart),
      1000,
    );
    return () => clearInterval(intervalRef.current);
  }, [isRunning, sessionStart]);

  const start = () => {
    setSessionStart(Date.now());
    setElapsed(0);
  };
  const stop = () => {
    setSessionStart(null);
    setElapsed(0);
  };
  const toggle = () => (isRunning ? stop() : start());

  return { sessionStart, elapsed, isRunning, start, stop, toggle };
};

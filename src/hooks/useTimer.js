import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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

  const start = useCallback(() => {
    setSessionStart(Date.now());
    setElapsed(0);
  }, []);

  const stop = useCallback(() => {
    setSessionStart(null);
    setElapsed(0);
  }, []);

  const toggle = useCallback(
    () => (isRunning ? stop() : start()),
    [isRunning, start, stop],
  );

  return useMemo(
    () => ({ sessionStart, elapsed, isRunning, start, stop, toggle }),
    [sessionStart, elapsed, isRunning, start, stop, toggle],
  );
};

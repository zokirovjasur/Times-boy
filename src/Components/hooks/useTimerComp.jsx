import { useState, useEffect, useRef, useCallback } from "react";

const useTimerComp = ({
  initialMinutes = 25,
  incrementMinutes = 5,
  minimumMinutes = 1,
  onTick,
  onComplete,
}) => {
  const [defaultDuration, setDefaultDuration] = useState(initialMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const elapsedTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  const updateTimer = useCallback(
    (timestamp) => {
      if (!elapsedTimeRef.current) {
        elapsedTimeRef.current = performance.now();
      }

      const elapsedTime = Math.floor(
        (timestamp - elapsedTimeRef.current) / 1000
      );
      const newTimeLeft = Math.max(defaultDuration - elapsedTime, 0);

      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
        onTick?.(newTimeLeft);
      }

      if (newTimeLeft === 0) {
        setIsRunning(false);
        onComplete?.();
        cancelAnimationFrame(animationFrameRef.current);
      } else if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    },
    [isRunning, defaultDuration, timeLeft, onTick, onComplete]
  );

  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, updateTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    elapsedTimeRef.current =
      performance.now() - (defaultDuration - timeLeft) * 1000;
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleCancel = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setTimeLeft(defaultDuration);
    elapsedTimeRef.current = 0;
  };

  const handleIncrease = () => {
    const newDuration = defaultDuration + incrementMinutes * 60;
    setDefaultDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration);
    }
  };

  const handleDecrease = () => {
    const newDuration = Math.max(
      defaultDuration - incrementMinutes * 60,
      minimumMinutes * 60
    );
    setDefaultDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration);
    }
  };

  return {
    timeLeft,
    isRunning,
    isPaused,
    defaultDuration,
    formatTime,
    handleStart,
    handlePause,
    handleCancel,
    handleIncrease,
    handleDecrease,
  };
};

export default useTimerComp;

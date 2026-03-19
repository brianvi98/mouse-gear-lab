import { useRef, useEffect } from "react";

export type PointerDataPoint = {
  x: number,    // absolute pixel position on x-axis
  y: number,    // absolute pixel position on y-axis
  dx: number,   // delta X since last event
  dy: number,   // delta Y since last event
  t: number,    // ms since recording started
}

export const usePointerCapture = (isRecording: boolean = false) => {
  const data = useRef<PointerDataPoint[]>([]);
  const startTime = useRef<number | null>(null);

  useEffect(() => {

    // when recording stops, reset everything
    if (!isRecording) {
        data.current = [];
        startTime.current = null;
        return;
    };

    startTime.current = performance.now();

    const handleMouseMoveEvent = (e: PointerEvent) => {
        data.current.push({
            x: e.clientX,
            y: e.clientY,
            dx: e.movementX,
            dy: e.movementY,
            t: performance.now() - startTime.current!,
        })
    };

    window.addEventListener("pointermove", handleMouseMoveEvent);

    return () => 
      window.removeEventListener("pointermove", handleMouseMoveEvent);

  }, [isRecording])

  return data;
}
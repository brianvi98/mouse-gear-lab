import { useRef, useEffect } from "react";

export type PointerDataPoint = {
  x: number;    // absolute pixel position on x-axis
  y: number;    // absolute pixel position on y-axis
  dx: number;   // delta X since last event
  dy: number;   // delta Y since last event
  t: number;    // ms since recording started
}

// This hook is intended to be consumed by a parent component that serves as a
// "canvas" for the capture. Within the parent, this hook can start and stop
// and stores data pointers for all captures during the elapsed duration
export const usePointerCapture = <T extends HTMLElement>({ 
  targetRef,
  isRecording,
} : {
  targetRef: React.RefObject<T | null>,
  isRecording: boolean,
}) => {
  const data = useRef<PointerDataPoint[]>([]);
  const startTime = useRef<number | null>(null);
  const prevPos = useRef<{x: number, y: number} | null>(null);

  const reset = () => {
    data.current = [];
    startTime.current = null;
    prevPos.current = null;
  }

  useEffect(() => {

    // when recording stops, reset everything
    if (!isRecording) {
      reset();
      return;
    };

    if (startTime.current === null) {
      startTime.current = performance.now();
    }

    const handleMouseMoveEvent = (e: PointerEvent) => {
      const coalesced = e.getCoalescedEvents?.() ?? [e];
      coalesced.forEach(event => {     
        const dx = prevPos.current ? event.clientX - prevPos.current.x : 0;
        const dy = prevPos.current ? event.clientY - prevPos.current.y : 0;

        prevPos.current = { x: event.clientX, y: event.clientY };

        data.current.push({
          x: event.clientX,
          y: event.clientY,
          dx,
          dy,
          t: event.timeStamp - startTime.current!,
        })
      })
    };

    const target = targetRef?.current ?? window;

    target.addEventListener(
      "pointermove", handleMouseMoveEvent as EventListener
    );

    return () => target.removeEventListener(
        "pointermove", handleMouseMoveEvent as EventListener
    );

  }, [isRecording, targetRef])

  return { data };
}
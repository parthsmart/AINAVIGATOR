import { useEffect, useState, useRef } from 'react';

export type AiFieldStatus = 'pending' | 'ready' | 'fallback' | 'ok';

export interface PollableAiPayload<T = string> {
  status: AiFieldStatus;
  text: T;
  fallbackText: T;
}

export interface UsePollAiStatusOptions<T> {
  initialStatus: AiFieldStatus;
  initialText: T;
  fallbackText: T;
  pollFn: () => Promise<{ status: AiFieldStatus; text?: T }>;
  maxAttempts?: number;
  baseIntervalMs?: number;
}

export function usePollAiStatus<T = string>({
  initialStatus,
  initialText,
  fallbackText,
  pollFn,
  maxAttempts = 3,
  baseIntervalMs = 400,
}: UsePollAiStatusOptions<T>) {
  const [status, setStatus] = useState<AiFieldStatus>(initialStatus);
  const [text, setText] = useState<T>(
    initialStatus === 'fallback' ? fallbackText : initialText
  );
  const attemptsRef = useRef(0);
  const pollFnRef = useRef(pollFn);
  pollFnRef.current = pollFn;

  useEffect(() => {
    setStatus(initialStatus);
    setText(initialStatus === 'fallback' ? fallbackText : initialText);
    attemptsRef.current = 0;
  }, [initialStatus, initialText, fallbackText]);

  useEffect(() => {
    if (status !== 'pending') {
      return;
    }

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      if (cancelled) return;
      if (attemptsRef.current >= maxAttempts) {
        setStatus('fallback');
        setText(fallbackText);
        return;
      }

      const delay = baseIntervalMs * Math.pow(2, attemptsRef.current);
      timerId = setTimeout(async () => {
        if (cancelled) return;
        attemptsRef.current += 1;
        try {
          const result = await pollFnRef.current();
          if (cancelled) return;
          if (result.status === 'ready' || result.status === 'ok') {
            setStatus('ready');
            if (result.text !== undefined) {
              setText(result.text);
            }
          } else if (result.status === 'fallback') {
            setStatus('fallback');
            setText(result.text !== undefined ? result.text : fallbackText);
          } else {
            scheduleNext();
          }
        } catch {
          if (!cancelled) {
            setStatus('fallback');
            setText(fallbackText);
          }
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [status, maxAttempts, baseIntervalMs, fallbackText]);

  return {
    status,
    text,
    isFallback: status === 'fallback',
    isPending: status === 'pending',
  };
}

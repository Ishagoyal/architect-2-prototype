"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Speak instead of typing: the browser's own speech-to-text (Web Speech API).
   Starting it makes the browser ask for the microphone. Works in Chrome, Edge and Safari. */

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function makeRecognition(): Recognition | null {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const messages: Record<string, string> = {
  "not-allowed": "The microphone is blocked. Allow it from the icon in your browser’s address bar, then press the mic again.",
  "service-not-allowed": "The microphone is blocked. Allow it from the icon in your browser’s address bar, then press the mic again.",
  "no-speech": "Didn’t hear anything. Press the mic and try again.",
  "audio-capture": "No microphone found.",
  network: "Speech-to-text needs an internet connection.",
};

/** `onText` gets the text so far (what was already in the box, plus what's been said). */
export function useDictation(current: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);
  const latest = useRef({ current, onText });
  latest.current = { current, onText };

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    const r = makeRecognition();
    if (!r) {
      setNote("This browser can’t turn speech into text. Try Chrome, Edge or Safari, or type instead.");
      return;
    }
    const before = latest.current.current.trim();
    let finals = "";
    r.lang = navigator.language || "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finals += res[0].transcript;
        else interim += res[0].transcript;
      }
      latest.current.onText([before, (finals + interim).trim()].filter(Boolean).join(" "));
    };
    r.onerror = (e) => setNote(messages[e.error] ?? null);
    r.onend = () => setListening(false);
    rec.current = r;
    setNote(null);
    try {
      r.start();
      setListening(true);
    } catch {
      setNote("Couldn’t start the microphone. Press the mic and try again.");
    }
  }, []);

  useEffect(() => () => rec.current?.stop(), []);

  return { listening, note, toggle: listening ? stop : start };
}

// Somali voice input — cloud transcription pipeline.
// The browser only records audio (MediaRecorder); the actual speech-to-text
// runs server-side in the Supabase `transcribe` edge function (Groq/OpenAI
// Whisper with language=so), so no STT API key ever reaches the browser.

export interface RecorderController {
  stop(): Promise<Blob | null>;
}

export function isMediaRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

/** Preferred audio MIME types, in order. */
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

/**
 * Requests the microphone and starts recording. Returns a controller whose
 * `stop()` resolves with the recorded audio Blob (or null if nothing was
 * captured). Throws "UNSUPPORTED" or the getUserMedia error (e.g.
 * NotAllowedError) on failure.
 */
export async function startVoiceRecording(): Promise<RecorderController> {
  if (!isMediaRecordingSupported()) throw new Error("UNSUPPORTED");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType =
    MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  let stopped = false;
  return {
    stop: () =>
      new Promise<Blob | null>((resolve) => {
        if (stopped) {
          resolve(null);
          return;
        }
        stopped = true;
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          resolve(blob.size > 0 ? blob : null);
        };
        try {
          recorder.stop();
        } catch {
          resolve(null);
        }
      }),
  };
}

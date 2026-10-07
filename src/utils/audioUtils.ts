/**
 * Utility for recording browser microphone audio to base64
 * and playing generated WAV audio from Gemini TTS.
 */

export interface AudioRecorderHandle {
  stop: () => Promise<{ base64: string; mimeType: string }>;
  cancel: () => void;
}

export async function startAudioRecording(): Promise<AudioRecorderHandle> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Pick preferred mimeType
  let mimeType = 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    mimeType = 'audio/webm;codecs=opus';
  } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
    mimeType = 'audio/mp4';
  } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
    mimeType = 'audio/ogg';
  }

  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.start(100);

  return {
    stop: () => {
      return new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // Extract base64 part after data:...;base64,
              const base64Data = result.split(',')[1] || result;
              // Clean up microphone stream tracks
              stream.getTracks().forEach((track) => track.stop());
              // Sanitize mimeType to standard IANA type without codec parameters
              const cleanMimeType = mimeType.split(';')[0].trim() || 'audio/webm';
              resolve({ base64: base64Data, mimeType: cleanMimeType });
            };
            reader.onerror = (err) => {
              stream.getTracks().forEach((track) => track.stop());
              reject(err);
            };
            reader.readAsDataURL(blob);
          } catch (err) {
            stream.getTracks().forEach((track) => track.stop());
            reject(err);
          }
        };

        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });
    },
    cancel: () => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      stream.getTracks().forEach((track) => track.stop());
    },
  };
}

let activeAudioElement: HTMLAudioElement | null = null;

export function playAudioBase64(base64Wav: string, onEnded?: () => void): HTMLAudioElement {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.src = '';
  }

  const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
  activeAudioElement = audio;

  audio.onended = () => {
    activeAudioElement = null;
    if (onEnded) onEnded();
  };

  audio.onerror = () => {
    activeAudioElement = null;
    if (onEnded) onEnded();
  };

  audio.play().catch((err) => {
    console.warn('Audio playback error:', err);
    if (onEnded) onEnded();
  });

  return audio;
}

export function stopCurrentAudio() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.src = '';
    activeAudioElement = null;
  }
}

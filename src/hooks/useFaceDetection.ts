import { useEffect, useRef, useState, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { calculateAverageEAR, areEyesClosed } from "@/utils/eyeAspectRatio";

/* -------------------- TYPES -------------------- */

interface FaceDetectionState {
  isLoading: boolean;
  error: string | null;
  eyesClosed: boolean;
  leftEAR: number;
  rightEAR: number;
  averageEAR: number;
  faceDetected: boolean;
  landmarks: { x: number; y: number; z: number }[] | null;
}

interface UseFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  earThreshold: number;
  isEnabled: boolean;
}

/* -------------------- GLOBAL CDN TYPE -------------------- */

declare global {
  interface Window {
    FaceMesh: any;
  }
}

/* -------------------- HOOK -------------------- */

export function useFaceDetection({
  videoRef,
  canvasRef,
  earThreshold,
  isEnabled,
}: UseFaceDetectionProps) {
  const [state, setState] = useState<FaceDetectionState>({
    isLoading: true,
    error: null,
    eyesClosed: false,
    leftEAR: 0,
    rightEAR: 0,
    averageEAR: 0,
    faceDetected: false,
    landmarks: null,
  });

  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<Camera | null>(null);
  const earThresholdRef = useRef(earThreshold);

  /* -------------------- KEEP THRESHOLD UPDATED -------------------- */

  useEffect(() => {
    earThresholdRef.current = earThreshold;
  }, [earThreshold]);

  /* -------------------- RESULTS CALLBACK -------------------- */

  const onResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks?.length) {
        const landmarks = results.multiFaceLandmarks[0];

        const { leftEAR, rightEAR, averageEAR } =
          calculateAverageEAR(landmarks);

        const closed = areEyesClosed(
          averageEAR,
          earThresholdRef.current
        );

        drawFaceMesh(
          ctx,
          landmarks,
          canvas.width,
          canvas.height,
          closed
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          eyesClosed: closed,
          leftEAR,
          rightEAR,
          averageEAR,
          faceDetected: true,
          landmarks,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          faceDetected: false,
          eyesClosed: false,
          landmarks: null,
        }));
      }

      ctx.restore();
    },
    [canvasRef, videoRef]
  );

  /* -------------------- INIT MEDIAPIPE -------------------- */

  useEffect(() => {
    if (!isEnabled) {
      cameraRef.current?.stop();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const init = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        /* 🔴 LOAD FaceMesh FROM CDN (CRITICAL FIX) */
        await import(
          "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
        );

        if (!window.FaceMesh) {
          throw new Error("FaceMesh failed to load");
        }

        faceMeshRef.current = new window.FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMeshRef.current.onResults(onResults);

        cameraRef.current = new Camera(video, {
          onFrame: async () => {
            if (faceMeshRef.current && video) {
              await faceMeshRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480,
          facingMode: "user",
        });

        await cameraRef.current.start();

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err: any) {
        console.error("FaceMesh init error:", err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err?.message || "Camera initialization failed",
        }));
      }
    };

    init();

    return () => {
      cameraRef.current?.stop();
      faceMeshRef.current?.close?.();
    };
  }, [isEnabled, onResults, videoRef]);

  return state;
}

/* -------------------- DRAWING -------------------- */

function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[],
  width: number,
  height: number,
  eyesClosed: boolean
) {
  const leftEyeIndices = [33, 160, 158, 133, 153, 144, 163, 7, 246, 161, 159, 157, 173];
  const rightEyeIndices = [362, 385, 387, 263, 373, 380, 390, 249, 466, 388, 386, 384, 398];

  const eyeColor = eyesClosed
    ? "rgba(255,70,70,0.9)"
    : "rgba(0,255,200,0.9)";
  const glowColor = eyesClosed
    ? "rgba(255,70,70,0.4)"
    : "rgba(0,255,200,0.4)";

  ctx.shadowBlur = 15;
  ctx.shadowColor = glowColor;
  ctx.strokeStyle = eyeColor;
  ctx.lineWidth = 2;

  [leftEyeIndices, rightEyeIndices].forEach((eye) => {
    ctx.beginPath();
    eye.forEach((idx, i) => {
      const p = landmarks[idx];
      const x = p.x * width;
      const y = p.y * height;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  });

  ctx.shadowBlur = 0;
}

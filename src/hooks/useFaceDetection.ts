import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { calculateAverageEAR, areEyesClosed } from '@/utils/eyeAspectRatio';

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

  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const earThresholdRef = useRef(earThreshold);

  // Update threshold ref when it changes
  useEffect(() => {
    earThresholdRef.current = earThreshold;
  }, [earThreshold]);

  const onResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Calculate EAR
      const { leftEAR, rightEAR, averageEAR } = calculateAverageEAR(landmarks);
      const closed = areEyesClosed(averageEAR, earThresholdRef.current);

      // Draw face mesh
      drawFaceMesh(ctx, landmarks, canvas.width, canvas.height, closed);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        eyesClosed: closed,
        leftEAR,
        rightEAR,
        averageEAR,
        faceDetected: true,
        landmarks: landmarks as any,
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
  }, [canvasRef, videoRef]);

  useEffect(() => {
    if (!isEnabled) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const initFaceMesh = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Initialize FaceMesh
        faceMeshRef.current = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMeshRef.current.onResults(onResults);

        // Initialize camera
        cameraRef.current = new Camera(video, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480,
          facingMode: 'user',
        });

        await cameraRef.current.start();
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Error initializing face detection:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize camera',
        }));
      }
    };

    initFaceMesh();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, [videoRef, isEnabled, onResults]);

  return state;
}

function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[],
  width: number,
  height: number,
  eyesClosed: boolean
) {
  // Draw eye contours
  const leftEyeIndices = [33, 160, 158, 133, 153, 144, 163, 7, 246, 161, 159, 157, 173];
  const rightEyeIndices = [362, 385, 387, 263, 373, 380, 390, 249, 466, 388, 386, 384, 398];

  const eyeColor = eyesClosed ? 'rgba(255, 70, 70, 0.9)' : 'rgba(0, 255, 200, 0.9)';
  const glowColor = eyesClosed ? 'rgba(255, 70, 70, 0.4)' : 'rgba(0, 255, 200, 0.4)';

  // Draw glow effect
  ctx.shadowBlur = 15;
  ctx.shadowColor = glowColor;

  // Draw left eye
  ctx.beginPath();
  ctx.strokeStyle = eyeColor;
  ctx.lineWidth = 2;
  leftEyeIndices.forEach((index, i) => {
    const point = landmarks[index];
    const x = point.x * width;
    const y = point.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();

  // Draw right eye
  ctx.beginPath();
  rightEyeIndices.forEach((index, i) => {
    const point = landmarks[index];
    const x = point.x * width;
    const y = point.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();

  // Draw face oval with subtle effect
  ctx.shadowBlur = 5;
  ctx.shadowColor = 'rgba(0, 200, 255, 0.2)';
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
  ctx.lineWidth = 1;

  const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  
  ctx.beginPath();
  faceOval.forEach((index, i) => {
    const point = landmarks[index];
    const x = point.x * width;
    const y = point.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();

  ctx.shadowBlur = 0;
}

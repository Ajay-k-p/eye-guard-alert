import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { CameraView } from '@/components/CameraView';
import { EyeStatus } from '@/components/EyeStatus';
import { ControlPanel } from '@/components/ControlPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useAlarm } from '@/hooks/useAlarm';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  // Settings state
  const [earThreshold, setEarThreshold] = useState(0.2);
  const [timeThreshold, setTimeThreshold] = useState(2);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(false);

  // Timer and stats state
  const [closureStartTime, setClosureStartTime] = useState<number | null>(null);
  const [closureTime, setClosureTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  // Refs for video and canvas
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { startAlarm, stopAlarm, testAlarm, isPlaying: isAlarmPlaying, isUnlocked } = useAlarm();

  const handleEnableCamera = () => {
    setIsDetectionEnabled(true);
  };

  // Face detection
  const {
    isLoading,
    error,
    eyesClosed,
    leftEAR,
    rightEAR,
    averageEAR,
    faceDetected,
  } = useFaceDetection({
    videoRef,
    canvasRef,
    earThreshold,
    isEnabled: isDetectionEnabled,
  });

  // Session timer
  useEffect(() => {
    if (!isDetectionEnabled) return;
    
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDetectionEnabled]);

  // Eye closure detection - set start time
  useEffect(() => {
    if (eyesClosed && faceDetected && !closureStartTime) {
      setClosureStartTime(Date.now());
    } else if (!eyesClosed && closureStartTime) {
      setClosureStartTime(null);
      setClosureTime(0);
    }
  }, [eyesClosed, faceDetected, closureStartTime]);

  // Alarm trigger logic - separate from closure detection
  useEffect(() => {
    if (closureTime >= timeThreshold && alarmEnabled && !isAlarmPlaying && eyesClosed) {
      console.log('Triggering alarm - closure time:', closureTime);
      startAlarm();
      setAlertCount((prev) => prev + 1);
    }
  }, [closureTime, timeThreshold, alarmEnabled, isAlarmPlaying, eyesClosed, startAlarm]);

  // Stop alarm when eyes open
  useEffect(() => {
    if (!eyesClosed && isAlarmPlaying) {
      stopAlarm();
    }
  }, [eyesClosed, isAlarmPlaying, stopAlarm]);

  // Update closure time display
  useEffect(() => {
    if (!closureStartTime) return;

    const interval = setInterval(() => {
      setClosureTime((Date.now() - closureStartTime) / 1000);
    }, 100);

    return () => clearInterval(interval);
  }, [closureStartTime]);

  return (
    <>
      <Helmet>
        <title>DriverGuard - Drowsiness Detection System</title>
        <meta name="description" content="Real-time driver drowsiness detection system that monitors eye closure and triggers alerts to prevent accidents. Stay safe on the road." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main camera view - takes 2 columns on desktop */}
            <div className="lg:col-span-2 space-y-6">
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                isLoading={isLoading}
                error={error}
                faceDetected={faceDetected}
                eyesClosed={eyesClosed}
                isEnabled={isDetectionEnabled}
                onEnableCamera={handleEnableCamera}
              />

              <EyeStatus
                eyesClosed={eyesClosed}
                faceDetected={faceDetected}
                closureTime={closureTime}
                averageEAR={averageEAR}
              />
            </div>

            {/* Control panel - takes 1 column on desktop */}
            <div className="space-y-6">
              <ControlPanel
                earThreshold={earThreshold}
                setEarThreshold={setEarThreshold}
                timeThreshold={timeThreshold}
                setTimeThreshold={setTimeThreshold}
                alarmEnabled={alarmEnabled}
                setAlarmEnabled={setAlarmEnabled}
                isDetectionEnabled={isDetectionEnabled}
                setIsDetectionEnabled={setIsDetectionEnabled}
                onTestAlarm={testAlarm}
                isAudioUnlocked={isUnlocked}
              />

              <StatsPanel
                leftEAR={leftEAR}
                rightEAR={rightEAR}
                sessionTime={sessionTime}
                alertCount={alertCount}
              />
            </div>
          </div>

          {/* About section */}
          <div className="mt-8 p-4 rounded-xl bg-muted/5 border border-muted/20">
            <h3 className="text-lg font-semibold text-center mb-2">About DriverGuard</h3>
            <p className="text-sm text-muted-foreground text-center">
              DriverGuard is a real-time drowsiness detection system designed to help prevent accidents by monitoring eye closure and triggering alerts.
              Created by ajay.kp with the help of AI.
            </p>
          </div>

          {/* Safety disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <p className="text-sm text-warning text-center">
              <strong>Safety Notice:</strong> This tool is designed as an aid and should not replace proper rest.
              Always prioritize getting adequate sleep before driving.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;

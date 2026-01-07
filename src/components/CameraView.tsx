import { Camera, Loader2, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
  faceDetected: boolean;
  eyesClosed: boolean;
  isEnabled: boolean;
  onEnableCamera: () => void;
}

export function CameraView({
  videoRef,
  canvasRef,
  isLoading,
  error,
  faceDetected,
  eyesClosed,
  isEnabled,
  onEnableCamera,
}: CameraViewProps) {
  return (
    <div className="relative">
      {/* Main video container */}
      <div className={cn(
        'video-container aspect-[4/3] w-full bg-card relative overflow-hidden',
        eyesClosed && faceDetected && 'ring-4 ring-destructive/50'
      )}>
        {/* Video element (hidden, used for processing) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          playsInline
          muted
        />

        {/* Canvas for drawing face mesh */}
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            (!isEnabled || isLoading) && 'opacity-0'
          )}
        />

        {/* Scanner line effect when active */}
        {isEnabled && !isLoading && faceDetected && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="scanner-line absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          </div>
        )}

        {/* Loading state */}
        {isEnabled && isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="font-display text-sm tracking-wider text-muted-foreground">
              INITIALIZING CAMERA...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <CameraOff className="w-12 h-12 text-destructive mb-4" />
            <p className="font-display text-sm tracking-wider text-destructive mb-2">
              CAMERA ERROR
            </p>
            <p className="text-xs text-muted-foreground text-center px-4">
              {error}
            </p>
          </div>
        )}

        {/* Disabled state */}
        {!isEnabled && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
            <Camera className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="font-display text-lg tracking-wider text-muted-foreground">
              CAMERA DISABLED
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2 mb-4">
              Click below to enable camera access
            </p>
            <button
              onClick={onEnableCamera}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />

        {/* Status indicator */}
        {isEnabled && !isLoading && !error && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={cn(
              'w-2 h-2 rounded-full',
              faceDetected ? 'bg-success animate-pulse' : 'bg-warning'
            )} />
            <span className="text-xs font-medium tracking-wide">
              {faceDetected ? 'TRACKING' : 'SEARCHING'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

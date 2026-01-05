import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EyeStatusProps {
  eyesClosed: boolean;
  faceDetected: boolean;
  closureTime: number;
  averageEAR: number;
}

export function EyeStatus({ eyesClosed, faceDetected, closureTime, averageEAR }: EyeStatusProps) {
  const getStatus = () => {
    if (!faceDetected) {
      return {
        icon: AlertTriangle,
        text: 'NO FACE',
        subtext: 'Position your face in the camera',
        colorClass: 'text-warning',
        bgClass: 'bg-warning/10 border-warning/30',
        pulseClass: '',
      };
    }
    if (eyesClosed) {
      return {
        icon: EyeOff,
        text: 'EYES CLOSED',
        subtext: closureTime > 0 ? `${closureTime.toFixed(1)}s` : 'Alert!',
        colorClass: 'text-destructive',
        bgClass: 'bg-destructive/10 border-destructive/30 glow-danger',
        pulseClass: 'animate-pulse',
      };
    }
    return {
      icon: Eye,
      text: 'EYES OPEN',
      subtext: 'Monitoring active',
      colorClass: 'text-success',
      bgClass: 'bg-success/10 border-success/30 glow-success',
      pulseClass: '',
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className={cn(
      'glass-card rounded-2xl p-6 border-2 transition-all duration-300',
      status.bgClass,
      status.pulseClass
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          'bg-background/50 border-2',
          eyesClosed ? 'border-destructive' : faceDetected ? 'border-success' : 'border-warning'
        )}>
          <Icon className={cn('w-8 h-8', status.colorClass)} />
        </div>
        
        <div className="flex-1">
          <h2 className={cn('font-display text-2xl font-bold tracking-wider', status.colorClass)}>
            {status.text}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{status.subtext}</p>
        </div>

        {faceDetected && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">EAR Value</div>
            <div className={cn('font-display text-xl font-bold', status.colorClass)}>
              {averageEAR.toFixed(3)}
            </div>
          </div>
        )}
      </div>

      {/* Closure Timer Bar */}
      {eyesClosed && closureTime > 0 && (
        <div className="mt-4">
          <div className="h-2 bg-background/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-destructive to-warning transition-all duration-100"
              style={{ width: `${Math.min((closureTime / 2) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Alarm triggers at 2.0s
          </p>
        </div>
      )}
    </div>
  );
}

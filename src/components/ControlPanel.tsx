import { Settings, Volume2, VolumeX, Gauge, Clock, Power, PowerOff, Bell } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  earThreshold: number;
  setEarThreshold: (value: number) => void;
  timeThreshold: number;
  setTimeThreshold: (value: number) => void;
  alarmEnabled: boolean;
  setAlarmEnabled: (value: boolean) => void;
  isDetectionEnabled: boolean;
  setIsDetectionEnabled: (value: boolean) => void;
  onTestAlarm?: () => void;
  isAudioUnlocked?: boolean;
}

export function ControlPanel({
  earThreshold,
  setEarThreshold,
  timeThreshold,
  setTimeThreshold,
  alarmEnabled,
  setAlarmEnabled,
  isDetectionEnabled,
  setIsDetectionEnabled,
  onTestAlarm,
  isAudioUnlocked,
}: ControlPanelProps) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold tracking-wide">CONTROLS</h3>
      </div>

      {/* Detection Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-border/50">
        <div className="flex items-center gap-3">
          {isDetectionEnabled ? (
            <Power className="w-5 h-5 text-success" />
          ) : (
            <PowerOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="detection-toggle" className="text-sm font-medium">
              Detection
            </Label>
            <p className="text-xs text-muted-foreground">
              {isDetectionEnabled ? 'Active' : 'Paused'}
            </p>
          </div>
        </div>
        <Switch
          id="detection-toggle"
          checked={isDetectionEnabled}
          onCheckedChange={setIsDetectionEnabled}
          className={cn(
            isDetectionEnabled && 'bg-success'
          )}
        />
      </div>

      {/* Alarm Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-border/50">
        <div className="flex items-center gap-3">
          {alarmEnabled ? (
            <Volume2 className="w-5 h-5 text-primary" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="alarm-toggle" className="text-sm font-medium">
              Alarm Sound
            </Label>
            <p className="text-xs text-muted-foreground">
              {alarmEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        <Switch
          id="alarm-toggle"
          checked={alarmEnabled}
          onCheckedChange={setAlarmEnabled}
        />
      </div>

      {/* Test Alarm Button */}
      <Button
        onClick={onTestAlarm}
        variant="outline"
        className={cn(
          "w-full gap-2 border-primary/50 hover:bg-primary/10",
          !isAudioUnlocked && "animate-pulse border-warning text-warning"
        )}
      >
        <Bell className="w-4 h-4" />
        {isAudioUnlocked ? "Test Alarm Sound" : "Tap to Enable Audio"}
      </Button>

      {/* EAR Threshold Slider */}
      <div className="space-y-4 p-4 rounded-xl bg-background/30 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-primary" />
            <div>
              <Label className="text-sm font-medium">Sensitivity</Label>
              <p className="text-xs text-muted-foreground">EAR threshold</p>
            </div>
          </div>
          <span className="font-display text-lg font-bold text-primary">
            {earThreshold.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[earThreshold]}
          onValueChange={([value]) => setEarThreshold(value)}
          min={0.1}
          max={0.3}
          step={0.01}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>More Sensitive</span>
          <span>Less Sensitive</span>
        </div>
      </div>

      {/* Time Threshold Slider */}
      <div className="space-y-4 p-4 rounded-xl bg-background/30 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <Label className="text-sm font-medium">Alarm Delay</Label>
              <p className="text-xs text-muted-foreground">Seconds before alarm</p>
            </div>
          </div>
          <span className="font-display text-lg font-bold text-primary">
            {timeThreshold.toFixed(1)}s
          </span>
        </div>
        <Slider
          value={[timeThreshold]}
          onValueChange={([value]) => setTimeThreshold(value)}
          min={1}
          max={5}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Quick (1s)</span>
          <span>Delayed (5s)</span>
        </div>
      </div>
    </div>
  );
}

import { Activity, Timer, AlertCircle, Eye } from 'lucide-react';

interface StatsPanelProps {
  leftEAR: number;
  rightEAR: number;
  sessionTime: number;
  alertCount: number;
}

export function StatsPanel({ leftEAR, rightEAR, sessionTime, alertCount }: StatsPanelProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    {
      icon: Eye,
      label: 'Left Eye EAR',
      value: leftEAR.toFixed(3),
      color: 'text-primary',
    },
    {
      icon: Eye,
      label: 'Right Eye EAR',
      value: rightEAR.toFixed(3),
      color: 'text-primary',
    },
    {
      icon: Timer,
      label: 'Session Time',
      value: formatTime(sessionTime),
      color: 'text-accent',
    },
    {
      icon: AlertCircle,
      label: 'Alerts',
      value: alertCount.toString(),
      color: alertCount > 0 ? 'text-destructive' : 'text-success',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold tracking-wide">STATISTICS</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-background/30 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <div className={`font-display text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

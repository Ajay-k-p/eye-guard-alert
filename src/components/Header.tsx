import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-border/30 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-wider text-foreground">
              DRIVER<span className="text-primary">GUARD</span>
            </h1>
            <p className="text-xs text-muted-foreground tracking-wide">
              Drowsiness Detection System
            </p>
          </div>
        </div>


      </div>
    </header>
  );
}

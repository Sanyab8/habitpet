import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Clock, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DurationEditorProps {
  currentDuration: number; // in seconds
  onDurationChange: (newDuration: number) => void;
}

export const DurationEditor = ({ currentDuration, onDurationChange }: DurationEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDuration, setTempDuration] = useState(currentDuration);
  const [customValue, setCustomValue] = useState('');

  const handleOpen = () => {
    setTempDuration(currentDuration);
    setCustomValue('');
    setIsOpen(true);
  };

  const handleSave = () => {
    onDurationChange(tempDuration);
    setIsOpen(false);
  };

  const adjustDuration = (delta: number) => {
    const newValue = Math.max(1, Math.min(3600, tempDuration + delta));
    setTempDuration(newValue);
    setCustomValue('');
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 3600) {
      setTempDuration(parsed);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <Settings className="w-4 h-4" />
        <span>Adjust Duration</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
            >
              <div className="glass-card rounded-2xl p-6 border border-border/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-lg">Adjust Duration</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Duration selector */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Set how long each rep should take
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => adjustDuration(-5)}
                      className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <div className="text-center min-w-[120px]">
                      <span className="text-3xl font-display font-bold text-primary">
                        {formatDuration(tempDuration)}
                      </span>
                    </div>

                    <button
                      onClick={() => adjustDuration(5)}
                      className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick presets */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {[5, 10, 15, 30, 60, 120, 300].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setTempDuration(preset);
                          setCustomValue('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          tempDuration === preset
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {formatDuration(preset)}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <div className="w-full">
                    <label className="text-xs text-muted-foreground mb-1 block">Custom (seconds)</label>
                    <Input
                      type="number"
                      min={1}
                      max={3600}
                      placeholder="Enter custom seconds (1-3600)"
                      value={customValue}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className="text-center"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Max: 1 hour (3600 seconds)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

import React from 'react';
import { Settings2, Clock } from 'lucide-react';
import { type ChunkInfo } from '../utils/audioProcessing';

interface SplitConfigProps {
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  chunks: ChunkInfo[];
  totalDurationSeconds: number | null;
}

const PRESET_DURATIONS = [10, 15, 30, 45, 60];

export const SplitConfig: React.FC<SplitConfigProps> = ({
  durationMinutes,
  onDurationChange,
  chunks,
  totalDurationSeconds
}) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border rounded-xl p-6 mt-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Cấu hình cắt file</h3>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Độ dài mỗi phần (phút)
        </label>
        <div className="flex flex-wrap gap-3">
          {PRESET_DURATIONS.map((preset) => (
            <button
              key={preset}
              onClick={() => onDurationChange(preset)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                durationMinutes === preset
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {preset} phút
            </button>
          ))}
        </div>
      </div>

      {chunks.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Dự kiến phân đoạn ({chunks.length} phần)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chunks.map((chunk, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-lg border border-border/50">
                <Clock className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Phần {idx + 1}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(chunk.start)} - {formatTime(chunk.end)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  progress: number;
  currentChunk: number;
  totalChunks: number;
  isProcessing: boolean;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  currentChunk,
  totalChunks,
  isProcessing
}) => {
  if (!isProcessing) return null;

  return (
    <div className="bg-card border rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-primary font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang xử lý phần {currentChunk} / {totalChunks}...</span>
        </div>
        <span className="text-sm font-semibold">{Math.round(progress * 100)}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary h-3 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Vui lòng không đóng trình duyệt trong quá trình này.
      </p>
    </div>
  );
};

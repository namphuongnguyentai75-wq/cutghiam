import React, { useCallback } from 'react';
import { UploadCloud, FileAudio } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  audioDuration: number | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, audioDuration }) => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.size > MAX_FILE_SIZE) {
          alert('Dung lượng file quá lớn. Ứng dụng xử lý trên trình duyệt nên chỉ hỗ trợ tối đa 2GB.');
          return;
        }
        if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
          onFileSelect(file);
        } else {
          alert('Vui lòng chọn file âm thanh hợp lệ (.mp3, .wav, .m4a, .aac, .ogg)');
        }
      }
    },
    [onFileSelect]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert('Dung lượng file quá lớn. Ứng dụng xử lý trên trình duyệt nên chỉ hỗ trợ tối đa 2GB.');
        return;
      }
      onFileSelect(file);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors rounded-xl p-12 text-center bg-card flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Tải lên file âm thanh</h3>
          <p className="text-muted-foreground mb-4">Kéo thả hoặc bấm để chọn file</p>
          <p className="text-xs text-muted-foreground">Hỗ trợ: MP3, WAV, M4A, AAC, OGG</p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
            onChange={onChange}
          />
        </div>
      ) : (
        <div className="bg-card border rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileAudio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold truncate max-w-[250px] sm:max-w-md">{selectedFile.name}</h4>
              <div className="text-sm text-muted-foreground flex items-center space-x-3 mt-1">
                <span>{formatSize(selectedFile.size)}</span>
                {audioDuration !== null && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(audioDuration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              // Trigger input click to change file
              document.getElementById('file-upload-change')?.click();
            }}
            className="text-sm text-primary hover:underline"
          >
            Đổi file
          </button>
          <input
            id="file-upload-change"
            type="file"
            className="hidden"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
};

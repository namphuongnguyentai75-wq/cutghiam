import React, { useEffect, useState } from 'react';
import { Download, Play, Pause, FileArchive } from 'lucide-react';
import { type ExportFile, downloadSingleFile, downloadZip } from '../utils/export';

interface ResultListProps {
  files: ExportFile[];
  originalFilename: string;
}

export const ResultList: React.FC<ResultListProps> = ({ files, originalFilename }) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioUrlMap, setAudioUrlMap] = useState<Record<string, string>>({});
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Generate object URLs for the blobs so they can be played
    const urlMap: Record<string, string> = {};
    const elements: Record<string, HTMLAudioElement> = {};
    
    files.forEach(file => {
      const url = URL.createObjectURL(file.blob);
      urlMap[file.filename] = url;
      const audio = new Audio(url);
      audio.onended = () => setPlaying(null);
      elements[file.filename] = audio;
    });

    setAudioUrlMap(urlMap);
    setAudioElements(elements);

    return () => {
      Object.values(urlMap).forEach(url => URL.revokeObjectURL(url));
      Object.values(elements).forEach(audio => {
        audio.pause();
        audio.removeAttribute('src');
      });
    };
  }, [files]);

  const togglePlay = (filename: string) => {
    if (playing === filename) {
      audioElements[filename]?.pause();
      setPlaying(null);
    } else {
      if (playing && audioElements[playing]) {
        audioElements[playing].pause();
      }
      audioElements[filename]?.play();
      setPlaying(filename);
    }
  };

  const handleDownloadZip = () => {
    const zipName = originalFilename.replace(/\.[^/.]+$/, '') + '_split.zip';
    downloadZip(files, zipName);
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-card border rounded-xl p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold">Kết quả đã xử lý ({files.length} phần)</h3>
        <button
          onClick={handleDownloadZip}
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <FileArchive className="w-4 h-4" />
          <span>Tải toàn bộ (.ZIP)</span>
        </button>
      </div>

      <div className="space-y-3">
        {files.map((file, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50 gap-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <button
                onClick={() => togglePlay(file.filename)}
                className="flex-shrink-0 bg-primary/10 p-2 rounded-full text-primary hover:bg-primary/20 transition-colors"
              >
                {playing === file.filename ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
              <div className="truncate font-medium text-sm">
                {file.filename}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {(file.blob.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <button
                onClick={() => downloadSingleFile(file)}
                className="flex items-center space-x-2 text-sm text-primary hover:underline whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

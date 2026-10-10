import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scissors } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { SplitConfig } from './components/SplitConfig';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ResultList } from './components/ResultList';
import { splitAudio, type ChunkInfo } from './utils/audioProcessing';
import { type ExportFile } from './utils/export';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  
  const [results, setResults] = useState<ExportFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract file extension and base name
  const getFileParts = (filename: string) => {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return { base: filename, ext: '.mp3' };
    return {
      base: filename.substring(0, lastDot),
      ext: filename.substring(lastDot)
    };
  };

  const calculateChunks = useCallback((durationSec: number, minsPerChunk: number, originalFilename: string) => {
    const chunkSeconds = minsPerChunk * 60;
    const numChunks = Math.ceil(durationSec / chunkSeconds);
    const { base, ext } = getFileParts(originalFilename);
    
    const newChunks: ChunkInfo[] = [];
    for (let i = 0; i < numChunks; i++) {
      newChunks.push({
        start: i * chunkSeconds,
        end: Math.min((i + 1) * chunkSeconds, durationSec),
        filename: `${base}_part${(i + 1).toString().padStart(2, '0')}${ext}`
      });
    }
    setChunks(newChunks);
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setResults([]);
    setError(null);
    setAudioDuration(null);
    setChunks([]);

    try {
      // Import parseBlob directly in the function to avoid top-level issues if any
      const musicMetadata = await import('music-metadata');
      const metadata = await musicMetadata.parseBlob(selectedFile);
      const duration = metadata.format.duration;
      
      if (duration) {
        setAudioDuration(duration);
        calculateChunks(duration, durationMinutes, selectedFile.name);
      } else {
        throw new Error("Không thể trích xuất thời lượng file.");
      }
    } catch (err: any) {
      console.error('Metadata parsing error:', err);
      // Fallback to HTML Audio if music-metadata fails (or for weird formats)
      const objectUrl = URL.createObjectURL(selectedFile);
      const audio = new Audio(objectUrl);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const duration = audio.duration;
        setAudioDuration(duration);
        calculateChunks(duration, durationMinutes, selectedFile.name);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError("Không thể đọc metadata của file âm thanh này. File có thể bị lỗi, hoặc định dạng quá lớn/không được hỗ trợ.");
      };
    }
  };

  const handleDurationChange = (minutes: number) => {
    setDurationMinutes(minutes);
    if (audioDuration && file) {
      calculateChunks(audioDuration, minutes, file.name);
    }
  };

  const handleStartSplit = async () => {
    if (!file || chunks.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setCurrentChunk(0);
    setError(null);
    setResults([]);

    try {
      const blobs = await splitAudio(
        file,
        chunks,
        (prog, current, total) => {
          setProgress(prog);
          setCurrentChunk(current);
        }
      );

      const exportFiles: ExportFile[] = blobs.map((blob, idx) => ({
        blob,
        filename: chunks[idx].filename
      }));

      setResults(exportFiles);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi trong quá trình xử lý. Có thể do file quá lớn vượt quá bộ nhớ RAM của trình duyệt.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Scissors className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AudioSplitter</h1>
          </div>
          <div className="text-sm text-muted-foreground">Chạy hoàn toàn trên trình duyệt</div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-6">Cắt nhỏ file ghi âm</h2>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              selectedFile={file} 
              audioDuration={audioDuration}
            />
          </section>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl text-sm">
              <span className="font-semibold">Lỗi:</span> {error}
            </div>
          )}

          {file && audioDuration && (
            <SplitConfig 
              durationMinutes={durationMinutes}
              onDurationChange={handleDurationChange}
              chunks={chunks}
              totalDurationSeconds={audioDuration}
            />
          )}

          {file && !isProcessing && results.length === 0 && chunks.length > 0 && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleStartSplit}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Bắt đầu cắt file
              </button>
            </div>
          )}

          <ProcessingProgress 
            isProcessing={isProcessing}
            progress={progress}
            currentChunk={currentChunk}
            totalChunks={chunks.length}
          />

          {results.length > 0 && (
            <ResultList files={results} originalFilename={file?.name || 'audio'} />
          )}
        </div>
      </main>

      <footer className="border-t py-6 mt-12 text-center text-sm text-muted-foreground">
        <p>Không có dữ liệu nào được tải lên máy chủ. Xử lý 100% tại trình duyệt của bạn.</p>
      </footer>
    </div>
  );
}

export default App;

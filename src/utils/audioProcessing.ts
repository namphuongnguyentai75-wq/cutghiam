import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async (onProgress?: (progress: number) => void) => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  if (onProgress) {
    ffmpeg.on('progress', ({ progress, time }) => {
      onProgress(progress);
    });
  }

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

export interface ChunkInfo {
  start: number; // in seconds
  end: number;   // in seconds
  filename: string;
}

export const splitAudio = async (
  file: File,
  chunkInfos: ChunkInfo[],
  onProgress?: (progress: number, currentChunk: number, totalChunks: number) => void
): Promise<Blob[]> => {
  const ff = await initFFmpeg();
  
  // Write the original file to FFmpeg's virtual file system
  const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
  await ff.writeFile(inputFileName, await fetchFile(file));

  const blobs: Blob[] = [];

  for (let i = 0; i < chunkInfos.length; i++) {
    const chunk = chunkInfos[i];
    const outputFileName = chunk.filename;
    
    const duration = chunk.end - chunk.start;
    
    // Command to split: ffmpeg -i input.mp3 -ss START -t DURATION -c copy output.mp3
    await ff.exec([
      '-i', inputFileName,
      '-ss', chunk.start.toString(),
      '-t', duration.toString(),
      '-c', 'copy',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const blob = new Blob([data as any], { type: file.type || 'audio/mpeg' });
    blobs.push(blob);
    
    if (onProgress) {
      onProgress(1, i + 1, chunkInfos.length); // We report progress per chunk completed
    }
  }

  // Cleanup
  await ff.deleteFile(inputFileName);
  for (const chunk of chunkInfos) {
    await ff.deleteFile(chunk.filename);
  }

  return blobs;
};

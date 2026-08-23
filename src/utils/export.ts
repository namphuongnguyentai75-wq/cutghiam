import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ExportFile {
  blob: Blob;
  filename: string;
}

export const downloadSingleFile = (file: ExportFile) => {
  saveAs(file.blob, file.filename);
};

export const downloadZip = async (files: ExportFile[], zipFilename: string) => {
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.filename, file.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
};

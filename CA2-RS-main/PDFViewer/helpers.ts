import {decode as atob, encode as btoa} from 'base-64';
var RNFS = require('react-native-fs');
import { toByteArray } from 'base64-js';

export const imgUrlToBase64 = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${url}`);
  }
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return _base64ToArrayBuffer(base64);
};
const isUrl = (path: string): boolean => {
  return /^https?:\/\//i.test(path);
};

const fetchPdfFromUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${url}`);
    }

    // Ưu tiên arrayBuffer (ổn định hơn blob/FileReader trên React Native)
    if (typeof (response as any).arrayBuffer === 'function') {
      const arrayBuffer = await (response as any).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const base64 = _uint8ToBase64(bytes);
      return { base64, arrayBuffer };
    }

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    const arrayBuffer = _base64ToArrayBuffer(base64);
    return { base64, arrayBuffer };
  } catch (error) {
    console.error('Error fetching PDF from URL1:', error);
    throw error;
  }
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Loại bỏ tiền tố data:application/pdf;base64,
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const readFile = async (path: string) => {
  try {
    if (isUrl(path)) {
      // Đọc PDF từ URL
      return await fetchPdfFromUrl(path);
    } else {
      // Đọc PDF từ file cục bộ (RNFS cần path không có file://)
      const localPath = path.startsWith('file://')
        ? path.replace(/^file:\/\//, '')
        : path;
      const contents = await RNFS.readFile(localPath, 'base64');
      return {
        base64: contents,
        arrayBuffer: _base64ToArrayBuffer(contents),
      };
    }
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};
export const writeFile = async (pdfBase64: string) => {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/${Date.now()}.pdf`;
    await RNFS.writeFile(path, pdfBase64, 'base64');
    return path;
  } catch (err) {
    console.log(err);
  }
};

export const _base64ToArrayBuffer = (base64: any) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export const _uint8ToBase64 = (u8Arr: any) => {
  const CHUNK_SIZE = 0x8000;
  let index = 0;
  const length = u8Arr.length;
  let result = '';
  let slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
};

export const _calcPosition = (
  pageSize: {width: number; height: number},
  position: {x: number; y: number},
  wrapperSize: {width: number; height: number},
  itemHegiht = 0,
) => {
  return {
    x: (pageSize.width * position.x) / wrapperSize.width,
    y: pageSize.height * (1 - position.y / wrapperSize.height) - itemHegiht,
  };
};

export const _calcDims = (
  pageSize: {width: number; height: number},
  dims: {width: number; height: number},
  wrapperSize: {width: number; height: number},
) => {
  return {
    width: (pageSize.width * dims.width) / wrapperSize.width,
    height: (pageSize.height * dims.height) / wrapperSize.height,
  };
};
export const getMimeTypeFromPath = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    csv: 'text/csv',
    txt: 'text/plain',
  };

  return mimeTypes[extension] || 'application/octet-stream'; // MIME type mặc định
}
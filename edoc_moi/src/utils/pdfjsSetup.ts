import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// Import raw để tạo Blob worker — tránh 404 .mjs trên IIS (thiếu MIME / rewrite)
import pdfWorkerCode from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?raw";

/** Polyfill main-thread */
export function ensurePromiseWithResolvers() {
  if (typeof (Promise as any).withResolvers !== "function") {
    (Promise as any).withResolvers = function <T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

ensurePromiseWithResolvers();

const workerBlob = new Blob([pdfWorkerCode], { type: "text/javascript" });
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

export { pdfjsLib };

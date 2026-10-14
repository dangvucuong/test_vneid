declare module "pdfjs-dist/build/pdf.mjs";
declare module "pdfjs-dist/build/pdf.worker.mjs";
declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const url: string;
  export default url;
}
declare module "pdfjs-dist/legacy/build/pdf.mjs";
declare module "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url" {
  const url: string;
  export default url;
}
declare module "pdfjs-dist/legacy/build/pdf.worker.min.mjs?raw" {
  const code: string;
  export default code;
}
declare module "trim-canvas" {
  export default function trimCanvas(selector: HTMLCanvasElement): any;
}

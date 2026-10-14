<template>
  <div class="signature-pad">
    <div class="signature-pad-canvas-box">
      <canvas
        ref="signaturePadCanvas"
        class="signature-pad-canvas"
        width="472"
        height="250"
        style="touch-action: none; user-select: none"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useEventListener } from "@vueuse/core";
import SignaturePad from "signature_pad";
import trimCanvas from "trim-canvas";

type Props = {
  toolShow?: boolean;
  colors?: string[];
  isTrimCanvas?: boolean;
  downloadName?: string;
};

const props = withDefaults(defineProps<Props>(), {
  toolShow: true,
  colors: () => ["#000", "#f00"],
  isTrimCanvas: true,
  downloadName: "signature",
});

defineExpose({
  getCanvas,
  getTrimmedCanvas,
  getSignaturePad,
  clear: clearCanvas,
  isEmpty: isEmptyCanvas,
  changePenColor,
  fromDataURL,
  toDataURL,
  fromData,
  toData,
  on: signaturePadOn,
  off: signaturePadOff,
  saveImage,
  saveAsPng,
  saveAsJpg,
  saveAsJpeg,
});

const signaturePadCanvas: any = ref(null);

let signaturePad: any = null;
onMounted(() => {
  nextTick(() => {
    signaturePad = new SignaturePad(signaturePadCanvas.value, {
      backgroundColor: props.isTrimCanvas
        ? "rgba(255,255,255,0)"
        : "rgb(255,255,255)",
    });
    // resizeCanvas();
  });
});

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  signaturePadCanvas.value.width = signaturePadCanvas.value.offsetWidth * ratio;
  signaturePadCanvas.value.height =
    signaturePadCanvas.value.offsetHeight * ratio;
  signaturePadCanvas.value.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
}

useEventListener(window, "resize", (evt) => {
  resizeCanvas();
});

function getCanvas() {
  return signaturePadCanvas.value;
}

// function getTrimmedCanvas(): any {
//   if (signaturePad.isEmpty()) {
//     console.log("Canvas is empty");
//     return false;
//   }
//   const copy = document.createElement("canvas");

//   copy.width = signaturePadCanvas.value.width;
//   copy.height = signaturePadCanvas.value.height;
//   copy
//     ?.getContext("2d", { willReadFrequently: true })
//     ?.drawImage(signaturePadCanvas.value, 0, 0);

//   // Create a temporary canvas to hold the current content
//   const temp = document.createElement("canvas");
//   temp.width = copy.width;
//   temp.height = copy.height;
//   temp.getContext("2d")?.drawImage(copy, 0, 0);

//   // Scale the original canvas
//   copy.width *= 0.3;
//   copy.height *= 0.3;

//   // Draw the content from the temporary canvas back onto the original canvas
//   copy
//     .getContext("2d")
//     ?.drawImage(
//       temp,
//       0,
//       0,
//       temp.width,
//       temp.height,
//       0,
//       0,
//       copy.width,
//       copy.height
//     );

//   const trimmedCanvas = trimCanvas(copy);

//   console.log(trimmedCanvas);

//   // Create a new canvas with the desired dimensions
//   const scaledCanvas = document.createElement("canvas");
//   scaledCanvas.width = 200; // Set width to 200
//   scaledCanvas.height = 100; // Set height to 100

//   // Draw the trimmed canvas onto the scaled canvas
//   const context = scaledCanvas.getContext("2d");
//   if (context) {
//     const newX = (scaledCanvas.width - trimmedCanvas.width) / 2;
//     const newY = (scaledCanvas.height - trimmedCanvas.height) / 2;
//     context.drawImage(trimmedCanvas, newX, newY);
//   }

//   return scaledCanvas;
// }

function resize(img: any, width: any, height: any, quality = null) {
  function newCanvas(width: any, height: any) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  const canvas = newCanvas(width, height);

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

  return canvas;
}

function getTrimmedCanvas(): any {
  if (signaturePad.isEmpty()) {
    console.log("Canvas is empty");
    return false;
  }
  const copy = document.createElement("canvas");

  copy.width = signaturePadCanvas.value.width;
  copy.height = signaturePadCanvas.value.height;
  copy
    ?.getContext("2d", { willReadFrequently: true })
    ?.drawImage(signaturePadCanvas.value, 0, 0);

  // Create a temporary canvas to hold the current content

  const temp = document.createElement("canvas");
  temp.width = copy.width;
  temp.height = copy.height;
  temp.getContext("2d")?.drawImage(copy, 0, 0);

  // Scale the original canvas
  copy.width *= 0.3;
  copy.height *= 0.3;
  // Draw the content from the temporary canvas back onto the original canvas
  copy
    .getContext("2d")
    ?.drawImage(
      temp,
      0,
      0,
      temp.width,
      temp.height,
      0,
      0,
      copy.width,
      copy.height
    );

  const trimmedCanvas = trimCanvas(copy);

  // Create a new canvas with the desired dimensions
  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = 200; // Set width to 200
  scaledCanvas.height = 100; // Set height to 100

  // Draw the trimmed canvas onto the scaled canvas
  const context = scaledCanvas.getContext("2d");
  if (context) {
    const newX = (scaledCanvas.width - trimmedCanvas.width) / 2;
    const newY = (scaledCanvas.height - trimmedCanvas.height) / 2;
    context.drawImage(trimmedCanvas, newX, newY);
  }

  return scaledCanvas;
}

function getSignaturePad() {
  if (signaturePad.isEmpty()) {
    console.log("Canvas is empty");
    return false;
  }
  return signaturePad;
}

function clearCanvas() {
  signaturePad.clear();
}

function isEmptyCanvas() {
  return signaturePad.isEmpty();
}

function changePenColor(color: string) {
  signaturePad.penColor = color;
}

function fromDataURL(dataURL: string, options: any) {
  return signaturePad.fromDataURL(dataURL, options);
}

function toDataURL(type: string, encoderOptions: any) {
  return signaturePad.toDataURL(type, encoderOptions);
}

function fromData(pointGroups: any) {
  return signaturePad.fromData(pointGroups);
}

function toData() {
  return signaturePad.toData();
}

function signaturePadOn() {
  return signaturePad.on();
}

function signaturePadOff() {
  return signaturePad.off();
}

function saveImage(downloadName: string, type = "png") {
  if (signaturePad.isEmpty()) {
    console.log("Canvas is empty");
  } else {
    const dataURL = props.isTrimCanvas
      ? getTrimmedCanvas().toDataURL("image/png", 0.5)
      : signaturePad.toDataURL();

    console.log(dataURL);

    return dataURL;

    // if (type === "png") {
    //   download(dataURL, `${downloadName || props.downloadName}.png`);
    // } else {
    //   download(dataURL, `${downloadName || props.downloadName}.jpg`);
    // }
  }
}

function saveAsPng(downloadName?: string) {
  saveImage(downloadName as string, "png");
}

function saveAsJpg(downloadName?: string) {
  saveImage(downloadName as string, "jpg");
}

function saveAsJpeg(downloadName?: string) {
  saveImage(downloadName as string, "jpeg");
}
</script>

<style scoped>
.signature-pad {
  background-color: #fff;
}

.color-box,
.handle-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.handle-item .handle-item-icon {
  font-size: 20px;
}

.signature-pad-canvas {
  width: 100%;
  height: 250px;
}
</style>

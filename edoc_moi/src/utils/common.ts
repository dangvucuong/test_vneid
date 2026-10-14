import { XMLParser } from "fast-xml-parser";
import trimCanvas from "trim-canvas";

export function getDataFromXml(xmlDoc: any, key: any) {
  try {
    const resultNode = xmlDoc.getElementsByTagName(key)[0];
    const resultValue = resultNode?.textContent || resultNode?.innerHTML;
    return resultValue;
  } catch (error) {
    console.log(error);
  }
}
export function convertXmlToJson(xmlData: string) {
  const options: any = {
    attributeNamePrefix: "",
    ignoreAttributes: false,
  };

  const parser = new XMLParser();
  return parser.parse(xmlData, options);
}

export const textToImage = ({
  value,
  font,
}: {
  value: string;
  font: string;
}) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 200;
  canvas.height = 100;

  const scaleX = 200 / canvas.width;
  const scaleY = 100 / canvas.height;
  const scale = Math.max(scaleX, scaleY);

  if (context) {
    const fontSize = 50 * scale;
    context.font = `${fontSize}px ${font}`;

    const textWidth = context.measureText(value).width;
    const textHeight = 30 * scale;
    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height + textHeight) / 2;

    context.fillText(value, x, y);
    const trimmedCanvas = trimCanvas(canvas);
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = 200;
    scaledCanvas.height = 100;
    const newContext = scaledCanvas.getContext("2d");
    if (newContext) {
      newContext.scale(scaleX, scaleY);

      // Calculate the x and y coordinates to center the image
      const newX = (scaledCanvas.width - trimmedCanvas.width * scaleX) / 2;
      const newY = (scaledCanvas.height - trimmedCanvas.height * scaleY) / 2;

      newContext.drawImage(trimmedCanvas, newX, newY);
    }
    const image = scaledCanvas.toDataURL();

    return image?.toString() || "";
    // Chuyển trimmedCanvas thành hình ảnh
  }

  // Chuyển canvas thành hình ảnh
};

export const checkExpiresLogin = (dataStorage: any) => {
  if (dataStorage) {
    const { expire } = dataStorage;

    if (new Date().getTime() > expire) {
      return true;
    }
  }

  return false;
};

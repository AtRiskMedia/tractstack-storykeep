import { Buffer } from "buffer";
import { SvgString } from "./svgString";

export const svgImageMask = (
  shapeName: string,
  thisId: string,
  viewportKey: string
) => {
  const shape = SvgString(shapeName, viewportKey, thisId);
  if (!shape) return null;
  const dataUri = Buffer.from(shape).toString(`base64`);
  const dataUriString = `data:image/svg+xml;base64,${dataUri}`;

  return {
    mask: `url("${dataUriString}")`,
    maskRepeat: `no-repeat`,
    WebkitMaskSize: `100% AUTO`,
    maskSize: `100% AUTO`,
  };
};

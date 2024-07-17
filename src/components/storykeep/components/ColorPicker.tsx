import { useRef, useEffect } from "react";
import Picker from "vanilla-picker";
import tinycolor from "tinycolor2";
import { tailwindColors } from "../../../assets/tailwindColors";
import { debounce } from "../../../utils/helpers";

export interface ColorPickerProps {
  id: string;
  defaultColor: string;
  onColorChange: (color: string) => void;
}
interface ClosestColor {
  name: string;
  shade: number;
}

const findClosestTailwindColor = (color: string): ClosestColor | null => {
  const targetColor = tinycolor(color);
  const targetHsl = targetColor.toHsl();
  let closestColor: ClosestColor | null = null;
  let closestDistance = Infinity;

  const validShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  Object.entries(tailwindColors).forEach(([colorName, shades]) => {
    shades.forEach((shade, index) => {
      if (!validShades.includes((index + 1) * 100)) return; // Skip invalid shades

      const shadeColor = tinycolor(shade);
      const shadeHsl = shadeColor.toHsl();

      // Calculate distance in HSL space
      const distanceH = Math.abs(targetHsl.h - shadeHsl.h);
      const distanceS = Math.abs(targetHsl.s - shadeHsl.s);
      const distanceL = Math.abs(targetHsl.l - shadeHsl.l);
      const distance = Math.sqrt(
        distanceH * distanceH + distanceS * distanceS + distanceL * distanceL
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestColor = { name: colorName, shade: validShades[index] };
      }
    });
  });
  return closestColor;
};

const ColorPicker = ({ defaultColor, onColorChange }: ColorPickerProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<Picker | null>(null);

  useEffect(() => {
    if (divRef.current && !pickerRef.current) {
      pickerRef.current = new Picker({
        parent: divRef.current,
        color: defaultColor,
        popup: "bottom",
        alpha: false,
        onDone: debounce(color => {
          const closestColor = findClosestTailwindColor(color.hex);
          if (closestColor) {
            onColorChange(`${closestColor.name}-${closestColor.shade}`);
          }
        }, 300),
      });
    }

    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, [onColorChange, defaultColor]);

  return (
    <div
      ref={divRef}
      style={{ backgroundColor: defaultColor }} // Use inline style for hex color
      className="border border-dotted border-1 border-black h-10 w-24 cursor-pointer"
      onClick={() => pickerRef.current?.show()}
    />
  );
};

export default ColorPicker;

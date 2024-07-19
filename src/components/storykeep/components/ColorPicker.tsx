import { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import tinycolor from "tinycolor2";
import { tailwindColors } from "../../../assets/tailwindColors";
import { debounce } from "../../../utils/helpers";
import type { CSSProperties } from "react";

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

const ColorPicker = ({ id, defaultColor, onColorChange }: ColorPickerProps) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const lastSelectedColor = useRef(defaultColor);

  useEffect(() => {
    setColor(defaultColor);
    lastSelectedColor.current = defaultColor;
  }, [defaultColor]);

  const handleClick = useCallback(() => {
    setDisplayColorPicker(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setDisplayColorPicker(false);
    // Apply the last selected color when closing without choosing
    if (color !== lastSelectedColor.current) {
      setColor(lastSelectedColor.current);
      const closestColor = findClosestTailwindColor(lastSelectedColor.current);
      if (closestColor) {
        onColorChange(`${closestColor.name}-${closestColor.shade}`);
      }
    }
  }, [color, onColorChange]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor);
      lastSelectedColor.current = newColor;
      const closestColor = findClosestTailwindColor(newColor);
      if (closestColor) {
        onColorChange(`${closestColor.name}-${closestColor.shade}`);
      }
    },
    [onColorChange]
  );

  const debouncedHandleColorChange = useCallback(
    debounce((newColor: string) => {
      handleColorChange(newColor);
      setDisplayColorPicker(false);
    }, 300),
    [handleColorChange]
  );

  const popover: CSSProperties = {
    position: "absolute",
    zIndex: 2,
  };
  const cover: CSSProperties = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  };

  return (
    <div>
      <div
        id={id}
        style={{ backgroundColor: color }}
        className="border border-dotted border-1 border-black h-10 w-24 cursor-pointer"
        onClick={handleClick}
      />
      {displayColorPicker ? (
        <div style={popover}>
          <div style={cover} onClick={handleClose} />
          <HexColorPicker color={color} onChange={debouncedHandleColorChange} />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;

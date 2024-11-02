import { useState, useEffect, useCallback } from "react";
import ColorPickerWrapper from "../components/ColorPickerWrapper";

interface BrandColorPickerProps {
  value: string;
  onChange: (newValue: string) => void;
  onEditingChange?: () => void;
}

const BrandColorPicker = ({
  value,
  onChange,
  onEditingChange,
}: BrandColorPickerProps) => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const colorArray = value.split(",").map(color => {
      const cleanColor = color.trim();
      return cleanColor.startsWith("#") ? cleanColor : `#${cleanColor}`;
    });
    setColors(colorArray);
  }, [value]);

  const handleColorChange = useCallback(
    (newColor: string, index: number) => {
      const newColors = [...colors];
      newColors[index] = newColor;
      const csvValue = newColors.map(color => color.replace("#", "")).join(",");
      onChange(csvValue);
      if (onEditingChange) {
        onEditingChange();
      }
    },
    [colors, onChange, onEditingChange]
  );

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
      {colors.map((color, index) => (
        <div key={index} className="relative">
          <ColorPickerWrapper
            id={`brand-color-${index}`}
            defaultColor={color}
            onColorChange={newColor => handleColorChange(newColor, index)}
            skipTailwind={true}
          />
        </div>
      ))}
    </div>
  );
};

export default BrandColorPicker;

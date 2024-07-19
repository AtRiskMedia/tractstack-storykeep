import { useState, useEffect } from "react";
import type { ColorPickerProps } from "./ColorPicker";

const ColorPickerWrapper = ({
  id,
  defaultColor,
  onColorChange,
}: ColorPickerProps) => {
  const [ColorPicker, setColorPicker] =
    useState<React.ComponentType<ColorPickerProps> | null>(null);

  useEffect(() => {
    import("./ColorPicker").then(module => {
      setColorPicker(
        () => module.default as React.ComponentType<ColorPickerProps>
      );
    });
  }, []);

  if (!ColorPicker) {
    return (
      <div
        id={id}
        style={{ backgroundColor: defaultColor }}
        className="border border-dotted border-1 border-black h-8 w-24 cursor-pointer"
      ></div>
    );
  }

  return (
    <ColorPicker
      id={id}
      defaultColor={defaultColor}
      onColorChange={onColorChange}
    />
  );
};

export default ColorPickerWrapper;

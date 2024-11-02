import { useState, useEffect } from "react";
import DesignSnapshot from "./DesignSnapshot";
import { pageDesigns } from "../../../assets/paneDesigns";
import type { Theme } from "../../../types";

interface ThemeVisualSelectorProps {
  value: Theme;
  onChange: (theme: Theme) => void;
}

const themes: Theme[] = [
  "light",
  "light-bw",
  "light-bold",
  "dark",
  "dark-bw",
  "dark-bold",
];

const themeNames: Record<Theme, string> = {
  "light": "Light",
  "light-bw": "Light Black & White",
  "light-bold": "Light Bold",
  "dark": "Dark",
  "dark-bw": "Dark Black & White",
  "dark-bold": "Dark Bold"
};

export default function ThemeVisualSelector({ value, onChange }: ThemeVisualSelectorProps) {
  const [snapshots, setSnapshots] = useState<Record<Theme, string>>({});
  const [brandColors, setBrandColors] = useState<string[]>([]);

  // Monitor brand color changes
  useEffect(() => {
    const updateBrandColors = () => {
      const style = getComputedStyle(document.documentElement);
      const colors = Array.from({ length: 8 }, (_, i) => 
        style.getPropertyValue(`--brand-${i + 1}`).trim()
      );
      setBrandColors(colors);
      // Clear snapshots to force regeneration
      setSnapshots({});
    };

    // Get initial colors
    updateBrandColors();

    // Create observer for CSS variable changes
    const observer = new MutationObserver(updateBrandColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {themes.map((theme) => {
        // Get design for this specific theme
        const design = pageDesigns(theme).basic;
        
        return (
          <button
            key={theme}
            onClick={() => onChange(theme)}
            className={`group relative rounded-lg transition-all hover:ring-2 hover:ring-myorange hover:ring-offset-2 ${
              value === theme ? "ring-2 ring-myorange ring-offset-2" : ""
            }`}
          >
            <div className="relative aspect-[4/3] w-full">
              {(!snapshots[theme] || brandColors.length === 0) ? (
                <div className="absolute inset-0">
                  <DesignSnapshot
                    design={design}
                    theme={theme}
                    brandColors={brandColors}
                    onComplete={(imageData) => 
                      setSnapshots(prev => ({ ...prev, [theme]: imageData }))
                    }
                  />
                </div>
              ) : (
                <img
                  src={snapshots[theme]}
                  alt={`${themeNames[theme]} theme preview`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 text-white rounded-b-lg text-center">
              {themeNames[theme]}
            </div>
          </button>
        )
      })}
    </div>
  );
}

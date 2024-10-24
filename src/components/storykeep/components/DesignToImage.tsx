import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import PreviewPage from "./PreviewPage";
import { paneDesigns } from "../../../assets/paneDesigns";
import type { Theme, Variant, PaneDesign } from "../../../types";

const themes: Theme[] = [
  "light",
  "light-bw",
  "light-bold",
  "dark",
  "dark-bw",
  "dark-bold",
];

type VariantMap = {
  [key in Variant]?: string;
};

function getValidVariants(design: PaneDesign): Variant[] {
  if (!design.id.includes("${variant}")) {
    return ["default"];
  }
  if (typeof design.name === "string") {
    return ["default"];
  }
  const variantObject =
    (design.name as { valueMap?: VariantMap })?.valueMap || {};
  return Object.keys(variantObject) as Variant[];
}

export default function DesignPreviewer() {
  const [images, setImages] = useState<
    Array<{ src: string; filename: string }>
  >([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentDesign, setCurrentDesign] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [currentVariant, setCurrentVariant] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debugView, setDebugView] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Get base designs and their valid variants
  const designConfigs = useMemo(() => {
    const baseDesigns = paneDesigns("light", "default");
    const configs = baseDesigns.map(design => ({
      design,
      validVariants: getValidVariants(design),
    }));

    // Calculate total number of combinations
    const total = configs.reduce(
      (acc, config) => acc + config.validVariants.length * themes.length,
      0
    );

    setProgress({ current: 0, total });

    return configs;
  }, []);

  const getCurrentDesign = () => {
    const currentConfig = designConfigs[currentDesign];
    if (!currentConfig) return null;

    const theme = themes[currentTheme];
    const variant = currentConfig.validVariants[currentVariant];

    const designs = paneDesigns(theme, variant);
    return designs.find(
      d => d.id === currentConfig.design.id.replace("${variant}", variant)
    );
  };

  const moveToNext = useCallback(() => {
    setProgress(prev => ({ ...prev, current: prev.current + 1 }));

    const currentConfig = designConfigs[currentDesign];
    if (!currentConfig) {
      setIsGenerating(false);
      return;
    }

    if (currentVariant < currentConfig.validVariants.length - 1) {
      setCurrentVariant(prev => prev + 1);
    } else if (currentTheme < themes.length - 1) {
      setCurrentVariant(0);
      setCurrentTheme(prev => prev + 1);
    } else if (currentDesign < designConfigs.length - 1) {
      setCurrentVariant(0);
      setCurrentTheme(0);
      setCurrentDesign(prev => prev + 1);
    } else {
      setIsGenerating(false);
    }
  }, [currentDesign, currentTheme, currentVariant, designConfigs]);

  const generateImage = async () => {
    if (!previewRef.current) return;

    try {
      const design = getCurrentDesign();
      if (!design) {
        moveToNext();
        return;
      }

      // Apply layout fixes
      if (previewRef.current) {
        // Fix heading layout
        const headings = previewRef.current.querySelectorAll("h2");
        headings.forEach(heading => {
          const h = heading as HTMLElement;
          h.style.display = "block";
          h.style.marginBottom = "1.5rem";
          h.style.lineHeight = "1.1";
          h.style.width = "100%";
          h.style.clear = "both";
        });

        // Fix paragraph spacing and layout
        const paragraphs = previewRef.current.querySelectorAll(".text-brand-7");
        paragraphs.forEach(p => {
          const paragraph = p as HTMLElement;
          paragraph.style.display = "block";
          paragraph.style.width = "100%";
          paragraph.style.clear = "both";
          paragraph.style.marginBottom = "1rem";
        });

        // Fix button spacing
        const buttons = previewRef.current.querySelectorAll('a[type="button"]');
        buttons.forEach(button => {
          const btn = button as HTMLElement;
          btn.style.display = "inline-flex";
          btn.style.alignItems = "center";
          btn.style.whiteSpace = "nowrap";
          btn.style.paddingLeft = "1rem";
          btn.style.paddingRight = "1rem";
          btn.style.marginRight = "0.5rem"; // Add consistent right margin
        });

        // Ensure container widths
        const containers =
          previewRef.current.querySelectorAll('[class*="max-w-"]');
        containers.forEach(container => {
          const cont = container as HTMLElement;
          cont.style.width = "100%";
          cont.style.maxWidth = "100%";
        });

        // Add wrapper for buttons to ensure proper spacing
        const buttonContainers = previewRef.current.querySelectorAll(
          'div:has(> a[type="button"])'
        );
        buttonContainers.forEach(container => {
          const cont = container as HTMLElement;
          cont.style.display = "flex";
          cont.style.flexWrap = "wrap";
          cont.style.gap = "0.5rem";
          cont.style.alignItems = "center";
        });
      }

      // Wait for styles and rendering
      await new Promise(resolve => setTimeout(resolve, 250));

      const image = await toPng(previewRef.current, {
        width: 1500,
        height: previewRef.current.offsetHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        pixelRatio: 1,
        backgroundColor: "#ffffff",
        quality: 1,
        canvasWidth: 1500,
        canvasHeight: previewRef.current.offsetHeight,
      });

      const filename = `${design.id}-${themes[currentTheme]}.webp`;
      const title = `${design.name} (${currentTheme})`;
      setImages(prev => [...prev, { src: image, filename, title }]);

      // Wait between captures
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error generating image:", error);
    }

    moveToNext();
  };

  useEffect(() => {
    if (isGenerating) {
      generateImage();
    }
  }, [currentDesign, currentTheme, currentVariant, isGenerating]);

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-4 items-center">
        <button
          onClick={() => {
            setImages([]);
            setCurrentDesign(0);
            setCurrentTheme(0);
            setCurrentVariant(0);
            setProgress(prev => ({ ...prev, current: 0 }));
            setIsGenerating(true);
          }}
          className="px-4 py-2 bg-myblue text-white rounded"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating...!" : "Generate All Previews"}
        </button>
        <button
          onClick={() => console.log(images)}
          disabled={!progress.current || progress.current !== progress.total}
          className="px-4 py-2 bg-myorange text-white rounded disabled:bg-mydarkgrey/20"
        >
          Push Images to Concierge
        </button>
        <button
          onClick={() => setDebugView(!debugView)}
          className="px-4 py-2 bg-mygreen text-white rounded"
        >
          {debugView ? "Hide Debug View" : "Show Debug View"}
        </button>
        {isGenerating && (
          <div className="ml-4">
            Progress: {progress.current} / {progress.total}
          </div>
        )}
      </div>

      {debugView && isGenerating && getCurrentDesign() && (
        <div className="mb-8 p-4 bg-myorange/10 rounded-lg">
          <h2 className="text-lg font-bold mb-2">Currently Rendering:</h2>
          <div className="mb-2">
            <strong>Design:</strong> {getCurrentDesign()?.id}
            <br />
            <strong>Theme:</strong> {themes[currentTheme]}
            <br />
            <strong>Variant:</strong>{" "}
            {designConfigs[currentDesign]?.validVariants[currentVariant]}
          </div>
          <div className="border-2 border-myorange p-4 rounded bg-white">
            <h3 className="text-lg font-bold mb-2">Live Preview:</h3>
            <div
              ref={previewRef}
              className="w-[1500px]"
              style={{
                isolation: "isolate",
                contain: "layout paint",
              }}
            >
              <PreviewPage
                design={{
                  name: getCurrentDesign()?.name || "",
                  isContext: false,
                  tailwindBgColour: null,
                  paneDesigns: [getCurrentDesign()!],
                }}
                viewportKey="desktop"
                slug="preview"
                isContext={false}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {images.map(({ src, filename }, idx) => (
          <div key={idx} className="border p-4 rounded">
            <div className="font-mono text-sm mb-2">{filename}</div>
            <img src={src} alt={filename} className="w-full h-auto border" />
          </div>
        ))}
      </div>
    </div>
  );
}

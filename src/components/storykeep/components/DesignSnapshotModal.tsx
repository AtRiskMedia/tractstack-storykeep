import { useState, useEffect } from "react";
import { classNames } from "../../../utils/helpers";
import { paneDesigns } from "../../../assets/paneDesigns";
import PreviewPage from "./PreviewPage";
import { toPng } from "html-to-image";
import imageCompression from "browser-image-compression";

type SnapshotStage =
  | "INITIALIZING"
  | "GENERATING"
  | "COMPRESSING"
  | "UPLOADING"
  | "COMPLETED"
  | "ERROR";

interface DesignSnapshotModalProps {
  onClose: () => void;
}

const themes = [
  "light",
  "light-bw",
  "light-bold",
  "dark",
  "dark-bw",
  "dark-bold",
] as const;

async function compressImage(
  image: string,
  maxSizeMB = 1,
  maxWidth = 1920
): Promise<string> {
  const blob = await fetch(image).then(r => r.blob());
  const file = new File([blob], "image.png", { type: "image/png" });
  const compressedFile = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
  });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressedFile);
  });
}

export const DesignSnapshotModal = ({ onClose }: DesignSnapshotModalProps) => {
  const [stage, setStage] = useState<SnapshotStage>("INITIALIZING");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ src: string; filename: string }>
  >([]);
  const [previewRef, setPreviewRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const baseDesigns = paneDesigns("light", "default");
    const total = baseDesigns.length * themes.length;
    setProgress({ current: 0, total });
    setStage("GENERATING");
  }, []);

  useEffect(() => {
    if (stage === "GENERATING") {
      generateImages();
    }
  }, [stage]);

  const generateImages = async () => {
    try {
      const baseDesigns = paneDesigns("light", "default");

      for (const design of baseDesigns) {
        for (const theme of themes) {
          if (!previewRef) continue;

          // Apply layout fixes for capture
          const headings = previewRef.querySelectorAll("h2");
          headings.forEach(heading => {
            const h = heading as HTMLElement;
            h.style.display = "block";
            h.style.marginBottom = "1.5rem";
            h.style.width = "100%";
            h.style.clear = "both";
          });

          const paragraphs = previewRef.querySelectorAll(".text-brand-7");
          paragraphs.forEach(p => {
            const paragraph = p as HTMLElement;
            paragraph.style.display = "block";
            paragraph.style.width = "100%";
            paragraph.style.clear = "both";
            paragraph.style.marginBottom = "1rem";
          });

          // Capture and compress image
          const image = await toPng(previewRef, {
            width: 1500,
            height: previewRef.offsetHeight,
            style: {
              transform: "scale(1)",
              transformOrigin: "top left",
            },
            pixelRatio: 1,
            backgroundColor: "#ffffff",
          });

          setStage("COMPRESSING");
          const compressed = await compressImage(image);

          setGeneratedImages(prev => [
            ...prev,
            {
              src: compressed,
              filename: `${design.id}-${theme}.png`,
            },
          ]);

          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }

      setStage("UPLOADING");
      await uploadImages(generatedImages);
      setStage("COMPLETED");
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const uploadImages = async (
    images: Array<{ src: string; filename: string }>
  ) => {
    try {
      const response = await fetch(
        `/api/concierge/storykeep/design-snapshots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images }),
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error("Failed to upload images");
    } catch (err) {
      throw new Error("Error uploading images: " + err);
    }
  };

  const getStageDescription = (currentStage: SnapshotStage) => {
    switch (currentStage) {
      case "INITIALIZING":
        return "Preparing to generate design snapshots...";
      case "GENERATING":
        return `Generating design snapshots... (${progress.current}/${progress.total})`;
      case "COMPRESSING":
        return "Compressing images...";
      case "UPLOADING":
        return "Uploading snapshots...";
      case "COMPLETED":
        return "Snapshot generation completed successfully!";
      case "ERROR":
        return `Error: ${error}`;
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Generating Design Snapshots</h2>
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={classNames(
                "h-full rounded-full transition-all",
                stage === "COMPLETED" ? "bg-green-500" : "bg-blue-500",
                stage === "ERROR" ? "bg-red-500" : "",
                stage === "INITIALIZING"
                  ? "w-1/5"
                  : stage === "GENERATING"
                    ? "w-2/5"
                    : stage === "COMPRESSING"
                      ? "w-3/5"
                      : stage === "UPLOADING"
                        ? "w-4/5"
                        : "w-full"
              )}
            />
          </div>
        </div>
        <p className="text-lg mb-4">{getStageDescription(stage)}</p>

        {/* Hidden Preview Area */}
        <div className="hidden">
          <div
            ref={setPreviewRef}
            className="w-[1500px]"
            style={{
              isolation: "isolate",
              contain: "layout paint",
            }}
          >
            <PreviewPage
              design={{
                name: "Preview",
                isContext: false,
                tailwindBgColour: null,
                paneDesigns: [],
              }}
              viewportKey="desktop"
              slug="preview"
              isContext={false}
            />
          </div>
        </div>

        {stage === "COMPLETED" && (
          <button
            onClick={onClose}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

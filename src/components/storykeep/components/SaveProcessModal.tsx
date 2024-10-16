import { useState, useEffect } from "react";
import { classNames } from "../../../utils/helpers";
import { tursoClient } from "../../../api/tursoClient";
import {
  reconcileData,
  resetUnsavedChanges,
} from "../../../utils/compositor/reconcileData";
//import { paneFiles } from "../../../store/storykeep";
import type {
  ReconciledData,
  StoryFragmentDatum,
  ContextPaneDatum,
  FileDatum,
} from "../../../types";

type SaveStage =
  | "RECONCILING"
  | "RESTORE_POINT"
  | "UPDATING_STYLES"
  | "UPLOADING_IMAGES"
  | "PUBLISHING"
  | "COMPLETED"
  | "ERROR";

type SaveProcessModalProps = {
  id: string;
  isContext: boolean;
  originalData: StoryFragmentDatum | ContextPaneDatum | null;
  onClose: () => void;
};

const updateFiles = (files: FileDatum[]) => {
  //console.log(paneFiles.get()[id].current)
  console.log(`update store`, files);
};

export const SaveProcessModal = ({
  id,
  isContext,
  originalData,
  onClose,
}: SaveProcessModalProps) => {
  const [stage, setStage] = useState<SaveStage>("RECONCILING");
  const [error, setError] = useState<string | null>(null);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function runFetch() {
      try {
        const result = (await tursoClient.uniqueTailwindClasses(
          id
        )) as string[];

        setWhitelist(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching datum payload:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoaded(true);
      }
    }
    runFetch();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const runSaveProcess = async () => {
        try {
          const data = await reconcileChanges();
          const hasFiles = !isContext
            ? data?.storyFragment?.data?.panesPayload
            : [data?.contextPane?.data?.panePayload];
          const files = hasFiles
            ?.map(p => {
              if (p?.files.length) {
                return p.files
                  .map(f => {
                    if (f.src.startsWith(`data:image`))
                      return {
                        filename: f.filename,
                        src: f.src,
                        paneId: f.paneId,
                        markdown: f.markdown,
                      };
                    return null;
                  })
                  .filter(n => n);
              }
              return null;
            })
            .filter(n => n)
            .flat() as FileDatum[];
          setStage("UPDATING_STYLES");
          await updateCustomStyles();
          if (files) {
            setStage("UPLOADING_IMAGES");
            await uploadFiles(files);
          }
          setStage("PUBLISHING");
          await publishChanges(data);
          setStage("RESTORE_POINT");
          await restorePoint();
          setStage("COMPLETED");
          resetUnsavedChanges(id, isContext);
        } catch (err) {
          setStage("ERROR");
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        }
      };

      runSaveProcess();
    }
  }, [isLoaded, id, isContext]);

  const reconcileChanges = async (): Promise<ReconciledData> => {
    try {
      const data = reconcileData(id, isContext, originalData);
      return data;
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during data reconciliation"
      );
      throw err;
    }
  };

  const restorePoint = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/concierge/storykeep/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: `restorePoint`,
        }),
      });
      const data = await response.json();
      if (data.success) return true;
      return false;
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while publishing tailwind whitelist"
      );
      throw err;
    }
  };

  const uploadFiles = async (files: FileDatum[]): Promise<boolean> => {
    try {
      const response = await fetch(`/api/concierge/storykeep/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files,
        }),
      });
      const data = await response.json();
      if (data.success) {
        updateFiles(files);
        return true;
      }
      return false;
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while publishing tailwind whitelist"
      );
      throw err;
    }
  };

  const updateCustomStyles = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/concierge/storykeep/tailwind`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whitelist,
        }),
      });
      const data = await response.json();
      if (data.success) return true;
      return false;
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while publishing tailwind whitelist"
      );
      throw err;
    }
  };

  const publishChanges = async (data: ReconciledData) => {
    const queries = isContext
      ? data.contextPane?.queries
      : data.storyFragment?.queries;
    if (!queries) {
      return;
    }
    try {
      for (const [, tableQueries] of Object.entries(queries)) {
        const thisQueries = Array.isArray(tableQueries)
          ? tableQueries
          : [tableQueries];
        for (const query of thisQueries) {
          if (query.sql) {
            console.log("Executing query:", query);
            // Uncomment the following lines when ready to actually execute queries
            // await fetch("/api/turso/execute", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(query),
            // });
          }
        }
      }
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while publishing changes"
      );
      throw err;
    }
  };

  const getStageDescription = (currentStage: SaveStage) => {
    switch (currentStage) {
      case "RECONCILING":
        return "Reconciling data changes...";
      case "UPDATING_STYLES":
        return "Updating custom styles...";
      case "UPLOADING_IMAGES":
        return "Uploading images...";
      case "PUBLISHING":
        return "Publishing changes...";
      case "RESTORE_POINT":
        return "Creating new restore point...";
      case "COMPLETED":
        return "Save completed successfully!";
      case "ERROR":
        return `Error: ${error}`;
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Saving Changes</h2>
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={classNames(
                "h-full rounded-full",
                stage === "COMPLETED" ? "bg-green-500" : "bg-blue-500",
                stage === "ERROR" ? "bg-red-500" : "",
                stage === "RECONCILING"
                  ? "w-1/6"
                  : stage === "UPDATING_STYLES"
                    ? "w-2/6"
                    : stage === "UPLOADING_IMAGES"
                      ? "w-3/6"
                      : stage === "RESTORE_POINT"
                        ? "w-4/6"
                        : stage === "PUBLISHING"
                          ? "w-5/6"
                          : "w-full"
              )}
            ></div>
          </div>
        </div>
        <p className="text-lg mb-4">{getStageDescription(stage)}</p>
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

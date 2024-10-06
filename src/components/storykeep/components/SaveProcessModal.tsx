import { useState, useEffect } from "react";
import { classNames } from "../../../utils/helpers";
import {
  reconcileData,
  resetUnsavedChanges,
} from "../../../utils/compositor/reconcileData";
import type {
  ReconciledData,
  StoryFragmentDatum,
  ContextPaneDatum,
} from "../../../types";

type SaveStage =
  | "RECONCILING"
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

export const SaveProcessModal = ({
  id,
  isContext,
  originalData,
  onClose,
}: SaveProcessModalProps) => {
  const [stage, setStage] = useState<SaveStage>("RECONCILING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runSaveProcess = async () => {
      try {
        const data = await reconcileChanges();
        setStage("UPDATING_STYLES");
        await updateCustomStyles();
        setStage("UPLOADING_IMAGES");
        await uploadFiles();
        setStage("PUBLISHING");
        await publishChanges(data);
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
  }, [id, isContext]);

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

  const uploadFiles = async () => {
    // TODO: Implement file upload logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
  };

  const updateCustomStyles = async () => {
    // TODO: Implement custom styles update logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
  };

  const publishChanges = async (data: ReconciledData) => {
    console.log("Publishing changes with data:", data);

    const queries = isContext
      ? data.contextPane?.queries
      : data.storyFragment?.queries;

    if (!queries) {
      console.log("No queries to publish");
      return;
    }

    try {
      for (const [, tableQueries] of Object.entries(queries)) {
        const thisQueries = Array.isArray(tableQueries)
          ? tableQueries
          : [tableQueries];
        for (const query of thisQueries) {
          if (query.sql) {
            // Only execute queries that have SQL statements
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
                  ? "w-1/4"
                  : stage === "UPDATING_STYLES"
                    ? "w-1/2"
                    : stage === "UPLOADING_IMAGES"
                      ? "w-3/4"
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

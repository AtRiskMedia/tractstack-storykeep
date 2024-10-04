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
  const [reconciledData, setReconciledData] = useState<ReconciledData | null>(
    null
  );
  const [stage, setStage] = useState<SaveStage>("RECONCILING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runSaveProcess = async () => {
      try {
        await reconcileChanges();
        setStage("UPDATING_STYLES");
        await updateCustomStyles();
        setStage("PUBLISHING");
        await publishChanges();
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

  const reconcileChanges = async () => {
    try {
      console.log(`ori`,originalData)
      const data = reconcileData(id, isContext, originalData);
      console.log(`now`,data)
      setReconciledData(data);
      setStage("UPDATING_STYLES");
    } catch (err) {
      setStage("ERROR");
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during data reconciliation"
      );
    }
  };

  const updateCustomStyles = async () => {
    // TODO: Implement custom styles update logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
  };

  const publishChanges = async () => {
    // TODO: Implement publishing to Turso
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
  };

  const getStageDescription = (currentStage: SaveStage) => {
    switch (currentStage) {
      case "RECONCILING":
        return "Reconciling data changes...";
      case "UPDATING_STYLES":
        return "Updating custom styles...";
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
                  ? "w-1/3"
                  : stage === "UPDATING_STYLES"
                    ? "w-2/3"
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

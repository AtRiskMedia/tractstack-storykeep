import { useState, useEffect, useCallback } from "react";
import { navigate } from "astro:transitions/client";

const RebuildProgressModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [progress, setProgress] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSite = useCallback(async () => {
    try {
      const response = await fetch(import.meta.env.PUBLIC_SITE_URL);
      return response.ok;
    } catch (err) {
      return false;
    }
  }, []);

  const triggerRebuild = useCallback(async () => {
    try {
      const response = await fetch("/api/concierge/storykeep/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target: "site" }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to trigger rebuild");
      }
    } catch (err) {
      setError("Failed to trigger rebuild. Please try again.");
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let intervalId: number;
    let attemptCount = 0;
    const maxAttempts = 45; // 90 seconds total with 2-second intervals

    const runRebuild = async () => {
      const rebuildStarted = await triggerRebuild();
      if (!rebuildStarted) return;

      intervalId = window.setInterval(async () => {
        attemptCount++;

        // Cycle progress between 8 and 10 segments
        setProgress(prev => (prev >= 10 ? 8 : prev + 1));

        const isUp = await checkSite();

        if (isUp) {
          setProgress(12);
          setIsComplete(true);
          clearInterval(intervalId);
          setTimeout(() => {
            navigate("/storykeep");
          }, 1000);
        } else if (attemptCount >= maxAttempts) {
          setError("Rebuild timed out. Please check your site manually.");
          clearInterval(intervalId);
        }
      }, 2000);
    };

    runRebuild();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, checkSite, triggerRebuild]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg font-bold leading-6 text-mydarkgrey">
                {error
                  ? "Rebuild Error"
                  : isComplete
                    ? "Rebuild Complete!"
                    : "Rebuilding Site..."}
              </h3>

              {!error && (
                <div className="mt-4">
                  <div className="h-2 w-full bg-mylightgrey/20 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-mygreen" : "bg-myorange"}`}
                      style={{ width: `${(progress / 12) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-mydarkgrey">
                  {error
                    ? error
                    : isComplete
                      ? "Redirecting to dashboard..."
                      : "This may take up to 90 seconds..."}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-myorange px-3 py-2 text-sm font-bold text-black hover:bg-black hover:text-white"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RebuildProgressModal;

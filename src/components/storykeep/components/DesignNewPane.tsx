import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Combobox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import PreviewPane from "./PreviewPane";
import { paneDesigns } from "../../../assets/paneDesigns";
import { editModeStore, themeStore } from "../../../store/storykeep";
import { handleToggleOn } from "../../../utils/storykeep";
import { tursoClient } from "../../../api/tursoClient";
import { PUBLIC_THEME } from "../../../constants";
import ThemeSelector from "./ThemeSelector";
import type { Theme, PaneDesign, ViewportAuto } from "../../../types";

const DesignNewPane = ({
  id,
  index,
  cancelInsert,
  doInsert,
  tailwindBgColour,
  viewportKey,
  paneIds,
  slug,
  isContext,
}: {
  id: string;
  index: number;
  cancelInsert: () => void;
  doInsert: (newPaneIds: string[], newPaneId: string) => void;
  tailwindBgColour: string;
  viewportKey: ViewportAuto;
  paneIds: string[];
  slug: string;
  isContext: boolean;
}) => {
  const [mode, setMode] = useState<`design` | `reuse` | `break`>(`design`);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const $theme = useStore(themeStore);
  const [activePaneDesigns, setActivePaneDesigns] = useState(
    paneDesigns($theme ?? PUBLIC_THEME).filter(
      (p: PaneDesign) => p.type === `starter`
    )
  );
  const [reusePaneDesigns, setReuseActivePaneDesigns] = useState<PaneDesign[]>(
    []
  );
  const [selectedDesign, setSelectedDesign] = useState<PaneDesign>(
    activePaneDesigns[0]
  );
  const [, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredDesigns =
    query === ""
      ? activePaneDesigns
      : activePaneDesigns.filter(design =>
          design.name.toLowerCase().includes(query.toLowerCase())
        );

  const cycleDesign = (direction: "next" | "prev") => {
    setCurrentIndex(prevIndex => {
      const newIndex =
        direction === "next"
          ? (prevIndex + 1) % activePaneDesigns.length
          : (prevIndex - 1 + activePaneDesigns.length) %
            activePaneDesigns.length;
      setSelectedDesign(activePaneDesigns[newIndex]);
      return newIndex;
    });
  };

  const handleInsert = () => {
    setSaving(true);
    editModeStore.set({
      id,
      mode: "insert",
      type: "pane",
      payload: {
        storyFragment: id,
        index,
        selectedDesign,
        cancelInsert,
        doInsert,
      },
    });
    handleToggleOn(`insert`, `pane-insert`);
  };

  const changeMode = (newMode: `design` | `reuse` | `break`) => {
    setMode(newMode);
    if (newMode === `design`) {
      setActivePaneDesigns(
        paneDesigns($theme).filter((p: PaneDesign) => p.type === `starter`)
      );
      setSelectedDesign(
        paneDesigns($theme).filter((p: PaneDesign) => p.type === `starter`)[0]
      );
    } else if (newMode === `break`) {
      setActivePaneDesigns(
        paneDesigns($theme).filter((p: PaneDesign) => p.type === `break`)
      );
      setSelectedDesign(
        paneDesigns($theme).filter((p: PaneDesign) => p.type === `break`)[0]
      );
    } else {
      setActivePaneDesigns(reusePaneDesigns);
      setSelectedDesign(reusePaneDesigns[0]);
    }
    setCurrentIndex(0);
    setQuery(``);
  };

  useEffect(() => {
    if (mode === "design" || mode === "break") {
      const newDesigns = paneDesigns($theme).filter((p: PaneDesign) =>
        mode === "design" ? p.type === "starter" : p.type === "break"
      );
      setActivePaneDesigns(newDesigns);
      if (selectedDesign) {
        const updatedDesign = newDesigns.find(d => d.id === selectedDesign.id);
        setSelectedDesign(updatedDesign || newDesigns[0]);
      } else if (newDesigns.length > 0) {
        setSelectedDesign(newDesigns[0]);
      }
    }
  }, [$theme, mode]);

  useEffect(() => {
    async function runFetch() {
      try {
        setIsLoading(true);
        const result = (await tursoClient.paneDesigns()) as PaneDesign[];
        // prevent use of duplicate panes on one storyFragment
        setReuseActivePaneDesigns(
          result.filter((p: PaneDesign) => !paneIds.includes(p.id))
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching datum payload:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    }
    runFetch();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleThemeChange = (newTheme: Theme) => {
    themeStore.set(newTheme);
  };

  return (
    <div id="pane-insert" className="pt-6 bg-mywhite shadow-inner rounded-lg">
      <div className="px-6 flex justify-center space-x-4">
        <div className="flex-grow max-w-sm">
          <Combobox
            as="div"
            value={selectedDesign}
            onChange={design => {
              setSelectedDesign(design);
              setCurrentIndex(
                design
                  ? activePaneDesigns.findIndex(d => d.id === design.id)
                  : 0
              );
            }}
          >
            {mode === `design` ? (
              <div className="flex flex-nowrap gap-x-3 text-md mb-1">
                <Combobox.Label className="block text-mydarkgrey">
                  Starter designs
                </Combobox.Label>
                <span className="text-mydarkgrey/85">
                  <button
                    onClick={() => changeMode(`break`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Transition shapes
                  </button>
                  <button
                    onClick={() => changeMode(`reuse`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Re-use existing pane
                  </button>
                </span>
              </div>
            ) : mode === `break` ? (
              <div className="flex flex-nowrap gap-x-3 text-md mb-1">
                <Combobox.Label className="block text-mydarkgrey">
                  Transition shapes
                </Combobox.Label>
                <span className="text-mydarkgrey/85">
                  <button
                    onClick={() => changeMode(`design`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Starter designs
                  </button>
                  <button
                    onClick={() => changeMode(`reuse`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Re-use existing pane
                  </button>
                </span>
              </div>
            ) : (
              <div className="flex flex-nowrap gap-x-3 text-md mb-1">
                <Combobox.Label className="block text-mydarkgrey">
                  Re-use existing pane
                </Combobox.Label>
                <span className="text-mydarkgrey/85">
                  <button
                    onClick={() => changeMode(`break`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Transition shapes
                  </button>
                  <button
                    onClick={() => changeMode(`design`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Starter designs
                  </button>
                </span>
              </div>
            )}
            <div className="relative">
              <Combobox.Input
                className="w-full rounded-lg border-0 bg-white py-1.5 pl-3 pr-10 text-mydarkgrey shadow-sm ring-1 ring-inset ring-mylightgrey focus:ring-2 focus:ring-inset focus:ring-myorange text-lg xs:text-md xs:leading-6"
                onChange={event => setQuery(event.target.value)}
                displayValue={(design: PaneDesign | null) => design?.name ?? ""}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-2 focus:outline-none">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-myblue"
                  aria-hidden="true"
                />
              </Combobox.Button>
              {filteredDesigns.length > 0 && (
                <Combobox.Options className="z-[999] absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xs:text-sm">
                  {filteredDesigns.map(design => (
                    <Combobox.Option
                      key={design.id}
                      value={design}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-8 pr-4 ${
                          active ? "bg-myorange text-white" : "text-mydarkgrey"
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-bold" : "font-normal"}`}
                          >
                            {design.name}
                          </span>
                          {selected && (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-1.5 ${
                                active ? "text-white" : "text-myorange"
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </div>
          </Combobox>
        </div>
        <div className="flex items-stretch h-[50px] space-x-2">
          <button
            className="bg-myorange text-white rounded-lg p-2 py-1 hover:bg-myblack transition-colors h-full flex flex-col justify-center"
            onClick={() => cycleDesign("prev")}
            disabled={saving}
            title="Previous design"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-myorange text-white rounded-lg p-2 py-1 hover:bg-myblack transition-colors h-full flex flex-col justify-center"
            onClick={() => cycleDesign("next")}
            disabled={saving}
            title="Next design"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-myorange/20 text-black rounded-lg p-2 py-1 hover:bg-myblack hover:text-white transition-colors h-full flex flex-col justify-center"
            onClick={() => cancelInsert()}
            disabled={saving}
            aria-label="Cancel"
            title="Cancel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <ThemeSelector value={$theme} onChange={handleThemeChange} />
          {selectedDesign ? (
            <button
              className="font-bold bg-myblue text-white rounded-lg p-2 py-1 hover:bg-myorange transition-colors h-full flex flex-col justify-center"
              onClick={() => handleInsert()}
              disabled={saving}
              aria-label="Use this Design"
              title="Use this Design"
            >
              ADD TO PAGE
            </button>
          ) : null}
        </div>
      </div>
      {selectedDesign && (
        <div
          className="outline-2 outline-dashed outline-myblue/10 outline-offset-[-2px]
          mt-4 bg-myblue/20 py-4"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)",
          }}
        >
          <div className={`${tailwindBgColour}`}>
            <PreviewPane
              slug={slug}
              isContext={isContext}
              design={selectedDesign}
              viewportKey={viewportKey}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignNewPane;

import { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import PreviewPane from "./PreviewPane";
import { paneDesigns } from "../../../assets/paneDesigns";
import { editModeStore } from "../../../store/storykeep";
import { handleToggleOn } from "../../../utils/storykeep";
import { tursoClient } from "../../../api/tursoClient";
import type { PaneDesign, ViewportAuto } from "../../../types";

const DesignNewPane = ({
  id,
  index,
  cancelInsert,
  doInsert,
  tailwindBgColour,
  viewportKey,
  paneIds,
}: {
  id: string;
  index: number;
  cancelInsert: () => void;
  doInsert: (newPaneIds: string[]) => void;
  tailwindBgColour: string;
  viewportKey: ViewportAuto;
  paneIds: string[];
}) => {
  const [mode, setMode] = useState<`design` | `reuse`>(`design`);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [activePaneDesigns, setActivePaneDesigns] = useState(paneDesigns);
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

  const changeMode = (newMode: `design` | `reuse`) => {
    setMode(newMode);
    if (newMode === `design`) {
      setActivePaneDesigns(paneDesigns);
      setSelectedDesign(paneDesigns[0]);
    } else {
      setActivePaneDesigns(reusePaneDesigns);
      setSelectedDesign(reusePaneDesigns[0]);
    }
    setCurrentIndex(0);
    setQuery(``);
  };

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

  return (
    <div id="pane-insert" className="py-6 bg-mywhite shadow-inner">
      <div className="px-6 flex justify-center space-x-4 mb-4">
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
                  Choose design starter
                </Combobox.Label>
                <span className="text-mydarkgrey/85">
                  ( or,{` `}
                  <button
                    onClick={() => changeMode(`reuse`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Re-use existing pane
                  </button>
                  )
                </span>
              </div>
            ) : (
              <div className="flex flex-nowrap gap-x-3 text-md mb-1">
                <Combobox.Label className="block text-mydarkgrey">
                  Re-use existing pane
                </Combobox.Label>
                <span className="text-mydarkgrey/85">
                  ( or,{` `}
                  <button
                    onClick={() => changeMode(`design`)}
                    className="text-black underline hover:underline-offset-2 hover:text-myorange"
                  >
                    Choose design starter
                  </button>
                  )
                </span>
              </div>
            )}
            <div className="relative">
              <Combobox.Input
                className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-mydarkgrey shadow-sm ring-1 ring-inset ring-mylightgrey focus:ring-2 focus:ring-inset focus:ring-myorange text-lg sm:text-md sm:leading-6"
                onChange={event => setQuery(event.target.value)}
                displayValue={(design: PaneDesign | null) => design?.name ?? ""}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-myblue"
                  aria-hidden="true"
                />
              </Combobox.Button>
              {filteredDesigns.length > 0 && (
                <Combobox.Options className="z-[999] absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                            className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
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
            className="bg-mylightgrey disabled:hover:bg-mylightgrey text-black rounded-lg p-2 py-1 hover:bg-myorange/20 transition-colors h-full flex flex-col justify-center"
            onClick={() => cycleDesign("prev")}
            disabled={saving}
            title="Previous design"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-mylightgrey disabled:hover:bg-mylightgrey text-black rounded-lg p-2 py-1 hover:bg-myorange/20 transition-colors h-full flex flex-col justify-center"
            onClick={() => cycleDesign("next")}
            disabled={saving}
            title="Next design"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-myblue disabled:hover:bg-myblue disabled:hover:text-white text-white rounded-lg p-2 py-1 hover:bg-myorange/20 hover:text-black transition-colors h-full flex flex-col justify-center"
            onClick={() => cancelInsert()}
            disabled={saving}
            aria-label="Cancel"
            title="Cancel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          {selectedDesign ? (
            <button
              className="bg-myorange disabled:hover:bg-myorange text-white rounded-lg p-2 py-1 hover:bg-black transition-colors h-full flex flex-col justify-center"
              onClick={() => handleInsert()}
              disabled={saving}
              aria-label="Use this Design"
              title="Use this Design"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
      {selectedDesign && (
        <div
          className="outline-2 outline-dashed outline-myblue/10 outline-offset-[-2px]
          my-4 bg-myblue/20 py-4 rounded-lg"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)",
          }}
        >
          <div className={`${tailwindBgColour}`}>
            <PreviewPane design={selectedDesign} viewportKey={viewportKey} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignNewPane;

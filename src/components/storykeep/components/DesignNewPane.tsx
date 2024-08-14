import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { paneDesigns } from "../../../assets/paneDesigns";
import type { PaneDesign, ViewportAuto } from "../../../types";

const DesignNewPane = (props: { id: string; index: number }) => {
  const { id, index } = props;
  const [query, setQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<PaneDesign | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredDesigns =
    query === ""
      ? paneDesigns
      : paneDesigns.filter(design => {
          return design.name.toLowerCase().includes(query.toLowerCase());
        });
  const cycleDesign = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentIndex(prevIndex => (prevIndex + 1) % paneDesigns.length);
    } else {
      setCurrentIndex(
        prevIndex => (prevIndex - 1 + paneDesigns.length) % paneDesigns.length
      );
    }
    setSelectedDesign(paneDesigns[currentIndex]);
  };

  return (
    <div>
      <div className="mb-4">
        Insert new pane pos:{index}, story fragment: {id}
      </div>
      <div>
        <button
          className="bg-myblue rounded-lg px-1.5 py-0.5 text-white"
          onClick={() => cycleDesign("prev")}
        >
          {"<"}
        </button>
        <span>Select a design</span>
        <button
          className="bg-myblue rounded-lg px-1.5 py-0.5 text-white"
          onClick={() => cycleDesign("next")}
        >
          {">"}
        </button>
      </div>
      <div className="max-w-xs w-full mb-4">
        <Combobox
          as="div"
          value={selectedDesign}
          onChange={design => {
            setSelectedDesign(design);
            setCurrentIndex(
              design ? paneDesigns.findIndex(d => d.id === design.id) : 0
            );
          }}
        >
          <Combobox.Label className="block text-sm font-medium leading-6 text-mydarkgrey">
            Select Design
          </Combobox.Label>
          <div className="relative mt-2">
            <Combobox.Input
              className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-mydarkgrey shadow-sm ring-1 ring-inset ring-mylightgrey focus:ring-2 focus:ring-inset focus:ring-myorange sm:text-sm sm:leading-6"
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
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredDesigns.map(design => (
                  <Combobox.Option
                    key={design.id}
                    value={design}
                    className={({ active }) =>
                      `group relative cursor-default select-none py-2 pl-8 pr-4 ${
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
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
      {selectedDesign && (
        <div className="mt-4 bg-red-200">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <div>
            {JSON.stringify({
              id: selectedDesign.id,
              toolMode: "text",
              toolAddMode: "p",
              viewportKey: "desktop" as ViewportAuto,
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignNewPane;

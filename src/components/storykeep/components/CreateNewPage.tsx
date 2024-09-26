import { useState } from "react";
import { Combobox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import PreviewPage from "./PreviewPage";
import type { PageDesign } from "../../../types";

interface CreateNewPageProps {
  mode: `storyfragment` | `context`;
  pageDesigns: Record<string, PageDesign>;
}

const CreateNewPage = ({
  mode,
  pageDesigns,
}: CreateNewPageProps) => {
  const [selectedDesign, setSelectedDesign] = useState<PageDesign | null>(null);
  const [query, setQuery] = useState("");
  const [, setCurrentIndex] = useState(0);

  const pageDesignList = Object.values(pageDesigns);

  const filteredDesigns =
    query === ""
      ? pageDesignList.filter(
          design =>
            (mode === `context` && design.isContext === true) ||
            mode !== `context`
        )
      : pageDesignList.filter(
          design =>
            ((mode === `context` && design.isContext === true) ||
              mode !== `context`) &&
            design.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSave = () => {
    if (selectedDesign) {
      // Implement save logic here
      console.log("Saving new page:", { mode, selectedDesign });
    }
  };

  const cycleDesign = (direction: "next" | "prev") => {
    setCurrentIndex(prevIndex => {
      const newIndex =
        direction === "next"
          ? (prevIndex + 1) % filteredDesigns.length
          : (prevIndex - 1 + filteredDesigns.length) % filteredDesigns.length;
      setSelectedDesign(filteredDesigns[newIndex]);
      return newIndex;
    });
  };

  const handleCancel = () => {
    // Implement cancel logic here
    console.log("Cancelling new page creation");
    // You might want to reset the form or navigate away
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <Combobox value={selectedDesign} onChange={setSelectedDesign}>
            <Combobox.Label className="block text-sm text-mydarkgrey">
              Page Design Starter (you'll get to customize from here...)
            </Combobox.Label>
            <div className="relative mt-1">
              <Combobox.Input
                className="w-full rounded-md border border-mylightgrey bg-white py-2 pl-3 pr-10 shadow-sm focus:border-mydarkgrey focus:outline-none focus:ring-1 focus:ring-myblue"
                onChange={event => setQuery(event.target.value)}
                displayValue={(design: PageDesign) => design?.name}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>

              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredDesigns.map(design => (
                  <Combobox.Option
                    key={design.name}
                    value={design}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-600 text-white" : "text-black"
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                        >
                          {design.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-blue-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        <div className="flex items-stretch h-[50px] space-x-2">
          <button
            className="bg-mylightgrey text-black rounded-lg p-2 py-1 hover:bg-myorange/20 transition-colors h-full flex flex-col justify-center"
            onClick={() => cycleDesign("prev")}
            title="Previous design"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-mylightgrey text-black rounded-lg p-2 py-1 hover:bg-myorange/20 transition-colors h-full flex flex-col justify-center"
            onClick={() => cycleDesign("next")}
            title="Next design"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-myblue text-white rounded-lg p-2 py-1 hover:bg-myorange/20 hover:text-black transition-colors h-full flex flex-col justify-center"
            onClick={handleCancel}
            aria-label="Cancel"
            title="Cancel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <button
            className="font-bold bg-myorange text-white rounded-lg p-2 py-1 hover:bg-black transition-colors h-full flex flex-col justify-center disabled:bg-black disabled:opacity-10 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={!selectedDesign}
            aria-label="Create Page"
            title="Create Page"
          >
            EDIT THIS PAGE
          </button>
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
          <div className={selectedDesign.tailwindBgColour ?? `bg-white`}>
            <PreviewPage
              design={selectedDesign}
              viewportKey="desktop"
              slug="create"
              isContext={mode === "context"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNewPage;

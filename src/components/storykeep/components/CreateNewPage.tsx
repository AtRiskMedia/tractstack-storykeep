import { useState } from "react";
import { navigate } from "astro:transitions/client";
import { Combobox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PreviewPage from "./PreviewPage";
import { creationStateStore } from "../../../store/storykeep";
import { initializeStores } from "../../../utils/compositor/initStore";
import type { PageDesign } from "../../../types";

interface CreateNewPageProps {
  mode: "storyfragment" | "context";
  pageDesigns: Record<string, PageDesign>;
  newId: string;
}

const CreateNewPage = ({ newId, mode, pageDesigns }: CreateNewPageProps) => {
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

  const handleEditThis = () => {
    if (selectedDesign) {
      const success = initializeStores(newId, selectedDesign, mode);
      if (success) {
        creationStateStore.set({ id: newId, isInitialized: true });
        if (mode === "context") {
          navigate(`/context/create/edit`);
        } else {
          navigate(`/create/edit`);
        }
      }
    }
  };

  return (
    <div className="w-full h-screen overflow-y bg-myoffwhite px-2">
      <div className="rounded-bl-xl rounded-br-xl px-3.5 py-6 shadow-inner bg-white">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <Combobox value={selectedDesign} onChange={setSelectedDesign}>
                <Combobox.Label className="block text-lg text-mydarkgrey">
                  Page Design Starter (you'll get to customize from here...)
                </Combobox.Label>
                <div className="relative mt-2.5">
                  <Combobox.Input
                    className="w-full rounded-md border border-mylightgrey bg-white py-2 pl-3 pr-10 shadow-sm focus:border-mydarkgrey focus:outline-none focus:ring-1 focus:ring-myblue text-2xl"
                    onChange={event => setQuery(event.target.value)}
                    displayValue={(design: PageDesign) => design?.name}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-mydarkgrey"
                      aria-hidden="true"
                    />
                  </Combobox.Button>

                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {filteredDesigns.map(design => (
                      <Combobox.Option
                        key={design.name}
                        value={design}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? "bg-myblue text-white" : "text-black"
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
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? "text-white" : "text-myblue"
                                }`}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
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
                className="bg-myorange text-white rounded-lg p-2 py-1 hover:bg-myblack transition-colors h-full flex flex-col justify-center"
                onClick={() => cycleDesign("prev")}
                title="Previous design"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                className="bg-myorange text-white rounded-lg p-2 py-1 hover:bg-myblack transition-colors h-full flex flex-col justify-center"
                onClick={() => cycleDesign("next")}
                title="Next design"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <a
                data-astro-reload
                className="bg-myorange/20 text-black rounded-lg p-2 py-1 hover:bg-myblack hover:text-white transition-colors h-full flex flex-col justify-center"
                aria-label="Cancel"
                title="Cancel"
                href="/storykeep"
              >
                <XMarkIcon className="h-5 w-5" />
              </a>
              <button
                disabled={!selectedDesign}
                aria-label="Create Page"
                title="Create Page"
                onClick={() => handleEditThis()}
                className={
                  selectedDesign
                    ? "font-bold bg-myblue text-white rounded-lg p-2 py-1 hover:bg-myorange transition-colors h-full flex flex-col justify-center"
                    : "font-bold text-white rounded-lg p-2 py-1 transition-colors h-full flex flex-col justify-center bg-black opacity-10 cursor-not-allowed"
                }
              >
                EDIT THIS PAGE
              </button>
            </div>
          </div>
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

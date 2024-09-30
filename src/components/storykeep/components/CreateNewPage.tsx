import { useState, useEffect } from "react";
import { navigate } from "astro:transitions/client";
import { useStore } from "@nanostores/react";
import { Combobox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PreviewPage from "./PreviewPage";
import { creationStateStore, themeStore } from "../../../store/storykeep";
import { initializeStores } from "../../../utils/compositor/initStore";
import { pageDesigns } from "../../../assets/paneDesigns";
import ThemeSelector from "./ThemeSelector";
import type { ViewportAuto, PageDesign, Theme } from "../../../types";

interface CreateNewPageProps {
  mode: "storyfragment" | "context";
  newId: string;
}

const CreateNewPage = ({ newId, mode }: CreateNewPageProps) => {
  const [selectedDesign, setSelectedDesign] = useState<PageDesign | null>(null);
  const [query, setQuery] = useState("");
  const [, setCurrentIndex] = useState(0);
  const $theme = useStore(themeStore);
  const [pageDesignList, setPageDesignList] = useState<PageDesign[]>([]);
  const [viewportKey, setViewportKey] = useState<ViewportAuto>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 800) {
        setViewportKey("mobile");
      } else if (width >= 1368) {
        setViewportKey("desktop");
      } else {
        setViewportKey("tablet");
      }
    };
    handleResize();
    window.addEventListener("create-resize", handleResize);
    return () => window.removeEventListener("create-resize", handleResize);
  }, []);

  useEffect(() => {
    const designs = Object.values(pageDesigns($theme));
    setPageDesignList(designs);
    if (designs.length > 0) {
      setSelectedDesign(designs[0]);
    }
  }, [$theme, pageDesigns]);

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

  const handleThemeChange = (newTheme: Theme) => {
    themeStore.set(newTheme);
  };

  return (
    <div className="w-full h-screen overflow-y bg-myoffwhite">
      <div className="rounded-bl-lg rounded-br-lg px-3.5 py-6 shadow-inner bg-white mx-2">
        <div className="space-y-6">
          <div className="flex flex-col space-y-4 max-w-screen-md">
            <Combobox value={selectedDesign} onChange={setSelectedDesign}>
              <Combobox.Label className="block text-lg text-mydarkgrey mb-2">
                Page Design Starter (you'll get to customize from here...)
              </Combobox.Label>
              <div className="relative">
                <Combobox.Input
                  className="w-full rounded-lg border border-mylightgrey bg-white py-2 pl-3 pr-10 shadow-sm focus:border-mydarkgrey focus:outline-none focus:ring-1 focus:ring-myblue text-xl"
                  onChange={event => setQuery(event.target.value)}
                  displayValue={(design: PageDesign) => design?.name}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-mydarkgrey"
                    aria-hidden="true"
                  />
                </Combobox.Button>

                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <ThemeSelector value={$theme} onChange={handleThemeChange} />
                <button
                  className="bg-myorange text-white rounded-lg p-2 hover:bg-myblack transition-colors flex items-center justify-center"
                  onClick={() => cycleDesign("prev")}
                  title="Previous design"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="bg-myorange text-white rounded-lg p-2 hover:bg-myblack transition-colors flex items-center justify-center"
                  onClick={() => cycleDesign("next")}
                  title="Next design"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                <a
                  data-astro-reload
                  className="bg-myorange/20 text-black rounded-lg p-2 hover:bg-myblack hover:text-white transition-colors flex items-center justify-center"
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
                  className={`font-bold ${
                    selectedDesign
                      ? "bg-myblue hover:bg-myorange"
                      : "bg-black opacity-10 cursor-not-allowed"
                  } text-white rounded-lg p-2`}
                >
                  MAKE THIS PAGE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDesign && (
        <div
          className="outline-2 outline-dashed outline-myblue/10 outline-offset-[-2px]
          my-4 bg-myblue/20 py-4"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)",
          }}
        >
          <div
            className={
              selectedDesign.tailwindBgColour
                ? `bg-${selectedDesign.tailwindBgColour}`
                : `bg-white`
            }
          >
            <PreviewPage
              design={selectedDesign}
              viewportKey={viewportKey}
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

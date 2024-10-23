import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@headlessui/react";
import { viewportKeyStore, themeStore } from "../../../store/storykeep";
import { classNames, debounce } from "../../../utils/helpers";
import ThemeSelector from "./ThemeSelector";
import type { ViewportKey, Theme } from "../../../types";

interface CreateNewPageProps {
  mode: "storyfragment" | "context";
  newId: string;
  tractStackId: string;
}

const pageTypes = [
  { id: 1, name: "Home Page" },
  { id: 2, name: "Long-form content" },
  { id: 3, name: "Short context page" },
];

const designPlaceholders = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: `Design ${i + 1}`,
  imageSrc: "/static.jpg",
}));

const CreateNewPage = ({ newId, tractStackId, mode }: CreateNewPageProps) => {
  const $viewportKey = useStore(viewportKeyStore);
  const $theme = useStore(themeStore);
  const viewportKey = $viewportKey.value;

  const [missionInput, setMissionInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [selectedPageType, setSelectedPageType] = useState(pageTypes[0]);
  const [query, setQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState(designPlaceholders[0]);

  const filteredPageTypes =
    query === ""
      ? pageTypes
      : pageTypes.filter(type =>
          type.name.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    const handleResize = () => {
      const scrollBarOffset =
        window.innerWidth - document.documentElement.clientWidth;
      const previewWidth = window.innerWidth;
      const adjustedWidth =
        previewWidth +
        scrollBarOffset *
          (window.innerWidth > previewWidth + scrollBarOffset ? 0 : 1);
      let newViewportKey: ViewportKey;
      if (adjustedWidth <= 800) {
        newViewportKey = `mobile`;
      } else if (adjustedWidth <= 1367) {
        newViewportKey = `tablet`;
      } else {
        newViewportKey = `desktop`;
      }
      viewportKeyStore.set({ value: newViewportKey });
    };
    const debouncedHandleResize = debounce(handleResize, 250);
    handleResize();
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    themeStore.set(newTheme);
  };

  return (
    <div
      className="outline-2 outline-dashed outline-myblue/10 outline-offset-[-2px]
          my-4 bg-myblue/20 py-4"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)",
      }}
    >
      <div className="rounded-lg px-3.5 py-6 shadow-inner bg-white mx-4 max-w-screen-md">
        <div className="flex flex-col space-y-12">
          <div className="relative">
            <h2 className="inline-block font-action text-myblue text-2xl md:text-3xl">
              Create a New Web Page
            </h2>
            <a
              href="/storykeep"
              className={classNames(
                "absolute right-0 top-1/2 transform -translate-y-1/2",
                "bg-black hover:bg-myorange text-white rounded-full p-2 shadow-lg",
                "transition-all duration-300 ease-in-out"
              )}
              title="Cancel"
            >
              <XMarkIcon className="w-6 h-6" />
            </a>
          </div>

          <div>
            <label
              htmlFor="page-type-input"
              className="block text-xl md:text-2xl text-mydarkgrey mb-2"
            >
              What kind of web page will this be?
            </label>
            <Combobox value={selectedPageType} onChange={setSelectedPageType}>
              <div className="relative mt-1 max-w-sm">
                <Combobox.Input
                  id="page-type-input"
                  className="w-full text-xl p-2 border border-mylightgrey rounded-md shadow-sm focus:ring-myblue focus:border-myblue"
                  onChange={event => setQuery(event.target.value)}
                  displayValue={(type: (typeof pageTypes)[0]) => type.name}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-mydarkgrey"
                    aria-hidden="true"
                  />
                </Combobox.Button>
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredPageTypes.map(type => (
                    <Combobox.Option
                      key={type.id}
                      value={type}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-myorange text-white" : "text-black"
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {type.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-myorange"
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

          <div>
            <fieldset>
              <div className="flex justify-between items-center mb-4">
                <legend className="block text-xl md:text-2xl text-mydarkgrey">
                  Select a design
                </legend>
                <ThemeSelector value={$theme} onChange={handleThemeChange} />
              </div>
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                role="radiogroup"
              >
                {designPlaceholders.map(design => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={classNames(
                      "relative aspect-[9/16] rounded-lg overflow-hidden transition-all",
                      selectedDesign.id === design.id
                        ? "ring-4 ring-myblue ring-offset-2"
                        : "hover:ring-2 hover:ring-myorange hover:ring-offset-1"
                    )}
                    role="radio"
                    aria-checked={selectedDesign.id === design.id}
                    aria-label={`Select ${design.name}`}
                    name="design-selection"
                    type="button"
                  >
                    <img
                      src={design.imageSrc}
                      alt={`${design.name} preview`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <label
              htmlFor="mission-input"
              className="block text-xl md:text-2xl text-mydarkgrey mb-2"
            >
              Please describe your "business" or "mission" and describe your
              target audience. What will they get out of this page? What do you
              hope they get out of this visit? Rough notes only, please.
            </label>
            <textarea
              id="mission-input"
              value={missionInput}
              maxLength={2000}
              onChange={e => setMissionInput(e.target.value)}
              className="w-full text-xl h-32 p-2 border border-mylightgrey rounded-md shadow-sm focus:ring-myblue focus:border-myblue"
              placeholder="Enter your mission and audience details..."
            />
          </div>

          <div>
            <label
              htmlFor="content-input"
              className="block text-xl md:text-2xl text-mydarkgrey mb-2"
            >
              Please provide some relevant text. This could be copy pasted from
              a Word doc or PDF, or perhaps from an existing web page. Just
              what's relevant for writing this page and pay no attention
              whatsoever to formatting!! We'll spin up a draft page based on it
              for you to edit then publish.
            </label>
            <textarea
              id="content-input"
              value={contentInput}
              maxLength={10000}
              onChange={e => setContentInput(e.target.value)}
              className="w-full text-xl h-48 p-2 border border-mylightgrey rounded-md shadow-sm focus:ring-myblue focus:border-myblue"
              placeholder="Paste your relevant content here..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold text-mydarkgrey">
              Ready to make this page?
            </h3>
            <p className="text-lg md:text-xl">
              We'll send your request through a AI-powered workflow and generate
              you a draft web page for you in seconds!
            </p>
            <button
              disabled={true}
              aria-label="Create Page"
              title="Create Page"
              className="font-bold bg-myorange hover:bg-myblue text-white rounded-lg p-2"
            >
              GENERATE DRAFT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewPage;

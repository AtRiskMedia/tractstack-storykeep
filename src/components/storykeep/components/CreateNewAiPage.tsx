import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@headlessui/react";
import { themeStore } from "../../../store/storykeep";
import { classNames } from "../../../utils/helpers";
import { pageDesigns } from "../../../assets/paneDesigns";
import ThemeSelector from "./ThemeSelector";
import type { PageDesign, Theme } from "../../../types";

interface CreateNewPageProps {
  mode: "storyfragment" | "context";
  newId: string;
  tractStackId: string;
}

const pageTypes = [
  { id: 1, name: "Home Page" },
  { id: 2, name: "Long-form content" },
];
const pageTypesContext = [{ id: 3, name: "Short context page" }];

const CreateNewPage = ({ newId, tractStackId, mode }: CreateNewPageProps) => {
  const $theme = useStore(themeStore);
  console.log(`CREATE`, newId, tractStackId );

  const [missionInput, setMissionInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [selectedPageType, setSelectedPageType] = useState(
    mode !== `context` ? pageTypes[0] : pageTypesContext[0]
  );
  const [query, setQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState(``);
  const [pageDesignList, setPageDesignList] = useState<PageDesign[]>([]);

  const filteredPageTypes =
    mode !== `context`
      ? query === ""
        ? pageTypes
        : pageTypes.filter(type =>
            type.name.toLowerCase().includes(query.toLowerCase())
          )
      : query === ""
        ? pageTypesContext
        : pageTypesContext.filter(type =>
            type.name.toLowerCase().includes(query.toLowerCase())
          );
  useEffect(() => {
    const designs = Object.values(pageDesigns($theme)).filter(
      design =>
        (mode === `context` && design.isContext === true) ||
        (mode !== `context` && design.isContext === false)
    );
    setPageDesignList(designs);
    if (selectedDesign) {
      const newSelectedDesign = designs.find(d => d.name === selectedDesign);
      if (newSelectedDesign) {
        setSelectedDesign(newSelectedDesign.name);
      } else {
        setSelectedDesign(designs[0].name);
      }
    } else if (designs.length > 0) {
      setSelectedDesign(designs[0].name);
    }
  }, [$theme, pageDesigns]);

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
      <div className="rounded-lg px-3.5 py-6 shadow-inner bg-white mx-4">
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
                  displayValue={
                    mode !== `context`
                      ? (type: (typeof pageTypes)[0]) => type.name
                      : (type: (typeof pageTypesContext)[0]) => type.name
                  }
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
                  Select a design starter *you'll get to customize from here
                </legend>
              </div>
              <div className="pb-12">
                <ThemeSelector value={$theme} onChange={handleThemeChange} />
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-12"
                role="radiogroup"
              >
                {pageDesignList.map(design => (
                  <button
                    key={design.name}
                    onClick={() => setSelectedDesign(design.name)}
                    className={classNames(
                      "relative rounded-t-lg transition-all h-fit",
                      "flex flex-col items-start",
                      selectedDesign === design.name
                        ? "ring-2 ring-myorange ring-offset-2"
                        : "hover:ring-2 hover:ring-myorange hover:ring-offset-2"
                    )}
                    role="radio"
                    aria-checked={selectedDesign === design.name}
                    aria-label={`Select ${design.name}`}
                    name="design-selection"
                    type="button"
                  >
                    <div className="flex flex-col items-start w-full shadow-lg">
                      {design.paneDesigns.map((pane,i) => (
                        <img
                          key={pane.img}
                          src={`${import.meta.env.PUBLIC_IMAGE_URL}/api/images/paneDesigns/${pane.img}`}
                          alt={`${pane.img}`}
                          className={classNames("w-full h-auto object-contain",
                          i===0 ? `rounded-t-2xl` : ``,
                          )}
                        />
                      ))}
                    </div>
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

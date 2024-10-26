import { useEffect, useState, useCallback } from "react";
import { navigate } from "astro:transitions/client";
import { useStore } from "@nanostores/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@headlessui/react";
import { initializeStores } from "../../../utils/compositor/initStore";
import { themeStore, creationStateStore } from "../../../store/storykeep";
import { classNames } from "../../../utils/helpers";
import { pageDesigns } from "../../../assets/paneDesigns";
import ThemeSelector from "./ThemeSelector";
import GeneratePageModal from "./GeneratePageModal";
import type { PageDesign, Theme, GenerateStage } from "../../../types";

interface CreateNewPageProps {
  mode: "storyfragment" | "context";
  newId: string;
  tractStackId: string;
}

export type GeneratedCopy = {
  title: string;
  paragraphs: string[];
};

const pageTypes = [
  { id: 1, name: "Home Page" },
  { id: 2, name: "Long-form content" },
];
const pageTypesContext = [{ id: 3, name: "Short context page" }];

const CreateNewPage = ({ newId, tractStackId, mode }: CreateNewPageProps) => {
  const [stage, setStage] = useState<GenerateStage>("GENERATING_COPY");
  const $theme = useStore(themeStore);
  const [missionInput, setMissionInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [selectedPageType, setSelectedPageType] = useState(
    mode !== `context` ? pageTypes[0] : pageTypesContext[0]
  );
  const [query, setQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<PageDesign | null>(null);
  const [pageDesignList, setPageDesignList] = useState<PageDesign[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  //const [newMarkdown, setNewMarkdown] = useState<string[]>([]);

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
      const newSelectedDesign = designs.find(
        d => d.name === selectedDesign.name
      );
      if (newSelectedDesign) {
        setSelectedDesign(newSelectedDesign);
      } else {
        setSelectedDesign(designs[0]);
      }
    } else if (designs.length > 0) {
      setSelectedDesign(designs[0]);
    }
  }, [$theme, pageDesigns]);

  const handleThemeChange = (newTheme: Theme) => {
    themeStore.set(newTheme);
  };

  const isValid =
    missionInput.length >= 10 && contentInput.length >= 10 && selectedDesign;

  const handleGenerateCopy =
    useCallback(async (): Promise<GeneratedCopy | null> => {
      console.log(`must generate copy`);
      //const response = await fetch("/api/aai/lemurTask", {
      //  method: "POST",
      //  headers: {
      //    "Content-Type": "application/json",
      //  },
      //  body: JSON.stringify({
      //    prompt: `You are writing copy for a high traffic internet website. Write for an audience who is reading this website copy and is very interested in what it has to offer. Create a markdown summary of the given text following this structure: Start with a # Heading 1 web page title that's appropriate for SEO. Next a ## Heading 2 containing a catchy, concise title that encapsulates the main theme. Follow with a single paragraph that provides an overall short description, setting the context for the entire piece. Create 3-5 ### Heading 3 sections, each focusing on a key aspect or subtopic of the main theme. Each heading should be followed by one or two paragraphs expanding on that subtopic. Optionally, include a #### Heading 4 subsection under one or more of the ### Heading 3 sections if there's a need to dive deeper into a specific point. This should also be followed by one or two paragraphs. Ensure all content is in pure markdown format, without any HTML tags or special formatting. Adjust the number of sections and subsections based on the length and complexity of the original text: For shorter texts (under 500 words), use fewer sections. For longer texts (over 2000 words), use more sections and subsections. Keep the overall structure and flow coherent, ensuring each section logically leads to the next. Use paragraphs instead of bullet points or lists for the main content under each heading. Maintain a consistent tone and style throughout the summary, matching the original text's voice where appropriate. Aim for a comprehensive yet concise summary that captures the essence of the original text while adhering to this structured format.`,
      //    input_text: ``,
      //  }),
      //});
      //const result = await response.json();
      //console.log(result.response);
      //console.log(result.usage);
      const copy = {
        title: `title`,
        paragraphs: [`paragraph 1`, `paragraph 2`],
      };
      return copy;
    }, []);

  const handlePrepareDesign = useCallback(
    async (generatedCopy: GeneratedCopy): Promise<null | PageDesign> => {
      if (!selectedDesign) return null;
      console.log(`prepare design -- must inject newMarkdown`, generatedCopy);
      return selectedDesign;
    },
    [selectedDesign]
  );

  const handleLoadDesign = useCallback(
    async (userDesign: PageDesign): Promise<boolean> => {
      if (!userDesign) return false;
      console.log(`load design`);
      const success = initializeStores(newId, tractStackId, userDesign, mode);
      if (success) creationStateStore.set({ id: newId, isInitialized: true });
      return success;
    },
    [newId, tractStackId, mode]
  );

  const handleGenerateComplete = useCallback(() => {
    console.log(`complete.`);
    if (mode === "context") {
      navigate(`/context/create/edit`);
    } else {
      navigate(`/create/edit`);
    }
  }, [mode]);

  const runGeneration = useCallback(async () => {
    try {
      const generatedCopy = await handleGenerateCopy();
      if (!generatedCopy) {
        throw new Error("Failed to generate copy");
      }

      setStage("PREPARING_DESIGN");
      const userDesign = await handlePrepareDesign(generatedCopy);
      if (!userDesign) {
        throw new Error("Failed to prepare design");
      }

      setStage("LOADING_DESIGN");
      const success3 = await handleLoadDesign(userDesign);
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!success3) {
        throw new Error("Failed to load design");
      }

      setStage("COMPLETED");
      handleGenerateComplete();
    } catch (error) {
      console.error("Error during page generation:", error);
      setStage("ERROR");
    }
  }, [
    handleGenerateCopy,
    handlePrepareDesign,
    handleLoadDesign,
    handleGenerateComplete,
  ]);

  const handleGenerateDraft = useCallback(() => {
    console.log(`user says go`);
    if (!isValid || !selectedDesign || isGenerating) return;
    setIsGenerating(true);
    runGeneration();
  }, [isValid, selectedDesign, isGenerating, runGeneration]);

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
                    onClick={() => setSelectedDesign(design)}
                    className={classNames(
                      "relative rounded-t-lg transition-all h-fit",
                      "flex flex-col items-start",
                      selectedDesign && selectedDesign.name === design.name
                        ? "ring-2 ring-myorange ring-offset-2"
                        : "hover:ring-2 hover:ring-myorange hover:ring-offset-2"
                    )}
                    role="radio"
                    aria-checked={
                      selectedDesign && selectedDesign.name === design.name
                        ? "true"
                        : "false"
                    }
                    aria-label={`Select ${design.name}`}
                    name="design-selection"
                    type="button"
                  >
                    <div className="flex flex-col items-start w-full shadow-lg">
                      {design.paneDesigns.map((pane, i) => (
                        <img
                          key={pane.img}
                          src={`${import.meta.env.PUBLIC_IMAGE_URL}/api/images/paneDesigns/${pane.img}`}
                          alt={`${pane.img}`}
                          className={classNames(
                            "w-full h-auto object-contain",
                            i === 0 ? `rounded-t-2xl` : ``
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
              disabled={!isValid || isGenerating}
              onClick={handleGenerateDraft}
              className={`font-bold ${
                isValid
                  ? "bg-myorange hover:bg-myblue"
                  : "bg-black opacity-10 cursor-not-allowed"
              } text-white rounded-lg p-2`}
            >
              GENERATE DRAFT
            </button>

            {isGenerating && <GeneratePageModal stage={stage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewPage;

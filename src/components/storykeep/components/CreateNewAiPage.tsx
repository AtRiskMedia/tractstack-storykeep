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
import { parseMarkdownSections } from "../../../utils/compositor/markdownUtils";
import { genAiPrompt } from "../../../constants";
import { pageDesigns } from "../../../assets/paneDesigns";
import ThemeSelector from "./ThemeSelector";
import GeneratePageModal from "./GeneratePageModal";
import type {
  PaneDesign,
  PageDesign,
  Theme,
  GenerateStage,
  GeneratedCopy
} from "../../../types";

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
      const aai = `\n # The Journey of an Entrepreneur\n\n## From Selling Dragon Ball Z to Founding a Company with 100k Students\n\nFarza is an entrepreneur who has been creating things for others from a young age. He started his first business at 13, selling Dragon Ball Z video games on eBay. He eventually turned this into a larger business selling blank DVDs and t-shirts. \n\nBy 15, Farza had grown his company's revenue to $100k. After this success, he continued to build new products and companies. Most recently, he founded buildspace, which became the largest community of people learning to build everything from YouTube videos to EDM music to their own companies.\n\n### Founding and Growing buildspace\n\nbuildspace raised funding from top investors like Y Combinator, a16z, and others. Farza worked on buildspace for 5 years, but unfortunately had to close the company. However, during its height, buildspace empowered huge numbers of people to bring their ideas to life.\n\n### A Passion for Creating and Teaching  \n\nEven before buildspace, Farza shipped gaming products to over 1 million users. He also trained open source deep learning models and founded an online elementary school with 100k students.\n\nFarza loves to write about his experiences building companies and products. He sends these lessons to his email list 1-2 times per month.\n\n### Get in Touch\n\nTo get Farza's writings in your inbox, drop your email below. You can also reach out to him directly at farza@buildspace.so - he responds to every email under 300 characters.\n`;
      console.log(aai);
      const response = await fetch("/api/aai/lemurTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${genAiPrompt}. Here's some additional context: ${missionInput}`,
          input_text: contentInput,
        }),
      });
      const result = await response.json();
      const copy = parseMarkdownSections(result.response);
      console.log(result.response);
      console.log(result.usage);
      //     const copy = parseMarkdownSections(
      //      ` # Farza's Journey of Creating and Building
      //\n\n
      //## From Selling Dragon Ball Z to Founding a Company with 100k Students
      //\n\n
      //Farza is an entrepreneur who has been creating things for others from a young age. He started his first business at 13, selling Dragon Ball Z video games on eBay. He eventually turned this into a larger business selling blank DVDs and t-shirts. By 15, he had grown it to $100k in revenue. After this success, he continued to build new products and companies.
      //\n\n
      //Most recently, he was the founder of buildspace, which became the largest community of people in the world learning to build everything from YouTube videos to EDM music to startups. The company raised funding from top investors like Y Combinator, a16z, and others. Farza worked on buildspace for five years before the company unfortunately had to close. However, even in closure, the community and impact buildspace made was incredible.
      //\n\n
      //### Early Days Hustling - From Anime to T-Shirts
      //\n\n
      //As early as 13 years old, I was hustling to make money. I started small by selling used video games on eBay. But I had bigger dreams. I expanded to producing and selling blank DVDs and t-shirts, leveraging my interests in anime and manga. Through persistence and drive, I grew the business to $100k in revenue by 15 years old. This early success gave me my first taste of creating companies and products people wanted.
      //\n\n
      //### Founding buildspace - Empowering Makers Worldwide
      //\n\n
      //After years of shipping different products and honing my skills, I founded buildspace in 2016. Our mission was to enable people around the world to learn building skills by following project-based YouTube coding tutorials. We strived to create the largest community platform for people to go from inspiration to launching their own apps, companies, and more. I worked tirelessly for 5 years to grow buildspace, raising funding from top Silicon Valley investors. At our peak, we empowered hundreds of thousands of people to level up their skills and creativity through the power of our platform and community.
      //\n\n
      //### What I Learned From These Experiences
      //\n\n
      //Through my journey of creating companies and products since 13 years old, I've learned many lessons about business, technology, and life:
      //\n\n
      //- Start small and iterate quickly - My first business was a humble eBay shop that I slowly grew into a $100k company.
      //- Persistence and hustle pay off - I spent years honing my skills in coding, design, writing, and more. That grit kept me going.
      //- Build communities, not just products - buildspace ultimately succeeded because of the community we fostered.
      //- Failures and closures contain important teachings - While buildspace closed, I don't see it as a failure, but rather a stepping stone with invaluable learnings.
      //\n\n
      //I'm proud of the products I've shipped and communities I've built so far. And at just 25 years old, I know there are many great projects still ahead. My journey of creating and building has only just begun.
      //\n`
      //    )

      //const copy = {
      //  pageTitle: `Page Title`,
      //  title: `## add a catchy title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n[Try it now!](try) &nbsp; [Learn more](learn)\n`,
      //  paragraphs: [
      //    `### tell us what happened\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n#### Add in those important details\n\nWrite for both the humans and for the search engine rankings!`,
      //    `### tell us what happened\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n#### Add in those important details\n\nWrite for both the humans and for the search engine rankings!`,
      //    `### tell us what happened\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n#### Add in those important details\n\nWrite for both the humans and for the search engine rankings!`,
      //  ],
      //};
      return copy;
    }, [contentInput, missionInput]);

  const handlePrepareDesign = useCallback(
    async (generatedCopy: GeneratedCopy): Promise<null | PageDesign> => {
      if (!selectedDesign) return null;

      const newPaneDesigns: PaneDesign[] = [];

      selectedDesign.paneDesignsMap.forEach((designType, index) => {
        const originalPane = selectedDesign.paneDesigns[index];
        if (!originalPane) return;

        switch (designType) {
          case "decorative":
            // Pass through decorative panes unchanged
            newPaneDesigns.push(originalPane);
            break;

          case "title": {
            // Replace markdown body in title pane with generated title
            const titlePane = structuredClone(originalPane);
            if (titlePane.fragments?.length) {
              titlePane.fragments = titlePane.fragments.map(fragment => {
                if (fragment.type === "markdown") {
                  return {
                    ...fragment,
                    markdownBody: generatedCopy.title ?? ``,
                  };
                }
                return fragment;
              });
            }
            newPaneDesigns.push(titlePane);
            break;
          }

          case "paragraph":
            // Create a new pane for each paragraph while preserving styling
            generatedCopy.paragraphs.forEach((paragraph, i) => {
              const isOdd = i % 2 === 1;
              const originalPaneOdd =
                selectedDesign?.paneDesignsOdd?.[originalPane.id];
              const paragraphPane = structuredClone(
                !isOdd ? originalPane : originalPaneOdd
              );
              if (paragraphPane?.fragments?.length) {
                paragraphPane.fragments = paragraphPane.fragments.map(
                  fragment => {
                    if (fragment.type === "markdown") {
                      return {
                        ...fragment,
                        markdownBody: paragraph ?? ``,
                      };
                    }
                    return fragment;
                  }
                );
              }
              if (paragraphPane) newPaneDesigns.push(paragraphPane);
            });
            break;
        }
      });
      return {
        ...selectedDesign,
        pageTitle: generatedCopy.pageTitle,
        paneDesigns: newPaneDesigns,
      };
    },
    [selectedDesign]
  );

  const handleLoadDesign = useCallback(
    async (userDesign: PageDesign): Promise<boolean> => {
      if (!userDesign) return false;
      const success = initializeStores(newId, tractStackId, userDesign, mode);
      if (success) creationStateStore.set({ id: newId, isInitialized: true });
      return success;
    },
    [newId, tractStackId, mode]
  );

  const handleGenerateComplete = useCallback(() => {
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
              hope they get out of this visit? Rough notes only, please. [You
              may need to write: 'Please write in the first-person perspective'
              for a personal website.]
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

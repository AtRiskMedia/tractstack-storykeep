import { useMemo, useState, useEffect } from "react";
import { Switch, Combobox } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import {
  XMarkIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import {
  getActiveTagData,
  updateViewportTuple,
  updateHistory,
} from "../../../utils/compositor/markdownUtils";
import ViewportComboBox from "../fields/ViewportComboBox";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  unsavedChangesStore,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import { classNames, cloneDeep } from "../../../utils/helpers";
import { tailwindClasses } from "../../../assets/tailwindClasses";
import { tagTitles } from "../../../constants";
import type {
  ClassNamesPayloadInnerDatum,
  PaneAstTargetId,
  Tag,
  Tuple,
} from "../../../types";

interface StyleTab {
  name: string;
  tag: Tag;
  priority: number;
}

export const PaneAstStyles = (props: {
  id: string;
  targetId: PaneAstTargetId;
  type: "desktop" | "mobile";
}) => {
  const { id, targetId, type } = props;
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [styleFilter, setStyleFilter] = useState("popular");
  const [selectedClass, setSelectedClass] = useState("");
  const [query, setQuery] = useState("");
  const [addClass, setAddClass] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [tabs, setTabs] = useState<StyleTab[] | null>(null);
  const [parentLayer, setParentLayer] = useState(0);
  const [mobileValue, setMobileValue] = useState<string>(``);
  const [tabletValue, setTabletValue] = useState<string>(``);
  const [desktopValue, setDesktopValue] = useState<string>(``);
  const [confirm, setConfirm] = useState<string | null>(null);
  const $unsavedChanges = useStore(unsavedChangesStore, { keys: [id] });
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [targetId.paneId],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[targetId.paneId].current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const { handleUndo } = useStoryKeepUtils(id, []);
  const markdownDatum = $paneFragmentMarkdown[markdownFragmentId].current;
  const hasHistory = !!$paneFragmentMarkdown[markdownFragmentId].history.length;
  const hasModal = markdownDatum.payload.isModal;
  const markdownLookup = useMemo(() => {
    return markdownDatum?.markdown?.htmlAst
      ? generateMarkdownLookup(markdownDatum.markdown.htmlAst)
      : null;
  }, [markdownDatum?.markdown?.htmlAst]);
  const thisTag = markdownLookup?.nthTag[targetId.outerIdx];
  const thisTagTitle = thisTag && tagTitles[thisTag];
  const hasTextShapeOutside =
    (markdownDatum.payload.textShapeOutsideDesktop &&
      markdownDatum.payload.textShapeOutsideDesktop !== `none`) ||
    (markdownDatum.payload.textShapeOutsideTablet &&
      markdownDatum.payload.textShapeOutsideTablet !== `none`) ||
    (markdownDatum.payload.textShapeOutsideMobile &&
      markdownDatum.payload.textShapeOutsideMobile !== `none`);
  const isListItem =
    typeof targetId.idx === `number`
      ? typeof markdownLookup?.listItemsLookup[targetId.outerIdx] ===
          `object` &&
        typeof markdownLookup.listItemsLookup[targetId.outerIdx][
          targetId.idx
        ] === `number`
      : null;
  const isCodeItem =
    typeof targetId.idx === `number`
      ? typeof markdownLookup?.codeItemsLookup[targetId.outerIdx] ===
          `object` &&
        typeof markdownLookup.codeItemsLookup[targetId.outerIdx][
          targetId.idx
        ] === `number`
      : null;
  const isImage =
    typeof targetId.idx === `number`
      ? typeof markdownLookup?.imagesLookup[targetId.outerIdx] === `object` &&
        typeof markdownLookup.imagesLookup[targetId.outerIdx][targetId.idx] ===
          `number`
      : null;
  const parentClassNamesPayload =
    markdownDatum?.payload.optionsPayload.classNamesPayload.parent;
  const modalClassNamesPayload =
    markdownDatum?.payload.optionsPayload.classNamesPayload.modal;
  //const parentLayers =
  //  (!hasTextShapeOutside &&
  //    parentClassNamesPayload &&
  //    Object.keys(parentClassNamesPayload).length) ||
  //  false;
  const imageClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.img;
  const codeItemClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.code;
  const listItemClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.li;
  const outerTagClassNamesPayload =
    thisTag && markdownDatum.payload.optionsPayload.classNamesPayload[thisTag];
  const classNamesPayload =
    activeTag === `img`
      ? imageClassNamesPayload
      : activeTag === `code`
        ? codeItemClassNamesPayload
        : activeTag === `li`
          ? listItemClassNamesPayload
          : outerTagClassNamesPayload;

  const removeStyle = (className: string) => {
    setSelectedStyle(null);
    if (!confirm) setConfirm(className);
    else {
      setConfirm(null);
      const activeTagData = getActiveTagData(
        activeTag,
        className,
        markdownLookup,
        targetId,
        classNamesPayload || null,
        modalClassNamesPayload,
        parentClassNamesPayload,
        parentLayer
      );
      const thisTag = activeTagData?.tag;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      const payloadForTag =
        thisTag &&
        (currentField.current.payload.optionsPayload.classNamesPayload[
          thisTag
        ] as ClassNamesPayloadInnerDatum);
      if (payloadForTag && className) {
        if (payloadForTag.classes && className in payloadForTag.classes) {
          delete (payloadForTag.classes as Record<string, string[]>)[className];
        }
        if (payloadForTag.override && className in payloadForTag.override) {
          delete payloadForTag.override[className];
        }
      }
      if (thisTag && payloadForTag)
        paneFragmentMarkdown.setKey(markdownFragmentId, {
          ...currentField,
          current: {
            ...currentField.current,
            payload: {
              ...currentField.current.payload,
              optionsPayload: {
                ...currentField.current.payload.optionsPayload,
                classNamesPayload: {
                  ...currentField.current.payload.optionsPayload
                    .classNamesPayload,
                  [thisTag]: payloadForTag,
                },
              },
            },
          },
          history: newHistory,
        });
      // Update unsavedChanges store
      unsavedChangesStore.setKey(id, {
        ...$unsavedChanges[id],
        paneFragmentMarkdown: true,
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };
  const cancelRemoveStyle = () => {
    setConfirm(null);
  };

  const removeOverride = () => {
    if (activeTagData?.hasOverride) console.log(`todo! removeOverride`);
    else console.log(`todo! enableOverride`);
  };

  const handleFinalChange = (
    value: string,
    viewport: "mobile" | "tablet" | "desktop",
    isNegative?: boolean
  ) => {
    if (activeTagData?.values.includes(value)) {
      const thisTag = activeTagData.tag;
      const thisGlobalNth = activeTagData.globalNth;
      const thisClass = activeTagData.class;
      const thisValue = !isNegative ? value : `!${value}`;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      const payloadForTag = currentField.current.payload.optionsPayload
        .classNamesPayload[thisTag] as ClassNamesPayloadInnerDatum;
      const thisTuple = !activeTagData.hasOverride
        ? (payloadForTag.classes as Record<string, Tuple>)[thisClass]
        : payloadForTag.override?.[thisClass]?.[thisGlobalNth as number];
      if (thisTuple) {
        const newTuple = updateViewportTuple(thisTuple, viewport, thisValue);
        if (activeTagData?.hasOverride) {
          if (!payloadForTag.override) payloadForTag.override = {};
          if (!payloadForTag.override[thisClass])
            payloadForTag.override[thisClass] = [];
          payloadForTag.override[thisClass][thisGlobalNth as number] = newTuple;
        } else {
          (payloadForTag.classes as Record<string, Tuple>)[thisClass] =
            newTuple;
        }
        paneFragmentMarkdown.setKey(markdownFragmentId, {
          ...currentField,
          current: {
            ...currentField.current,
            payload: {
              ...currentField.current.payload,
              optionsPayload: {
                ...currentField.current.payload.optionsPayload,
                classNamesPayload: {
                  ...currentField.current.payload.optionsPayload
                    .classNamesPayload,
                  [thisTag]: payloadForTag,
                },
              },
            },
          },
          history: newHistory,
        });
        // Update unsavedChanges store
        unsavedChangesStore.setKey(id, {
          ...$unsavedChanges[id],
          paneFragmentMarkdown: true,
        });
        lastInteractedTypeStore.set(`markdown`);
        lastInteractedPaneStore.set(targetId.paneId);
      }
    }
  };

  const filteredClasses = useMemo(() => {
    return Object.entries(tailwindClasses)
      .filter(([, classInfo]) => {
        switch (styleFilter) {
          case "popular":
            return classInfo.priority <= 1;
          case "advanced":
            return classInfo.priority <= 2;
          case "effects":
            return true;
          default:
            return false;
        }
      })
      .filter(([, classInfo]) =>
        classInfo.title.toLowerCase().includes(query.toLowerCase())
      );
  }, [styleFilter, query]);

  const handleAddStyle = () => {
    if (selectedClass) {
      const activeTagData = getActiveTagData(
        activeTag,
        selectedClass,
        markdownLookup,
        targetId,
        classNamesPayload || null,
        modalClassNamesPayload,
        parentClassNamesPayload,
        parentLayer
      );
      const thisTag = activeTagData?.tag;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      const payloadForTag =
        thisTag &&
        (currentField.current.payload.optionsPayload.classNamesPayload[
          thisTag
        ] as ClassNamesPayloadInnerDatum);

      if (payloadForTag && !(selectedClass in payloadForTag.classes)) {
        if (
          typeof payloadForTag.classes === "object" &&
          !Array.isArray(payloadForTag.classes)
        ) {
          (payloadForTag.classes as Record<string, Tuple>)[selectedClass] = [
            "",
          ];
        }
      }
      if (thisTag && payloadForTag)
        paneFragmentMarkdown.setKey(markdownFragmentId, {
          ...currentField,
          current: {
            ...currentField.current,
            payload: {
              ...currentField.current.payload,
              optionsPayload: {
                ...currentField.current.payload.optionsPayload,
                classNamesPayload: {
                  ...currentField.current.payload.optionsPayload
                    .classNamesPayload,
                  [thisTag]: payloadForTag,
                },
              },
            },
          },
          history: newHistory,
        });
      // Update unsavedChanges store
      unsavedChangesStore.setKey(id, {
        ...$unsavedChanges[id],
        paneFragmentMarkdown: true,
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);

      setAddClass(false);
      setSelectedStyle(selectedClass);
      setSelectedClass("");
      setQuery("");
    }
  };

  const ClassTag = (className: string) => (
    <div key={className} className="flex items-center">
      {!confirm || confirm !== className ? (
        <>
          <button
            className="peer text-md py-1 px-3 bg-mywhite text-black rounded-md hover:bg-yellow-300 shadow hover:underline"
            title={`Adjust ${
              typeof tailwindClasses[className] !== `undefined`
                ? tailwindClasses[className].title
                : className
            }`}
            onClick={() => setSelectedStyle(className)}
          >
            {typeof tailwindClasses[className] !== `undefined`
              ? tailwindClasses[className].title
              : className}
          </button>
          <button
            className="ml-[-0.5rem] py-1 px-0.5 bg-myorange/10 text-myorange font-bold rounded-full hover:bg-myorange/50 hover:text-black peer-hover:invisible shadow"
            title="Remove style"
            onClick={() => removeStyle(className)}
          >
            <XMarkIcon className="w-3 h-6" />
          </button>
        </>
      ) : (
        <>
          <button
            className="text-md py-1 pl-1.5 pr-3 bg-myorange/20 text-black rounded-md hover:bg-myorange/50"
            title="Remove style"
            onClick={() => removeStyle(className)}
          >
            <span className="flex flex-nowrap">
              Are you sure
              <CheckIcon className="w-5 h-5" />
            </span>
          </button>
          <button
            className="ml-[-0.5rem] p-1 bg-black text-white font-bold rounded-full hover:bg-myorange hover:text-white"
            title="Keep style"
            onClick={() => cancelRemoveStyle()}
          >
            <XMarkIcon className="w-3 h-5" />
          </button>
        </>
      )}
    </div>
  );

  useEffect(() => {
    const thisTabs: StyleTab[] = [];
    if (isImage) thisTabs.push({ name: `Image`, tag: `img`, priority: 1 });
    else if (isCodeItem)
      thisTabs.push({ name: `Widget`, tag: `code`, priority: 1 });
    else if (thisTagTitle && !isListItem)
      thisTabs.push({ name: thisTagTitle, tag: thisTag, priority: 0 });
    if (isListItem && thisTag) {
      thisTabs.push({ name: `List Item`, tag: `li`, priority: 2 });
      thisTabs.push({ name: `List Container`, tag: thisTag, priority: 3 });
    }
    if (hasModal)
      thisTabs.push({ name: `Modal Styles`, tag: `modal`, priority: 3 });
    if (!hasTextShapeOutside)
      thisTabs.push({ name: `Pane Styles`, tag: `parent`, priority: 4 });
    setSelectedStyle(null);
    setParentLayer(0);
    setTabs(thisTabs);
    setActiveTag(thisTabs[0].tag);
    setMobileValue(``);
    setTabletValue(``);
    setDesktopValue(``);
  }, [id, targetId]);

  const sortByActiveTag = (arr: StyleTab[], activeTag: Tag): StyleTab[] => {
    return [...arr].sort((a, b) => {
      if (a.tag === activeTag && b.tag !== activeTag) return -1;
      if (b.tag === activeTag && a.tag !== activeTag) return 1;
      if (a.tag === activeTag && b.tag === activeTag) return 0;
      return a.priority - b.priority;
    });
  };

  useEffect(() => {
    if (activeTag)
      setTabs(prevItems =>
        prevItems && activeTag ? sortByActiveTag(prevItems, activeTag) : null
      );
  }, [activeTag]);

  const activeTagData = useMemo(() => {
    return getActiveTagData(
      activeTag,
      selectedStyle,
      markdownLookup,
      targetId,
      classNamesPayload || null,
      modalClassNamesPayload,
      parentClassNamesPayload,
      parentLayer
    );
  }, [
    activeTag,
    selectedStyle,
    markdownLookup,
    targetId,
    classNamesPayload,
    modalClassNamesPayload,
    parentClassNamesPayload,
    parentLayer,
  ]);

  useEffect(() => {
    if (activeTagData) {
      setMobileValue(String(activeTagData.mobileVal ?? ""));
      setTabletValue(String(activeTagData.tabletVal ?? ""));
      setDesktopValue(String(activeTagData.desktopVal ?? ""));
    } else {
      // Reset values when activeTagData is null or undefined
      setMobileValue("");
      setTabletValue("");
      setDesktopValue("");
    }
  }, [activeTagData]);

  if (!tabs) return null;

  return (
    <div
      className={classNames(
        `flex`,
        type === `mobile` ? `flex-nowrap gap-x-4 gap-y-2` : `flex-wrap`
      )}
    >
      <div
        className={classNames(
          type === `mobile` ? `max-w-5/12` : `w-fit-contents mr-8`
        )}
      >
        <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner px-3.5 py-1.5">
          <div className="flex justify-between items-center">
            <nav aria-label="Tabs" className="flex space-x-4 mt-4 mb-1">
              {tabs.map((tab: StyleTab, idx: number) => (
                <button
                  key={idx}
                  aria-current={tab.tag === activeTag ? "page" : undefined}
                  onClick={() => {
                    setActiveTag(tab.tag);
                    setSelectedStyle(null);
                  }}
                  className={classNames(
                    tab.tag === activeTag
                      ? "text-black font-bold"
                      : "text-mydarkgrey hover:text-black underline",
                    "text-md"
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
            {hasHistory ? (
              <button
                onClick={() =>
                  handleUndo("paneFragmentMarkdown", markdownFragmentId)
                }
                className="bg-mygreen/50 hover:bg-myorange text-black px-2 py-1 rounded"
                disabled={
                  $paneFragmentMarkdown[markdownFragmentId]?.history.length ===
                  0
                }
              >
                Undo
              </button>
            ) : null}
          </div>

          <hr />
          {activeTag && ![`parent`, `modal`].includes(activeTag) && (
            <div className="my-4 flex flex-wrap gap-x-2 gap-y-1.5">
              {classNamesPayload?.classes &&
              Object.keys(classNamesPayload.classes).length ? (
                Object.keys(classNamesPayload.classes).map(className =>
                  ClassTag(className)
                )
              ) : (
                <span>No styles</span>
              )}
            </div>
          )}

          {activeTag === `parent` && (
            <>
              <div className="bg-myblue/5 text-md mt-2 px-2 flex flex-wrap gap-x-2 gap-y-1.5">
                <span className="py-1">Layer:</span>
                {parentClassNamesPayload?.classes &&
                  Object.keys(parentClassNamesPayload?.classes).map(
                    (_, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setParentLayer(idx);
                          setSelectedStyle(null);
                        }}
                        className={classNames(
                          "py-1 px-1.5 rounded-md",
                          idx !== parentLayer
                            ? "text-md underline underline-offset-2 text-mydarkgrey hover:text-black hover:bg-myorange/20"
                            : "text-md text-black bg-myorange/50 font-bold pointer-events-none"
                        )}
                      >
                        {idx}
                      </button>
                    )
                  )}
              </div>
              <hr />
              <div className="my-4 flex flex-wrap gap-x-1.5 gap-y-1.5">
                {parentClassNamesPayload?.classes &&
                Array.isArray(parentClassNamesPayload?.classes) ? (
                  Object.keys(
                    parentClassNamesPayload?.classes[parentLayer]
                  ).map(className => ClassTag(className))
                ) : (
                  <div>
                    No styles.{" "}
                    <button className="font-bold underline">
                      Delete layer.
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTag === `modal` && (
            <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
              {modalClassNamesPayload?.classes ? (
                Object.keys(modalClassNamesPayload?.classes).map(className =>
                  ClassTag(className)
                )
              ) : (
                <span>No styles</span>
              )}
            </div>
          )}
          <button
            className="my-2 underline"
            title="Add a Style to this"
            onClick={() => {
              setSelectedStyle(null);
              setAddClass(true);
            }}
          >
            ADD STYLE
          </button>
        </div>
      </div>
      <div
        className={classNames(
          type === `mobile` ? `max-w-5/12` : `w-fit-contents mt-8`
        )}
      >
        {selectedStyle ? (
          <div className="bg-white shadow-inner rounded">
            <div className="px-6 py-4">
              <h4 className="text-lg">
                <strong>{tailwindClasses[selectedStyle].title}</strong> on{" "}
                {activeTagData?.hasOverride ? (
                  <span className="underline">this</span>
                ) : (
                  <span className="underline">all</span>
                )}{" "}
                {tabs.length && tagTitles[tabs.at(0)!.tag]}
                {!activeTagData?.hasOverride ? `s` : null}
              </h4>

              <div className="flex flex-col gap-y-2.5 my-3 text-mydarkgrey text-xl">
                <ViewportComboBox
                  value={mobileValue}
                  onChange={setMobileValue}
                  onFinalChange={handleFinalChange}
                  values={activeTagData?.values ?? []}
                  viewport="mobile"
                  allowNegative={activeTagData?.allowNegative ?? false}
                  isNegative={activeTagData?.mobileIsNegative ?? false}
                />
                <ViewportComboBox
                  value={tabletValue}
                  onChange={setTabletValue}
                  onFinalChange={handleFinalChange}
                  values={activeTagData?.values ?? []}
                  viewport="tablet"
                  allowNegative={activeTagData?.allowNegative}
                  isNegative={activeTagData?.tabletIsNegative ?? false}
                />
                <ViewportComboBox
                  value={desktopValue}
                  onChange={setDesktopValue}
                  onFinalChange={handleFinalChange}
                  values={activeTagData?.values ?? []}
                  viewport="desktop"
                  allowNegative={activeTagData?.allowNegative ?? false}
                  isNegative={activeTagData?.desktopIsNegative ?? false}
                />
              </div>

              {tabs.length &&
              ![`Pane Styles`, `Modal Styles`].includes(
                tagTitles[tabs.at(0)!.tag]
              ) ? (
                <div className="flex items-center mt-4">
                  <Switch
                    checked={activeTagData?.hasOverride}
                    onChange={removeOverride}
                    className={`${
                      activeTagData?.hasOverride
                        ? "bg-myorange"
                        : "bg-mydarkgrey"
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        activeTagData?.hasOverride
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                  <div className="ml-3">
                    <div className="text-md text-black font-bold">
                      {!activeTagData?.hasOverride
                        ? `Quick style mode`
                        : `Custom styles`}
                    </div>
                    <div className="text-md text-mydarkgrey">
                      {!activeTagData?.hasOverride
                        ? `all ${tagTitles[tabs.at(0)!.tag]}s (in this pane)`
                        : `on this ${tagTitles[tabs.at(0)!.tag]} only`}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : addClass ? (
          <div className="bg-white shadow-inner rounded">
            <div className="px-6 py-4">
              <h4 className="text-lg">Add Styles</h4>
              <div className="my-4">
                <select
                  value={styleFilter}
                  onChange={e => setStyleFilter(e.target.value)}
                  className="w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-10 text-xl leading-5 text-black focus:ring-1 focus:ring-myorange focus:border-myorange"
                >
                  <option value="popular">Popular Styles</option>
                  <option value="advanced">+ Advanced</option>
                  <option value="effects">+ Effects</option>
                </select>
              </div>

              <div className="relative">
                <Combobox value={selectedClass} onChange={setSelectedClass}>
                  <div className="relative mt-1">
                    <Combobox.Input
                      className="w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-10 text-xl leading-5 text-black focus:ring-1 focus:ring-myorange focus:border-myorange"
                      displayValue={(className: string) =>
                        tailwindClasses[className]?.title || ""
                      }
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Select a style to add"
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-mydarkgrey"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredClasses.map(([className, classInfo]) => (
                      <Combobox.Option
                        key={className}
                        value={className}
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
                              {classInfo.title}
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
                </Combobox>
              </div>

              <button
                onClick={handleAddStyle}
                className="mt-4 w-full py-2 bg-myorange text-white rounded-md hover:bg-myorange/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-myorange"
              >
                Add Style
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="w-2 h-auto"></div>
    </div>
  );
};

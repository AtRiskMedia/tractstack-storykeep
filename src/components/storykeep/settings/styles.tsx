import { useMemo, useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
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
  // replace with direct from datum
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
    if (!confirm) setConfirm(className);
    else {
      setConfirm(null);
      console.log(`remove tag ${className}`, targetId);
    }
  };
  const cancelRemoveStyle = () => {
    setConfirm(null);
  };

  const removeOverride = () => {
    console.log(`todo! removeOverride`);
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
          <div className="my-2">ADD STYLE</div>
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
        ) : null}
      </div>
      <div className="w-2 h-auto"></div>
    </div>
  );
};

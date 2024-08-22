import { useMemo, useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import ViewportComboBox from "../fields/ViewportComboBox";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
} from "../../../store/storykeep";
import { classNames } from "../../../utils/helpers";
import { tailwindClasses } from "../../../assets/tailwindClasses";
import { tagTitles } from "../../../constants";
import type { PaneAstTargetId, Tag } from "../../../types";

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
  const [mobileValue, setMobileValue] = useState<string | null>(null);
  const [tabletValue, setTabletValue] = useState<string | null>(null);
  const [desktopValue, setDesktopValue] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [id],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[id].current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const markdownDatum = $paneFragmentMarkdown[markdownFragmentId].current;
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
    console.log(`will do!`);
  };

  const handleFinalChange = (
    value: string,
    viewport: "mobile" | "tablet" | "desktop"
  ) => {
    if (activeTagData?.values.includes(value)) {
      console.log(
        `set:`,
        value,
        viewport,
        `hasOverride?`,
        activeTagData?.hasOverride
      );
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
    setMobileValue(null);
    setTabletValue(null);
    setDesktopValue(null);
  }, [id, targetId]);

  const sortByActiveTag = (arr: StyleTab[], activeTag: Tag): StyleTab[] => {
    return [...arr].sort((a, b) => {
      if (a.tag === activeTag && b.tag !== activeTag) return -1;
      if (b.tag === activeTag && a.tag !== activeTag) return 1;
      if (a.tag === activeTag && b.tag === activeTag) return 0;
      return a.priority - b.priority;
    });
  };

  const setViewportValues = (
    mobileVal: string | number | null | unknown,
    tabletVal: string | number | null | unknown,
    desktopVal: string | number | null | unknown
  ) => {
    if (typeof mobileVal === `string`) setMobileValue(mobileVal);
    else if (typeof mobileVal === `number`)
      setMobileValue(mobileVal.toString());
    else
      console.log(
        `unable to setViewportValues on`,
        mobileVal,
        typeof mobileVal
      );
    if (typeof tabletVal === `string`) setTabletValue(tabletVal);
    else if (typeof tabletVal === `number`)
      setTabletValue(tabletVal.toString());
    else
      console.log(
        `unable to setViewportValues on`,
        tabletVal,
        typeof tabletVal
      );
    if (typeof desktopVal === `string`) setDesktopValue(desktopVal);
    else if (typeof desktopVal === `number`)
      setDesktopValue(desktopVal.toString());
    else
      console.log(
        `unable to setViewportValues on`,
        desktopVal,
        typeof desktopVal
      );
  };

  useEffect(() => {
    if (activeTag)
      setTabs(prevItems =>
        prevItems && activeTag ? sortByActiveTag(prevItems, activeTag) : null
      );
  }, [activeTag]);

  const activeTagData = useMemo(() => {
    if (!activeTag || !selectedStyle || !markdownLookup) return null;
    switch (activeTag) {
      case "p":
      case "h2":
      case "h3":
      case "h4":
      case "ol":
      case "ul": {
        const tagLookup = markdownLookup.nthTagLookup[activeTag];
        if (!tagLookup || !tagLookup[targetId.outerIdx]) return null;
        const globalNth = tagLookup[targetId.outerIdx].nth;
        const overrideClasses =
          (classNamesPayload?.override &&
            classNamesPayload.override[selectedStyle] &&
            classNamesPayload.override[selectedStyle][globalNth]) ||
          null;
        const classes =
          classNamesPayload?.classes &&
          typeof selectedStyle === "string" &&
          selectedStyle in classNamesPayload.classes
            ? (classNamesPayload.classes as Record<string, unknown[]>)[
                selectedStyle
              ]
            : undefined;
        const mobileVal =
          Array.isArray(classes) && classes.length ? classes[0] : null;
        const tabletVal =
          Array.isArray(classes) && classes.length > 1 ? classes[1] : mobileVal;
        const desktopVal =
          Array.isArray(classes) && classes.length > 2 ? classes[2] : tabletVal;
        setViewportValues(mobileVal, tabletVal, desktopVal);
        return {
          class: selectedStyle,
          tag: activeTag,
          globalNth,
          hasOverride: !!overrideClasses,
          mobileVal,
          tabletVal,
          desktopVal,
          values: tailwindClasses[selectedStyle].values,
        };
      }
      case "img": {
        if (
          typeof targetId.idx === `number` &&
          markdownLookup.imagesLookup[targetId.outerIdx] &&
          typeof markdownLookup.imagesLookup[targetId.outerIdx][
            targetId.idx
          ] !== `number`
        )
          return null;
        const globalNth =
          typeof targetId.idx === `number` &&
          markdownLookup?.imagesLookup[targetId.outerIdx][targetId.idx];
        const overrideClasses =
          (classNamesPayload?.override &&
            typeof globalNth === `number` &&
            classNamesPayload.override[selectedStyle] &&
            classNamesPayload.override[selectedStyle][globalNth]) ||
          null;
        const classes =
          classNamesPayload?.classes &&
          typeof selectedStyle === "string" &&
          selectedStyle in classNamesPayload.classes
            ? (classNamesPayload.classes as Record<string, unknown[]>)[
                selectedStyle
              ]
            : undefined;
        const mobileVal =
          overrideClasses && overrideClasses.length
            ? overrideClasses[0]
            : classes && classes.length
              ? classes[0]
              : null;
        const tabletVal =
          overrideClasses && overrideClasses.length > 1
            ? overrideClasses[1]
            : classes && classes.length > 1
              ? classes[1]
              : mobileVal;
        const desktopVal =
          overrideClasses && overrideClasses.length > 2
            ? overrideClasses[2]
            : classes && classes.length > 2
              ? classes[2]
              : tabletVal;
        setViewportValues(mobileVal, tabletVal, desktopVal);
        return {
          class: selectedStyle,
          tag: activeTag,
          globalNth,
          hasOverride: !!overrideClasses,
          mobileVal,
          tabletVal,
          desktopVal,
          values: tailwindClasses[selectedStyle].values,
        };
      }
      case "li": {
        if (
          typeof targetId.idx === `number` &&
          markdownLookup.listItemsLookup[targetId.outerIdx] &&
          typeof markdownLookup.listItemsLookup[targetId.outerIdx][
            targetId.idx
          ] !== `number`
        )
          return null;
        const globalNth =
          typeof targetId.idx === `number` &&
          markdownLookup?.listItemsLookup[targetId.outerIdx][targetId.idx];
        const overrideClasses =
          (classNamesPayload?.override &&
            typeof globalNth === `number` &&
            classNamesPayload.override[selectedStyle] &&
            classNamesPayload.override[selectedStyle][globalNth]) ||
          null;
        const classes =
          classNamesPayload?.classes &&
          typeof selectedStyle === "string" &&
          selectedStyle in classNamesPayload.classes
            ? (classNamesPayload.classes as Record<string, unknown[]>)[
                selectedStyle
              ]
            : undefined;
        const mobileVal =
          Array.isArray(classes) && classes.length ? classes[0] : null;
        const tabletVal =
          Array.isArray(classes) && classes.length > 1 ? classes[1] : mobileVal;
        const desktopVal =
          Array.isArray(classes) && classes.length > 2 ? classes[2] : tabletVal;
        setViewportValues(mobileVal, tabletVal, desktopVal);
        return {
          class: selectedStyle,
          tag: activeTag,
          globalNth,
          hasOverride: !!overrideClasses,
          mobileVal,
          tabletVal,
          desktopVal,
          values: tailwindClasses[selectedStyle].values,
        };
      }
      case "code": {
        if (
          typeof targetId.idx === `number` &&
          markdownLookup.codeItemsLookup[targetId.outerIdx] &&
          typeof markdownLookup.codeItemsLookup[targetId.outerIdx][
            targetId.idx
          ] !== `number`
        )
          return null;
        const globalNth =
          typeof targetId.idx === `number` &&
          markdownLookup.codeItemsLookup[targetId.outerIdx][targetId.idx];
        const overrideClasses =
          (classNamesPayload?.override &&
            typeof globalNth === `number` &&
            classNamesPayload.override[selectedStyle] &&
            classNamesPayload.override[selectedStyle][globalNth]) ||
          null;
        const classes =
          classNamesPayload?.classes &&
          typeof selectedStyle === "string" &&
          selectedStyle in classNamesPayload.classes
            ? (classNamesPayload.classes as Record<string, unknown[]>)[
                selectedStyle
              ]
            : undefined;
        const mobileVal =
          overrideClasses && overrideClasses.length
            ? overrideClasses[0]
            : classes && classes.length
              ? classes[0]
              : null;
        const tabletVal =
          overrideClasses && overrideClasses.length > 1
            ? overrideClasses[1]
            : classes && classes.length > 1
              ? classes[1]
              : mobileVal;
        const desktopVal =
          overrideClasses && overrideClasses.length > 2
            ? overrideClasses[2]
            : classes && classes.length > 2
              ? classes[2]
              : tabletVal;
        setViewportValues(mobileVal, tabletVal, desktopVal);
        return {
          class: selectedStyle,
          tag: activeTag,
          globalNth,
          hasOverride: !!overrideClasses,
          mobileVal,
          tabletVal,
          desktopVal,
          values: tailwindClasses[selectedStyle].values,
        };
      }
      case "modal": {
        const classes =
          modalClassNamesPayload?.classes &&
          typeof selectedStyle === "string" &&
          selectedStyle in modalClassNamesPayload.classes
            ? (modalClassNamesPayload.classes as Record<string, unknown>)[
                selectedStyle
              ]
            : undefined;
        const mobileVal =
          Array.isArray(classes) && classes.length ? classes[0] : null;
        const tabletVal =
          Array.isArray(classes) && classes.length > 1 ? classes[1] : mobileVal;
        const desktopVal =
          Array.isArray(classes) && classes.length > 2 ? classes[2] : tabletVal;
        setViewportValues(mobileVal, tabletVal, desktopVal);
        return {
          tag: `modal`,
          class: selectedStyle,
          hasOverride: false,
          mobileVal,
          tabletVal,
          desktopVal,
          values: tailwindClasses[selectedStyle].values,
        };
      }
      case "parent": {
        const classes =
          parentClassNamesPayload?.classes &&
          typeof selectedStyle === "string" &&
          Array.isArray(parentClassNamesPayload.classes) &&
          parentClassNamesPayload.classes[parentLayer] &&
          selectedStyle in parentClassNamesPayload.classes[parentLayer]
            ? (
                parentClassNamesPayload.classes[parentLayer] as Record<
                  string,
                  unknown[]
                >
              )[selectedStyle]
            : undefined;
        const mobileVal =
          Array.isArray(classes) && classes.length ? classes[0] : null;
        const tabletVal =
          Array.isArray(classes) && classes.length > 1 ? classes[1] : mobileVal;
        const desktopVal =
          Array.isArray(classes) && classes.length > 2 ? classes[2] : tabletVal;
        setViewportValues(mobileVal, tabletVal, desktopVal);
        return {
          tag: `parent`,
          class: selectedStyle,
          hasOverride: false,
          mobileVal,
          tabletVal,
          desktopVal,
          values: tailwindClasses[selectedStyle].values,
        };
      }
      default:
        return null;
    }
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

  if (!tabs) return null;

  return (
    <div
      className={classNames(
        `flex`,
        type === `mobile` ? `flex-nowrap gap-x-12 gap-y-2` : `flex-wrap`
      )}
    >
      <div className={classNames(type === `mobile` ? `max-w-5/12` : `w-full`)}>
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
        <hr />
        {activeTag && ![`parent`, `modal`].includes(activeTag) && (
          <>
            <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner px-3.5 py-1.5">
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
            </div>
            <div className="my-2">ADD STYLE</div>
          </>
        )}

        {activeTag === `parent` && (
          <>
            <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner px-3.5 py-1.5">
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
            </div>
            <div className="my-2">ADD STYLE</div>
          </>
        )}

        {activeTag === `modal` && (
          <>
            <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner px-3.5 py-1.5">
              <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
                {modalClassNamesPayload?.classes ? (
                  Object.keys(modalClassNamesPayload?.classes).map(className =>
                    ClassTag(className)
                  )
                ) : (
                  <span>No styles</span>
                )}
              </div>
            </div>
            <div className="my-2">ADD STYLE</div>
          </>
        )}
      </div>
      <div
        className={classNames(type === `mobile` ? `max-w-5/12` : `w-full mt-8`)}
      >
        {selectedStyle ? (
          <div className="my-1 bg-white shadow-inner rounded">
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
                  value={mobileValue || ``}
                  onChange={setMobileValue}
                  onFinalChange={handleFinalChange}
                  values={activeTagData?.values || []}
                  viewport="mobile"
                />
                <ViewportComboBox
                  value={tabletValue || ``}
                  onChange={setTabletValue}
                  onFinalChange={handleFinalChange}
                  values={activeTagData?.values || []}
                  viewport="tablet"
                />
                <ViewportComboBox
                  value={desktopValue || ``}
                  onChange={setDesktopValue}
                  onFinalChange={handleFinalChange}
                  values={activeTagData?.values || []}
                  viewport="desktop"
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
    </div>
  );
};

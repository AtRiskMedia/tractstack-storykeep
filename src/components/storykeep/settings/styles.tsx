import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
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
}

export const PaneAstStyles = (props: {
  id: string;
  targetId: PaneAstTargetId;
  type: "desktop" | "mobile";
}) => {
  const { id, targetId, type } = props;
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [tabs, setTabs] = useState<StyleTab[] | null>(null);
  const [parentLayer, setParentLayer] = useState(0);
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
  const markdownLookup =
    markdownDatum?.markdown?.htmlAst &&
    generateMarkdownLookup(markdownDatum.markdown.htmlAst);
  const thisTag = markdownLookup.nthTag[targetId.outerIdx];
  const thisTagTitle = tagTitles[thisTag];
  const hasTextShapeOutside =
    (markdownDatum.payload.textShapeOutsideDesktop &&
      markdownDatum.payload.textShapeOutsideDesktop !== `none`) ||
    (markdownDatum.payload.textShapeOutsideTablet &&
      markdownDatum.payload.textShapeOutsideTablet !== `none`) ||
    (markdownDatum.payload.textShapeOutsideMobile &&
      markdownDatum.payload.textShapeOutsideMobile !== `none`);
  const isListItem =
    typeof targetId.idx === `number`
      ? typeof markdownLookup.listItemsLookup[targetId.outerIdx] === `object` &&
        typeof markdownLookup.listItemsLookup[targetId.outerIdx][
          targetId.idx
        ] === `number`
      : null;
  const isCodeItem =
    typeof targetId.idx === `number`
      ? typeof markdownLookup.codeItemsLookup[targetId.outerIdx] === `object` &&
        typeof markdownLookup.codeItemsLookup[targetId.outerIdx][
          targetId.idx
        ] === `number`
      : null;
  const isImage =
    typeof targetId.idx === `number`
      ? typeof markdownLookup.imagesLookup[targetId.outerIdx] === `object` &&
        typeof markdownLookup.imagesLookup[targetId.outerIdx][targetId.idx] ===
          `number`
      : null;
  const parentClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.parent;
  const modalClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.modal;
  const parentLayers =
    (!hasTextShapeOutside &&
      parentClassNamesPayload &&
      Object.keys(parentClassNamesPayload).length) ||
    false;
  const imageClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.img;
  const codeItemClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.code;
  const listItemClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.li;
  const outerTagClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload[thisTag];
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

  const ClassTag = (className: string) => (
    <div key={className} className="flex items-center">
      {!confirm || confirm !== className ? (
        <>
          <button
            className="peer text-md py-1 pl-1.5 pr-3 bg-white text-black rounded-md hover:bg-myblue hover:text-white"
            title="Adjust style"
            onClick={() => setSelectedStyle(className)}
          >
            {tailwindClasses[className].title}
          </button>
          <button
            className="ml-[-0.5rem] p-1 bg-red-50 text-black font-bold rounded-full hover:bg-myorange peer-hover:invisible"
            title="Remove style"
            onClick={() => removeStyle(className)}
          >
            <XMarkIcon className="w-3 h-5" />
          </button>
        </>
      ) : (
        <>
          <button
            className="text-md py-1 pl-1.5 pr-3 bg-myorange/20 text-black rounded-md hover:bg-myblue hover:text-white"
            title="Remove style"
            onClick={() => removeStyle(className)}
          >
            <span className="flex flex-nowrap">
              Are you sure
              <CheckIcon className="w-5 h-5" />
            </span>
          </button>
          <button
            className="ml-[-0.5rem] p-1 bg-red-50 text-black font-bold rounded-full hover:bg-myorange"
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
    if (isImage) thisTabs.push({ name: `Image`, tag: `img` });
    else if (isCodeItem) thisTabs.push({ name: `Widget`, tag: `code` });
    else if (thisTagTitle && !isListItem)
      thisTabs.push({ name: thisTagTitle, tag: thisTag });
    if (isListItem) {
      thisTabs.push({ name: `List Item`, tag: `li` });
      thisTabs.push({ name: `List Container`, tag: thisTag });
    }
    if (hasModal) thisTabs.push({ name: `Modal Styles`, tag: `modal` });
    if (!hasTextShapeOutside)
      thisTabs.push({ name: `Pane Styles`, tag: `parent` });
    setTabs(thisTabs);
    setActiveTag(thisTabs[0].tag);
    setSelectedStyle(null);
    setParentLayer(0);
  }, [id, targetId]);

  const sortByActiveTag = (arr: StyleTab[], activeTag: Tag): StyleTab[] => {
    return [...arr].sort((a, b) => {
      if (a.tag === activeTag && b.tag !== activeTag) return -1;
      if (b.tag === activeTag && a.tag !== activeTag) return 1;
      return 0;
    });
  };

  useEffect(() => {
    if (activeTag)
      setTabs(prevItems =>
        prevItems && activeTag ? sortByActiveTag(prevItems, activeTag) : null
      );
  }, [activeTag]);

  if (!tabs) return null;

  return (
    <div
      className={classNames(
        `flex`,
        type === `mobile` ? `flex-nowrap gap-x-12 gap-y-2` : `flex-wrap`
      )}
    >
      <div className={classNames(type === `mobile` ? `max-w-5/12` : `w-full`)}>
        <nav aria-label="Tabs" className="flex space-x-4 mb-1">
          {tabs.map((tab: StyleTab, idx: number) => (
            <button
              key={idx}
              aria-current={tab.tag === activeTag ? "page" : undefined}
              onClick={() => setActiveTag(tab.tag)}
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
              <div className="my-4 flex flex-wrap gap-x-1.5 gap-y-1.5">
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
            <div className="my-6">todo: Add new style selectbox</div>
          </>
        )}

        {activeTag === `parent` && (
          <>
            <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner px-3.5 py-1.5">
              <div className="my-4 flex flex-wrap gap-x-1.5 gap-y-1.5">
                {parentClassNamesPayload?.classes &&
                Array.isArray(parentClassNamesPayload?.classes) ? (
                  Object.keys(
                    parentClassNamesPayload?.classes[parentLayer]
                  ).map(className => ClassTag(className))
                ) : (
                  <span>No styles</span>
                )}
              </div>
              <hr />
              <div className="bg-myblue/5 text-md mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
                <span className="py-1">Layers:</span>
                {parentClassNamesPayload?.classes &&
                  Object.keys(parentClassNamesPayload?.classes).map(
                    (_, idx: number) => (
                      <span
                        key={idx}
                        onClick={() => setParentLayer(idx)}
                        className={classNames(
                          "text-md py-1 px-1.5 rounded-md",
                          idx !== parentLayer
                            ? "text-mydarkgrey bg-mylightgrey/20 hover:bg-myorange/20"
                            : "text-black font-bold"
                        )}
                      >
                        {idx}
                      </span>
                    )
                  )}
              </div>
            </div>
            <div className="my-6">
              todo: Add new style selectbox; add/remove layer --${parentLayers}
            </div>
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
            <div className="my-6">todo: Add new style selectbox</div>
          </>
        )}
      </div>
      <div
        className={classNames(type === `mobile` ? `max-w-5/12` : `w-full mt-8`)}
      >
        {selectedStyle ? (
          <h4 className="text-lg">
            Styles on: <strong>{tailwindClasses[selectedStyle].title}</strong>
          </h4>
        ) : null}
      </div>
    </div>
  );
  //return (
  //  <>
  //    <p>Pane Ast Styles: {id}</p>
  //    <ul>
  //      <li>{$paneTitle[id].current}</li>
  //      <li>{$paneSlug[id].current}</li>
  //      <li>{$paneFragmentIds[id].current.join(`, `)}</li>
  //    </ul>
  //  </>
  //);
};

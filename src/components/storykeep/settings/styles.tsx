import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
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
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [id],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[id].current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const markdownDatum = $paneFragmentMarkdown[markdownFragmentId].current;
  const markdownLookup =
    markdownDatum?.markdown?.htmlAst &&
    generateMarkdownLookup(markdownDatum.markdown.htmlAst);
  const thisTag = markdownLookup.nthTag[targetId.outerIdx];
  const thisTagTitle = tagTitles[thisTag];
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
  const imageClassNamesPayload = isImage
    ? markdownDatum.payload.optionsPayload.classNamesPayload.img
    : null;
  const codeItemClassNamesPayload = isCodeItem
    ? markdownDatum.payload.optionsPayload.classNamesPayload.code
    : null;
  console.log(markdownDatum);
  const listItemClassNamesPayload = isListItem
    ? markdownDatum.payload.optionsPayload.classNamesPayload.li
    : null;
  const outerTagClassNamesPayload = isImage
    ? markdownDatum.payload.optionsPayload.classNamesPayload.img
    : markdownDatum.payload.optionsPayload.classNamesPayload[thisTag];
  console.log(markdownDatum.payload.optionsPayload.classNamesPayload);
  console.log(markdownLookup);
  console.log(
    outerTagClassNamesPayload,
    listItemClassNamesPayload,
    codeItemClassNamesPayload,
    imageClassNamesPayload
  );

  useEffect(() => {
    console.log(`set-up tabs`);
    const thisTabs: StyleTab[] = [];
    if (isImage) thisTabs.push({ name: `Image`, tag: `img` });
    else if (isCodeItem) thisTabs.push({ name: `Widget`, tag: `code` });
    else if (thisTagTitle && !isListItem)
      thisTabs.push({ name: thisTagTitle, tag: thisTag });
    if (isListItem) {
      thisTabs.push({ name: `List Item`, tag: `li` });
      thisTabs.push({ name: `List Container`, tag: thisTag });
    }
    thisTabs.push({ name: `Pane Styles`, tag: `pane` });
    setTabs(thisTabs);
    setActiveTag(thisTabs[0].tag);
  }, [id, targetId]);

  if (!tabs) return null;
  return (
    <div
      className={classNames(
        `flex`,
        type === `mobile` ? `flex-nowrap gap-x-6 gap-y-2` : `flex-wrap`
      )}
    >
      <div className={classNames(type === `mobile` ? `w-5/12` : `w-full`)}>
        <nav aria-label="Tabs" className="flex space-x-4 mb-1">
          {tabs.map((tab: StyleTab, idx: number) => (
            <button
              key={idx}
              aria-current={tab.tag === activeTag ? "page" : undefined}
              onClick={() => setActiveTag(tab.tag)}
              className={classNames(
                tab.tag === activeTag
                  ? "text-black font-bold"
                  : "text-mydarkgrey hover:text-myorange",
                "text-sm"
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        <hr />
        <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
          {Object.keys(outerTagClassNamesPayload?.classes || []).map(
            className => (
              <button
                key={className}
                className="text-sm py-1 px-1.5 bg-mylightgrey/20 text-black rounded-md hover:bg-myorange/20"
                onClick={() => setSelectedStyle(className)}
              >
                {tailwindClasses[className].title}
              </button>
            )
          )}
        </div>
        <div className="my-6">Add new style selectbox</div>
      </div>
      {selectedStyle ? (
        <div
          className={classNames(type === `mobile` ? `w-5/12` : `w-full mt-8`)}
        >
          Selected style: {selectedStyle}
        </div>
      ) : null}
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

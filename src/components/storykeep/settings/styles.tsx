import { useState } from "react";
import { useStore } from "@nanostores/react";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
} from "../../../store/storykeep";
import { classNames } from "../../../utils/helpers";
import { tailwindClasses } from "../../../assets/tailwindClasses";
import { toolAddModeTitles } from "../../../constants";
import type { ToolAddMode, PaneAstTargetId } from "../../../types";

export const PaneAstStyles = (props: {
  id: string;
  targetId: PaneAstTargetId;
  type: "desktop" | "mobile";
}) => {
  const { id, targetId, type } = props;
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [id],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[id].current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const markdownDatum = $paneFragmentMarkdown[markdownFragmentId].current;
  console.log(targetId, markdownDatum);
  const markdownLookup =
    markdownDatum?.markdown?.htmlAst &&
    generateMarkdownLookup(markdownDatum.markdown.htmlAst);
  const thisTag = markdownLookup.nthTag[targetId.outerIdx] as ToolAddMode;
  const thisClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload[thisTag];
  console.log(markdownLookup);
  console.log(thisTag, toolAddModeTitles[thisTag]);
  console.log(thisClassNamesPayload);
  console.log(thisTag);

  return (
    <div
      className={classNames(
        `flex`,
        type === `mobile` ? `flex-nowrap gap-x-6` : `flex-wrap`
      )}
    >
      <div className={classNames(type === `mobile` ? `w-5/12` : `w-full`)}>
        <h4 className="font-bold mb-2">
          Styles on this {toolAddModeTitles[thisTag]}
        </h4>
        <div className="flex flex-wrap gap-x-3">
          {Object.keys(thisClassNamesPayload.classes || []).map(className => (
            <button
              key={className}
              className="py-2 px-2 bg-mylightgrey/20 text-black rounded-md"
              onClick={() => setSelectedStyle(className)}
            >
              {tailwindClasses[className].title}
            </button>
          ))}
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

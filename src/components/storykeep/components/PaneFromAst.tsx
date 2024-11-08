import { useCallback } from "react";
import {
  lastInteractedPaneStore,
  lastInteractedTypeStore,
  editModeStore, dragHandleStore,
} from "../../../store/storykeep";
import { lispLexer } from "../../../utils/concierge/lispLexer";
import { preParseAction } from "../../../utils/concierge/preParseAction";
import { AstToButton } from "../../../components/panes/AstToButton";
import EditableContent from "./EditableContent";
import { toHtml } from "hast-util-to-html";
import { getGlobalNth } from "../../../utils/compositor/markdownUtils";
import EraserWrapper from "./EraserWrapper";
import InsertWrapper from "./InsertWrapper";
import { wrapWithStylesIndicator } from "./StylesWrapper";
import { classNames } from "../../../utils/helpers";
import { Belief } from "@components/widgets/Belief";
import { IdentifyAs } from "@components/widgets/IdentifyAs";
import { ToggleBelief } from "@components/widgets/ToggleBelief";
import type { MouseEvent, ReactNode } from "react";
import type {
  ButtonData,
  FileNode,
  MarkdownLookup,
  MarkdownDatum,
  ToolAddMode,
  ToolMode,
} from "../../../types";
import type { Element as HastElement } from "hast";
import { useStore } from "@nanostores/react";

interface PaneFromAstProps {
  readonly: boolean;
  payload: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ast: any[];
    imageData: FileNode[];
    buttonData: { [key: string]: ButtonData };
  };
  markdown: MarkdownDatum;
  thisClassNames: { [key: string]: string | string[] };
  paneId: string;
  paneFragmentIds: string[];
  markdownFragmentId: string;
  slug: string;
  isContext: boolean;
  idx: number | null;
  outerIdx: number;
  markdownLookup: MarkdownLookup;
  queueUpdate: (id: string, updateFn: () => void) => void;
  toolMode: ToolMode;
  toolAddMode: ToolAddMode;
}

const EditableOuterWrapper = ({
  tooltip,
  onClick,
  id,
  children,
}: {
  tooltip: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  id: string;
  children: ReactNode;
}) => {
  return (
    <div
      id={id}
      className="relative cursor-pointer pointer-events-auto"
      title={tooltip}
    >
      {children}
      <div
        onClick={onClick}
        className="absolute inset-0 w-full h-full z-101 hover:bg-mylightgrey hover:bg-opacity-10 hover:outline-white/20
                   outline outline-2 outline-dotted outline-white/20 outline-offset-[-2px]
                   mix-blend-exclusion"
      />
    </div>
  );
};
const EditableInnerWrapper = ({
  tooltip,
  onClick,
  id,
  children,
}: {
  tooltip: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  id: string;
  children: ReactNode;
}) => {
  return (
    <span id={id} className="relative" title={tooltip}>
      {children}
      <span
        onClick={onClick}
        className="absolute inset-0 w-full h-full z-102 hover:bg-mylightgrey hover:bg-opacity-20 hover:outline-white
                   outline outline-2 outline-dashed outline-white/85 outline-offset-[-2px]
                   mix-blend-exclusion"
      />
    </span>
  );
};
const EditableInnerElementWrapper = ({
  tooltip,
  onClick,
  id,
  children,
}: {
  tooltip: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  id: string;
  children: ReactNode;
}) => {
  return (
    <div id={id} className="relative" title={tooltip}>
      {children}
      <div
        onClick={onClick}
        className="absolute inset-0 w-full h-full z-103 hover:bg-mylightgrey hover:bg-opacity-10 hover:outline-white
                   outline outline-2 outline-solid outline-white/10 outline-offset-[-2px]
                   mix-blend-exclusion"
      />
    </div>
  );
};

const ImageWrapper = ({
  children,
  showOverlay,
  toolMode,
  thisId,
  handleToolModeClick,
}: {
  children: ReactNode;
  showOverlay: boolean;
  toolMode: ToolMode;
  thisId: string;
  handleToolModeClick: () => void;
}) => {
  if (!showOverlay) return children;
  if (toolMode === "eraser") return children;
  if (toolMode === "styles") {
    return (
      <EditableInnerElementWrapper
        id={thisId}
        tooltip="Manage this image"
        onClick={handleToolModeClick}
      >
        {children}
      </EditableInnerElementWrapper>
    );
  }
  return children;
};

function buildComponentFromAst(
  payload: {
    ast: any[];
    imageData: FileNode[];
    buttonData: { [p: string]: ButtonData };
  },
  markdownLookup: MarkdownLookup,
  outerIdx: number,
  toolMode: "insert" | "text" | "styles" | "settings" | "pane" | "eraser",
  readonly: boolean,
  idx: number | null,
  paneId: string,
  thisClassNames: {
    [p: string]: string | string[];
  },
  slug: string,
  isContext: boolean,
  markdown: MarkdownDatum,
  markdownFragmentId: string,
  queueUpdate: (id: string, updateFn: () => void) => void,
  paneFragmentIds: string[],
  toolAddMode: ToolAddMode
) {
  const thisAst = payload.ast[0];
  const Tag = thisAst?.tagName || thisAst?.type;
  const outerGlobalNth =
    [`p`, `ul`, `ol`, `h2`, `h3`, `h4`].includes(Tag) &&
    markdownLookup?.nthTagLookup[Tag] &&
    markdownLookup.nthTagLookup[Tag][outerIdx] &&
    markdownLookup.nthTagLookup[Tag][outerIdx].nth;
  const isTextContainerItem =
    Tag === `li` &&
    markdownLookup?.nthTag[outerIdx] &&
    markdownLookup.nthTag[outerIdx] === `ol`;
  const showOverlay =
    [`text`, `styles`, `eraser`].includes(toolMode) && !readonly;
  const showInsertOverlay = [`insert`].includes(toolMode) && !readonly;
  const noOverlay = readonly || (!showOverlay && !showInsertOverlay);
  const globalNth = getGlobalNth(Tag, idx, outerIdx, markdownLookup);
  const thisId = `${paneId}-${Tag}-${outerIdx}${typeof idx === `number` ? `-${idx}` : ``}`;
  // is this an image?
  const isImage =
    typeof idx === `number` &&
    typeof markdownLookup.imagesLookup[outerIdx] !== `undefined`
      ? typeof markdownLookup.imagesLookup[outerIdx][idx] === `number`
      : false;
  // is this an inline code?
  const isWidget =
    typeof idx === `number` &&
    typeof markdownLookup.codeItemsLookup[outerIdx] !== `undefined`
      ? typeof markdownLookup.codeItemsLookup[outerIdx][idx] === `number`
      : false;
  const wrapContent = (content: ReactNode, span: boolean = false) =>
    wrapWithStylesIndicator(content, span, paneId, outerIdx, idx);
  const updateLastInteracted = (paneId: string) => {
    lastInteractedPaneStore.set(paneId);
    lastInteractedTypeStore.set(`markdown`);
  };
  const handleToolModeClick = useCallback(() => {
    const thisTag = isImage ? `img` : isWidget ? `code` : Tag;
    const thisGlobalNth = getGlobalNth(thisTag, idx, outerIdx, markdownLookup);
    updateLastInteracted(paneId);
    editModeStore.set({
      id: paneId,
      mode: `styles`,
      type: `pane`,
      targetId: {
        paneId,
        outerIdx,
        idx,
        globalNth: thisGlobalNth,
        tag: thisTag,
        mustConfig: toolMode === `text`,
      },
    });
  }, [thisId, toolMode, paneId, Tag, outerIdx, idx]);

  const handleToolModeLinkClick = useCallback(() => {
    const thisTag = isImage ? `img` : isWidget ? `code` : Tag;
    const thisGlobalNth = getGlobalNth(thisTag, idx, outerIdx, markdownLookup);
    updateLastInteracted(paneId);
    editModeStore.set({
      id: paneId,
      mode: `styles`,
      type: `pane`,
      targetId: {
        paneId,
        outerIdx,
        idx,
        globalNth: thisGlobalNth,
        tag: thisTag,
        buttonTarget,
        mustConfig: false,
      },
    });
  }, [paneId]);

  // Extract class names
  const injectClassNames =
    typeof thisAst?.tagName === `undefined`
      ? ``
      : typeof thisClassNames[Tag] === `string`
        ? (thisClassNames[Tag] as string)
        : typeof thisClassNames[Tag] === `object` &&
            typeof outerGlobalNth === `number` &&
            thisClassNames[Tag].length >= outerGlobalNth + 1
          ? (thisClassNames[Tag][outerGlobalNth] as string)
          : typeof thisClassNames[Tag] === `object` &&
              typeof globalNth === `number` &&
              !outerGlobalNth &&
              thisClassNames[Tag].length >= globalNth + 1
            ? (thisClassNames[Tag][globalNth] as string)
            : typeof thisClassNames[Tag] === `object`
              ? (thisClassNames[Tag][0] as string)
              : ``;

  // Handle button payload
  const buttonPayload =
    typeof thisAst.properties?.href === "string" &&
    thisAst.children[0]?.type === "text" &&
    typeof thisAst.children[0]?.value === "string" &&
    typeof payload?.buttonData === "object" &&
    Object.keys(payload?.buttonData).length &&
    thisAst.properties?.href &&
    typeof payload?.buttonData[thisAst.properties.href] !== "undefined"
      ? payload.buttonData[thisAst.properties.href]
      : undefined;
  const buttonTarget = buttonPayload && thisAst.properties.href;
  const callbackPayload =
    buttonPayload?.callbackPayload && lispLexer(buttonPayload?.callbackPayload);
  const targetUrl =
    callbackPayload && preParseAction(callbackPayload, slug, isContext);
  const isExternalUrl =
    (typeof targetUrl === "string" &&
      targetUrl.substring(0, 8) === "https://") ||
    (typeof thisAst.properties?.href === "string" &&
      thisAst.properties.href.substring(0, 8) === "https://");

  // Handle image properties
  const thisImage = payload?.imageData?.filter(
    (image: any) => image.filename === thisAst.properties?.src
  )[0];
  const altText =
    thisAst.properties?.alt ||
    thisImage?.altDescription ||
    "This should be descriptive text of an image | We apologize the alt text is missing.";
  const imageSrc = thisImage?.optimizedSrc || thisImage?.url || `/static.jpg`;
  const imageSrcSet = thisImage?.srcSet ? thisImage.optimizedSrc : null;

  // Handle code hooks
  const regexpHook =
    /(identifyAs|youtube|bunny|bunnyContext|toggle|resource|belief)\((.*?)\)/;
  const regexpValues = /((?:[^\\|]+|\\\|?)+)/g;
  const thisHookRaw =
    thisAst?.children?.length && thisAst.children[0].value?.match(regexpHook);
  const hook =
    thisHookRaw && typeof thisHookRaw[1] === "string" ? thisHookRaw[1] : null;
  const thisHookPayload =
    thisHookRaw && typeof thisHookRaw[2] === "string" ? thisHookRaw[2] : null;
  const thisHookValuesRaw =
    thisHookPayload && thisHookPayload.match(regexpValues);
  const value1 =
    thisHookValuesRaw && thisHookValuesRaw.length ? thisHookValuesRaw[0] : null;
  const value2 =
    thisHookValuesRaw && thisHookValuesRaw.length > 1
      ? thisHookValuesRaw[1]
      : null;
  const value3 =
    thisHookValuesRaw && thisHookValuesRaw.length > 2
      ? thisHookValuesRaw[2]
      : "";

  // if editable as text
  const renderContent = useCallback(() => {
    const processNode = (node: HastElement): HastElement => {
      if (node.tagName === "a") {
        const href = node.properties?.href as string;
        const buttonStyle = payload.buttonData[href]?.className || "";
        node.properties = {
          ...node.properties,
          class: buttonStyle,
          "data-href": href,
        };
      }
      if (node.children) {
        node.children = node.children.map(child =>
          "tagName" in child ? processNode(child as HastElement) : child
        );
      }
      return node;
    };

    const processedAst = processNode(thisAst as HastElement);
    return toHtml(processedAst);
  }, [thisAst, payload.buttonData]);

  if (
    !readonly &&
    markdown &&
    toolMode === `text` &&
    ([`p`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`].includes(Tag) ||
      isTextContainerItem)
  ) {
    const content = renderContent();

    return (
      <EditableContent
        content={content}
        tag={Tag}
        paneId={paneId}
        markdownFragmentId={markdownFragmentId}
        classes={injectClassNames}
        outerIdx={outerIdx}
        idx={idx}
        queueUpdate={queueUpdate}
      />
    );
  }

  // if set-up for recursive handling
  if (["p", "em", "strong", "ol", "ul", "li", "h2", "h3", "h4"].includes(Tag)) {
    const TagComponent =
      Tag !== `p`
        ? (Tag as keyof JSX.IntrinsicElements)
        : (`div` as keyof JSX.IntrinsicElements);
    const child = (
      <TagComponent className={injectClassNames}>
        {thisAst?.children?.map((p: any, childIdx: number) => (
          <PaneFromAst
            readonly={readonly}
            key={childIdx}
            payload={{ ...payload, ast: [p] }}
            markdown={markdown}
            thisClassNames={thisClassNames}
            paneId={paneId}
            paneFragmentIds={paneFragmentIds}
            markdownFragmentId={markdownFragmentId}
            slug={slug}
            isContext={isContext}
            idx={!idx ? childIdx : idx}
            outerIdx={outerIdx}
            markdownLookup={markdownLookup}
            toolMode={toolMode}
            toolAddMode={toolAddMode}
            queueUpdate={queueUpdate}
          />
        ))}
      </TagComponent>
    );

    if (noOverlay || [`ol`, `ul`, `strong`, `em`].includes(Tag)) return child;
    if (showOverlay && [`li`].includes(Tag)) {
      // is this a blockquote (not currently implemented)
      if (toolMode === `eraser`)
        return (
          <EraserWrapper
            paneId={paneId}
            fragmentId={markdownFragmentId}
            outerIdx={outerIdx}
            idx={idx}
            queueUpdate={queueUpdate}
            markdownLookup={markdownLookup}
          >
            {child}
          </EraserWrapper>
        );
      const tip = isImage
        ? `Manage this image`
        : isWidget
          ? `Manage this widget`
          : isTextContainerItem
            ? `Style this text`
            : `UNKNOWN`;
      if (tip && (toolMode === `styles` || isWidget || isImage))
        return (
          <EditableInnerElementWrapper
            id={thisId}
            tooltip={tip}
            onClick={handleToolModeClick}
          >
            {child}
          </EditableInnerElementWrapper>
        );
      else return child;
    }
    if (showOverlay) {
      if (toolMode === `eraser`)
        return (
          <EraserWrapper
            paneId={paneId}
            fragmentId={markdownFragmentId}
            outerIdx={outerIdx}
            idx={idx}
            queueUpdate={queueUpdate}
            markdownLookup={markdownLookup}
          >
            {child}
          </EraserWrapper>
        );

      const tip = toolMode === `styles` ? `Click to update style/design` : ``;
      if (tip)
        return wrapContent(
          <EditableOuterWrapper
            id={thisId}
            tooltip={tip}
            onClick={handleToolModeClick}
          >
            {child}
          </EditableOuterWrapper>,
          false
        );
    }
    if (showInsertOverlay) {
      return (
        <InsertWrapper
          isEmpty={false}
          fragmentId={markdownFragmentId}
          toolAddMode={toolAddMode}
          paneId={paneId}
          outerIdx={outerIdx}
          idx={idx}
          queueUpdate={queueUpdate}
          markdownLookup={markdownLookup}
        >
          {child}
        </InsertWrapper>
      );
    }
  }

  // can we render component based on Tag
  if (Tag === "text") return thisAst.value;
  if (Tag === "br") return <br />;

  // other edge cases
  if (Tag === "a" && isExternalUrl) {
    const child = (
      <a
        target="_blank"
        rel="noreferrer"
        className={classNames(
          `pointer-events-none`,
          buttonPayload?.className || injectClassNames
        )}
        href={targetUrl || thisAst.properties.href}
      >
        {thisAst.children[0].value}
      </a>
    );
    if (!showOverlay) return wrapContent(child, true);
    if (toolMode === `eraser`) return wrapContent(child, true);
    if (toolMode === `styles`)
      return wrapContent(
        <EditableInnerWrapper
          id={thisId}
          tooltip={`Manage this Link`}
          onClick={handleToolModeLinkClick}
        >
          {child}
        </EditableInnerWrapper>,
        true
      );
  }
  if (
    Tag === "a" &&
    !isExternalUrl &&
    buttonPayload &&
    thisAst.children[0].type === "text" &&
    thisAst.children[0].value
  ) {
    const child = (
      <AstToButton
        className={classNames(
          `pointer-events-none`,
          buttonPayload.className || ""
        )}
        callbackPayload={callbackPayload}
        targetUrl={targetUrl}
        slug={slug}
        paneId={paneId}
        text={thisAst.children[0].value}
      />
    );
    if (!showOverlay) return wrapContent(child, true);
    if (toolMode === `eraser`) return wrapContent(child, true);
    if (toolMode === `styles`)
      return wrapContent(
        <EditableInnerWrapper
          id={thisId}
          tooltip={`Manage this Link`}
          onClick={handleToolModeLinkClick}
        >
          {child}
        </EditableInnerWrapper>,
        true
      );
  }

  if (Tag === "img" && imageSrc && imageSrcSet) {
    return (
      <ImageWrapper
        showOverlay={showOverlay}
        toolMode={toolMode}
        thisId={thisId}
        handleToolModeClick={handleToolModeClick}
      >
        <img
          className={injectClassNames}
          src={imageSrcSet.split(" ")[0]}
          srcSet={imageSrcSet}
          alt={altText}
        />
      </ImageWrapper>
    );
  } else if (Tag === "img" && imageSrc) {
    return (
      <ImageWrapper
        showOverlay={showOverlay}
        toolMode={toolMode}
        thisId={thisId}
        handleToolModeClick={handleToolModeClick}
      >
        <img className={injectClassNames} src={imageSrc} alt={altText} />
      </ImageWrapper>
    );
  }

  if (Tag === "code") {
    let widgetContent;
    if (hook === "resource" && value1) {
      widgetContent = (
        <div className={injectClassNames}>
          <div>
            <strong>Resource Template (not yet implemented):</strong> {value1},{" "}
            {value2}
          </div>
        </div>
      );
    }

    if (hook === "youtube" && value1 && value2) {
      widgetContent = (
        <div className={injectClassNames}>
          <div>
            <strong>YouTube Video Embed Code:</strong> {value1} ({value2})
          </div>
        </div>
      );
    }

    if (hook === "bunny" && value1 && value2) {
      widgetContent = (
        <div className={injectClassNames}>
          <div>
            <strong>Bunny Video Embed Code:</strong> {value1} ({value2})
          </div>
        </div>
      );
    }

    if (hook === "bunnyContext" && value1 && value2) {
      widgetContent = (
        <div className={injectClassNames}>
          <div>
            <strong>Bunny Video Embed Code on Context Page:</strong> {value1} (
            {value2})
          </div>
        </div>
      );
    }

    if (hook === "belief" && value1 && value2) {
      widgetContent = (
        <div className={injectClassNames}>
          <Belief
            key={value2}
            value={{ slug: value1, scale: value2, extra: value3 }}
            readonly={true}
          />
        </div>
      );
    }

    if (hook === "identifyAs" && value1 && value2) {
      widgetContent = (
        <div className={injectClassNames}>
          <IdentifyAs
            value={{ slug: value1, target: value2, extra: value3 || `` }}
            readonly={true}
          />
        </div>
      );
    }

    if (hook === "toggle" && value1 && value2) {
      widgetContent = (
        <div className={injectClassNames}>
          <ToggleBelief belief={value1} prompt={value2} readonly={true} />
        </div>
      );
    }

    if (widgetContent) {
      const isInlineWidget = false;
      if (!showOverlay) return wrapContent(widgetContent, isInlineWidget);
      if (toolMode === `eraser`)
        return wrapContent(widgetContent, isInlineWidget);
      if (toolMode === `styles`)
        return wrapContent(
          <EditableInnerElementWrapper
            id={thisId}
            tooltip={`Manage this Widget`}
            onClick={handleToolModeClick}
          >
            {widgetContent}
          </EditableInnerElementWrapper>,
          isInlineWidget
        );
      else return widgetContent;
    }
  }

  console.log(`missed on Tag:${Tag}`, thisAst);
  return <div className="bg-myorange text-black">{`missed on Tag:${Tag}`}</div>;
}

const PaneFromAst = ({
  readonly,
  payload,
  markdown,
  thisClassNames,
  paneId,
  paneFragmentIds,
  markdownFragmentId,
  slug,
  isContext,
  idx = null,
  outerIdx,
  markdownLookup,
  toolMode,
  toolAddMode,
  queueUpdate,
}: PaneFromAstProps) => {
  const dragState = useStore(dragHandleStore);

  const component = buildComponentFromAst(
    payload,
    markdownLookup,
    outerIdx,
    toolMode,
    readonly,
    idx,
    paneId,
    thisClassNames,
    slug,
    isContext,
    markdown,
    markdownFragmentId,
    queueUpdate,
    paneFragmentIds,
    toolAddMode
  );

  const canDrawGhostBlock = (): boolean => {
    const el = dragState.hoverElement;
    if(!el) return false;

    return el.fragmentId === markdownFragmentId
      && el.paneId === paneId
      && el.idx === idx
      && el.outerIdx === outerIdx;
  };

  const drawGhostBlock = () => {
    return (<div className={`w-full bg-blue-200 h-20`}/>);
  }

  if(canDrawGhostBlock()) {
    return (
      <div>
        {dragState.hoverElement?.location === "before" && drawGhostBlock()}
        {component}
        {dragState.hoverElement?.location === "after" && drawGhostBlock()}
      </div>
    );
  } else {
    return component;
  }
};

export default PaneFromAst;

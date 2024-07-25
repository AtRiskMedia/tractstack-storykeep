import { lispLexer } from "../../../utils/concierge/lispLexer";
import { preParseAction } from "../../../utils/concierge/preParseAction";
import { AstToButton } from "../../../components/panes/AstToButton";
import type { ReactNode } from "react";
import type { ButtonData, FileNode, MarkdownLookup } from "../../../types";

interface PaneFromAstProps {
  payload: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ast: any[];
    imageData: FileNode[];
    buttonData: { [key: string]: ButtonData };
  };
  thisClassNames: { [key: string]: string | string[] };
  paneId: string;
  slug: string;
  idx: number | null;
  outerIdx: number;
  markdownLookup?: MarkdownLookup;
  toolMode: string;
}

const EditableOuterWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative">
      {children}
      <div
        style={{ outline: "2px dashed purple" }}
        className="absolute inset-0 w-full h-full z-101 hover:bg-myorange/10"
      />
    </div>
  );
};
const EditableInnerWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <span className="relative">
      {children}
      <span
        style={{ outline: "1px dashed red" }}
        className="absolute inset-0 w-full h-full z-102 hover:bg-myorange/20"
      />
    </span>
  );
};
const EditableInnerElementWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative">
      {children}
      <div
        style={{ outline: "1px solid red" }}
        className="absolute inset-0 w-full h-full z-103 hover:bg-myorange/50"
      />
    </div>
  );
};

const PaneFromAst = ({
  payload,
  thisClassNames,
  paneId,
  slug,
  idx = null,
  outerIdx,
  markdownLookup,
  toolMode,
}: PaneFromAstProps) => {
  const thisAst = payload.ast[0];

  const Tag = thisAst?.tagName || thisAst?.type;
  let globalNth: number | undefined = undefined;

  switch (Tag) {
    case `li`:
      if (
        idx &&
        markdownLookup?.listItemsLookup &&
        markdownLookup.listItemsLookup[outerIdx] &&
        typeof markdownLookup.listItemsLookup[outerIdx][idx] === `number`
      )
        globalNth = markdownLookup.listItemsLookup[outerIdx][idx];
      break;
    case `img`:
      if (
        idx &&
        markdownLookup?.imagesLookup &&
        markdownLookup.imagesLookup[outerIdx] &&
        typeof markdownLookup.imagesLookup[outerIdx][idx] === `number`
      )
        globalNth = markdownLookup.imagesLookup[outerIdx][idx];
      break;
    case `code`:
      if (
        idx &&
        markdownLookup?.codeItemsLookup &&
        markdownLookup.codeItemsLookup[outerIdx] &&
        typeof markdownLookup.codeItemsLookup[outerIdx][idx] === `number`
      )
        globalNth = markdownLookup.codeItemsLookup[outerIdx][idx];
      break;
    case `a`:
      if (
        idx &&
        markdownLookup?.linksLookup &&
        markdownLookup.linksLookup[outerIdx] &&
        typeof markdownLookup.linksLookup[outerIdx][idx] === `number`
      )
        globalNth = markdownLookup.linksLookup[outerIdx][idx];
      break;
  }

  const injectClassNames =
    typeof thisAst?.tagName === `undefined`
      ? ``
      : typeof thisClassNames[Tag] === `string`
        ? (thisClassNames[Tag] as string)
        : typeof thisClassNames[Tag] === `object` &&
            globalNth &&
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

  const callbackPayload =
    buttonPayload?.callbackPayload && lispLexer(buttonPayload?.callbackPayload);
  const targetUrl = callbackPayload && preParseAction(callbackPayload);
  const isExternalUrl =
    (typeof targetUrl === "string" &&
      targetUrl.substring(0, 8) === "https://") ||
    (typeof thisAst.properties?.href === "string" &&
      thisAst.properties.href.substring(0, 8) === "https://");

  // Handle image properties
  const altText =
    thisAst.properties?.alt ||
    "This should be descriptive text of an image | We apologize the alt text is missing.";
  const thisImage = payload?.imageData?.filter(
    (image: any) => image.filename === thisAst.properties?.src
  )[0];
  const imageSrc = thisImage?.optimizedSrc || thisImage?.src || null;

  // Handle code hooks
  const regexpHook =
    /(identifyAs|youtube|bunny|toggle|resource|belief)\((.*?)\)/;
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

  const isParent = typeof idx !== `number` || Tag === `li`;

  // Render component based on Tag
  if (Tag === "text") return thisAst.value;
  if (Tag === "br") return <br />;

  if (
    [
      "p",
      "em",
      "strong",
      "ol",
      "ul",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ].includes(Tag)
  ) {
    const TagComponent = Tag as keyof JSX.IntrinsicElements;
    const child = (
      <TagComponent className={injectClassNames}>
        {thisAst?.children?.map((p: any, childIdx: number) => (
          <PaneFromAst
            key={childIdx}
            payload={{ ...payload, ast: [p] }}
            thisClassNames={thisClassNames}
            paneId={paneId}
            slug={slug}
            idx={!idx ? childIdx : idx}
            outerIdx={outerIdx}
            markdownLookup={markdownLookup}
            toolMode={toolMode}
          />
        ))}
      </TagComponent>
    );
    if (toolMode !== `text` || !isParent || [`ol`, `ul`].includes(Tag))
      return child;
    if ([`li`].includes(Tag))
      return <EditableInnerElementWrapper>{child}</EditableInnerElementWrapper>;
    if ([`strong`, `em`].includes(Tag))
      return <EditableInnerWrapper>{child}</EditableInnerWrapper>;
    return <EditableOuterWrapper>{child}</EditableOuterWrapper>;
  }

  if (Tag === "a" && isExternalUrl) {
    const child = (
      <a
        target="_blank"
        rel="noreferrer"
        className={buttonPayload?.className || injectClassNames}
        href={targetUrl || thisAst.properties.href}
      >
        {thisAst.children[0].value}
      </a>
    );
    if (toolMode !== `text`) return child;
    return <EditableInnerWrapper>{child}</EditableInnerWrapper>;
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
        className={buttonPayload.className || ""}
        callbackPayload={callbackPayload}
        targetUrl={targetUrl}
        slug={slug}
        paneId={paneId}
        text={thisAst.children[0].value}
      />
    );
    if (toolMode !== `text`) return child;
    return <EditableInnerWrapper>{child}</EditableInnerWrapper>;
  }

  if (Tag === "img" && imageSrc) {
    return <img className={injectClassNames} src={imageSrc} alt={altText} />;
  }

  if (Tag === "code") {
    if (hook === "youtube" && value1) {
      return <div className={injectClassNames}>YouTubeWrapper: {value1}</div>;
    }

    if (hook === "bunny" && value1 && value2) {
      return (
        <div className={injectClassNames}>
          BunnyVideo: {value1} {value2}
        </div>
      );
    }

    if (hook === "belief" && value1 && value2) {
      return (
        <div className={injectClassNames}>
          Belief slug: {value1}, scale: {value2}, extra: {value3}
        </div>
      );
    }

    if (hook === "identifyAs" && value1 && value2) {
      return (
        <div className={injectClassNames}>
          IdentifyAs: slug: {value1}, target: {value2}, extra: {value3}
        </div>
      );
    }

    if (hook === "toggle" && value1 && value2) {
      return (
        <div className={injectClassNames}>
          ToggleBelief {value1} {value2}
        </div>
      );
    }
  }

  return null;
};

export default PaneFromAst;

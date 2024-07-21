import { classNames } from "../../../utils/helpers";
import { lispLexer } from "../../../utils/concierge/lispLexer";
import { preParseAction } from "../../../utils/concierge/preParseAction";
import { AstToButton } from "../../../components/panes/AstToButton";
import type { ButtonData, FileNode } from "../../../types";

interface PaneFromAstProps {
  payload: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ast: any[];
    imageData: FileNode[];
    buttonData: { [key: string]: ButtonData };
  };
  thisClassNames: { [key: string]: string | string[] };
  memory: { [key: string]: number };
  paneId: string;
  slug: string;
  idx: number;
  outerIdx: number;
  offset?: number;
}

const PaneFromAst = ({
  payload,
  thisClassNames,
  memory: initialMemory,
  paneId,
  slug,
  idx,
  outerIdx,
  offset = 0,
}: PaneFromAstProps) => {
  const memory = { ...initialMemory };

  const thisAst = payload.ast[0];

  const Tag = thisAst?.tagName || thisAst?.type;

  if (Tag && typeof thisClassNames[Tag] === `object`) {
    if (typeof memory[Tag] !== `undefined`) memory[Tag] = memory[Tag] + 1;
    else memory[Tag] = offset;
  }
  const injectClassNames =
    typeof thisAst?.tagName === `undefined`
      ? ``
      : typeof thisClassNames[Tag] === `object` &&
          thisClassNames[Tag].length >= offset + 1
        ? (thisClassNames[Tag][offset] as string)
        : typeof thisClassNames[Tag] === `string`
          ? (thisClassNames[Tag] as string)
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
  const injectClassNamesImgWrapper =
    thisAst.tagName &&
    typeof thisClassNames.imgWrapper !== `undefined` &&
    typeof thisClassNames.imgWrapper === `string`
      ? thisClassNames.imgWrapper
      : thisAst.tagName &&
          typeof thisClassNames.imgWrapper !== `undefined` &&
          typeof thisClassNames.imgWrapper === `object`
        ? thisClassNames.imgWrapper[
            thisAst.tagName && typeof memory.imgWrapper !== `undefined`
              ? memory.imgWrapper + 1
              : 0
          ]
        : ``;
  const injectClassNamesImg =
    thisAst.tagName &&
    typeof thisClassNames.img !== `undefined` &&
    typeof thisClassNames.img === `string`
      ? thisClassNames.img
      : thisAst.tagName &&
          typeof thisClassNames.img !== `undefined` &&
          typeof thisClassNames.img === `object`
        ? thisClassNames.img[
            thisAst.tagName && typeof memory.img !== `undefined`
              ? memory.img + 1
              : 0
          ]
        : ``;
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
    return (
      <TagComponent className={injectClassNames}>
        {thisAst?.children?.map((p: any, childIdx: number) => (
          <PaneFromAst
            key={childIdx}
            payload={{ ...payload, ast: [p] }}
            thisClassNames={thisClassNames}
            memory={memory}
            paneId={paneId}
            slug={slug}
            idx={idx}
            outerIdx={outerIdx}
            offset={childIdx}
          />
        ))}
      </TagComponent>
    );
  }

  if (Tag === "a" && isExternalUrl) {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        className={buttonPayload?.className || injectClassNames}
        href={targetUrl || thisAst.properties.href}
      >
        {thisAst.children[0].value}
      </a>
    );
  }

  if (
    Tag === "a" &&
    !isExternalUrl &&
    buttonPayload &&
    thisAst.children[0].type === "text" &&
    thisAst.children[0].value
  ) {
    return (
      <AstToButton
        className={buttonPayload.className || ""}
        callbackPayload={callbackPayload}
        targetUrl={targetUrl}
        slug={slug}
        paneId={paneId}
        text={thisAst.children[0].value}
      />
    );
  }

  if (Tag === "img" && imageSrc) {
    return (
      <img
        className={classNames(
          injectClassNames,
          injectClassNamesImgWrapper,
          injectClassNamesImg
        )}
        src={imageSrc}
        alt={altText}
      />
    );
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

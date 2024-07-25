import { useStore } from "@nanostores/react";
import PaneFromAst from "./PaneFromAst";
import { SvgInsideLeftModal } from "../../panes/SvgInsideLeftModal";
import { SvgInsideRightModal } from "../../panes/SvgInsideRightModal";
import { classNames } from "../../../utils/helpers";
import { reduceClassNamesPayload } from "../../../utils/compositor/reduceClassNamesPayload";
import { viewportStore } from "../../../store/storykeep";
import type { ReactNode } from "react";
import type {
  FileNode,
  MarkdownDatum,
  MarkdownPaneDatum,
  MarkdownLookup,
  OptionsPayloadDatum,
  ViewportKey,
} from "../../../types";

interface Props {
  payload: MarkdownPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneHeight: [number, number, number];
  modalPayload: {
    [key: string]: {
      zoomFactor: number;
      paddingLeft: number;
      paddingTop: number;
    };
  };
  paneId: string;
  slug: string;
  markdownLookup: MarkdownLookup;
  toolMode: string;
}

const MarkdownInsideModal = ({
  payload,
  markdown,
  files,
  paneHeight,
  modalPayload,
  paneId,
  slug,
  markdownLookup,
  toolMode,
}: Props) => {
  const $viewport = useStore(viewportStore) as { value: ViewportKey };
  const viewportKey: ViewportKey =
    $viewport?.value && $viewport.value !== "auto" ? $viewport.value : null;
  const optionsPayload = payload.optionsPayload;
  const optionsPayloadDatum: OptionsPayloadDatum =
    optionsPayload && reduceClassNamesPayload(optionsPayload);
  const baseClasses: { [key: string]: string } = {
    mobile:
      viewportKey === "mobile" ? "grid" : viewportKey ? "hidden" : "md:hidden",
    tablet:
      viewportKey === "tablet"
        ? "grid"
        : viewportKey
          ? "hidden"
          : "hidden md:grid xl:hidden",
    desktop:
      viewportKey === "desktop"
        ? "grid"
        : viewportKey
          ? "hidden"
          : "hidden xl:grid",
  };
  const paneFragmentStyle = {
    gridArea: "1/1/1/1",
  };

  const viewportLookup =
    viewportKey && [`mobile`, `tablet`, `desktop`].includes(viewportKey)
      ? [viewportKey]
      : ["mobile", "tablet", "desktop"];
  const payloads = viewportLookup.map((_viewportKey: string) => {
    if (payload.hiddenViewports.includes(_viewportKey)) return null;

    const shapeName =
      _viewportKey === `desktop`
        ? payload.textShapeOutsideDesktop
        : _viewportKey === `tablet`
          ? payload.textShapeOutsideTablet
          : _viewportKey === `mobile`
            ? payload.textShapeOutsideMobile
            : payload.textShapeOutside;
    const astPayload = {
      ast: markdown.htmlAst.children,
      buttonData: optionsPayload?.buttons || {},
      imageData: files,
    };
    const injectClassNames =
      (viewportKey &&
        optionsPayloadDatum?.classNames &&
        optionsPayloadDatum?.classNames[viewportKey]) ||
      optionsPayloadDatum?.classNames?.all ||
      optionsPayload?.classNames?.all ||
      {};
    const classNamesParentRaw =
      (viewportKey &&
        optionsPayloadDatum?.classNamesParent &&
        optionsPayloadDatum?.classNamesParent[viewportKey]) ||
      optionsPayloadDatum?.classNamesParent?.all ||
      optionsPayload?.classNamesParent?.all ||
      ``;
    const classNamesParent = Array.isArray(classNamesParentRaw)
      ? classNamesParentRaw
      : [classNamesParentRaw];

    return {
      shapeName,
      astPayload,
      injectClassNames,
      classNamesParent,
      viewportKey: _viewportKey,
    };
  });

  return (
    <>
      {payloads.map((thisPayload, index) =>
        thisPayload ? (
          <div key={index}>
            {(thisPayload.classNamesParent as string[])
              .slice()
              .reverse()
              .reduce(
                (content: ReactNode, cssClass: string) => (
                  <div className={cssClass}>{content}</div>
                ),
                <div
                  className={classNames(
                    Array.isArray(thisPayload.classNamesParent)
                      ? thisPayload.classNamesParent.join(` `)
                      : ``,
                    (thisPayload.viewportKey &&
                      baseClasses[thisPayload.viewportKey]) ||
                      ``,
                    `h-fit-contents`
                  )}
                >
                  <div
                    className="relative w-full h-full justify-self-start"
                    style={paneFragmentStyle}
                  >
                    <SvgInsideLeftModal
                      shapeName={thisPayload.shapeName || ``}
                      viewportKey={thisPayload.viewportKey}
                      id={`markdown-${paneId}`}
                      paneHeight={
                        paneHeight[
                          thisPayload.viewportKey === `desktop`
                            ? 2
                            : thisPayload.viewportKey === `tablet`
                              ? 1
                              : 0
                        ]
                      }
                      modalPayload={modalPayload[thisPayload.viewportKey]}
                    />
                    <SvgInsideRightModal
                      shapeName={thisPayload.shapeName || ``}
                      viewportKey={thisPayload.viewportKey}
                      id={`markdown-${paneId}`}
                      paneHeight={
                        paneHeight[
                          thisPayload.viewportKey === `desktop`
                            ? 2
                            : thisPayload.viewportKey === `tablet`
                              ? 1
                              : 0
                        ]
                      }
                      modalPayload={modalPayload[thisPayload.viewportKey]}
                    />
                    {thisPayload.astPayload.ast
                      .filter(
                        /* eslint-disable @typescript-eslint/no-explicit-any */
                        (e: any) => !(e?.type === `text` && e?.value === `\n`)
                      )
                      /* eslint-disable @typescript-eslint/no-explicit-any */
                      .map((thisAstPayload: any, idx: number) => (
                        <PaneFromAst
                          key={idx}
                          payload={{
                            ...thisPayload.astPayload,
                            ast: [thisAstPayload],
                          }}
                          thisClassNames={
                            thisPayload.injectClassNames as {
                              [key: string]: string | string[];
                            }
                          }
                          paneId={paneId}
                          slug={slug}
                          idx={null}
                          outerIdx={idx}
                          markdownLookup={markdownLookup}
                          toolMode={toolMode}
                        />
                      ))}
                  </div>
                </div>
              )}
          </div>
        ) : null
      )}
    </>
  );
};

export default MarkdownInsideModal;

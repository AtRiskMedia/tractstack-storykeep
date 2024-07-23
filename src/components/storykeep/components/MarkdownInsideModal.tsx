import PaneFromAst from "./PaneFromAst";
import { SvgInsideLeftModal } from "../../panes/SvgInsideLeftModal";
import { SvgInsideRightModal } from "../../panes/SvgInsideRightModal";
import { classNames } from "../../../utils/helpers";
import type {
  FileNode,
  MarkdownDatum,
  MarkdownPaneDatum,
  MarkdownLookup,
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
}: Props) => {
  const optionsPayload = payload.optionsPayload;
  const baseClasses: { [key: string]: string } = {
    mobile: `md:hidden`,
    tablet: `hidden md:grid xl:hidden`,
    desktop: `hidden xl:grid`,
  };
  const paneFragmentStyle = {
    gridArea: "1/1/1/1",
  };

  const payloads = ["mobile", "tablet", "desktop"].map(
    (viewportKey: string) => {
      if (payload.hiddenViewports.includes(viewportKey)) return null;

      const shapeName =
        viewportKey === `desktop`
          ? payload.textShapeOutsideDesktop
          : viewportKey === `tablet`
            ? payload.textShapeOutsideTablet
            : viewportKey === `mobile`
              ? payload.textShapeOutsideMobile
              : payload.textShapeOutside;
      const astPayload = {
        ast: markdown.htmlAst.children,
        buttonData: optionsPayload?.buttons || {},
        imageData: files,
      };
      const injectClassNames = optionsPayload?.classNames?.all || {};
      const classNamesParentRaw = optionsPayload?.classNamesParent
        ? optionsPayload.classNamesParent?.all
        : ``;
      const classNamesParent =
        typeof classNamesParentRaw === `string`
          ? [classNamesParentRaw]
          : classNamesParentRaw;
      return {
        shapeName,
        astPayload,
        injectClassNames,
        classNamesParent,
        viewportKey,
      };
    }
  );

  return (
    <>
      {payloads.map((thisPayload, index) =>
        thisPayload ? (
          <div key={index}>
            {thisPayload.classNamesParent
              .slice()
              .reverse()
              .reduce(
                (content, cssClass) => (
                  <div className={cssClass}>{content}</div>
                ),
                <div
                  className={classNames(
                    thisPayload.classNamesParent.join(` `) || ``,
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
                          thisClassNames={thisPayload.injectClassNames || ``}
                          paneId={paneId}
                          slug={slug}
                          idx={null}
                          outerIdx={idx}
                          markdownLookup={markdownLookup}
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

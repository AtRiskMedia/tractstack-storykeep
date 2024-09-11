import PreviewPaneRenderer from "./PreviewPaneRenderer";
import preparePreviewPane from "../../../utils/compositor/preparePreviewPane";
import type { ViewportAuto, PaneDesign } from "../../../types";

interface PreviewPaneProps {
  design: PaneDesign;
  viewportKey: ViewportAuto;
  slug: string;
  isContext: boolean;
}

const PreviewPane = ({
  design,
  viewportKey,
  slug,
  isContext,
}: PreviewPaneProps) => {
  const paneData = preparePreviewPane(design);
  if (design?.panePayload?.codeHook)
    return (
      <div className="bg-yellow-300 p-4 rounded-md text-center">
        <h2 className="text-xl text-black font-bold mb-2">
          Code Hook: {design.panePayload.codeHook}
        </h2>
      </div>
    );
  return (
    <div className="relative">
      <PreviewPaneRenderer
        paneData={paneData}
        viewportKey={viewportKey}
        toolMode="text"
        toolAddMode="p"
        slug={slug}
        isContext={isContext}
      />
      <div className="absolute inset-0 z-[1999]" />
    </div>
  );
};

export default PreviewPane;

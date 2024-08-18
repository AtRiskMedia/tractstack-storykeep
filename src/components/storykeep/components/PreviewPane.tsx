import PreviewPaneRenderer from "./PreviewPaneRenderer";
import preparePreviewPane from "../../../utils/compositor/preparePreviewPane";
import type { ViewportAuto, PaneDesign } from "../../../types";

interface PreviewPaneProps {
  design: PaneDesign;
  viewportKey: ViewportAuto;
}

const PreviewPane = ({ design, viewportKey }: PreviewPaneProps) => {
  const paneData = preparePreviewPane(design);

  return (
    <div className="relative">
      <PreviewPaneRenderer
        paneData={paneData}
        viewportKey={viewportKey}
        toolMode="text"
        toolAddMode="p"
      />
      <div className="absolute inset-0 z-[8999]" />
    </div>
  );
};

export default PreviewPane;

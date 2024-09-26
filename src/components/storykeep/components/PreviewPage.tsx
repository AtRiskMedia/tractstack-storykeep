import PreviewPane from "./PreviewPane";
import type { ViewportAuto, PageDesign } from "../../../types";

interface PreviewPageProps {
  design: PageDesign;
  viewportKey: ViewportAuto;
  slug: string;
  isContext: boolean;
}

const PreviewPage = ({
  design,
  viewportKey,
  slug,
  isContext,
}: PreviewPageProps) => {
  if (!design || !design.paneDesigns || design.paneDesigns.length === 0) {
    console.error(
      "Invalid or empty page design received in PreviewPage:",
      design
    );
    return <div>Error: Invalid or empty page design</div>;
  }

  return (
    <div className="space-y-4">
      {design.paneDesigns.map((paneDesign, index) => (
        <div key={paneDesign.id || index} className="overflow-hidden">
          <PreviewPane
            design={paneDesign}
            viewportKey={viewportKey}
            slug={slug}
            isContext={isContext}
          />
        </div>
      ))}
    </div>
  );
};

export default PreviewPage;

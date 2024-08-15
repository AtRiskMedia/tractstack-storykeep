import { useMemo } from "react";
import type { PaneDesign, ViewportKey } from "../../../types";

interface PreviewPaneProps {
  design: PaneDesign;
  viewportKey: ViewportKey;
}

const PreviewPane = ({ design, viewportKey }: PreviewPaneProps) => {
  const memoizedPaneData = useMemo(() => ({}), [design, viewportKey]);
  console.log(`memoized:`, memoizedPaneData);

  return <div>PreviewPane</div>;
};

export default PreviewPane;

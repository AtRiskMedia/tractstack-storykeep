import { useState } from "react";
import { ContentSearchCombobox } from "./ContentSearchCombobox";
import type { FullContentMap } from "../../../types";

interface ContentSearchWrapperProps {
  contentMap: FullContentMap[];
}

export function ContentSearchWrapper({
  contentMap,
}: ContentSearchWrapperProps) {
  const [selectedItem, setSelectedItem] = useState<FullContentMap | null>(null);

  const handleSelect = (item: FullContentMap) => {
    setSelectedItem(item);
    // Here you can add logic to navigate to the selected item or perform other actions
  };

  return (
    <div className="max-w-xl">
      <ContentSearchCombobox items={contentMap} onSelect={handleSelect} />
      {selectedItem && (
        <div className="mt-4">
          <h3 className="text-xs font-bold">Selected Item:</h3>
          <pre className="mt-2 p-2 bg-mylightgrey rounded-md overflow-auto text-xs">
            {JSON.stringify(selectedItem, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

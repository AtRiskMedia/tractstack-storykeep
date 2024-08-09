import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  unsavedChangesStore,
} from "../../../store/storykeep";
import {
  removeElementFromMarkdown,
  updateHistory,
} from "../../../utils/compositor/markdownUtils";
import type { ReactNode } from "react";

interface Props {
  fragmentId: string;
  paneId: string;
  outerIdx: number;
  idx: number | null;
  children: ReactNode;
}

const EraserWrapper = ({
  fragmentId,
  paneId,
  outerIdx,
  idx,
  children,
}: Props) => {
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const $unsavedChanges = useStore(unsavedChangesStore);

  const handleErase = () => {
    const currentField = $paneFragmentMarkdown[fragmentId];
    const newMarkdownEdit = removeElementFromMarkdown(
      currentField.current,
      outerIdx,
      idx
    );

    const now = Date.now();
    const newHistory = updateHistory(currentField, now);

    paneFragmentMarkdown.setKey(fragmentId, {
      ...currentField,
      current: newMarkdownEdit,
      history: newHistory,
    });

    unsavedChangesStore.setKey(paneId, {
      ...$unsavedChanges[paneId],
      paneFragmentMarkdown: true,
    });
  };

  return (
    <span className="relative">
      {children}
      <span
        onClick={handleErase}
        title="Delete this!"
        className="absolute inset-0 w-full h-full z-101 hover:bg-myorange hover:bg-opacity-20 hover:outline-white/20
                   outline outline-2 outline-dashed outline-myorange/50 outline-offset-[-2px]
                   mix-blend-exclusion cursor-pointer"
      />
    </span>
  );
};

export default EraserWrapper;

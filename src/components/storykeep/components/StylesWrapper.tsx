import { useStore } from "@nanostores/react";
import { editModeStore } from "../../../store/storykeep";
import type { ReactNode } from "react";

interface Props {
  paneId: string;
  outerIdx: number;
  idx: number | null;
  children: ReactNode;
}

const StylesWrapper = ({ paneId, outerIdx, idx, children }: Props) => {
  const $editMode = useStore(editModeStore);

  const isActive =
    $editMode?.type === "pane" &&
    $editMode.mode === "styles" &&
    $editMode.id === paneId &&
    $editMode.targetId?.outerIdx === outerIdx &&
    $editMode.targetId?.idx === idx;

  if (!isActive) return children;

  return (
    <div className="relative">
      {children}
      <div
        className="absolute inset-0 w-full h-full z-101 pointer-events-none
                   outline-2 outline-dashed outline-myorange outline-offset-[-2px]
                   mix-blend-exclusion"
      />
    </div>
  );
};

export default StylesWrapper;

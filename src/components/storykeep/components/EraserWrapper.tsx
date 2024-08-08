import { useStore } from "@nanostores/react";
import { paneFragmentMarkdown } from "../../../store/storykeep";
import { classNames } from "../../../utils/helpers";
import type { ReactNode } from "react";

interface Props {
  fragmentId: string;
  outerIdx: number;
  idx: number | null;
  children: ReactNode;
}

const EraserWrapper = ({ fragmentId, outerIdx, idx, children }: Props) => {
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const onClick = () => {
    console.log(fragmentId, outerIdx, idx);
    console.log($paneFragmentMarkdown[fragmentId].current.markdown.body);
  };
  return (
    <span className="relative">
      {children}
      <span
        onClick={onClick}
        title="Delete this!"
        className={classNames(
          typeof idx === `number` ? `z-103` : `z-101`,
          `absolute inset-0 w-full h-full hover:bg-myorange hover:bg-opacity-20 hover:outline-white/20
                   outline outline-2 outline-dashed outline-myorange/50 outline-offset-[-2px]
                   mix-blend-exclusion`
        )}
      />
    </span>
  );
};
export default EraserWrapper;

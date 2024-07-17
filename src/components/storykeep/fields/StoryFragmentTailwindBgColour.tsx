import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { storyFragmentTailwindBgColour } from "../../../store/storykeep";
import ColorPickerWrapper from "../components/ColorPickerWrapper";
import { tailwindToHex, debounce } from "../../../utils/helpers";
import type { StoreKey } from "../../../types";

interface StoryFragmentTailwindBgColourProps {
  id: string;
  updateStoreField: (storeKey: StoreKey, newValue: string) => boolean;
  handleUndo: (storeKey: StoreKey) => void;
}

const StoryFragmentTailwindBgColour = ({
  id,
  updateStoreField,
  handleUndo,
}: StoryFragmentTailwindBgColourProps) => {
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour
  );

  const [localValue, setLocalValue] = useState(
    $storyFragmentTailwindBgColour[id]?.current || ""
  );

  const hexColor = useMemo(() => tailwindToHex(localValue), [localValue]);

  const debouncedUpdateField = useRef(
    debounce((newValue: string) => {
      updateStoreField("storyFragmentTailwindBgColour", newValue);
    }, 300)
  ).current;

  useEffect(() => {
    setLocalValue($storyFragmentTailwindBgColour[id]?.current || "");
  }, [$storyFragmentTailwindBgColour[id]?.current]);

  const handleChange = useCallback(
    (newColor: string) => {
      setLocalValue(newColor);
      debouncedUpdateField(`bg-${newColor}`);
    },
    [debouncedUpdateField]
  );

  const handleUndoCallback = useCallback(() => {
    handleUndo("storyFragmentTailwindBgColour");
    const undoneValue = $storyFragmentTailwindBgColour[id]?.current || "";
    setLocalValue(undoneValue);
  }, [handleUndo, $storyFragmentTailwindBgColour, id]);

  return (
    <div className="flex items-center space-x-4 space-y-2">
      <span
        id="storyFragmentTailwindBgColour-label"
        className="text-md leading-6 text-mydarkgrey flex-shrink-0"
      >
        Bg Color
      </span>
      <ColorPickerWrapper
        id="storyFragmentTailwindBgColour"
        defaultColor={hexColor}
        onColorChange={handleChange}
      />
      <button
        onClick={handleUndoCallback}
        className="disabled:hidden ml-2"
        disabled={$storyFragmentTailwindBgColour[id]?.history.length === 0}
      >
        <ChevronDoubleLeftIcon
          className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
          title="Undo"
        />
      </button>
    </div>
  );
};

export default StoryFragmentTailwindBgColour;

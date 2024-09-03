import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { storyFragmentTailwindBgColour } from "../../../store/storykeep";
import ColorPickerWrapper from "../components/ColorPickerWrapper";
import { debounce } from "../../../utils/helpers";
import {
  hexToTailwind,
  tailwindToHex,
  getTailwindColorOptions,
} from "../../../assets/tailwindColors";
import type { StoreKey } from "../../../types";
import TailwindColorCombobox from "../fields/TailwindColorCombobox";

interface StoryFragmentTailwindBgColourProps {
  id: string;
  updateStoreField: (storeKey: StoreKey, newValue: string) => boolean;
  handleUndo: (storeKey: StoreKey, id: string) => void;
}

const StoryFragmentTailwindBgColour = ({
  id,
  updateStoreField,
  handleUndo,
}: StoryFragmentTailwindBgColourProps) => {
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour,
    { keys: [id] }
  );

  const [localValue, setLocalValue] = useState(
    $storyFragmentTailwindBgColour[id]?.current || ""
  );
  const [selectedTailwindColor, setSelectedTailwindColor] = useState("");

  const hexColor = useMemo(() => tailwindToHex(localValue), [localValue]);
  const tailwindColorOptions = useMemo(() => getTailwindColorOptions(), []);

  const debouncedUpdateField = useRef(
    debounce((newValue: string) => {
      updateStoreField("storyFragmentTailwindBgColour", newValue);
    }, 300)
  ).current;

  useEffect(() => {
    setLocalValue($storyFragmentTailwindBgColour[id]?.current || "");
    const currentColor = $storyFragmentTailwindBgColour[id]?.current || "";
    const matchingTailwindColor = hexToTailwind(tailwindToHex(currentColor));
    setSelectedTailwindColor(matchingTailwindColor || "");
  }, [$storyFragmentTailwindBgColour[id]?.current]);

  const handleHexColorChange = useCallback(
    (newHexColor: string) => {
      setLocalValue(newHexColor.replace("#", ""));
      debouncedUpdateField(`bg-${newHexColor.replace("#", "")}`);
      const matchingTailwindColor = hexToTailwind(newHexColor);
      setSelectedTailwindColor(matchingTailwindColor || "");
    },
    [debouncedUpdateField]
  );

  const handleTailwindColorChange = useCallback(
    (newTailwindColor: string) => {
      setLocalValue(newTailwindColor);
      debouncedUpdateField(`bg-${newTailwindColor}`);
      setSelectedTailwindColor(newTailwindColor);
    },
    [debouncedUpdateField]
  );

  const handleUndoCallback = useCallback(() => {
    handleUndo("storyFragmentTailwindBgColour", id);
    setLocalValue($storyFragmentTailwindBgColour[id]?.current || "");
    const matchingTailwindColor = tailwindColorOptions.find(
      color =>
        tailwindToHex(`bg-${color}`) ===
        tailwindToHex($storyFragmentTailwindBgColour[id]?.current || "")
    );
    setSelectedTailwindColor(matchingTailwindColor || "");
  }, [handleUndo, $storyFragmentTailwindBgColour, id, tailwindColorOptions]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-md leading-6 text-mydarkgrey flex-shrink-0">
          Background Color
        </span>
        <ColorPickerWrapper
          id="storyFragmentTailwindBgColour"
          defaultColor={hexColor}
          onColorChange={handleHexColorChange}
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
      <div>
        <label className="block text-sm text-mydarkgrey mb-1">
          Tailwind Color Class
        </label>
        <TailwindColorCombobox
          selectedColor={selectedTailwindColor}
          onColorChange={handleTailwindColorChange}
        />
      </div>
    </div>
  );
};

export default StoryFragmentTailwindBgColour;

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { XMarkIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import {
  paneFragmentIds,
  paneFragmentBgColour,
} from "../../../store/storykeep";
import {
  useStoryKeepUtils,
  createFieldWithHistory,
} from "../../../utils/storykeep";
import { tailwindToHex } from "../../../utils/helpers";
import ColorPickerWrapper from "../components/ColorPickerWrapper";
import { ulid } from "ulid";

interface PaneBgColourProps {
  paneId: string;
}

const PaneBgColour = ({ paneId }: PaneBgColourProps) => {
  const $paneFragmentIds = useStore(paneFragmentIds, { keys: [paneId] });
  const [bgColorFragmentId, setBgColorFragmentId] = useState<string | null>(
    null
  );
  const $paneFragmentBgColour = useStore(paneFragmentBgColour, {
    keys: [bgColorFragmentId ?? ""],
  });
  const { updateStoreField, handleUndo } = useStoryKeepUtils(
    bgColorFragmentId ?? ""
  );

  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    const fragmentIds = $paneFragmentIds[paneId]?.current;
    if (fragmentIds) {
      const colorFragmentId = fragmentIds.find(
        id => $paneFragmentBgColour[id]?.current?.type === "bgColour"
      );
      setBgColorFragmentId(colorFragmentId ?? null);
      if (colorFragmentId) {
        const bgColor =
          $paneFragmentBgColour[colorFragmentId]?.current?.bgColour;
        setColor(bgColor ?? null);
      } else {
        setColor(null);
      }
    }
  }, [$paneFragmentIds, $paneFragmentBgColour, paneId]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor);
      if (bgColorFragmentId) {
        updateStoreField(
          "paneFragmentBgColour",
          {
            ...$paneFragmentBgColour[bgColorFragmentId].current,
            bgColour: tailwindToHex(newColor),
          },
          bgColorFragmentId
        );
        updateStoreField(
          "paneFragmentIds",
          [...$paneFragmentIds[paneId].current],
          paneId
        );
      } else {
        const newFragmentId = ulid();
        paneFragmentBgColour.set({
          ...paneFragmentBgColour.get(),
          [newFragmentId]: createFieldWithHistory({
            id: newFragmentId,
            type: "bgColour",
            bgColour: tailwindToHex(newColor),
            hiddenViewports: "none",
          }),
        });
        updateStoreField(
          "paneFragmentIds",
          [...$paneFragmentIds[paneId].current, newFragmentId],
          paneId
        );
        setBgColorFragmentId(newFragmentId);
      }
    },
    [
      bgColorFragmentId,
      $paneFragmentBgColour,
      updateStoreField,
      $paneFragmentIds,
      paneId,
    ]
  );

  const handleRemoveColor = useCallback(() => {
    if (bgColorFragmentId) {
      const updatedFragmentIds = $paneFragmentIds[paneId].current.filter(
        id => id !== bgColorFragmentId
      );
      updateStoreField("paneFragmentIds", updatedFragmentIds, paneId);
      const updatedBgColour = { ...$paneFragmentBgColour };
      delete updatedBgColour[bgColorFragmentId];
      paneFragmentBgColour.set(updatedBgColour);
      setBgColorFragmentId(null);
      setColor(null);
    }
  }, [
    bgColorFragmentId,
    $paneFragmentIds,
    $paneFragmentBgColour,
    paneId,
    updateStoreField,
  ]);

  return (
    <div className="flex items-center space-x-4 space-y-2">
      <span className="text-md leading-6 text-mydarkgrey flex-shrink-0">
        Background Color
      </span>
      <ColorPickerWrapper
        id="paneBackgroundColor"
        defaultColor={color || "#FFFFFF"}
        onColorChange={handleColorChange}
      />
      {color && (
        <button
          onClick={handleRemoveColor}
          className="text-myorange hover:text-black"
          title="Remove color"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
      <button
        onClick={() =>
          handleUndo("paneFragmentBgColour", bgColorFragmentId ?? "")
        }
        className="disabled:hidden ml-2"
        disabled={
          !bgColorFragmentId ||
          $paneFragmentBgColour[bgColorFragmentId]?.history.length === 0
        }
      >
        <ChevronDoubleLeftIcon
          className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
          title="Undo"
        />
      </button>
    </div>
  );
};

export default PaneBgColour;

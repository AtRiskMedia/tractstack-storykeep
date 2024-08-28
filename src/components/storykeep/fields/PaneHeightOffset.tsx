import { useState, useEffect } from "react";
import {
  ChevronDoubleLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import {
  paneHeightOffsetDesktop,
  paneHeightOffsetTablet,
  paneHeightOffsetMobile,
} from "../../../store/storykeep";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import type { StoreKey } from "../../../types";

interface PaneHeightOffsetProps {
  id: string;
}

const PaneHeightOffset = ({ id }: PaneHeightOffsetProps) => {
  const $paneHeightOffsetDesktop = useStore(paneHeightOffsetDesktop, {
    keys: [id],
  });
  const $paneHeightOffsetTablet = useStore(paneHeightOffsetTablet, {
    keys: [id],
  });
  const $paneHeightOffsetMobile = useStore(paneHeightOffsetMobile, {
    keys: [id],
  });

  const { updateStoreField, handleUndo } = useStoryKeepUtils(id);

  const [desktopInput, setDesktopInput] = useState(
    $paneHeightOffsetDesktop[id]?.current?.toString() || "0"
  );
  const [tabletInput, setTabletInput] = useState(
    $paneHeightOffsetTablet[id]?.current?.toString() || "0"
  );
  const [mobileInput, setMobileInput] = useState(
    $paneHeightOffsetMobile[id]?.current?.toString() || "0"
  );

  useEffect(() => {
    setDesktopInput($paneHeightOffsetDesktop[id]?.current?.toString() || "0");
    setTabletInput($paneHeightOffsetTablet[id]?.current?.toString() || "0");
    setMobileInput($paneHeightOffsetMobile[id]?.current?.toString() || "0");
  }, [
    $paneHeightOffsetDesktop[id]?.current,
    $paneHeightOffsetTablet[id]?.current,
    $paneHeightOffsetMobile[id]?.current,
  ]);

  const isPreValid = (value: string): boolean => {
    return /^-?\d{0,4}$/.test(value);
  };

  const isValid = (value: string): boolean => {
    const numValue = parseInt(value);
    return !isNaN(numValue) && numValue >= -300 && numValue <= 300;
  };

  const normalizeValue = (value: string): string => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return "0";
    if (numValue < -300) return "-300";
    if (numValue > 300) return "300";
    return numValue.toString();
  };

  const handleInputChange = (
    value: string,
    storeKey: StoreKey,
    setter: (value: string) => void
  ) => {
    if (isPreValid(value)) {
      setter(value);
      if (isValid(value)) {
        updateStoreField(storeKey, normalizeValue(value));
      }
    }
  };

  const handleInputBlur = (
    value: string,
    storeKey: StoreKey,
    setter: (value: string) => void
  ) => {
    const normalizedValue = normalizeValue(value);
    setter(normalizedValue);
    updateStoreField(storeKey, normalizedValue);
  };

  const renderInput = (
    value: string,
    setter: (value: string) => void,
    storeKey: StoreKey,
    label: string
  ) => (
    <div className="flex items-center">
      <label className="mr-2 text-lg text-mydarkgrey">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => handleInputChange(e.target.value, storeKey, setter)}
        onBlur={e => handleInputBlur(e.target.value, storeKey, setter)}
        className="w-20 rounded-md border-0 px-2 py-1 text-myblack ring-1 ring-inset ring-mygreen focus:ring-2 focus:ring-mygreen text-lg"
      />
    </div>
  );

  return (
    <div className="flex items-center space-x-4 py-3">
      <span className="text-md text-mydarkgrey flex-shrink-0">
        Height Offset:
      </span>
      <InformationCircleIcon
        className="h-5 w-5"
        title="In rare instance to add negative (or positive) margin between panes"
      />
      {renderInput(
        desktopInput,
        setDesktopInput,
        "paneHeightOffsetDesktop",
        "Desktop"
      )}
      {renderInput(
        tabletInput,
        setTabletInput,
        "paneHeightOffsetTablet",
        "Tablet"
      )}
      {renderInput(
        mobileInput,
        setMobileInput,
        "paneHeightOffsetMobile",
        "Mobile"
      )}
      <button
        onClick={() => {
          handleUndo("paneHeightOffsetDesktop", id);
          handleUndo("paneHeightOffsetTablet", id);
          handleUndo("paneHeightOffsetMobile", id);
        }}
        className="disabled:hidden ml-2"
        disabled={
          $paneHeightOffsetDesktop[id]?.history.length === 0 &&
          $paneHeightOffsetTablet[id]?.history.length === 0 &&
          $paneHeightOffsetMobile[id]?.history.length === 0
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

export default PaneHeightOffset;

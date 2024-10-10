import { useState, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { classNames } from "../../../utils/helpers";
import {
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

interface ViewportComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  onFinalChange: (
    value: string,
    viewport: "mobile" | "tablet" | "desktop",
    isNegative?: boolean
  ) => void;
  values: string[];
  viewport: "mobile" | "tablet" | "desktop";
  allowNegative?: boolean;
  isNegative?: boolean;
  isInferred?: boolean;
}

const ViewportComboBox = ({
  value,
  onChange,
  onFinalChange,
  values,
  viewport,
  allowNegative = false,
  isNegative = false,
  isInferred = false,
}: ViewportComboBoxProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isNowNegative, setIsNowNegative] = useState(isNegative);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const Icon =
    viewport === "mobile"
      ? DevicePhoneMobileIcon
      : viewport === "tablet"
        ? DeviceTabletIcon
        : ComputerDesktopIcon;

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    onChange(event.target.value);
  };

  const handleInputBlur = () => {
    onFinalChange(internalValue, viewport, isNowNegative);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onFinalChange(internalValue, viewport, isNowNegative);
    }
  };

  const handleNegativeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newIsNegative = event.target.checked;
    setIsNowNegative(newIsNegative);
    onFinalChange(internalValue, viewport, newIsNegative);
  };

  const handleSelectOption = (selectedValue: string) => {
    setInternalValue(selectedValue);
    onChange(selectedValue);
    onFinalChange(selectedValue, viewport, isNowNegative);
    setIsModalOpen(false);
  };

  return (
    <div
      className="flex flex-nowrap items-center"
      title={`Value on ${viewport} Screens`}
    >
      <Icon className="h-8 w-8 mr-2" aria-hidden="true" />
      <div className="relative w-full">
        <div className="flex items-center">
          <input
            type="text"
            value={internalValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={classNames(
              "w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-10 text-xl leading-5 focus:ring-1 focus:ring-myorange focus:border-myorange",
              isInferred ? "text-black/20" : "text-black"
            )}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <ChevronUpDownIcon
              className="h-5 w-5 text-mydarkgrey"
              aria-hidden="true"
            />
          </button>
        </div>
        {allowNegative && (
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id={`negative-${viewport}`}
              checked={isNowNegative}
              onChange={handleNegativeChange}
              className="h-4 w-4 text-myorange focus:ring-myorange border-mydarkgrey rounded"
            />
            <label
              htmlFor={`negative-${viewport}`}
              className="ml-2 block text-sm text-black"
            >
              Negative
            </label>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="max-h-60 overflow-auto">
              {values.map(item => (
                <button
                  key={item}
                  onClick={() => handleSelectOption(item)}
                  className={classNames(
                    "w-full text-left py-2 px-4 hover:bg-myorange hover:text-white",
                    item === internalValue ? "bg-myorange/10" : ""
                  )}
                >
                  {item}
                  {item === internalValue && (
                    <CheckIcon
                      className="h-5 w-5 inline-block ml-2"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full bg-myorange text-white py-2 rounded-md"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewportComboBox;

import { useRef, useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
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
  const [internalValue, setInternalValue] = useState(value ?? "");
  const [isNowNegative, setIsNowNegative] = useState(isNegative);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon =
    viewport === "mobile"
      ? DevicePhoneMobileIcon
      : viewport === "tablet"
        ? DeviceTabletIcon
        : ComputerDesktopIcon;

  const handleNegativeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFinalChange(value, viewport, event.target.checked);
    setIsNowNegative(event.target.checked);
  };

  const handleChange = (newValue: string) => {
    setInternalValue(newValue ?? "");
    onChange(newValue ?? "");
  };

  const handleSelect = (selectedValue: string) => {
    setInternalValue(selectedValue);
    onChange(selectedValue);
    onFinalChange(selectedValue, viewport, isNowNegative);
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    onFinalChange(internalValue, viewport, isNowNegative);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onFinalChange(internalValue, viewport, isNowNegative);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  return (
    <div
      className="flex flex-nowrap items-center"
      title={`Value on ${viewport} Screens`}
    >
      <Icon className="h-8 w-8 mr-2" aria-hidden="true" />
      <div className="relative w-full">
        <Combobox value={value} onChange={handleSelect}>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <Combobox.Input
                ref={inputRef}
                className={classNames(
                  "w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-10 text-xl leading-5 focus:ring-1 focus:ring-myorange focus:border-myorange",
                  isInferred ? "text-black/20" : "text-black"
                )}
                onChange={event => handleChange(event.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                value={internalValue}
                displayValue={v => (typeof v === `string` ? v : "")}
                autoComplete="off"
              />
              <Combobox.Button
                className="absolute inset-y-0 right-0 flex items-center pr-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                <ChevronUpDownIcon
                  className="h-5 w-5 text-mydarkgrey"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            {allowNegative && (
              <div className="ml-2 flex items-center">
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
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-4 w-full max-w-md">
                <Combobox.Options className="max-h-60 overflow-auto">
                  {values
                    .filter(item =>
                      item.toLowerCase().includes((value || "").toLowerCase())
                    )
                    .map(item => (
                      <Combobox.Option
                        key={item}
                        value={item}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? "bg-myorange text-white" : "text-black"
                          }`
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-bold" : "font-normal"
                              }`}
                            >
                              {item}
                            </span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? "text-white" : "text-myorange"
                                }`}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                </Combobox.Options>
                <button
                  className="mt-4 w-full bg-myorange text-white py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Combobox>
      </div>
    </div>
  );
};

export default ViewportComboBox;

import { useRef, useState, useEffect, useCallback } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { classNames, debounce } from "../../../utils/helpers";
import {
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useDropdownDirection } from "../../../hooks/useDropdownDirection";
import type { ChangeEvent } from "react";

interface ViewportComboBoxProps {
  value: string;
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
  onFinalChange,
  values,
  viewport,
  allowNegative = false,
  isNegative = false,
  isInferred = false,
}: ViewportComboBoxProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isNowNegative, setIsNowNegative] = useState(isNegative);
  const [filteredValues, setFilteredValues] = useState(values);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const comboboxButtonRef = useRef<HTMLButtonElement>(null);
  const { openAbove, maxHeight } = useDropdownDirection(comboboxButtonRef);

  const Icon =
    viewport === "mobile"
      ? DevicePhoneMobileIcon
      : viewport === "tablet"
        ? DeviceTabletIcon
        : ComputerDesktopIcon;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const debouncedCheckMobile = debounce(checkMobile, 250);
    checkMobile();
    window.addEventListener("resize", debouncedCheckMobile);
    return () => {
      window.removeEventListener("resize", debouncedCheckMobile);
    };
  }, []);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
    }
    if (isNegative !== isNowNegative) {
      setIsNowNegative(isNegative);
    }
  }, [value, isNegative]);

  useEffect(() => {
    if (!isMobile) {
      setFilteredValues(
        values.filter(item =>
          item.toLowerCase().includes(internalValue.toLowerCase())
        )
      );
    } else {
      setFilteredValues(values);
    }
  }, [internalValue, values, isMobile]);

  const handleNegativeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIsNowNegative(event.target.checked);
      onFinalChange(internalValue, viewport, event.target.checked);
    },
    [internalValue, onFinalChange, viewport]
  );

  const handleChange = useCallback((newValue: string) => {
    setInternalValue(newValue);
  }, []);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      setInternalValue(selectedValue);
      onFinalChange(selectedValue, viewport, isNowNegative);
    },
    [onFinalChange, viewport, isNowNegative]
  );

  const handleBlur = useCallback(() => {
    onFinalChange(internalValue, viewport, isNowNegative);
  }, [internalValue, onFinalChange, viewport, isNowNegative]);

  const renderMobileInput = () => (
    <div className="relative">
      <select
        value={internalValue}
        onChange={e => handleSelect(e.target.value)}
        className={classNames(
          "w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-10 text-xl leading-5 focus:ring-1 focus:ring-myorange focus:border-myorange appearance-none",
          isInferred ? "text-black/20" : "text-black"
        )}
      >
        {values.map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <div className="pointer-events-none pl-2 text-gray-700">
          <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-nowrap items-center"
      title={`Value on ${viewport} Screens`}
    >
      <Icon className="h-8 w-8 mr-2" aria-hidden="true" />
      <div className="relative w-full">
        <div className="flex items-center">
          <div className="relative flex-grow">
            {isMobile ? (
              renderMobileInput()
            ) : (
              <Combobox value={internalValue} onChange={handleSelect}>
                <div className="relative">
                  <Combobox.Input
                    ref={inputRef}
                    className={classNames(
                      "w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-16 text-xl leading-5 focus:ring-1 focus:ring-myorange focus:border-myorange",
                      isInferred ? "text-black/20" : "text-black"
                    )}
                    onChange={event => handleChange(event.target.value)}
                    onBlur={handleBlur}
                    displayValue={(v: string) => v}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <Combobox.Button
                      ref={comboboxButtonRef}
                      className="flex items-center pl-2"
                    >
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-mydarkgrey"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                </div>
                <Combobox.Options
                  className={`absolute z-10 left-0 right-0 w-full overflow-auto rounded-md bg-white py-1 text-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                    openAbove ? "bottom-full mb-1" : "top-full mt-1"
                  }`}
                  style={{ maxHeight: `${maxHeight}px` }}
                >
                  {filteredValues.map(item => (
                    <Combobox.Option
                      key={item}
                      value={item}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
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
                              className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
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
              </Combobox>
            )}
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
      </div>
    </div>
  );
};

export default ViewportComboBox;

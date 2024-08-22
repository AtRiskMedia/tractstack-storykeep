import React, { useRef } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
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
    viewport: "mobile" | "tablet" | "desktop"
  ) => void;
  values: string[];
  viewport: "mobile" | "tablet" | "desktop";
}

const ViewportComboBox = ({
  value,
  onChange,
  onFinalChange,
  values,
  viewport,
}: ViewportComboBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon =
    viewport === "mobile"
      ? DevicePhoneMobileIcon
      : viewport === "tablet"
        ? DeviceTabletIcon
        : ComputerDesktopIcon;

  const handleChange = (newValue: string) => {
    onChange(newValue || "");
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    onFinalChange(selectedValue, viewport);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onFinalChange(value, viewport);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className="flex flex-nowrap items-center"
      title={`Value on ${viewport} Screens`}
    >
      <Icon className="h-8 w-8 mr-2" aria-hidden="true" />
      <div className="relative w-full">
        <Combobox value={value} onChange={handleSelect}>
          <div className="relative">
            <Combobox.Input
              ref={inputRef}
              className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-1 focus:ring-myorange focus:border-myorange"
              onChange={event => handleChange(event.target.value)}
              onKeyDown={handleKeyDown}
              displayValue={v => (typeof v === `string` ? v : "")}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {values
              .filter(item =>
                item.toLowerCase().includes((value || "").toLowerCase())
              )
              .map(item => (
                <Combobox.Option
                  key={item}
                  value={item}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? "bg-myorange text-white" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
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
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </Combobox>
      </div>
    </div>
  );
};

export default ViewportComboBox;

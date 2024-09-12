import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import type { FullContentMap } from "../../../types";

interface ContentSearchComboboxProps {
  items: FullContentMap[];
  onSelect: (item: FullContentMap) => void;
}

export function ContentSearchCombobox({
  items,
  onSelect,
}: ContentSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FullContentMap | null>(null);

  const filteredItems =
    query === ""
      ? items
      : items.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (item: FullContentMap) => {
    setQuery("");
    setSelectedItem(item);
    onSelect(item);
  };

  const getItemType = (item: FullContentMap): string => {
    if (item.type === "Pane" && item.isContext) {
      return "Context";
    }
    return item.type;
  };

  const getSecondaryText = (item: FullContentMap): string => {
    const type = getItemType(item);
    if (item.type === "Resource" && item.categorySlug) {
      return `${type} - ${item.categorySlug}`;
    }
    return type;
  };

  return (
    <Combobox as="div" value={selectedItem} onChange={handleSelect}>
      <Combobox.Label className="block text-xs leading-6 text-black">
        Search Content
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-black shadow-sm ring-1 ring-inset ring-myblack/20 focus:ring-2 focus:ring-inset focus:ring-myorange xs:text-xs xs:leading-6"
          onChange={event => setQuery(event.target.value)}
          onBlur={() => setQuery("")}
          displayValue={(item: FullContentMap | null) => item?.title || ""}
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-myblack/60"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredItems.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xs:text-xs">
            {filteredItems.map(item => (
              <Combobox.Option
                key={item.id}
                value={item}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? "bg-myorange text-white" : "text-black"
                  }`
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex flex-col">
                      <span
                        className={`truncate ${selected ? "font-bold" : "font-normal"}`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`truncate ${active ? "text-myorange/80" : "text-myblack/60"}`}
                      >
                        {getSecondaryText(item)}
                      </span>
                    </div>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? "text-white" : "text-myorange"}`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

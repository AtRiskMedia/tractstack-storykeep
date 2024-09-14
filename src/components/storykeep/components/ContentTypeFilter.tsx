import { CheckIcon } from "@heroicons/react/20/solid";

interface ContentTypeFilterProps {
  types: string[];
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

export function ContentTypeFilter({
  types,
  selectedTypes,
  onChange,
}: ContentTypeFilterProps) {
  const handleChange = (type: string) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onChange(newSelectedTypes);
  };

  return (
    <div>
      <label className="block text-lg leading-6 text-black">Filter</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => handleChange(type)}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
              selectedTypes.includes(type)
                ? "bg-myorange/20 text-black"
                : "bg-white text-mydarkgrey border border-mydarkgrey"
            }`}
          >
            {selectedTypes.includes(type) && (
              <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
            )}
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

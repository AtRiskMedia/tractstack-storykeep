import type { ToolAddMode } from "../../types";
import { toolAddModeTitles, toolAddModes } from "../../constants";

interface ToolAddModeSelectorProps {
  toolAddMode: ToolAddMode;
  setToolAddMode: (toolAddMode: ToolAddMode) => void;
}

const ToolAddModeSelector = ({
  toolAddMode,
  setToolAddMode,
}: ToolAddModeSelectorProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setToolAddMode(event.target.value as ToolAddMode);
  };

  return (
    <div className="flex items-center">
      <label
        htmlFor="toolAddMode"
        className="mr-2 text-sm font-bold text-mydarkgrey"
      >
        Add:
      </label>
      <select
        id="toolAddMode"
        name="toolAddMode"
        value={toolAddMode}
        onChange={handleChange}
        className="block w-fit-contents rounded-md border-0 py-1.5 pl-3 pr-10 text-mydarkgrey ring-1 ring-inset ring-mylightgrey focus:ring-2 focus:ring-myblue sm:text-sm sm:leading-6"
      >
        {toolAddModes.map(mode => (
          <option key={mode} value={mode}>
            {toolAddModeTitles[mode]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ToolAddModeSelector;

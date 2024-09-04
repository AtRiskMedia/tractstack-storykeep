import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../components/ContentEditableField";

interface WidgetMeta {
  [key: string]: {
    valueLabels: string[];
    multi: boolean[];
  };
}

const widgetMeta: WidgetMeta = {
  identifyAs: {
    valueLabels: ["Belief Tag", "Belief Matching Value(s)", "Question Prompt"],
    multi: [false, true, false],
  },
};

interface WidgetProps {
  id: string;
  values: string[];
}

const Widget = ({ id, values }: WidgetProps) => {
  console.log(id, values);
  const [widgetId, setWidgetId] = useState(id);
  const [widgetValues, setWidgetValues] = useState(values);

  useEffect(() => {
    setWidgetId(id);
    setWidgetValues(values);
  }, [id, values]);

  const handleIdChange = (newId: string) => {
    setWidgetId(newId);
    console.log("handle update");
    return true;
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newValues = [...widgetValues];
    newValues[index] = newValue;
    setWidgetValues(newValues);
    console.log("handle update");
    return true;
  };

  const addValue = (index: number) => {
    const newValues = [...widgetValues];
    newValues.splice(index + 1, 0, "");
    setWidgetValues(newValues);
    console.log("handle update");
  };

  const removeValue = (index: number) => {
    const newValues = widgetValues.filter((_, i) => i !== index);
    setWidgetValues(newValues);
    console.log("handle update");
  };

  const meta = widgetMeta[widgetId] || { valueLabels: [], multi: [] };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm text-mydarkgrey">Widget ID</label>
        <ContentEditableField
          id="widget-id"
          value={widgetId}
          onChange={handleIdChange}
          onEditingChange={() => {}}
          placeholder="Enter widget ID"
          className="block w-full rounded-md border-0 px-2.5 py-1.5 text-myblack ring-1 ring-inset ring-mygreen focus:ring-2 focus:ring-myorange xs:text-sm xs:leading-6"
        />
      </div>

      {widgetValues.map((value, index) => (
        <div key={index} className="space-y-2">
          <label className="block text-sm text-mydarkgrey">
            {meta.valueLabels[index] || `Value ${index + 1}`}
          </label>
          <div className="flex items-center space-x-2">
            <ContentEditableField
              id={`widget-value-${index}`}
              value={value}
              onChange={newValue => handleValueChange(index, newValue)}
              onEditingChange={() => {}}
              placeholder={`Enter ${meta.valueLabels[index] || "value"}`}
              className="flex-grow rounded-md border-0 px-2.5 py-1.5 text-myblack ring-1 ring-inset ring-mygreen focus:ring-2 focus:ring-myorange xs:text-sm xs:leading-6"
            />
            <button
              onClick={() => removeValue(index)}
              className="text-myorange hover:text-black"
              title="Remove value"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {meta.multi[index] && (
              <button
                onClick={() => addValue(index)}
                className="text-myblue hover:text-black"
                title="Add value"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={() => console.log("Undo functionality to be implemented")}
          className="flex items-center text-myblack bg-mygreen/50 px-2 py-1 rounded hover:bg-myorange hover:text-white"
        >
          <ChevronDoubleLeftIcon className="h-5 w-5 mr-1" />
          Undo
        </button>
      </div>
    </div>
  );
};

export default Widget;

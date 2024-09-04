import { useState, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  PlusIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../components/ContentEditableField";

interface WidgetMeta {
  [key: string]: {
    valueLabels: string[];
    valueDefaults: string[];
    multi: boolean[];
  };
}

const widgetMeta: WidgetMeta = {
  identifyAs: {
    title: `Identify As Belief Widget`,
    valueLabels: ["Belief Tag", "Belief Matching Value(s)", "Question Prompt"],
    valueDefaults: ["BELIEF", "*", "Prompt"],
    multi: [false, true, false],
  },
  toggle: {
    title: `Toggle Belief Widget`,
    valueLabels: ["Belief Tag", "Question Prompt"],
    valueDefaults: ["BELIEF", "Prompt"],
    multi: [false, false],
  },
};

interface WidgetProps {
  id: string;
  values: string[];
}

const Widget = ({ id, values }: WidgetProps) => {
  const [widgetId, setWidgetId] = useState(id);
  const [widgetValues, setWidgetValues] = useState<string[]>([]);

  useEffect(() => {
    setWidgetId(id);
    const meta = widgetMeta[id] || { valueDefaults: [], multi: [] };
    const initialValues = values.length > 0 ? values : meta.valueDefaults;
    setWidgetValues(
      initialValues.map((value, index) =>
        meta.multi[index] && value === "" ? meta.valueDefaults[index] : value
      )
    );
  }, [id, values]);

  const handleValueChange = useCallback(
    (index: number, subIndex: number | null, newValue: string) => {
      setWidgetValues(prev => {
        const newValues = [...prev];
        const meta = widgetMeta[widgetId] || { multi: [] };
        if (meta.multi[index]) {
          const values = newValues[index].split(",").map(v => v.trim());
          if (subIndex !== null) {
            values[subIndex] = newValue;
          }
          newValues[index] = values.filter(v => v !== "").join(",");
        } else {
          newValues[index] = newValue;
        }
        return newValues;
      });
      console.log("Local state updated");
      return true;
    },
    [widgetId]
  );

  const handleFinalChange = useCallback(() => {
    console.log("Update nanostore with:", widgetId, widgetValues);
  }, [widgetId, widgetValues]);

  const addValue = useCallback((index: number) => {
    setWidgetValues(prev => {
      const newValues = [...prev];
      const values = newValues[index].split(",").map(v => v.trim());
      values.push("");
      newValues[index] = values.join(",");
      return newValues;
    });
  }, []);

  const removeValue = useCallback(
    (index: number, subIndex: number) => {
      setWidgetValues(prev => {
        const newValues = [...prev];
        const values = newValues[index].split(",").map(v => v.trim());
        values.splice(subIndex, 1);
        newValues[index] =
          values.length > 0
            ? values.join(",")
            : widgetMeta[widgetId]?.valueDefaults[index] || "";
        return newValues;
      });
    },
    [widgetId]
  );

  const meta = widgetMeta[widgetId] || {
    valueLabels: [],
    valueDefaults: [],
    multi: [],
  };
  console.log(meta.title);
  return (
    <div className="space-y-4 max-w-md min-w-80">
      <div className="flex flex-nowrap justify-between">
        <h3 className="text-lg font-bold">{meta.title}</h3>
        <div className="flex justify-end">
          <button
            onClick={() => console.log("Undo functionality to be implemented")}
            disabled={true}
            className="flex items-center text-myblack bg-mygreen/50 px-2 py-1 rounded hover:bg-myorange hover:text-white disabled:hidden"
          >
            <ChevronDoubleLeftIcon className="h-5 w-5 mr-1" />
            Undo
          </button>
        </div>
      </div>

      {widgetValues.map((value, index) => (
        <div key={index} className="space-y-2">
          <label className="block text-sm text-mydarkgrey">
            {meta.valueLabels[index] || `Value ${index + 1}`}
          </label>
          {meta.multi[index] ? (
            <div className="space-y-2">
              {value.split(",").map((subValue, subIndex) => (
                <div key={subIndex} className="flex items-center space-x-2">
                  <ContentEditableField
                    id={`widget-value-${index}-${subIndex}`}
                    value={subValue.trim()}
                    onChange={newValue =>
                      handleValueChange(index, subIndex, newValue)
                    }
                    onEditingChange={handleFinalChange}
                    placeholder={`Enter ${meta.valueLabels[index] || "value"}`}
                    className="rounded-md border-0 px-2.5 py-1.5 text-myblack ring-1 ring-inset ring-mygreen focus:ring-2 focus:ring-myorange xs:text-sm xs:leading-6"
                  />
                  <button
                    onClick={() => removeValue(index, subIndex)}
                    className="text-myorange hover:text-black"
                    title="Remove value"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addValue(index)}
                className="text-myblue hover:text-black flex items-center"
                title="Add value"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                <span>Add {meta.valueLabels[index] || "Value"}</span>
              </button>
            </div>
          ) : (
            <ContentEditableField
              id={`widget-value-${index}`}
              value={value}
              onChange={newValue => handleValueChange(index, null, newValue)}
              onEditingChange={handleFinalChange}
              placeholder={`Enter ${meta.valueLabels[index] || "value"}`}
              className="rounded-md border-0 px-2.5 py-1.5 text-myblack ring-1 ring-inset ring-mygreen focus:ring-2 focus:ring-myorange xs:text-sm xs:leading-6"
            />
          )}
        </div>
      ))}
      <span className="flex gap-x-6">
        <button
          className="my-2 underline"
          title="Close Widget Config panel"
          onClick={() => {
            setSelectedStyle(null);
            setAddClass(false);
            setWidgetConfigMode(false);
          }}
        >
          BACK
        </button>
      </span>
    </div>
  );
};

export default Widget;

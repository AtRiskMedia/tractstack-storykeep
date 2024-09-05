import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  XMarkIcon,
  PlusIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../components/ContentEditableField";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import {
  updateMarkdownElement,
  extractMarkdownElement,
  markdownToHtmlAst,
} from "../../../utils/compositor/markdownUtils";
import { cloneDeep } from "../../../utils/helpers";
import { widgetMeta } from "../../../constants";

interface WidgetProps {
  id: string;
  values: string[];
  paneId: string;
  outerIdx: number;
  idx: number | null;
}

const Widget = ({ id, values, paneId, outerIdx, idx }: WidgetProps) => {
  const [widgetId, setWidgetId] = useState(id);
  const [widgetValues, setWidgetValues] = useState<string[]>([]);

  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [paneId],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[paneId]?.current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId || ""],
  });
  const { updateStoreField, handleUndo } = useStoryKeepUtils(
    markdownFragmentId || ""
  );

  useEffect(() => {
    setWidgetId(id);
    const meta = widgetMeta[id] || { valueDefaults: [], multi: [] };
    const initialValues = values.length > 0 ? values : meta.valueDefaults;
    setWidgetValues(
      initialValues.map((value, index) =>
        meta.multi[index] && value === "" ? meta.valueDefaults[index] : value
      )
    );
  }, [id, values, paneId, markdownFragmentId, $paneFragmentMarkdown]);

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
      return true;
    },
    [widgetId]
  );

  const handleFinalChange = useCallback(() => {
    if (!markdownFragmentId) {
      console.error("markdownFragmentId is undefined");
      return;
    }

    lastInteractedTypeStore.set(`markdown`);
    lastInteractedPaneStore.set(paneId);
    const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);

    if (
      !currentField ||
      !currentField.current ||
      !currentField.current.markdown
    ) {
      console.error("Invalid markdown data structure");
      return;
    }

    const oldContent = extractMarkdownElement(
      currentField.current.markdown.body,
      "code",
      outerIdx,
      idx
    );
    const newContent = `${widgetId}(${widgetValues.join("|")})`;
    if (oldContent !== newContent) {
      const newBody = updateMarkdownElement(
        currentField.current.markdown.body,
        newContent,
        "code",
        outerIdx,
        idx
      );
      const newHtmlAst = markdownToHtmlAst(newBody);
      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        markdown: {
          ...currentField.current.markdown,
          body: newBody,
          htmlAst: newHtmlAst,
        },
      });
    }
  }, [
    widgetId,
    widgetValues,
    paneId,
    markdownFragmentId,
    outerIdx,
    idx,
    $paneFragmentMarkdown,
    updateStoreField,
  ]);

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

  const handleUndoClick = useCallback(() => {
    if (markdownFragmentId) {
      handleUndo("paneFragmentMarkdown", markdownFragmentId);
    } else {
      console.error("Cannot undo: markdownFragmentId is undefined");
    }
  }, [handleUndo, markdownFragmentId]);

  const meta = widgetMeta[widgetId] || {
    title: ``,
    valueLabels: [],
    valueDefaults: [],
    multi: [],
  };

  if (!markdownFragmentId || !$paneFragmentMarkdown[markdownFragmentId]) {
    return <div>Loading widget data...</div>;
  }

  return (
    <div className="space-y-4 max-w-md min-w-80">
      <div className="flex flex-nowrap justify-between">
        <h3 className="text-lg font-bold">{meta.title}</h3>
        <div className="flex justify-end">
          <button
            onClick={handleUndoClick}
            className="flex items-center text-myblack bg-mygreen/50 px-2 py-1 rounded hover:bg-myorange hover:text-white disabled:hidden"
            disabled={
              !markdownFragmentId ||
              $paneFragmentMarkdown[markdownFragmentId]?.history.length === 0
            }
          >
            <ChevronDoubleLeftIcon className="h-5 w-5 mr-1" />
            Undo
          </button>
        </div>
      </div>

      {widgetValues.map((value, index) => (
        <div key={index} className="space-y-1">
          <label className="block text-sm text-mydarkgrey">
            {meta.valueLabels[index] || `Value ${index + 1}`}
          </label>
          {meta.multi[index] ? (
            <div className="space-y-1">
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
    </div>
  );
};

export default Widget;

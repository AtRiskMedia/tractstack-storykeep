import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import { Switch } from "@headlessui/react";
import {
  XMarkIcon,
  PlusIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import { paneCodeHook } from "../../../store/storykeep";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import ContentEditableField from "../components/ContentEditableField";
import type { CodeHookDatum } from "../../../types";

interface CodeHookProps {
  id: string;
}

const CodeHook = ({ id }: CodeHookProps) => {
  const $paneCodeHook = useStore(paneCodeHook, { keys: [id] });
  const { updateStoreField, handleUndo } = useStoryKeepUtils(id);

  const [localCodeHook, setLocalCodeHook] = useState<CodeHookDatum>({
    target: "",
    options: "{}",
  });
  const optionKeysRef = useRef<{ [oldKey: string]: string }>({});

  useEffect(() => {
    setLocalCodeHook(
      $paneCodeHook[id]?.current || { target: "", options: "{}" }
    );
  }, [$paneCodeHook[id]?.current]);

  const handleTargetChange = useCallback((newTarget: string) => {
    setLocalCodeHook(prev => ({ ...prev, target: newTarget }));
    return true;
  }, []);

  const handleTargetEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing) {
        updateStoreField("paneCodeHook", localCodeHook);
      }
    },
    [updateStoreField, localCodeHook]
  );

  const getUniqueKey = useCallback(
    (baseKey: string): string => {
      const options = JSON.parse(localCodeHook.options || "{}");
      let newKey = baseKey;
      let counter = 1;
      while (newKey in options) {
        newKey = `${baseKey}${counter}`;
        counter++;
      }
      return newKey;
    },
    [localCodeHook.options]
  );

  const addOption = useCallback(() => {
    const options = JSON.parse(localCodeHook.options || "{}");
    const newKey = getUniqueKey("newOption");
    options[newKey] = "";
    setLocalCodeHook(prev => ({
      ...prev,
      options: JSON.stringify(options),
    }));
  }, [localCodeHook.options, getUniqueKey]);

  const handleOptionChange = useCallback(
    (oldKey: string, field: "key" | "value", newValue: string) => {
      setLocalCodeHook(prev => {
        const options = JSON.parse(prev.options || "{}");
        if (field === "key") {
          optionKeysRef.current[oldKey] = newValue;
        } else {
          options[oldKey] = newValue;
        }
        return {
          ...prev,
          options: JSON.stringify(options),
        };
      });
      return true;
    },
    []
  );

  const handleOptionEditingChange = useCallback(
    (editing: boolean, key: string) => {
      if (!editing) {
        setLocalCodeHook(prev => {
          const options = JSON.parse(prev.options || "{}");
          const newKey = optionKeysRef.current[key] || key;

          if (newKey !== key) {
            // Find the old key (case-insensitive)
            const oldKey = Object.keys(options).find(
              k => k.toLowerCase() === key.toLowerCase()
            );

            if (oldKey) {
              // If the old key exists, update it
              const value = options[oldKey];
              delete options[oldKey];

              // If the new key already exists, merge the values
              if (newKey in options) {
                if (
                  typeof options[newKey] === "object" &&
                  typeof value === "object"
                ) {
                  options[newKey] = { ...options[newKey], ...value };
                } else {
                  options[newKey] = value;
                }
              } else {
                options[newKey] = value;
              }
            }
          }

          optionKeysRef.current = {};
          return {
            ...prev,
            options: JSON.stringify(options),
          };
        });
        updateStoreField("paneCodeHook", localCodeHook);
      }
    },
    [updateStoreField, localCodeHook]
  );

  const removeOption = useCallback((key: string) => {
    setLocalCodeHook(prev => {
      const options = JSON.parse(prev.options || "{}");
      delete options[key];
      return {
        ...prev,
        options: JSON.stringify(options),
      };
    });
  }, []);

  const toggleBooleanOption = useCallback((key: string) => {
    setLocalCodeHook(prev => {
      const options = JSON.parse(prev.options || "{}");
      options[key] = options[key] === "true" ? "false" : "true";
      return {
        ...prev,
        options: JSON.stringify(options),
      };
    });
  }, []);

  const commonInputClass =
    "block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6";

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="code-hook-target"
          className="block text-sm font-medium text-mydarkgrey"
        >
          Target
        </label>
        <ContentEditableField
          id="code-hook-target"
          value={localCodeHook.target}
          onChange={handleTargetChange}
          onEditingChange={handleTargetEditingChange}
          placeholder="Enter target"
          className={commonInputClass}
          hyphenate={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-mydarkgrey">
          Options
        </label>
        {Object.entries(JSON.parse(localCodeHook.options || "{}")).map(
          ([key, value]) => (
            <div key={key} className="flex items-center space-x-2 mt-2">
              <ContentEditableField
                id={`option-key-${key}`}
                value={optionKeysRef.current[key] || key}
                onChange={newKey => handleOptionChange(key, "key", newKey)}
                onEditingChange={editing =>
                  handleOptionEditingChange(editing, key)
                }
                placeholder="Key"
                className={`w-1/3 ${commonInputClass}`}
                hyphenate={true}
              />
              {value === "true" || value === "false" ? (
                <Switch
                  checked={value === "true"}
                  onChange={() => toggleBooleanOption(key)}
                  className={`${
                    value === "true" ? "bg-myorange" : "bg-mydarkgrey"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      value === "true" ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              ) : (
                <ContentEditableField
                  id={`option-value-${key}`}
                  value={value as string}
                  onChange={newValue =>
                    handleOptionChange(key, "value", newValue)
                  }
                  onEditingChange={editing =>
                    handleOptionEditingChange(editing, key)
                  }
                  placeholder="Value"
                  className={`w-1/2 ${commonInputClass}`}
                />
              )}
              <button
                onClick={() => removeOption(key)}
                className="text-myorange hover:text-black"
                title="Remove option"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )
        )}
        <button
          onClick={addOption}
          className="mt-2 flex items-center text-myblue hover:text-myorange"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Option
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleUndo("paneCodeHook", id)}
          className="flex items-center text-myblack bg-mygreen/50 px-2 py-1 rounded hover:bg-myorange hover:text-white"
          disabled={$paneCodeHook[id]?.history.length === 0}
        >
          <ChevronDoubleLeftIcon className="h-5 w-5 mr-1" />
          Undo
        </button>
      </div>
    </div>
  );
};

export default CodeHook;

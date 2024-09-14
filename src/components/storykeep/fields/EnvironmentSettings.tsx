import { useState, useEffect, useCallback, useMemo } from "react";
//import { useStore } from "@nanostores/react";
import { Switch } from "@headlessui/react";
import {
  XMarkIcon,
  PlusIcon,
  ChevronUpDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { envSettings } from "../../../store/storykeep";
import ContentEditableField from "../components/ContentEditableField";
import { knownEnvSettings } from "../../../constants";
import type { EnvSettingDatum } from "../../../types";

const groupOrder = ["Brand", "Core", "Options", "Integrations"];

const EnvironmentSettings = () => {
  //const $envSettings = useStore(envSettings);

  const [localSettings, setLocalSettings] = useState<EnvSettingDatum[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const initializeSettings = useCallback(() => {
    const initialSettings = knownEnvSettings.map(setting => ({
      ...setting,
      value: "",
    }));
    setLocalSettings(initialSettings);
    setHasUnsavedChanges(false);
  }, []);

  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  const handleSettingChange = useCallback(
    (
      index: number,
      field: keyof EnvSettingDatum,
      newValue: string | boolean
    ) => {
      setLocalSettings(prev => {
        const newSettings = [...prev];
        newSettings[index] = { ...newSettings[index], [field]: newValue };
        return newSettings;
      });
      setHasUnsavedChanges(true);
      return true;
    },
    []
  );

  const handleSettingEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing) {
        console.log("must update envSettings", localSettings);
      }
    },
    [localSettings]
  );

  const toggleBooleanSetting = useCallback((index: number) => {
    setLocalSettings(prev => {
      const newSettings = [...prev];
      newSettings[index].value =
        newSettings[index].value === "true" ? "false" : "true";
      return newSettings;
    });
    setHasUnsavedChanges(true);
  }, []);

  const addSocialValue = useCallback((index: number) => {
    setLocalSettings(prev => {
      const newSettings = [...prev];
      const currentValues = newSettings[index].value.split("|");
      currentValues.push("");
      newSettings[index].value = currentValues.join("|");
      return newSettings;
    });
    setHasUnsavedChanges(true);
  }, []);

  const removeSocialValue = useCallback(
    (settingIndex: number, valueIndex: number) => {
      setLocalSettings(prev => {
        const newSettings = [...prev];
        const currentValues = newSettings[settingIndex].value.split("|");
        currentValues.splice(valueIndex, 1);
        newSettings[settingIndex].value = currentValues.join("|");
        return newSettings;
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  const reset = useCallback(() => {
    initializeSettings();
  }, [initializeSettings]);

  const handlePublish = useCallback(() => {
    console.log("Publishing changes:", localSettings);
    envSettings.set({
      current: localSettings,
      original: localSettings,
      history: [],
    });
    setHasUnsavedChanges(false);
  }, [localSettings]);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const hasUncleanData = useMemo(() => {
    return localSettings.some(setting => setting.required && !setting.value);
  }, [localSettings]);

  const uncleanGroups = useMemo(() => {
    return localSettings
      .filter(setting => setting.required && !setting.value)
      .map(setting => setting.group);
  }, [localSettings]);

  useEffect(() => {
    uncleanGroups.forEach(group => {
      setExpandedGroups(prev => ({ ...prev, [group]: true }));
    });
  }, [uncleanGroups]);

  const renderSetting = (setting: EnvSettingDatum, index: number) => {
    const settingId = `env-setting-${setting.name}`;
    const commonInputClass =
      "block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen xs:text-md xs:leading-6";

    return (
      <div key={setting.name} className="space-y-2 mb-4">
        <label
          id={`${settingId}-label`}
          className="block text-md text-mydarkgrey"
        >
          {setting.description}
          {setting.required && (
            <span
              className="text-myorange ml-1"
              title={`Use format: ${setting.defaultValue}`}
            >
              *
            </span>
          )}
        </label>
        {setting.type === "boolean" ? (
          <Switch
            checked={setting.value === "true"}
            onChange={() => toggleBooleanSetting(index)}
            className={`${
              setting.value === "true" ? "bg-myorange" : "bg-mydarkgrey"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
            id={settingId}
            aria-labelledby={`${settingId}-label`}
          >
            <span
              className={`${
                setting.value === "true" ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        ) : setting.type === "string[]" ? (
          <div className="space-y-2">
            {setting.value.split("|").map((value, valueIndex) => (
              <div key={valueIndex} className="flex items-center space-x-2">
                <ContentEditableField
                  id={`${settingId}-${valueIndex}`}
                  value={value}
                  onChange={newValue => {
                    const newValues = setting.value.split("|");
                    newValues[valueIndex] = newValue;
                    return handleSettingChange(
                      index,
                      "value",
                      newValues.join("|")
                    );
                  }}
                  onEditingChange={handleSettingEditingChange}
                  placeholder={setting.value}
                  className={commonInputClass}
                  aria-labelledby={`${settingId}-label`}
                />
                <button
                  onClick={() => removeSocialValue(index, valueIndex)}
                  className="text-myorange hover:text-black"
                  title="Remove value"
                  aria-label={`Remove ${setting.name} value ${valueIndex + 1}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addSocialValue(index)}
              className="flex items-center text-myblue hover:text-myorange"
              aria-label={`Add new ${setting.name} value`}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Value
            </button>
          </div>
        ) : (
          <div className="relative">
            <ContentEditableField
              id={settingId}
              value={setting.value}
              onChange={newValue =>
                handleSettingChange(index, "value", newValue)
              }
              onEditingChange={handleSettingEditingChange}
              placeholder={setting.defaultValue}
              className={commonInputClass}
              aria-labelledby={`${settingId}-label`}
            />
            {setting.required && !setting.value && (
              <ExclamationTriangleIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-myorange" />
            )}
          </div>
        )}
        {setting.required && !setting.value && (
          <p className="text-sm text-myorange">This field is required</p>
        )}
      </div>
    );
  };

  const groupedSettings = groupOrder.reduce(
    (acc, group) => {
      const settings = localSettings.filter(setting => setting.group === group);
      if (settings.length > 0) {
        acc[group] = settings.sort(
          (a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0)
        );
      }
      return acc;
    },
    {} as Record<string, EnvSettingDatum[]>
  );

  return (
    <div className="space-y-8">
      {hasUncleanData && (
        <div className="bg-myorange/10 p-4 rounded-md mb-4">
          <p className="text-black font-bold">
            <ExclamationTriangleIcon className="inline-block h-5 w-5 mr-2" />
            Some required fields are empty. Please fill them out before
            publishing.
          </p>
        </div>
      )}
      {hasUnsavedChanges && (
        <div className="bg-myblue/5 p-4 rounded-md mb-4 space-y-4">
          <p className="text-myblue font-bold">
            Be very careful adjusting any technical settings. When ready hit <strong>publish</strong> to push these changes to your site.</p>
            <p className="text-mydarkgrey">
            Note: this triggers a 0-2 second "reload" of your website. Active users are unlikely to be impacted.
          </p>
<div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={reset}
          className="px-4 py-2 text-white bg-mydarkgrey rounded hover:bg-myblue"
        >
          Cancel
        </button>
        <button
          onClick={handlePublish}
          className="px-4 py-2 text-white bg-myorange rounded hover:bg-myblue disabled:bg-mydarkgrey disabled:cursor-not-allowed"
          disabled={hasUncleanData}
        >
          Publish Changes
        </button>
      </div>

        </div>
      )}
      {groupOrder.map(group => {
        const settings = groupedSettings[group];
        if (!settings) return null;

        return (
          <div key={group} className="rounded-md bg-mywhite shadow-inner">
            <div className="px-3.5 py-3">
              <button
                onClick={() => toggleGroup(group)}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-lg font-bold text-black">{group}</h2>
                <ChevronUpDownIcon className="h-5 w-5 text-mydarkgrey" />
              </button>
              {expandedGroups[group] && (
                <div className="mt-4 space-y-4">
                  {settings.map(setting =>
                    renderSetting(setting, localSettings.indexOf(setting))
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

          </div>
  );
};

export default EnvironmentSettings;

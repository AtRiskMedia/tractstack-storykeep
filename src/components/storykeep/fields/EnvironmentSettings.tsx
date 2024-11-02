import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Switch, Combobox } from "@headlessui/react";
import {
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  ChevronUpDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { envSettings } from "../../../store/storykeep";
import ContentEditableField from "../components/ContentEditableField";
import { DesignSnapshotModal } from "../components/DesignSnapshotModal";
import RebuildProgressModal from "../components/RebuildProgressModal";
import BrandColorPicker from "./BrandColorPicker";
import ThemeVisualSelector from "../components/ThemeVisualSelector";
import { knownEnvSettings } from "../../../constants";
import { socialIconKeys } from "../../../assets/socialIcons";
import type { ChangeEvent } from "react";
import type {
  FullContentMap,
  EnvSettingType,
  EnvSettingDatum,
} from "../../../types";

interface EnvironmentSettingsProps {
  contentMap: FullContentMap[];
  showOnlyGroup?: string;
}

interface SocialMediaInputProps {
  value: string;
  onChange: (newValue: string) => void;
  onRemove: () => void;
  availablePlatforms: string[];
}

function processEnvSettingValue(setting: EnvSettingDatum): string | null {
  if (!setting.value && !setting.required) {
    return null;
  }
  switch (setting.type) {
    case "boolean":
      return setting.value === "true" ? "true" : "false";
    case "number": {
      const num = parseFloat(setting.value);
      return isNaN(num) ? "0" : num.toString();
    }
    case "string[]":
      return setting.value
        .split(",")
        .map(v => v.trim())
        .filter(Boolean)
        .join(",");
    case "string":
      return setting.value || (setting.required ? "" : null);
    default:
      return setting.value || (setting.required ? "" : null);
  }
}

async function saveEnvSettings(
  currentSettings: EnvSettingDatum[],
  originalSettings: EnvSettingDatum[]
): Promise<boolean> {
  try {
    const originalValues = originalSettings.reduce(
      (acc, setting) => {
        acc[setting.name] = processEnvSettingValue(setting);
        return acc;
      },
      {} as Record<string, string | null>
    );
    // Filter and process only changed settings
    const processedSettings = currentSettings
      .map(setting => {
        const processedValue = processEnvSettingValue(setting);
        const originalValue = originalValues[setting.name];
        if (processedValue !== originalValue) {
          return {
            name: setting.name,
            value: processedValue,
          };
        }
        return null;
      })
      .filter(
        (s): s is NonNullable<typeof s> => s !== null && s.value !== null
      );
    // Only proceed if there are actual changes
    if (processedSettings.length === 0) {
      return true; // No changes needed
    }
    const payload: { settings: Record<string, string> } = {
      settings: processedSettings.reduce(
        (acc, setting) => {
          acc[setting.name] = setting.value ?? ``;
          return acc;
        },
        {} as Record<string, string>
      ),
    };
    const saveResponse = await fetch(`/api/concierge/storykeep/env`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload.settings),
    });
    const saveData = await saveResponse.json();
    if (!saveData.success) {
      throw new Error(saveData.error || "Failed to save environment settings");
    }
    return true;
  } catch (error) {
    console.error("Error saving environment settings:", error);
    return false;
  }
}

const groupOrder = [
  "Brand",
  "Home",
  "Core",
  "Options",
  "Integrations",
  "Backend",
];
const wordmarkModeOptions = ["default", "logo", "wordmark"];
const themeOptions = [
  "light",
  "light-bw",
  "light-bold",
  "dark",
  "dark-bw",
  "dark-bold",
];

const EnvironmentSettings = ({
  contentMap,
  showOnlyGroup,
}: EnvironmentSettingsProps) => {
  const [
    isGeneratingSnapshotsThenPublish,
    setIsGeneratingSnapshotsThenPublish,
  ] = useState(false);
  const [isGeneratingSnapshots, setIsGeneratingSnapshots] = useState(false);
  const [showRebuildModal, setShowRebuildModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [localSettings, setLocalSettings] = useState<EnvSettingDatum[]>([]);
  const [originalSettings, setOriginalSettings] = useState<EnvSettingDatum[]>(
    []
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      Brand: true,
    }
  );

  const commonInputClass =
    "block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-myorange/20 placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-myorange xs:text-md xs:leading-6";

  const storyFragmentItems = useMemo(
    () =>
      contentMap
        .filter(item => item.type === "StoryFragment")
        .map(item => ({
          slug: item.slug,
          title: item.title,
        })),
    [contentMap]
  );
  const tractStackItems = useMemo(
    () =>
      contentMap
        .filter(item => item.type === "TractStack")
        .map(item => ({
          slug: item.slug,
          title: item.title,
        })),
    [contentMap]
  );

  async function fetchEnv() {
    try {
      const response = await fetch(`/api/concierge/storykeep/env`);
      const data = await response.json();
      if (data.success) {
        const newData = JSON.parse(data.data);
        const initialSettings = knownEnvSettings.map(setting => {
          let value = newData[setting.name] ?? "";
          if (setting.type === "boolean") {
            value = value === "1" || value === true ? "true" : "false";
          }
          return {
            ...setting,
            value,
          };
        });
        setLocalSettings(initialSettings);
        setOriginalSettings(initialSettings);
        setHasUnsavedChanges(false);
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching env:", error);
    }
  }

  useEffect(() => {
    fetchEnv();
  }, []);

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
      const currentValues = newSettings[index].value.split(",").filter(Boolean);
      const usedPlatforms = currentValues.map(value => value.split("|")[0]);
      const availablePlatforms = socialIconKeys.filter(
        key => !usedPlatforms.includes(key)
      );

      if (availablePlatforms.length > 0) {
        const newPlatform = availablePlatforms[0];
        currentValues.push(`${newPlatform}|`);
        newSettings[index].value = currentValues.join(",");
      }
      return newSettings;
    });
    setHasUnsavedChanges(true);
  }, []);

  const removeSocialValue = useCallback((index: number, valueIndex: number) => {
    setLocalSettings(prev => {
      const newSettings = [...prev];
      const currentValues = newSettings[index].value.split(",").filter(Boolean);
      currentValues.splice(valueIndex, 1);
      newSettings[index].value = currentValues.join(",");
      return newSettings;
    });
    setHasUnsavedChanges(true);
  }, []);

  const SocialMediaInput = memo(
    ({
      value,
      onChange,
      onRemove,
      availablePlatforms,
    }: SocialMediaInputProps) => {
      const [platform, url] = value.split("|");
      const [localUrl, setLocalUrl] = useState(url || "");
      const [isEditing, setIsEditing] = useState(false);
      useEffect(() => {
        if (!isEditing) {
          setLocalUrl(url || "");
        }
      }, [url, isEditing]);
      const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIsEditing(true);
        const newUrl = e.target.value;
        setLocalUrl(newUrl);
      };
      const handleUrlBlur = () => {
        setIsEditing(false);
        onChange(`${platform}|${localUrl}`);
      };
      if (!isLoaded) return <div>Loading...</div>;

      return (
        <div className="flex items-center space-x-2">
          <Combobox
            value={platform}
            onChange={(newPlatform: string) => {
              onChange(`${newPlatform}|${localUrl}`);
            }}
          >
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-myorange sm:text-sm">
                <Combobox.Input
                  className={`${commonInputClass} pr-10`}
                  displayValue={(platformValue: string) => platformValue}
                  onChange={event => {
                    const newPlatform = event.target.value;
                    onChange(`${newPlatform}|${localUrl}`);
                  }}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-mydarkgrey"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Combobox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {availablePlatforms.map(key => (
                  <Combobox.Option
                    key={key}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-myorange/10 text-myblack"
                          : "text-mydarkgrey"
                      }`
                    }
                    value={key}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-bold" : "font-normal"
                          }`}
                        >
                          {key}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-myorange" : "text-myorange"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
          <input
            type="text"
            value={localUrl}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="https://"
            className={commonInputClass}
          />
          <button
            onClick={onRemove}
            className="text-myorange hover:text-black"
            title="Remove social media"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      );
    }
  );

  const handleSave = useCallback(async () => {
    try {
      const success = await saveEnvSettings(localSettings, originalSettings);
      if (success) {
        envSettings.set({
          current: localSettings,
          original: localSettings,
          history: [],
        });
        setOriginalSettings(localSettings);
        setHasUnsavedChanges(false);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 7000);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  }, [localSettings, originalSettings]);

  const handleSavePublish = useCallback(async () => {
    try {
      const success = await saveEnvSettings(localSettings, originalSettings);
      if (!success) {
        throw new Error("Failed to save environment settings");
      }

      envSettings.set({
        current: localSettings,
        original: localSettings,
        history: [],
      });
      setOriginalSettings(localSettings);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);

      // Check if brand colors changed
      const brandChanged = originalSettings.some(
        setting =>
          setting.name === "PUBLIC_BRAND" &&
          setting.value !==
            localSettings.find(s => s.name === "PUBLIC_BRAND")?.value
      );

      if (brandChanged) {
        // update the css var colours
        const brandColors = localSettings
          .find(s => s.name === "PUBLIC_BRAND")
          ?.value.split(",")
          .map(color => `#${color.trim()}`);
        if (brandColors)
          brandColors.forEach((color, index) => {
            document.documentElement.style.setProperty(
              `--brand-${index + 1}`,
              color
            );
          });
        setIsGeneratingSnapshotsThenPublish(true);
      } else {
        setShowRebuildModal(true);
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 7000);
    } catch (error) {
      console.error("Error in handleSavePublish:", error);
    }
  }, [localSettings, originalSettings]);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const hasUncleanData = useMemo(() => {
    return localSettings.some(
      setting =>
        setting.required &&
        !setting.value &&
        (showOnlyGroup ? setting.group === showOnlyGroup : true)
    );
  }, [localSettings]);

  const uncleanGroups = useMemo(() => {
    return localSettings
      .filter(setting => setting.required && !setting.value)
      .map(setting => setting.group);
  }, [localSettings]);

  useEffect(() => {
    if (uncleanGroups.length > 0) {
      setExpandedGroups(prev => {
        const newGroups = { ...prev };
        uncleanGroups.forEach(group => {
          newGroups[group] = true;
        });
        return newGroups;
      });
    }
  }, [uncleanGroups]);

  const renderSetting = (setting: EnvSettingDatum, index: number) => {
    const settingId = `env-setting-${setting.name}`;

    const renderLabel = () => (
      <label
        id={`${settingId}-label`}
        className="block text-md text-mydarkgrey flex items-center"
      >
        {setting.description}
        <div className="relative ml-1 group">
          <InformationCircleIcon className="h-5 w-5 text-myblue cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-white border border-mylightgrey rounded p-2 shadow-lg z-10 w-64">
            <p className="text-sm text-mydarkgrey">
              {setting.required ? "Required field. " : ""}
              Use format: {setting.defaultValue}
            </p>
          </div>
        </div>
        {setting.required && (
          <span className="text-myorange ml-1" title="This field is required">
            *
          </span>
        )}
      </label>
    );

    if (setting.type === "boolean") {
      return (
        <div key={setting.name} className="space-y-2 mb-4">
          {renderLabel()}
          <Switch
            checked={setting.value === "1" || setting.value === "true"}
            onChange={() => toggleBooleanSetting(index)}
            className={`${
              setting.value === "1" || setting.value === "true"
                ? "bg-myorange"
                : "bg-mydarkgrey"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
            id={settingId}
            aria-labelledby={`${settingId}-label`}
          >
            <span
              className={`${
                setting.value === "1" || setting.value === "true"
                  ? "translate-x-6"
                  : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      );
    }

    if (setting.name === "PUBLIC_WORDMARK_MODE") {
      return (
        <div key={setting.name} className="space-y-2 mb-4 max-w-xs">
          {renderLabel()}
          <Combobox
            value={setting.value || "default"}
            onChange={newValue => handleSettingChange(index, "value", newValue)}
          >
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className={commonInputClass}
                  displayValue={(value: string) => value}
                  onChange={event =>
                    handleSettingChange(index, "value", event.target.value)
                  }
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-mylightgrey"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {wordmarkModeOptions.map(option => (
                  <Combobox.Option
                    key={option}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-myorange/10 text-myblack"
                          : "text-mydarkgrey"
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-bold" : "font-normal"
                          }`}
                        >
                          {option}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-myorange"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      );
    } else if (setting.name === "PUBLIC_THEME") {
     return (
    <div key={setting.name} className="space-y-2 mb-4">
      {renderLabel()}
      <ThemeVisualSelector
        value={setting.value || "light-bold"}
        onChange={newValue => handleSettingChange(index, "value", newValue)}
        brandColors={localSettings.find(s => s.name === "PUBLIC_BRAND")?.value}
      />
    </div>
  ) 
    } else if (setting.name === "PUBLIC_SOCIALS") {
      const values = setting.value.split(",");
      const usedPlatforms = values.map(value => value.split("|")[0]);

      return (
        <div key={setting.name} className="space-y-2 mb-4">
          {renderLabel()}
          <div className="space-y-2">
            {values.map((value, valueIndex) => {
              const availablePlatforms = socialIconKeys.filter(
                key =>
                  !usedPlatforms.includes(key) || key === value.split("|")[0]
              );
              return (
                <SocialMediaInput
                  key={valueIndex}
                  value={value}
                  onChange={newValue => {
                    const newValues = [...values];
                    newValues[valueIndex] = newValue;
                    handleSettingChange(index, "value", newValues.join(","));
                  }}
                  onRemove={() => removeSocialValue(index, valueIndex)}
                  availablePlatforms={availablePlatforms}
                />
              );
            })}
            <button
              onClick={() => addSocialValue(index)}
              className="flex items-center text-myblue hover:text-myorange"
              disabled={usedPlatforms.length === socialIconKeys.length}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Social Media
            </button>
          </div>
        </div>
      );
    } else if (setting.name === "PUBLIC_TRACTSTACK") {
      return (
        <div key={setting.name} className="space-y-2 mb-4">
          {renderLabel()}
          <Combobox
            value={setting.value}
            onChange={newValue => handleSettingChange(index, "value", newValue)}
          >
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className={`${commonInputClass}`}
                  displayValue={(slug: string) => slug}
                  onChange={event =>
                    handleSettingChange(index, "value", event.target.value)
                  }
                  autoComplete="off"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-mylightgrey"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Combobox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {tractStackItems.map(tractStack => (
                  <Combobox.Option
                    key={tractStack.slug}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-myorange/10 text-myblack"
                          : "text-mydarkgrey"
                      }`
                    }
                    value={tractStack.slug}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate`}>
                          <strong>{tractStack.slug}</strong> |{" "}
                          {tractStack.title}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-myorange"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      );
    } else if (setting.name === "PUBLIC_BRAND") {
      return (
        <div key={setting.name} className="space-y-2 mb-4">
          {renderLabel()}
          <BrandColorPicker
            value={setting.value}
            onChange={newValue => handleSettingChange(index, "value", newValue)}
            onEditingChange={() => setHasUnsavedChanges(true)}
          />
        </div>
      );
    } else if (setting.name === "PUBLIC_HOME") {
      return (
        <div key={setting.name} className="space-y-2 mb-4">
          {renderLabel()}
          <Combobox
            value={setting.value}
            onChange={newValue => handleSettingChange(index, "value", newValue)}
          >
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className={`${commonInputClass}`}
                  displayValue={(slug: string) => slug}
                  onChange={event =>
                    handleSettingChange(index, "value", event.target.value)
                  }
                  autoComplete="off"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-mylightgrey"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Combobox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {storyFragmentItems.map(item => (
                  <Combobox.Option
                    key={item.slug}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-myorange/10 text-myblack"
                          : "text-mydarkgrey"
                      }`
                    }
                    value={item.slug}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate`}>
                          <strong>{item.slug}</strong> | {item.title}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-myorange"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      );
    }

    return (
      <div key={setting.name} className="space-y-2 mb-4">
        {renderLabel()}
        {setting.type === ("boolean" as EnvSettingType) ? (
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
                  onEditingChange={() => {}}
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
              onEditingChange={() => {}}
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
      <RebuildProgressModal
        isOpen={showRebuildModal}
        onClose={() => setShowRebuildModal(false)}
      />
      {saveSuccess && (
        <div className="bg-mygreen/10 p-4 rounded-md mb-4">
          <p className="text-black font-bold">
            <CheckIcon className="inline-block h-5 w-5 mr-2" />
            Save successful
          </p>
        </div>
      )}
      {hasUncleanData && (
        <div className="bg-myorange/10 p-4 rounded-md mb-4">
          <p className="text-black font-bold">
            <ExclamationTriangleIcon className="inline-block h-5 w-5 mr-2" />
            Some required fields are empty. Please fill them out before
            publishing.
          </p>
        </div>
      )}
      {!showOnlyGroup && hasUnsavedChanges && !hasUncleanData && (
        <div className="bg-myblue/5 p-4 rounded-md mb-4 space-y-4">
          <p className="text-myblue font-bold">
            Be very careful adjusting any technical settings. When ready hit{" "}
            <strong>publish</strong> to push these changes to your site.
          </p>
          <p className="text-mydarkgrey">
            Note: this triggers a 0-2 second "reload" of your website. Active
            users are unlikely to be impacted.
          </p>
          <div className="flex justify-end space-x-2 mt-6">
            <a
              className="px-4 py-2 text-white bg-mydarkgrey rounded hover:bg-myblue"
              href="/storykeep"
            >
              Cancel
            </a>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-myorange rounded hover:bg-myblue disabled:bg-mydarkgrey disabled:cursor-not-allowed"
              disabled={hasUncleanData}
            >
              Save Changes Only
            </button>
            <button
              onClick={handleSavePublish}
              className="px-4 py-2 text-black bg-myorange/50 rounded hover:bg-myblue hover:text-white"
            >
              Save and Re-Publish Website
            </button>
          </div>
        </div>
      )}
      {groupOrder.map(group => {
        // Skip groups that don't match showOnlyGroup if it's set
        if (showOnlyGroup && group !== showOnlyGroup) return null;

        const settings = groupedSettings[group];
        if (!settings) return null;

        return (
          <div key={group} className="rounded-md bg-mywhite shadow-inner">
            <div className="px-3.5 py-3">
              {!showOnlyGroup && (
                <button
                  onClick={() => toggleGroup(group)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-lg font-bold text-black">{group}</h2>
                  <ChevronUpDownIcon className="h-5 w-5 text-mydarkgrey" />
                </button>
              )}
              {(expandedGroups[group] || showOnlyGroup) && (
                <div className={`${showOnlyGroup ? "" : "mt-4"} space-y-4`}>
                  {settings.map(setting =>
                    renderSetting(setting, localSettings.indexOf(setting))
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {showOnlyGroup && hasUnsavedChanges && !hasUncleanData && (
        <div className="bg-myblue/5 p-4 rounded-md mb-4 space-y-4">
          <p className="text-myblue font-bold">
            When ready hit <strong>publish</strong> to push these changes to
            your site.
          </p>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleSavePublish}
              className="px-4 py-2 text-white bg-myorange rounded hover:bg-myblue"
            >
              Save and Re-Publish Website
            </button>
          </div>
        </div>
      )}
      {isGeneratingSnapshots && (
        <DesignSnapshotModal onClose={() => setIsGeneratingSnapshots(false)} />
      )}
      {isGeneratingSnapshotsThenPublish && (
        <DesignSnapshotModal
          onClose={() => {
            setIsGeneratingSnapshotsThenPublish(false);
            setShowRebuildModal(true);
          }}
        />
      )}
      {!showOnlyGroup && (
        <div className="pt-12">
          <div className="flex justify-start space-x-2">
            <h3 className="text-lg font-bold font-action">Special Actions:</h3>
            <button
              onClick={() => setIsGeneratingSnapshots(true)}
              className="px-4 py-2 text-white bg-myblack rounded hover:bg-myblue"
            >
              Regenerate Design Previews
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSettings;

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { Combobox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import {
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { paneFragmentIds, paneFragmentBgPane } from "../../../store/storykeep";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import { SvgBreaks } from "../../../assets/shapes";
import { cloneDeep, classNames } from "../../../utils/helpers";

const availableCollections = ["kCz"] as const;
const availableImagesWithPrefix = ["none", ...Object.keys(SvgBreaks)] as const;

type Viewport = "desktop" | "tablet" | "mobile";
type Collection = (typeof availableCollections)[number];
type ImageOption = (typeof availableImagesWithPrefix)[number];

interface ViewportSettings {
  image: ImageOption;
}

interface LocalSettings {
  collection: Collection | "";
  colour: string;
  desktop: ViewportSettings;
  tablet: ViewportSettings;
  mobile: ViewportSettings;
}

interface PaneBreakSettingsProps {
  id: string;
  type: "desktop" | "mobile";
}

export const PaneBreakSettings = ({ id, type }: PaneBreakSettingsProps) => {
  const $paneFragmentIds = useStore(paneFragmentIds, { keys: [id] });
  const [fragmentId, setFragmentId] = useState<string | null>(null);
  const $paneFragmentBgPane = useStore(paneFragmentBgPane, {
    keys: [fragmentId ?? ""],
  });
  const { updateStoreField, handleUndo } = useStoryKeepUtils(fragmentId ?? "");

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    collection: "",
    colour: "#10120d",
    desktop: { image: "none" },
    tablet: { image: "none" },
    mobile: { image: "none" },
  });

  const availableImages = availableImagesWithPrefix.map(img =>
    img === "none"
      ? "none"
      : (img.replace(localSettings.collection, "") as ImageOption)
  );

  useEffect(() => {
    const fragmentIds = $paneFragmentIds[id]?.current;
    if (fragmentIds && fragmentIds.length > 0) {
      setFragmentId(fragmentIds[0]);
    }
  }, [$paneFragmentIds, id]);

  useEffect(() => {
    if (fragmentId && $paneFragmentBgPane[fragmentId]?.current) {
      const currentSettings = $paneFragmentBgPane[fragmentId].current;
      const artpack = currentSettings.optionsPayload.artpack;
      const hiddenViewports = currentSettings.hiddenViewports.split(",");

      setLocalSettings({
        collection: (artpack?.desktop?.collection || "") as Collection,
        colour: artpack?.desktop?.svgFill || "#10120d",
        desktop: {
          image: (hiddenViewports.includes("desktop")
            ? "none"
            : artpack?.desktop?.image || "none") as ImageOption,
        },
        tablet: {
          image: (hiddenViewports.includes("tablet")
            ? "none"
            : artpack?.tablet?.image || "none") as ImageOption,
        },
        mobile: {
          image: (hiddenViewports.includes("mobile")
            ? "none"
            : artpack?.mobile?.image || "none") as ImageOption,
        },
      });
    }
  }, [fragmentId, $paneFragmentBgPane]);

  const handleChange = useCallback(
    <K extends keyof LocalSettings>(
      field: K,
      value: LocalSettings[K] | ImageOption,
      viewport?: Viewport
    ) => {
      setLocalSettings(prev => {
        let newSettings: LocalSettings;

        if (viewport) {
          newSettings = {
            ...prev,
            [viewport]: {
              ...prev[viewport],
              image: value as ImageOption,
            },
          };
        } else {
          newSettings = { ...prev, [field]: value };
        }

        if (fragmentId) {
          const hiddenViewports = (["desktop", "tablet", "mobile"] as const)
            .filter(vp => newSettings[vp].image === "none")
            .join(",");

          const oldPane = cloneDeep($paneFragmentBgPane[fragmentId].current);
          const newBgPane = {
            ...oldPane,
            hiddenViewports: hiddenViewports || "none",
            optionsPayload: {
              ...oldPane.optionsPayload,
              artpack: {
                desktop: {
                  collection: newSettings.collection,
                  image:
                    newSettings.desktop.image === "none"
                      ? ""
                      : newSettings.desktop.image,
                  mode: "break",
                  svgFill: newSettings.colour,
                },
                tablet: {
                  collection: newSettings.collection,
                  image:
                    newSettings.tablet.image === "none"
                      ? ""
                      : newSettings.tablet.image,
                  mode: "break",
                  svgFill: newSettings.colour,
                },
                mobile: {
                  collection: newSettings.collection,
                  image:
                    newSettings.mobile.image === "none"
                      ? ""
                      : newSettings.mobile.image,
                  mode: "break",
                  svgFill: newSettings.colour,
                },
              },
            },
          };

          updateStoreField("paneFragmentBgPane", newBgPane);
        }

        return newSettings;
      });

      return true;
    },
    [$paneFragmentBgPane, fragmentId, updateStoreField]
  );

  const renderViewportSettings = (viewport: Viewport) => {
    const Icon =
      viewport === "mobile"
        ? DevicePhoneMobileIcon
        : viewport === "tablet"
          ? DeviceTabletIcon
          : ComputerDesktopIcon;

    return (
      <div key={viewport} className="mb-4">
        <div className="flex items-center space-x-2">
          <Icon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
          <Combobox
            as="div"
            value={localSettings[viewport].image}
            onChange={(value: ImageOption) =>
              handleChange(viewport, value, viewport)
            }
            className="relative flex-grow"
          >
            <div className="relative mt-1 flex-grow">
              <Combobox.Input
                className="w-full border-mydarkgrey rounded-md py-2 pl-3 pr-10 shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
                displayValue={(image: ImageOption) => image}
                onChange={event =>
                  handleChange(
                    viewport,
                    event.target.value as ImageOption,
                    viewport
                  )
                }
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-mydarkgrey"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {availableImages.map(image => (
                <Combobox.Option
                  key={image}
                  value={image}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-myorange text-white" : "text-black"
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-bold" : "font-normal"
                        }`}
                      >
                        {image}
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
          </Combobox>
        </div>
      </div>
    );
  };

  if (!fragmentId) return <div>Loading...</div>;
  console.log(type);
  return (
    <div
      className={classNames(
        `flex`,
        type === `mobile` ? `flex-nowrap gap-x-4 gap-y-2` : `flex-wrap`
      )}
    >
      <div
        className={classNames(
          type === `mobile` ? `max-w-5/12` : `w-fit-contents mr-8`
        )}
      >
        <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner px-3.5 py-1.5">
          <label className="block text-sm font-medium text-mydarkgrey">
            Collection
          </label>
          <select
            value={localSettings.collection}
            onChange={e =>
              handleChange("collection", e.target.value as Collection)
            }
            className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
          >
            <option value="">Select a collection</option>
            {availableCollections.map(collection => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-mydarkgrey">
            Colour (applies to all viewports)
          </label>
          <input
            type="color"
            value={localSettings.colour}
            onChange={e => handleChange("colour", e.target.value)}
            className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
          />
        </div>
        {renderViewportSettings("desktop")}
        {renderViewportSettings("tablet")}
        {renderViewportSettings("mobile")}
        <div className="flex justify-end">
          <button
            onClick={() => handleUndo("paneFragmentBgPane", fragmentId)}
            className="flex items-center text-myblack bg-mygreen/50 px-2 py-1 rounded hover:bg-myorange hover:text-white"
            disabled={$paneFragmentBgPane[fragmentId]?.history.length === 0}
          >
            <ChevronDoubleLeftIcon className="h-5 w-5 mr-1" />
            Undo
          </button>
        </div>
      </div>
    </div>
  );
};

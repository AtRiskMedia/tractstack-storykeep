import { useMemo, useState, useEffect, useCallback } from "react";
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
import { cloneDeep, classNames, tailwindToHex } from "../../../utils/helpers";
import { SvgBreaks } from "../../../assets/shapes";
import { tailwindColors } from "../../../assets/tailwindColors";

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

  const [tailwindColorQuery, setTailwindColorQuery] = useState("");
  const [selectedTailwindColor, setSelectedTailwindColor] = useState("");

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
  const [query, setQuery] = useState("");

  const filteredImages = useMemo(() => {
    return query === ""
      ? availableImages
      : availableImages.filter(image =>
          image.toLowerCase().includes(query.toLowerCase())
        );
  }, [query, availableImages]);

  const updateStore = useCallback(
    (
      newSettings: LocalSettings,
      viewport?: Viewport,
      newImage?: ImageOption
    ) => {
      if (fragmentId) {
        const hiddenViewports = (["desktop", "tablet", "mobile"] as const)
          .filter(vp => newSettings[vp].image === "none")
          .join(",");

        const oldPane = $paneFragmentBgPane[fragmentId].current;
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

        // If a specific viewport was updated, only update that viewport
        if (viewport && newImage) {
          newBgPane.optionsPayload.artpack[viewport].image =
            newImage === "none" ? "" : newImage;
        }

        updateStoreField("paneFragmentBgPane", newBgPane);
        updateStoreField(
          "paneFragmentIds",
          [...$paneFragmentIds[id].current],
          id
        );
      }
    },
    [fragmentId, $paneFragmentBgPane, updateStoreField]
  );

  const handleUndoClick = useCallback(() => {
    if (fragmentId) {
      handleUndo("paneFragmentBgPane", fragmentId);
    }
  }, [fragmentId, handleUndo]);

  const handleChange = useCallback(
    <K extends keyof LocalSettings>(
      field: K,
      value: LocalSettings[K] | ImageOption,
      viewport?: Viewport
    ) => {
      setLocalSettings(prev => {
        const newSettings = viewport
          ? {
              ...prev,
              [viewport]: {
                ...prev[viewport],
                image: value as ImageOption,
              },
            }
          : { ...prev, [field]: value };

        // Immediately update the store
        updateStore(newSettings, viewport, value as ImageOption);

        return newSettings;
      });

      return true;
    },
    [updateStore]
  );

  const updateColor = useCallback((newColor: string) => {
    setLocalSettings(prev => ({
      ...prev,
      colour: newColor,
    }));
  }, []);

  const tailwindColorOptions = useMemo(
    () =>
      Object.entries(tailwindColors).flatMap(([colorName, shades]) =>
        shades.map((_, index) => `${colorName}-${(index + 1) * 100}`)
      ),
    []
  );

  const filteredTailwindColors = useMemo(
    () =>
      tailwindColorQuery === ""
        ? tailwindColorOptions
        : tailwindColorOptions.filter(color =>
            color.toLowerCase().includes(tailwindColorQuery.toLowerCase())
          ),
    [tailwindColorOptions, tailwindColorQuery]
  );

  const handleHexColorChange = useCallback(
    (newHexColor: string) => {
      updateColor(newHexColor);
      const matchingTailwindColor = tailwindColorOptions.find(
        color => tailwindToHex(`bg-${color}`) === newHexColor
      );
      setSelectedTailwindColor(matchingTailwindColor || "");
    },
    [tailwindColorOptions]
  );

  const handleTailwindColorChange = useCallback((newTailwindColor: string) => {
    const hexColor = tailwindToHex(`bg-${newTailwindColor}`);
    updateColor(hexColor);
    setSelectedTailwindColor(newTailwindColor);
  }, []);

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
      const currentColor = artpack?.desktop?.svgFill || "#10120d";
      const matchingTailwindColor = tailwindColorOptions.find(
        color => tailwindToHex(`bg-${color}`) === currentColor
      );
      if (matchingTailwindColor) {
        setSelectedTailwindColor(matchingTailwindColor);
      }
      setLocalSettings({
        collection: (artpack?.desktop?.collection || "") as Collection,
        colour: currentColor,
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
  }, [fragmentId, $paneFragmentBgPane, tailwindColorOptions]);

  useEffect(() => {
    if (fragmentId && $paneFragmentBgPane[fragmentId]?.current) {
      const currentSettings = $paneFragmentBgPane[fragmentId].current;
      const currentColor =
        currentSettings.optionsPayload.artpack?.desktop?.svgFill;

      if (currentColor !== localSettings.colour) {
        const newBgPane = {
          ...cloneDeep(currentSettings),
          optionsPayload: {
            ...currentSettings.optionsPayload,
            artpack: {
              desktop: {
                ...currentSettings.optionsPayload?.artpack?.desktop,
                svgFill: localSettings.colour,
              },
              tablet: {
                ...currentSettings.optionsPayload?.artpack?.tablet,
                svgFill: localSettings.colour,
              },
              mobile: {
                ...currentSettings.optionsPayload?.artpack?.mobile,
                svgFill: localSettings.colour,
              },
            },
          },
        };
        updateStoreField("paneFragmentBgPane", newBgPane);
      }
    }
  }, [fragmentId, localSettings.colour, $paneFragmentBgPane, updateStoreField]);

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
                autoComplete="off"
                displayValue={(image: ImageOption) => image}
                onChange={event => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-mydarkgrey"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredImages.map(image => (
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
        <div className="mb-2">
          <label className="block text-sm font-medium text-mydarkgrey">
            Colour (applies to all viewports)
          </label>
          <input
            type="color"
            value={localSettings.colour}
            onChange={e => handleHexColorChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-mydarkgrey">
            Tailwind Color Class
          </label>
          <Combobox
            as="div"
            value={selectedTailwindColor}
            onChange={handleTailwindColorChange}
            className="relative mt-1"
          >
            <div className="relative">
              <Combobox.Input
                className="w-full rounded-md border-0 px-2.5 py-1.5 pr-10 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-myorange sm:text-sm sm:leading-6"
                onChange={event => setTailwindColorQuery(event.target.value)}
                displayValue={(color: string) => color}
                placeholder="Select a Tailwind color"
                autoComplete="off"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-myblue"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredTailwindColors.map(color => (
                <Combobox.Option
                  key={color}
                  value={color}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-10 pr-4",
                      active ? "bg-myorange text-white" : "text-myblack"
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={classNames(
                          "block truncate",
                          selected ? "font-bold" : "font-normal"
                        )}
                      >
                        {color}
                      </span>
                      {selected && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 left-0 flex items-center pl-3",
                            active ? "text-white" : "text-myorange"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </div>

        {renderViewportSettings("mobile")}
        {renderViewportSettings("tablet")}
        {renderViewportSettings("desktop")}
        <div className="flex justify-end">
          <button
            onClick={handleUndoClick}
            className="flex items-center text-myblack bg-mygreen/50 px-2 py-1 rounded hover:bg-myorange hover:text-white disabled:hidden"
            disabled={
              !fragmentId ||
              $paneFragmentBgPane[fragmentId]?.history.length === 0
            }
          >
            <ChevronDoubleLeftIcon className="h-5 w-5 mr-1" />
            Undo
          </button>
        </div>
      </div>
    </div>
  );
};

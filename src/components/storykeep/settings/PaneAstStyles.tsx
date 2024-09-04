import { useMemo, useState, useEffect } from "react";
import { Switch, Combobox, Listbox } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import {
  XMarkIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import {
  getActiveTagData,
  updateViewportTuple,
  findCodeNode,
  cleanHtmlAst,
} from "../../../utils/compositor/markdownUtils";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import ViewportComboBox from "../fields/ViewportComboBox";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import { classNames, cloneDeep } from "../../../utils/helpers";
import { tailwindClasses } from "../../../assets/tailwindClasses";
import { tagTitles } from "../../../constants";
import ImageMeta from "../fields/ImageMeta";
import LinksMeta from "../fields/LinksMeta";
import StyleMemory from "../fields/StyleMemory";
import type { Root } from "hast";
import type {
  ClassNamesPayloadInnerDatum,
  ClassNamesPayloadDatumValue,
  PaneAstTargetId,
  Tag,
  Tuple,
} from "../../../types";

interface StyleTab {
  name: string;
  tag: Tag;
  priority: number;
}

export const PaneAstStyles = (props: {
  id: string;
  targetId: PaneAstTargetId;
  type: "desktop" | "mobile";
}) => {
  const { id, targetId, type } = props;
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [styleFilter, setStyleFilter] = useState("popular");
  const [selectedClass, setSelectedClass] = useState("");
  const [widgetConfigMode, setWidgetConfigMode] = useState(false);
  const [widgetData, setWidgetData] = useState<string[]>([]);
  const [imageMeta, setImageMeta] = useState(false);
  const [linkTargetKey, setLinkTargetKey] = useState<string>(``);
  const [linkMode, setLinkMode] = useState<`button` | `hover` | null>(null);
  const [query, setQuery] = useState("");
  const [addClass, setAddClass] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [tabs, setTabs] = useState<StyleTab[] | null>(null);
  const [parentLayer, setParentLayer] = useState(0);
  const [mobileValue, setMobileValue] = useState<string>(``);
  const [tabletValue, setTabletValue] = useState<string>(``);
  const [desktopValue, setDesktopValue] = useState<string>(``);
  const [confirm, setConfirm] = useState<string | null>(null);
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [targetId.paneId],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[targetId.paneId].current;
  const { updateStoreField } = useStoryKeepUtils(markdownFragmentId, []);
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const { handleUndo } = useStoryKeepUtils(id, []);
  const markdownDatum = $paneFragmentMarkdown[markdownFragmentId].current;
  const hasHistory = !!$paneFragmentMarkdown[markdownFragmentId].history.length;
  const hasModal = markdownDatum.payload.isModal;
  const markdownLookup = useMemo(() => {
    return markdownDatum?.markdown?.htmlAst
      ? generateMarkdownLookup(markdownDatum.markdown.htmlAst)
      : null;
  }, [markdownDatum?.markdown?.htmlAst]);
  const thisTag = markdownLookup?.nthTag[targetId.outerIdx];
  const thisTagTitle = thisTag && tagTitles[thisTag];
  const hasTextShapeOutside =
    (markdownDatum.payload.textShapeOutsideDesktop &&
      markdownDatum.payload.textShapeOutsideDesktop !== `none`) ||
    (markdownDatum.payload.textShapeOutsideTablet &&
      markdownDatum.payload.textShapeOutsideTablet !== `none`) ||
    (markdownDatum.payload.textShapeOutsideMobile &&
      markdownDatum.payload.textShapeOutsideMobile !== `none`);
  const isLink =
    (typeof targetId.idx === `number` &&
      targetId.tag === `a` &&
      typeof targetId.buttonTarget === `string`) ||
    (linkTargetKey && linkTargetKey !== `*`);
  const isListItem =
    typeof targetId.idx === `number`
      ? typeof markdownLookup?.listItemsLookup[targetId.outerIdx] ===
          `object` &&
        typeof markdownLookup.listItemsLookup[targetId.outerIdx][
          targetId.idx
        ] === `number`
      : null;
  const isCodeItem =
    typeof targetId.idx === `number`
      ? typeof markdownLookup?.codeItemsLookup[targetId.outerIdx] ===
          `object` &&
        typeof markdownLookup.codeItemsLookup[targetId.outerIdx][
          targetId.idx
        ] === `number`
      : null;
  const isImage =
    typeof targetId.idx === `number`
      ? typeof markdownLookup?.imagesLookup[targetId.outerIdx] === `object` &&
        typeof markdownLookup.imagesLookup[targetId.outerIdx][targetId.idx] ===
          `number`
      : null;
  const parentClassNamesPayload =
    markdownDatum?.payload.optionsPayload.classNamesPayload.parent;
  const modalClassNamesPayload =
    markdownDatum?.payload.optionsPayload.classNamesPayload.modal;
  const imageClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.img;
  const codeItemClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.code;
  const listItemClassNamesPayload =
    markdownDatum.payload.optionsPayload.classNamesPayload.li;
  const outerTagClassNamesPayload =
    thisTag && markdownDatum.payload.optionsPayload.classNamesPayload[thisTag];
  const linkTargetLookup =
    typeof linkTargetKey === `string` ? linkTargetKey : targetId.buttonTarget;
  const buttonClassNamesPayload =
    isLink &&
    linkMode === `button` &&
    linkTargetLookup &&
    linkTargetLookup !== `*` &&
    markdownDatum?.payload?.optionsPayload?.buttons
      ? markdownDatum.payload.optionsPayload.buttons[linkTargetLookup]
          .classNamesPayload.button
      : isLink &&
          linkMode === `hover` &&
          linkTargetLookup &&
          linkTargetLookup !== `*` &&
          markdownDatum?.payload?.optionsPayload?.buttons
        ? markdownDatum.payload.optionsPayload.buttons[linkTargetLookup]
            .classNamesPayload.hover
        : null;
  const buttonClassNamesPayloadArray = useMemo(() => {
    if (
      isLink &&
      linkTargetLookup &&
      linkTargetLookup !== "*" &&
      markdownDatum?.payload?.optionsPayload?.buttons
    ) {
      const buttonData =
        markdownDatum.payload.optionsPayload.buttons[linkTargetLookup];
      return [
        buttonData.classNamesPayload.button.classes,
        buttonData.classNamesPayload.hover.classes,
      ] as ClassNamesPayloadDatumValue[];
    }
    return [] as ClassNamesPayloadDatumValue[];
  }, [isLink, linkTargetLookup, markdownDatum]);

  const classNamesPayload =
    isLink && buttonClassNamesPayload
      ? buttonClassNamesPayload
      : activeTag === `img`
        ? imageClassNamesPayload
        : activeTag === `code`
          ? codeItemClassNamesPayload
          : activeTag === `li`
            ? listItemClassNamesPayload
            : outerTagClassNamesPayload;

  const removeLinkStyle = (className: string) => {
    setSelectedStyle(null);
    if (!confirm) setConfirm(className);
    else {
      setConfirm(null);
      const thisTag = linkMode;
      const thisButtonKey = linkTargetKey;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      const payloadForTag =
        thisButtonKey &&
        thisTag &&
        (currentField?.current?.payload?.optionsPayload?.buttons?.[
          thisButtonKey
        ]?.classNamesPayload?.[thisTag] as ClassNamesPayloadInnerDatum);
      if (
        payloadForTag &&
        typeof payloadForTag === `object` &&
        `classes` in payloadForTag &&
        className in payloadForTag.classes
      ) {
        delete (payloadForTag.classes as Record<string, string[]>)[className];
      }
      if (thisTag && payloadForTag) {
        updateStoreField("paneFragmentMarkdown", {
          ...currentField.current,
          payload: {
            ...currentField.current.payload,
            optionsPayload: {
              ...currentField.current.payload.optionsPayload,
              classNamesPayload: {
                ...currentField.current.payload.optionsPayload
                  .classNamesPayload,
                [thisTag]: payloadForTag,
              },
            },
          },
        });
      }
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };

  const removeStyle = (className: string) => {
    setSelectedStyle(null);
    if (!confirm) setConfirm(className);
    else {
      setConfirm(null);
      const activeTagData = getActiveTagData(
        activeTag,
        className,
        markdownLookup,
        targetId,
        classNamesPayload || null,
        modalClassNamesPayload,
        parentClassNamesPayload,
        parentLayer
      );
      const thisTag = activeTagData?.tag;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      const payloadForTag =
        thisTag &&
        (currentField.current.payload.optionsPayload.classNamesPayload[
          thisTag
        ] as ClassNamesPayloadInnerDatum);
      if (payloadForTag && className) {
        if (thisTag === `parent`) {
          if (
            Array.isArray(payloadForTag.classes) &&
            payloadForTag.classes?.[parentLayer] &&
            className in payloadForTag.classes[parentLayer]
          ) {
            delete (
              payloadForTag.classes[parentLayer] as Record<string, string[]>
            )[className];
          }
        } else {
          if (payloadForTag.classes && className in payloadForTag.classes) {
            delete (payloadForTag.classes as Record<string, string[]>)[
              className
            ];
          }
          if (payloadForTag.override && className in payloadForTag.override) {
            delete payloadForTag.override[className];
          }
        }
      }
      if (thisTag && payloadForTag) {
        updateStoreField("paneFragmentMarkdown", {
          ...currentField.current,
          payload: {
            ...currentField.current.payload,
            optionsPayload: {
              ...currentField.current.payload.optionsPayload,
              classNamesPayload: {
                ...currentField.current.payload.optionsPayload
                  .classNamesPayload,
                [thisTag]: payloadForTag,
              },
            },
          },
        });
      }
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };

  const removeStyleIntercept = (className: string) => {
    if (isLink) removeLinkStyle(className);
    else removeStyle(className);
  };

  const handleWidgetConfig = () => {
    if (
      markdownDatum?.markdown?.htmlAst &&
      typeof targetId.outerIdx === "number"
    ) {
      const codeNode =
        markdownDatum?.markdown?.htmlAst &&
        findCodeNode(
          cleanHtmlAst(markdownDatum.markdown.htmlAst as Root) as Root,
          targetId.outerIdx
        );
      if (codeNode) {
      const match = codeNode.match(/(\w+)\((.*?)\)/);
      if (match) {
        const [, key, valuesString] = match;
        const values = valuesString.split('|').map(item => item.trim());
        setWidgetData([key, ...values]);
      } else {
        console.error('Invalid widget format:', codeNode);
        setWidgetData([]);
      }
    }
    }
    setWidgetConfigMode(true);
    setSelectedStyle(null);
    setAddClass(false);
  };

  const WidgetConfigPlaceholder = ({
    widgetData,
  }: {
    widgetData: string[];
  }) => (
    <div className="max-w-md my-4 flex flex-wrap gap-x-1.5 gap-y-3.5">
      <h3 className="text-lg font-bold">Widget Configuration</h3>
      <span className="flex gap-x-6 w-full">
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
      <div className="w-full mt-2">
        <h4 className="text-md font-semibold">Extracted Data:</h4>
        <pre className="bg-gray-100 p-2 rounded mt-1">
          {JSON.stringify(widgetData, null, 2)}
        </pre>
      </div>
    </div>
  );

  const handleAddLayer = (start: boolean) => {
    const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
    const payloadForTag = currentField.current.payload.optionsPayload
      .classNamesPayload.parent as ClassNamesPayloadInnerDatum;
    if (Array.isArray(payloadForTag.classes)) {
      if (start) {
        payloadForTag.classes.unshift({});
      } else {
        payloadForTag.classes.push({});
      }
      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        payload: {
          ...currentField.current.payload,
          optionsPayload: {
            ...currentField.current.payload.optionsPayload,
            classNamesPayload: {
              ...currentField.current.payload.optionsPayload.classNamesPayload,
              [`parent`]: payloadForTag,
            },
          },
        },
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };

  const removeOverride = () => {
    const thisTag = activeTagData?.tag;
    const thisClass = activeTagData?.class ?? "";
    const thisGlobalNth = activeTagData?.globalNth ?? 0;
    const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
    const payloadForTag =
      thisTag &&
      (currentField.current.payload.optionsPayload.classNamesPayload[
        thisTag
      ] as ClassNamesPayloadInnerDatum | undefined);
    if (payloadForTag && payloadForTag.override) {
      if (activeTagData?.hasOverride && typeof thisGlobalNth === `number`) {
        if (payloadForTag.override[thisClass]) {
          delete payloadForTag.override[thisClass][thisGlobalNth];
          if (Object.keys(payloadForTag.override[thisClass]).length === 0) {
            delete payloadForTag.override[thisClass];
          }
        }
        if (Object.keys(payloadForTag.override).length === 0) {
          delete payloadForTag.override;
          delete payloadForTag.count;
        }
      } else {
        const count = markdownLookup?.nthTagLookup[
          thisTag as keyof typeof markdownLookup.nthTagLookup
        ]
          ? Object.keys(
              markdownLookup.nthTagLookup[
                thisTag as keyof typeof markdownLookup.nthTagLookup
              ]
            ).length
          : 0;
        payloadForTag.count = count;
        if (payloadForTag && typeof thisGlobalNth === "number") {
          if (!payloadForTag.override) {
            payloadForTag.override = {};
          }
          if (!payloadForTag.override[thisClass]) {
            payloadForTag.override[thisClass] = [];
          }
          payloadForTag.override[thisClass][thisGlobalNth] = ["", "", ""];
        }
      }
      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        payload: {
          ...currentField.current.payload,
          optionsPayload: {
            ...currentField.current.payload.optionsPayload,
            classNamesPayload: {
              ...currentField.current.payload.optionsPayload.classNamesPayload,
              [thisTag]: payloadForTag as ClassNamesPayloadInnerDatum,
            },
          },
        },
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };

  const handleFinalChangeLink = (
    value: string,
    viewport: "mobile" | "tablet" | "desktop",
    isNegative: boolean = false
  ) => {
    const thisTag = linkMode;
    const thisClass = selectedStyle;
    const thisValue =
      typeof isNegative !== `undefined` && isNegative ? `!${value}` : value;
    const thisButtonKey = linkTargetKey;
    const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
    const payloadForTag =
      thisButtonKey &&
      thisTag &&
      (currentField?.current?.payload?.optionsPayload?.buttons?.[thisButtonKey]
        ?.classNamesPayload?.[thisTag] as ClassNamesPayloadInnerDatum);
    const thisTuple =
      payloadForTag &&
      thisClass &&
      !Array.isArray(payloadForTag.classes) &&
      payloadForTag.classes[thisClass];
    if (thisTuple && currentField.current.payload.optionsPayload.buttons) {
      const newTuple = updateViewportTuple(thisTuple, viewport, thisValue);
      (payloadForTag.classes as Record<string, Tuple>)[thisClass] = newTuple;
      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        payload: {
          ...currentField.current.payload,
          optionsPayload: {
            ...currentField.current.payload.optionsPayload,
            buttons: {
              ...currentField.current.payload.optionsPayload.buttons,

              [thisButtonKey]: {
                classNamesPayload: {
                  ...currentField.current.payload.optionsPayload.buttons[
                    thisButtonKey
                  ].classNamesPayload,
                  [thisTag]: payloadForTag,
                },
              },
            },
          },
        },
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };

  const handleFinalChange = (
    value: string,
    viewport: "mobile" | "tablet" | "desktop",
    isNegative: boolean = false
  ) => {
    if (activeTagData?.values.includes(value)) {
      const thisTag = activeTagData.tag;
      const thisGlobalNth = activeTagData.globalNth;
      const thisClass = activeTagData.class;
      const thisValue =
        typeof isNegative !== `undefined` && isNegative ? `!${value}` : value;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      console.log(thisTag, thisValue, thisClass);

      // Initialize the classNamesPayload for this tag if it doesn't exist
      if (
        !currentField.current.payload.optionsPayload.classNamesPayload[thisTag]
      ) {
        currentField.current.payload.optionsPayload.classNamesPayload[thisTag] =
          {
            classes: {},
          };
      }

      const payloadForTag = currentField.current.payload.optionsPayload
        .classNamesPayload[thisTag] as ClassNamesPayloadInnerDatum;

      // Initialize classes if it doesn't exist
      if (!payloadForTag.classes) {
        payloadForTag.classes = {};
      }

      let thisTuple: Tuple;

      if (
        activeTagData.tag === `parent` &&
        Array.isArray(payloadForTag.classes)
      ) {
        if (!payloadForTag.classes[parentLayer]) {
          payloadForTag.classes[parentLayer] = {};
        }
        thisTuple = (
          payloadForTag.classes[parentLayer] as Record<string, Tuple>
        )[thisClass] || ["", "", ""];
      } else if (activeTagData?.hasOverride) {
        if (!payloadForTag.override) {
          payloadForTag.override = {};
        }
        if (!payloadForTag.override[thisClass]) {
          payloadForTag.override[thisClass] = [];
        }
        thisTuple = payloadForTag.override[thisClass][
          thisGlobalNth as number
        ] || ["", "", ""];
      } else {
        thisTuple = (payloadForTag.classes as Record<string, Tuple>)[
          thisClass
        ] || ["", "", ""];
      }

      const newTuple = updateViewportTuple(thisTuple, viewport, thisValue);

      if (
        activeTagData.tag === `parent` &&
        Array.isArray(payloadForTag.classes)
      ) {
        (payloadForTag.classes[parentLayer] as Record<string, Tuple>)[
          thisClass
        ] = newTuple;
      } else if (activeTagData?.hasOverride) {
        payloadForTag.override![thisClass][thisGlobalNth as number] = newTuple;
      } else {
        (payloadForTag.classes as Record<string, Tuple>)[thisClass] = newTuple;
      }

      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        payload: {
          ...currentField.current.payload,
          optionsPayload: {
            ...currentField.current.payload.optionsPayload,
            classNamesPayload: {
              ...currentField.current.payload.optionsPayload.classNamesPayload,
              [thisTag]: payloadForTag,
            },
          },
        },
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);
    }
  };

  const handleFinalChangeIntercept = (
    value: string,
    viewport: "mobile" | "tablet" | "desktop",
    isNegative: boolean = false
  ) => {
    if (isLink) handleFinalChangeLink(value, viewport, isNegative);
    else handleFinalChange(value, viewport, isNegative);
  };

  const handleDeleteLayer = () => {
    const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
    const payloadForTag =
      currentField.current.payload.optionsPayload.classNamesPayload.parent;
    if (Array.isArray(payloadForTag.classes))
      payloadForTag.classes.splice(parentLayer, 1);
    if (payloadForTag)
      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        payload: {
          ...currentField.current.payload,
          optionsPayload: {
            ...currentField.current.payload.optionsPayload,
            classNamesPayload: {
              ...currentField.current.payload.optionsPayload.classNamesPayload,
              [`parent`]: payloadForTag,
            },
          },
        },
      });
    lastInteractedTypeStore.set(`markdown`);
    lastInteractedPaneStore.set(targetId.paneId);
  };

  const handleAddStyle = () => {
    if (selectedClass) {
      const activeTagData = getActiveTagData(
        activeTag,
        selectedClass,
        markdownLookup,
        targetId,
        classNamesPayload || null,
        modalClassNamesPayload,
        parentClassNamesPayload,
        parentLayer
      );
      const thisTag = activeTagData?.tag;
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      const payloadForTag =
        thisTag &&
        (currentField.current.payload.optionsPayload.classNamesPayload[
          thisTag
        ] as ClassNamesPayloadInnerDatum);

      if (
        payloadForTag &&
        Array.isArray(payloadForTag.classes) &&
        !(selectedClass in payloadForTag.classes[parentLayer])
      ) {
        if (
          typeof payloadForTag.classes === "object" &&
          typeof payloadForTag.classes[parentLayer] === "object"
        ) {
          (payloadForTag.classes[parentLayer] as Record<string, Tuple>)[
            selectedClass
          ] = [""];
        }
      } else if (payloadForTag && !(selectedClass in payloadForTag.classes)) {
        if (
          typeof payloadForTag.classes === "object" &&
          !Array.isArray(payloadForTag.classes)
        ) {
          (payloadForTag.classes as Record<string, Tuple>)[selectedClass] = [
            "",
          ];
        }
      }
      if (thisTag && payloadForTag)
        updateStoreField("paneFragmentMarkdown", {
          ...currentField.current,
          payload: {
            ...currentField.current.payload,
            optionsPayload: {
              ...currentField.current.payload.optionsPayload,
              classNamesPayload: {
                ...currentField.current.payload.optionsPayload
                  .classNamesPayload,
                [thisTag]: payloadForTag,
              },
            },
          },
        });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);

      setAddClass(false);
      setSelectedStyle(selectedClass);
      setSelectedClass("");
      setQuery("");
      setConfirm(null);
    }
  };

  const handleAddStyleLink = () => {
    const thisTag = linkMode;
    const thisClass = selectedClass;
    const thisButtonKey = linkTargetKey;
    const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
    const payloadForTag =
      thisButtonKey &&
      thisTag &&
      (currentField?.current?.payload?.optionsPayload?.buttons?.[thisButtonKey]
        ?.classNamesPayload?.[thisTag] as ClassNamesPayloadInnerDatum);
    if (payloadForTag && currentField.current.payload.optionsPayload.buttons) {
      (payloadForTag.classes as Record<string, Tuple>)[thisClass] = [``];
      updateStoreField("paneFragmentMarkdown", {
        ...currentField.current,
        payload: {
          ...currentField.current.payload,
          optionsPayload: {
            ...currentField.current.payload.optionsPayload,
            buttons: {
              ...currentField.current.payload.optionsPayload.buttons,

              [thisButtonKey]: {
                classNamesPayload: {
                  ...currentField.current.payload.optionsPayload.buttons[
                    thisButtonKey
                  ].classNamesPayload,
                  [thisTag]: payloadForTag,
                },
              },
            },
          },
        },
      });
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(targetId.paneId);

      setAddClass(false);
      setSelectedStyle(selectedClass);
      setSelectedClass("");
      setQuery("");
      setConfirm(null);
    }
  };

  const handleAddStyleIntercept = () => {
    if (isLink) handleAddStyleLink();
    else handleAddStyle();
  };

  const cancelRemoveStyle = () => {
    setConfirm(null);
  };

  const styleFilterOptions = [
    { value: "popular", label: "Popular Styles" },
    { value: "advanced", label: "+ Advanced" },
    { value: "effects", label: "+ Effects" },
  ];

  const filteredClasses = useMemo(() => {
    return Object.entries(tailwindClasses)
      .filter(([, classInfo]) => {
        switch (styleFilter) {
          case "popular":
            return classInfo.priority <= 1;
          case "advanced":
            return classInfo.priority <= 2;
          case "effects":
            return true;
          default:
            return false;
        }
      })
      .filter(([, classInfo]) =>
        classInfo.title.toLowerCase().includes(query.toLowerCase())
      );
  }, [styleFilter, query]);

  const ClassTag = (className: string) => (
    <div key={className} className="flex items-center">
      {!confirm || confirm !== className ? (
        <>
          <button
            className="peer text-md py-1 px-3 bg-mywhite text-black rounded-md hover:bg-yellow-300 shadow hover:underline"
            title={`Adjust ${
              typeof tailwindClasses[className] !== `undefined`
                ? tailwindClasses[className].title
                : className
            }`}
            onClick={() => {
              setSelectedStyle(className);
              setConfirm(null);
            }}
          >
            {typeof tailwindClasses[className] !== `undefined`
              ? tailwindClasses[className].title
              : className}
          </button>
          <button
            className="ml-[-0.5rem] py-1 px-0.5 bg-myorange/10 text-myorange font-bold rounded-full hover:bg-myorange/50 hover:text-black peer-hover:invisible shadow"
            title="Remove style"
            onClick={() => {
              removeStyleIntercept(className);
            }}
          >
            <XMarkIcon className="w-3 h-6" />
          </button>
        </>
      ) : (
        <>
          <button
            className="text-md py-1 pl-1.5 pr-3 bg-myorange/20 text-black rounded-md hover:bg-myorange/50"
            title="Remove style"
            onClick={() => removeStyleIntercept(className)}
          >
            <span className="flex flex-nowrap">
              Are you sure
              <CheckIcon className="w-5 h-5" />
            </span>
          </button>
          <button
            className="ml-[-0.5rem] p-1 bg-black text-white font-bold rounded-full hover:bg-myorange hover:text-white"
            title="Keep style"
            onClick={() => cancelRemoveStyle()}
          >
            <XMarkIcon className="w-3 h-5" />
          </button>
        </>
      )}
    </div>
  );

  useEffect(() => {
    const thisTabs: StyleTab[] = [];
    if (isImage) thisTabs.push({ name: `Image`, tag: `img`, priority: 1 });
    else if (isCodeItem)
      thisTabs.push({ name: `Widget`, tag: `code`, priority: 1 });
    else if (thisTagTitle && !isListItem)
      thisTabs.push({ name: thisTagTitle, tag: thisTag, priority: 0 });
    if (isListItem && thisTag) {
      thisTabs.push({ name: `List Item`, tag: `li`, priority: 2 });
      thisTabs.push({ name: `List Container`, tag: thisTag, priority: 3 });
    }
    if (hasModal)
      thisTabs.push({ name: `Modal Styles`, tag: `modal`, priority: 3 });
    if (!hasTextShapeOutside)
      thisTabs.push({ name: `Pane Styles`, tag: `parent`, priority: 4 });
    setSelectedStyle(null);
    setParentLayer(0);
    setTabs(thisTabs);
    setActiveTag(thisTabs[0].tag);
    setMobileValue(``);
    setTabletValue(``);
    setDesktopValue(``);
    if (targetId.buttonTarget && !linkTargetKey)
      setLinkTargetKey(targetId.buttonTarget);
  }, [id, targetId]);

  const sortByActiveTag = (arr: StyleTab[], activeTag: Tag): StyleTab[] => {
    return [...arr].sort((a, b) => {
      if (a.tag === activeTag && b.tag !== activeTag) return -1;
      if (b.tag === activeTag && a.tag !== activeTag) return 1;
      if (a.tag === activeTag && b.tag === activeTag) return 0;
      return a.priority - b.priority;
    });
  };

  const mergeClassesWithAllOverrides = (
    classNamesPayload: ClassNamesPayloadInnerDatum
  ): ClassNamesPayloadDatumValue => {
    const mergedClasses: ClassNamesPayloadDatumValue = Array.isArray(
      classNamesPayload.classes
    )
      ? {}
      : { ...classNamesPayload.classes };
    const globalNth = targetId.globalNth || 0;
    if (classNamesPayload.override) {
      Object.entries(classNamesPayload.override).forEach(
        ([className, overrides]) => {
          if (globalNth in overrides) {
            mergedClasses[className] = overrides[globalNth];
          }
        }
      );
    }
    return mergedClasses;
  };

  const handlePasteStyles = (
    pastedPayload: ClassNamesPayloadDatumValue | ClassNamesPayloadDatumValue[]
  ) => {
    if (linkMode) {
      const currentField = cloneDeep($paneFragmentMarkdown[markdownFragmentId]);
      if (!currentField.current.payload.optionsPayload.buttons) {
        currentField.current.payload.optionsPayload.buttons = {};
      }
      if (!currentField.current.payload.optionsPayload.buttons[linkTargetKey]) {
        currentField.current.payload.optionsPayload.buttons[linkTargetKey] = {
          urlTarget: linkTargetKey,
          callbackPayload: "",
          className: "",
          classNamesPayload: {
            button: { classes: {} },
            hover: { classes: {} },
          },
        };
      }
      if (Array.isArray(pastedPayload) && pastedPayload.length === 2) {
        currentField.current.payload.optionsPayload.buttons[
          linkTargetKey
        ].classNamesPayload.button.classes = pastedPayload[0];
        currentField.current.payload.optionsPayload.buttons[
          linkTargetKey
        ].classNamesPayload.hover.classes = pastedPayload[1];
        updateStoreField("paneFragmentMarkdown", currentField.current);
        lastInteractedTypeStore.set(`markdown`);
        lastInteractedPaneStore.set(targetId.paneId);
      }
    } else if (activeTag) {
      if (activeTag === "parent") {
        const currentField = cloneDeep(
          $paneFragmentMarkdown[markdownFragmentId]
        );
        const payloadForTag = currentField.current.payload.optionsPayload
          .classNamesPayload.parent as ClassNamesPayloadInnerDatum;
        if (
          Array.isArray(pastedPayload) &&
          Array.isArray(payloadForTag.classes)
        ) {
          payloadForTag.classes = pastedPayload;
        }
        updateStoreField("paneFragmentMarkdown", {
          ...currentField.current,
          payload: {
            ...currentField.current.payload,
            optionsPayload: {
              ...currentField.current.payload.optionsPayload,
              classNamesPayload: {
                ...currentField.current.payload.optionsPayload
                  .classNamesPayload,
                parent: payloadForTag,
              },
            },
          },
        });
        lastInteractedTypeStore.set(`markdown`);
        lastInteractedPaneStore.set(targetId.paneId);
      } else {
        const currentField = cloneDeep(
          $paneFragmentMarkdown[markdownFragmentId]
        );
        const payloadForTag = currentField.current.payload.optionsPayload
          .classNamesPayload[activeTag] as ClassNamesPayloadInnerDatum;
        if (activeTagData?.hasOverride && activeTagData.globalNth !== null) {
          if (!payloadForTag.override) {
            payloadForTag.override = {};
          }
          Object.entries(pastedPayload).forEach(([className, value]) => {
            if (payloadForTag?.override && !payloadForTag.override[className]) {
              payloadForTag.override[className] = [];
            }
            if (
              payloadForTag?.override &&
              className in payloadForTag.override &&
              activeTagData?.globalNth &&
              activeTagData?.globalNth in payloadForTag.override[className]
            )
              payloadForTag.override[className][activeTagData.globalNth] =
                value as Tuple;
          });
        } else {
          payloadForTag.classes = {
            ...payloadForTag.classes,
            ...pastedPayload,
          };
        }

        updateStoreField("paneFragmentMarkdown", {
          ...currentField.current,
          payload: {
            ...currentField.current.payload,
            optionsPayload: {
              ...currentField.current.payload.optionsPayload,
              classNamesPayload: {
                ...currentField.current.payload.optionsPayload
                  .classNamesPayload,
                [activeTag]: payloadForTag,
              },
            },
          },
        });
        lastInteractedTypeStore.set(`markdown`);
        lastInteractedPaneStore.set(targetId.paneId);
      }
    }
  };

  useEffect(() => {
    if (activeTag)
      setTabs(prevItems =>
        prevItems && activeTag ? sortByActiveTag(prevItems, activeTag) : null
      );
  }, [activeTag]);

  const activeTagData = useMemo(() => {
    return getActiveTagData(
      activeTag,
      selectedStyle,
      markdownLookup,
      targetId,
      classNamesPayload || null,
      modalClassNamesPayload,
      parentClassNamesPayload,
      parentLayer
    );
  }, [
    activeTag,
    selectedStyle,
    markdownLookup,
    targetId,
    classNamesPayload,
    modalClassNamesPayload,
    parentClassNamesPayload,
    parentLayer,
  ]);

  useEffect(() => {
    if (activeTagData) {
      setMobileValue(String(activeTagData.mobileVal ?? ""));
      setTabletValue(String(activeTagData.tabletVal ?? ""));
      setDesktopValue(String(activeTagData.desktopVal ?? ""));
    } else {
      // Reset values when activeTagData is null or undefined
      setMobileValue("");
      setTabletValue("");
      setDesktopValue("");
    }
  }, [activeTagData]);

  if (!tabs) return null;

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
          {!linkTargetKey && !widgetConfigMode && (
            <>
              <div className="flex justify-between items-center">
                <nav
                  aria-label="Tabs"
                  className="flex space-x-4 mt-4 mb-1 mr-6"
                >
                  {tabs.map((tab: StyleTab, idx: number) => (
                    <button
                      key={idx}
                      aria-current={tab.tag === activeTag ? "page" : undefined}
                      onClick={() => {
                        setActiveTag(tab.tag);
                        setImageMeta(false);
                        setLinkTargetKey(``);
                        setLinkMode(null);
                        setSelectedStyle(null);
                      }}
                      className={classNames(
                        tab.tag === activeTag
                          ? "text-black font-bold"
                          : "text-mydarkgrey hover:text-black underline",
                        "text-md"
                      )}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
                <div className="flex flex-nowrap gap-x-4">
                  {hasHistory ? (
                    <button
                      onClick={() => {
                        handleUndo("paneFragmentMarkdown", markdownFragmentId);
                        setImageMeta(false);
                        setLinkTargetKey(``);
                        setLinkMode(null);
                        setSelectedStyle(null);
                      }}
                      className="bg-mygreen/50 hover:bg-myorange text-black px-2 py-1 rounded"
                      disabled={
                        $paneFragmentMarkdown[markdownFragmentId]?.history
                          .length === 0
                      }
                    >
                      Undo
                    </button>
                  ) : null}
                  {activeTag && (
                    <StyleMemory
                      currentKey={activeTag}
                      classNamesPayload={
                        activeTag === `parent` &&
                        parentClassNamesPayload?.classes &&
                        Array.isArray(parentClassNamesPayload.classes)
                          ? parentClassNamesPayload.classes
                          : activeTag === `modal`
                            ? modalClassNamesPayload?.classes || {}
                            : mergeClassesWithAllOverrides(
                                classNamesPayload || { classes: {} }
                              )
                      }
                      onPaste={handlePasteStyles}
                    />
                  )}
                </div>
              </div>

              <hr />
            </>
          )}
          {widgetConfigMode && (
            <WidgetConfigPlaceholder widgetData={widgetData} />
          )}
          {!imageMeta &&
            !linkTargetKey &&
            !widgetConfigMode &&
            activeTag &&
            ![`parent`, `modal`].includes(activeTag) && (
              <div className="max-w-md my-4 flex flex-wrap gap-x-1.5 gap-y-3.5">
                {classNamesPayload?.classes &&
                Object.keys(classNamesPayload.classes).length ? (
                  Object.keys(classNamesPayload.classes).map(className =>
                    ClassTag(className)
                  )
                ) : (
                  <span>No styles</span>
                )}
              </div>
            )}
          {linkTargetKey && (
            <div className="max-w-md my-4 flex flex-wrap gap-x-1.5 gap-y-3.5">
              {linkMode && linkTargetKey !== `*` ? (
                <div className="w-80">
                  <div className="flex flex-nowrap justify-between">
                    <div className="flex flex-nowrap gap-x-4">
                      <button
                        className={classNames(
                          linkMode === `button` ? `font-bold` : `underline`,
                          "my-2"
                        )}
                        title="Button Styles"
                        onClick={() => {
                          setLinkMode(`button`);
                          setSelectedStyle(null);
                        }}
                      >
                        Button Styles
                      </button>
                      <button
                        className={classNames(
                          linkMode === `hover` ? `font-bold` : `underline`,
                          "my-2"
                        )}
                        title="Hover Styles"
                        onClick={() => {
                          setLinkMode(`hover`);
                          setSelectedStyle(null);
                        }}
                      >
                        Hover Styles
                      </button>
                    </div>
                    <StyleMemory
                      currentKey="button"
                      classNamesPayload={buttonClassNamesPayloadArray}
                      onPaste={handlePasteStyles}
                    />
                  </div>
                  <div className="max-w-md my-4 flex flex-wrap gap-x-1.5 gap-y-3.5">
                    {classNamesPayload?.classes &&
                    Object.keys(classNamesPayload.classes).length ? (
                      Object.keys(classNamesPayload.classes).map(className =>
                        ClassTag(className)
                      )
                    ) : (
                      <span>No styles</span>
                    )}
                  </div>
                </div>
              ) : (
                <LinksMeta
                  paneId={targetId.paneId}
                  target={linkTargetKey}
                  setLinkTarget={setLinkTargetKey}
                />
              )}
              <span className="flex gap-x-6 w-full">
                <button
                  className="my-2 underline"
                  title={!linkMode ? `Style this Link` : `Configure this Link`}
                  onClick={() => {
                    if (linkMode) setLinkMode(null);
                    else setLinkMode(`button`);
                    setSelectedStyle(null);
                  }}
                >
                  {!linkMode ? `STYLE THIS LINK` : `CONFIGURE THIS LINK`}
                </button>
                {linkMode && (
                  <button
                    className="my-2 underline"
                    title="Add a Style to this"
                    onClick={() => {
                      setSelectedStyle(null);
                      setAddClass(true);
                    }}
                  >
                    ADD STYLE
                  </button>
                )}
                <button
                  className="my-2 underline"
                  title="Close Links panel"
                  onClick={() => {
                    setSelectedStyle(null);
                    setAddClass(false);
                    setLinkMode(null);
                    setLinkTargetKey(``);
                  }}
                >
                  BACK
                </button>
              </span>
            </div>
          )}
          {imageMeta &&
            activeTag &&
            activeTag === `img` &&
            typeof targetId?.globalNth === `number` &&
            typeof targetId?.idx === `number` && (
              <div className="max-w-md my-4 flex flex-wrap gap-x-1.5 gap-y-3.5">
                <ImageMeta
                  paneId={targetId.paneId}
                  outerIdx={targetId.outerIdx}
                  idx={targetId.idx}
                />
                <span className="flex gap-x-6 w-full">
                  <button
                    className="my-2 underline"
                    title="Edit Image Metadata"
                    onClick={() => {
                      setImageMeta(false);
                    }}
                  >
                    STYLE IMAGE
                  </button>
                </span>
              </div>
            )}

          {activeTag === `parent` && (
            <>
              <div className="bg-myblue/5 text-md mt-2 px-2 flex flex-wrap gap-x-2 gap-y-1.5">
                <span className="py-1">Layer:</span>
                <button
                  onClick={() => handleAddLayer(true)}
                  title="Insert layer before"
                  className="py-1 px-1.5 rounded-md text-sm text-mydarkgrey hover:text-black hover:bg-myorange/20"
                >
                  +
                </button>
                {parentClassNamesPayload?.classes &&
                  Object.keys(parentClassNamesPayload?.classes).map(
                    (_, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setParentLayer(idx);
                          setSelectedStyle(null);
                        }}
                        className={classNames(
                          "py-1 px-1.5 rounded-md",
                          idx !== parentLayer
                            ? "text-md underline underline-offset-2 text-mydarkgrey hover:text-black hover:bg-myorange/20"
                            : "text-md text-black bg-myorange/50 font-bold pointer-events-none"
                        )}
                      >
                        {idx + 1}
                      </button>
                    )
                  )}
                <button
                  onClick={() => handleAddLayer(false)}
                  title="Insert layer after"
                  className="py-1 px-1.5 rounded-md text-sm text-mydarkgrey hover:text-black hover:bg-myorange/20"
                >
                  +
                </button>
              </div>
              <hr />
              <div className="max-w-md my-4 flex flex-wrap gap-x-1.5 gap-y-3.5">
                {parentClassNamesPayload?.classes &&
                Array.isArray(parentClassNamesPayload?.classes) &&
                Object.keys(parentClassNamesPayload?.classes[parentLayer])
                  .length ? (
                  Object.keys(
                    parentClassNamesPayload?.classes[parentLayer]
                  ).map(className => ClassTag(className))
                ) : (
                  <div>
                    No styles.{" "}
                    <button
                      className="font-bold underline"
                      onClick={handleDeleteLayer}
                    >
                      Delete layer.
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTag === `modal` && (
            <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
              {modalClassNamesPayload?.classes ? (
                Object.keys(modalClassNamesPayload?.classes).map(className =>
                  ClassTag(className)
                )
              ) : (
                <span>No styles</span>
              )}
            </div>
          )}
          {!imageMeta && !linkTargetKey && !widgetConfigMode && (
            <span className="flex gap-x-6">
              <button
                className="my-2 underline"
                title="Add a Style to this"
                onClick={() => {
                  setSelectedStyle(null);
                  setAddClass(true);
                }}
              >
                ADD STYLE
              </button>
              {activeTag === `img` && (
                <button
                  className="my-2 underline"
                  title="Edit Image Metadata"
                  onClick={() => {
                    setImageMeta(true);
                    setAddClass(false);
                  }}
                >
                  IMAGE DESCRIPTION
                </button>
              )}
              {activeTag === `code` && (
                <button
                  className="my-2 underline"
                  title="Configure Widget"
                  onClick={handleWidgetConfig}
                >
                  CONFIGURE WIDGET
                </button>
              )}
              {markdownLookup?.linksLookup[targetId.outerIdx] &&
                Object.keys(markdownLookup.linksLookup[targetId.outerIdx])
                  .length && (
                  <button
                    className="my-2 underline"
                    title="Manage Links"
                    onClick={() => {
                      setLinkTargetKey(
                        linkTargetKey || targetId.buttonTarget || `*`
                      );
                      setLinkMode(null);
                      setSelectedStyle(null);
                      setAddClass(false);
                      if (thisTag) setActiveTag(thisTag);
                    }}
                  >
                    MANAGE LINKS
                  </button>
                )}
            </span>
          )}
        </div>
      </div>
      <div
        className={classNames(
          type === `mobile` ? `max-w-5/12` : `w-fit-contents mt-8`
        )}
      >
        {selectedStyle ? (
          <div className="bg-white shadow-inner rounded">
            <div className="px-6 py-4">
              <h4 className="text-lg">
                <strong>{tailwindClasses[selectedStyle].title}</strong> on{" "}
                {isLink || activeTagData?.hasOverride ? (
                  <span className="underline">this</span>
                ) : (
                  <span className="underline">all</span>
                )}{" "}
                {isLink ? `Button` : tabs.length && tagTitles[tabs.at(0)!.tag]}
                {isLink ? null : !activeTagData?.hasOverride ? `s` : null}
              </h4>
              <div className="flex flex-col gap-y-2.5 my-3 text-mydarkgrey text-xl">
                <ViewportComboBox
                  value={mobileValue}
                  onChange={setMobileValue}
                  onFinalChange={handleFinalChangeIntercept}
                  values={activeTagData?.values ?? []}
                  viewport="mobile"
                  allowNegative={activeTagData?.allowNegative ?? false}
                  isNegative={activeTagData?.mobileIsNegative ?? false}
                />
                <ViewportComboBox
                  value={tabletValue}
                  onChange={setTabletValue}
                  onFinalChange={handleFinalChangeIntercept}
                  values={activeTagData?.values ?? []}
                  viewport="tablet"
                  allowNegative={activeTagData?.allowNegative}
                  isNegative={activeTagData?.tabletIsNegative ?? false}
                  isInferred={tabletValue === mobileValue}
                />
                <ViewportComboBox
                  value={desktopValue}
                  onChange={setDesktopValue}
                  onFinalChange={handleFinalChangeIntercept}
                  values={activeTagData?.values ?? []}
                  viewport="desktop"
                  allowNegative={activeTagData?.allowNegative ?? false}
                  isNegative={activeTagData?.desktopIsNegative ?? false}
                  isInferred={desktopValue === tabletValue}
                />
              </div>

              {!isLink &&
              tabs.length &&
              ![`Pane Styles`, `Modal Styles`].includes(
                tagTitles[tabs.at(0)!.tag]
              ) ? (
                <div className="flex items-center mt-4">
                  <Switch
                    checked={activeTagData?.hasOverride}
                    onChange={removeOverride}
                    className={`${
                      activeTagData?.hasOverride
                        ? "bg-myorange"
                        : "bg-mydarkgrey"
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        activeTagData?.hasOverride
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                  <div className="ml-3">
                    <div className="text-md text-black font-bold">
                      {!activeTagData?.hasOverride
                        ? `Quick style mode`
                        : `Custom styles`}
                    </div>
                    <div className="text-md text-mydarkgrey">
                      {!activeTagData?.hasOverride
                        ? `all ${tagTitles[tabs.at(0)!.tag]}s (in this pane)`
                        : `on this ${tagTitles[tabs.at(0)!.tag]} only`}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : addClass ? (
          <div className="bg-white shadow-inner rounded">
            <div className="px-6 py-4">
              <h4 className="text-lg">Add Styles</h4>
              <div className="my-4">
                <Listbox value={styleFilter} onChange={setStyleFilter}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-mydarkgrey bg-white py-2 pl-3 pr-10 text-left text-black shadow-sm focus:outline-none focus:ring-1 focus:ring-myorange focus:border-myorange sm:text-sm">
                      <span className="block truncate">
                        {
                          styleFilterOptions.find(
                            option => option.value === styleFilter
                          )?.label
                        }
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-mydarkgrey"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {styleFilterOptions.map(option => (
                        <Listbox.Option
                          key={option.value}
                          value={option.value}
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
                                {option.label}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? "text-white" : "text-myorange"
                                  }`}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              <div className="relative">
                <Combobox value={selectedClass} onChange={setSelectedClass}>
                  <div className="relative mt-1">
                    <Combobox.Input
                      className="w-full border border-mydarkgrey rounded-md py-2 pl-3 pr-10 text-xl leading-5 text-black focus:ring-1 focus:ring-myorange focus:border-myorange"
                      displayValue={(className: string) =>
                        tailwindClasses[className]?.title || ""
                      }
                      onChange={event => setQuery(event.target.value)}
                      autoComplete="off"
                      placeholder="Select a style to add"
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-mydarkgrey"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredClasses.map(([className, classInfo]) => (
                      <Combobox.Option
                        key={className}
                        value={className}
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
                              {classInfo.title}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? "text-white" : "text-myorange"
                                }`}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox>
              </div>

              <button
                onClick={handleAddStyleIntercept}
                className="mt-4 w-full py-2 bg-myorange text-white rounded-md hover:bg-myorange/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-myorange"
              >
                Add Style
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="w-2 h-auto"></div>
    </div>
  );
};

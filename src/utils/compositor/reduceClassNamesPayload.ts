import {
  tailwindSpecial,
  tailwindModifier,
  isShorty,
  truncateShorty,
} from "./allowedTailwindValues";
import type {
  TupleValue,
  ClassNamesPayloadDatum,
  ClassNamesPayloadDatumWrapper,
  ClassNamesPayloadDatumValue,
  ClassNamesPayloadValue,
  OptionsPayloadDatum,
  Tuple,
} from "../../types";

const processParentClasses = (
  parentClasses: ClassNamesPayloadDatum["parent"]["classes"]
): [string[], string[], string[], string[]] => {
  if (!parentClasses) {
    return [[], [], [], []];
  }

  const processClassObject = (
    classObj: ClassNamesPayloadDatumValue | ClassNamesPayloadValue
  ) => {
    return processClassesForViewports(classObj, undefined);
  };

  let all: string[] = [];
  let mobile: string[] = [];
  let tablet: string[] = [];
  let desktop: string[] = [];

  if (Array.isArray(parentClasses)) {
    // Handle array of objects
    const result = parentClasses.map(classObj => processClassObject(classObj));
    all = result.map(r => r[0]).flat();
    mobile = result.map(r => r[1]).flat();
    tablet = result.map(r => r[2]).flat();
    desktop = result.map(r => r[3]).flat();
  } else if (typeof parentClasses === "object") {
    // Handle object with numbered keys
    const processedClasses = Object.values(parentClasses).map(classObj => {
      return processClassObject(
        classObj as ClassNamesPayloadDatumValue | ClassNamesPayloadValue
      );
    });

    all = processedClasses.map(([allClasses]) => allClasses?.[0] || "");
    mobile = processedClasses.map(
      ([, mobileClasses]) => mobileClasses?.[0] || ""
    );
    tablet = processedClasses.map(
      ([, , tabletClasses]) => tabletClasses?.[0] || ""
    );
    desktop = processedClasses.map(
      ([, , , desktopClasses]) => desktopClasses?.[0] || ""
    );
  }

  return [all, mobile, tablet, desktop];
};

const reduceClassName = (
  selector: string,
  v: TupleValue,
  viewportIndex: number
): string => {
  if (!selector) return "";

  const modifier = viewportIndex === -1 ? "" : tailwindModifier[viewportIndex];
  const truncated =
    isShorty.includes(selector) && typeof truncateShorty[selector] === "string";
  const thisSelector = truncated ? truncateShorty[selector] : selector;

  if (v === false || v === null || v === undefined) return "";
  if (typeof v === "boolean") return `${modifier}${thisSelector}`;
  if (v === "true") return `${modifier}${thisSelector}`;
  if (typeof v === "string" && v[0] === "!")
    return `${modifier}-${thisSelector}-${v.substring(1)}`;
  if (
    (typeof v === "string" || typeof v === "number") &&
    selector === "animate"
  )
    return `motion-safe:${modifier}${thisSelector}-${v}`;
  if (truncated && typeof v === "string")
    return `${modifier}${thisSelector}-${v}`;
  if (isShorty.includes(selector) && typeof v === "string")
    return `${modifier}${v}`;
  if (typeof v === "string" || typeof v === "number") {
    // Handle negative values
    if (typeof v === "string" && v.startsWith("-")) {
      return `${modifier}-${thisSelector}${v}`;
    }
    return `${modifier}${thisSelector}-${v}`;
  }

  return "";
};

const processTupleForViewport = (
  tuple: Tuple,
  viewportIndex: number
): TupleValue => {
  if (tuple.length === 1) return tuple[0];
  if (tuple.length === 2) return viewportIndex === 0 ? tuple[0] : tuple[1];
  return tuple[viewportIndex] ?? tuple[2] ?? tuple[1] ?? tuple[0];
};

const processClassesForViewports = (
  classes:
    | ClassNamesPayloadDatumValue
    | ClassNamesPayloadValue
    | ClassNamesPayloadDatumWrapper,
  override: Record<string, Tuple[]> | undefined,
  count: number = 1
): [string[], string[], string[], string[]] => {
  const processForViewport = (viewportIndex: number): string[] => {
    return Array(count)
      .fill(null)
      .map((_, i) =>
        Object.entries(classes)
          .map(([selector, tuple]) => {
            const isSpecial = selector in tailwindSpecial;
            const thisSelector = isSpecial
              ? tailwindSpecial[selector]
              : selector;
            const overrideTuple = override?.[selector]?.[i];
            const value = overrideTuple
              ? processTupleForViewport(overrideTuple, viewportIndex)
              : processTupleForViewport(tuple, viewportIndex);
            return reduceClassName(thisSelector, value, -1); // Change viewportIndex to -1
          })
          .filter(Boolean)
          .join(" ")
      );
  };

  const mobile = processForViewport(0);
  const tablet = processForViewport(1);
  const desktop = processForViewport(2);

  const all = mobile.map((_, index) => {
    const mobileClasses = mobile[index].split(" ");
    const tabletClasses = tablet[index].split(" ");
    const desktopClasses = desktop[index].split(" ");

    const combinedClasses = new Set(mobileClasses);

    tabletClasses.forEach(cls => {
      if (!mobileClasses.includes(cls)) combinedClasses.add(`md:${cls}`);
    });

    desktopClasses.forEach(cls => {
      if (!mobileClasses.includes(cls) && !tabletClasses.includes(cls)) {
        combinedClasses.add(`xl:${cls}`);
      }
    });

    return Array.from(combinedClasses).join(" ");
  });

  return [all, mobile, tablet, desktop];
};

export const reduceClassNamesPayload = (
  optionsPayload: OptionsPayloadDatum
) => {
  const { classNamesPayload: classes } = optionsPayload;
  optionsPayload.classNames = { all: {}, mobile: {}, tablet: {}, desktop: {} };

  Object.entries(classes).forEach(([elementName, elementClasses]) => {
    if (elementName === "parent" || elementName === "modal") return;

    const { classes: allSelectors, count = 1, override } = elementClasses;
    if (!allSelectors) return;

    const [all, mobile, tablet, desktop] = processClassesForViewports(
      allSelectors,
      override,
      count
    );
    optionsPayload.classNames = {
      ...optionsPayload?.classNames,
      all: {
        ...optionsPayload?.classNames?.all,
        [elementName]: all,
      },
      desktop: {
        ...optionsPayload?.classNames?.desktop,
        [elementName]: desktop,
      },
      tablet: {
        ...optionsPayload?.classNames?.tablet,
        [elementName]: tablet,
      },
      mobile: {
        ...optionsPayload?.classNames?.mobile,
        [elementName]: mobile,
      },
    };
  });

  // Process parent classes
  if (classes.parent && classes.parent.classes) {
    const parentClasses = classes.parent.classes;
    const [all, mobile, tablet, desktop] = processParentClasses(parentClasses);
    optionsPayload.classNamesParent = {
      all: Array.isArray(all) ? all.join(" ") : all || "",
      mobile: Array.isArray(mobile) ? mobile.join(" ") : mobile || "",
      tablet: Array.isArray(tablet) ? tablet.join(" ") : tablet || "",
      desktop: Array.isArray(desktop) ? desktop.join(" ") : desktop || "",
    };
  } else {
    optionsPayload.classNamesParent = {
      all: "",
      mobile: "",
      tablet: "",
      desktop: "",
    };
  }

  // Process modal classes
  if (classes.modal && classes.modal.classes) {
    const modalClasses = classes.modal.classes;
    // Check if modalClasses is an object with numbered keys
    // SHOULD NO LONGER BE REQ'D; was schema set by gatsby-tractstack-storykeep prototype
    //if (
    //  typeof modalClasses === "object" &&
    //  Object.keys(modalClasses).every(key => !isNaN(Number(key)))
    //) {
    //  // If so, use the first (and likely only) numbered key
    //  const firstKey = Object.keys(modalClasses)[0];
    //  const [all, mobile, tablet, desktop] = processClassesForViewports(
    //    /* eslint-disable @typescript-eslint/no-explicit-any */
    //    (modalClasses as any)[firstKey] as ClassNamesPayloadValue,
    //    undefined
    //  );
    //  optionsPayload.classNamesModal = {
    //    all: all[0] || "",
    //    mobile: mobile[0] || "",
    //    tablet: tablet[0] || "",
    //    desktop: desktop[0] || "",
    //  };
    //} else {
      // If it's already in the expected format, process it directly
      const [all, mobile, tablet, desktop] = processClassesForViewports(
        modalClasses as ClassNamesPayloadValue,
        undefined
      );
      optionsPayload.classNamesModal = {
        all: all[0] || "",
        mobile: mobile[0] || "",
        tablet: tablet[0] || "",
        desktop: desktop[0] || "",
      };
    //}
  }

  // Process button classes
  if (optionsPayload.buttons) {
    for (const buttonKey in optionsPayload.buttons) {
      const buttonData = (optionsPayload.buttons as any)[buttonKey];
      const buttonClasses = buttonData.classNamesPayload?.button?.classes;
      const buttonHoverClasses = buttonData.classNamesPayload?.hover?.classes;

      if (buttonClasses) {
        const [allButton, mobileButton, tabletButton, desktopButton] =
          processClassesForViewports(buttonClasses, undefined);

        let [allHover, mobileHover, tabletHover, desktopHover] = [
          [],
          [],
          [],
          [],
        ] as [string[], string[], string[], string[]];
        if (buttonHoverClasses) {
          [allHover, mobileHover, tabletHover, desktopHover] =
            processClassesForViewports(buttonHoverClasses, undefined);
        }

        const combineClasses = (regular: string[], hover: string[]) => {
          return regular.map((cls, index) => {
            const hoverCls = hover[index]
              ? hover[index]
                  .split(" ")
                  .map(c => `hover:${c}`)
                  .join(" ")
              : "";
            return `${cls} ${hoverCls}`.trim();
          });
        };

        buttonData.className = combineClasses(allButton, allHover)[0] || "";
        buttonData.mobileClassName =
          combineClasses(mobileButton, mobileHover)[0] || "";
        buttonData.tabletClassName =
          combineClasses(tabletButton, tabletHover)[0] || "";
        buttonData.desktopClassName =
          combineClasses(desktopButton, desktopHover)[0] || "";

        // Remove the separate hoverClassName properties
        delete buttonData.hoverClassName;
        delete buttonData.mobileHoverClassName;
        delete buttonData.tabletHoverClassName;
        delete buttonData.desktopHoverClassName;
      }
    }
  }

  return optionsPayload;
};

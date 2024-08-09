import { useStore } from "@nanostores/react";
import { Svg } from "../../../components/panes/Svg";
import { classNames } from "../../../utils/helpers";
import { svgImageMask } from "../../../utils/compositor/svgImageMask";
import { cleanShapeOptionsDatum } from "../../../utils/compositor/shapeOptionsDatum";
import { viewportStore } from "../../../store/storykeep";
import { reduceClassNamesPayload } from "../../../utils/compositor/reduceClassNamesPayload";
import type {
  BgPaneDatum,
  BreakOptionsDatum,
  MaskOptionsDatum,
  ShapeOptionsDatum,
  OptionsPayloadDatum,
  ViewportKey,
} from "../../../types";

const BgPane = ({ payload }: { payload: BgPaneDatum }) => {
  const $viewport = useStore(viewportStore) as { value: ViewportKey };
  const viewportKey: ViewportKey =
    $viewport?.value && $viewport.value !== "auto" ? $viewport.value : null;
  const optionsPayload = payload.optionsPayload;
  const optionsPayloadDatum: OptionsPayloadDatum | undefined =
    optionsPayload &&
    optionsPayload?.classNamesPayload &&
    reduceClassNamesPayload(optionsPayload);
  const hasArtpack = optionsPayload?.artpack;
  const hasArtpackAll = hasArtpack?.all;
  const baseClasses: { [key: string]: string } = {
    mobile:
      viewportKey === "mobile" ? "grid" : viewportKey ? "hidden" : "md:hidden",
    tablet:
      viewportKey === "tablet"
        ? "grid"
        : viewportKey
          ? "hidden"
          : "hidden md:grid xl:hidden",
    desktop:
      viewportKey === "desktop"
        ? "grid"
        : viewportKey
          ? "hidden"
          : "hidden xl:grid",
  };

  // prepare for each breakpoint
  const viewportLookup =
    viewportKey && [`mobile`, `tablet`, `desktop`].includes(viewportKey)
      ? [viewportKey]
      : ["mobile", "tablet", "desktop"];
  const options = viewportLookup.map((_viewportKey: string) => {
    if (payload.hiddenViewports.includes(_viewportKey)) return null;

    // check for artpack payload
    const hasArtpackViewport =
      hasArtpack &&
      typeof hasArtpack[_viewportKey] !== `undefined` &&
      hasArtpack[_viewportKey];
    const artpack = (hasArtpack && hasArtpackAll) || hasArtpackViewport;
    const artpackMode = artpack ? artpack.mode : null;
    const artpackFiletype = artpack ? artpack.filetype : null;
    const artpackCollection = artpack ? artpack.collection : null;
    const viewportPrefix =
      _viewportKey === `desktop` || _viewportKey === `tablet` ? `1920` : `800`;
    const filenamePrefix =
      artpackCollection !== `custom` ? `${artpackCollection}-` : ``;
    const artpackImage = artpack ? artpack.image : null;

    // check for shape mask
    const thisShapeSelector =
      _viewportKey === `desktop`
        ? payload.shapeDesktop
        : _viewportKey === `tablet`
          ? payload.shapeTablet
          : _viewportKey === `mobile`
            ? payload.shapeMobile
            : payload.shape;
    const shapeName = thisShapeSelector !== `none` ? thisShapeSelector : null;
    const thisId = `${_viewportKey}-${thisShapeSelector}-pane`;

    // check for tailwind classes
    const classNamesParent =
      optionsPayloadDatum?.classNamesParent &&
      viewportKey &&
      typeof optionsPayloadDatum?.classNamesParent[viewportKey] !== `undefined`
        ? optionsPayloadDatum.classNamesParent[viewportKey]
        : optionsPayload?.classNamesParent &&
            typeof optionsPayload?.classNamesParent?.all !== `undefined`
          ? optionsPayload.classNamesParent.all
          : typeof optionsPayload?.classNamesParent !== `undefined` &&
              typeof optionsPayload?.classNamesParent[_viewportKey] !==
                `undefined`
            ? optionsPayload.classNamesParent[_viewportKey]
            : ``;

    // based on artpack mode
    switch (artpackMode) {
      case `break`: {
        return {
          id: `${_viewportKey}-${payload.id}`,
          artpackMode,
          styles: { fill: (artpack && artpack?.svgFill) || `none` },
          shapeName: `${artpackCollection}${artpackImage}`,
        };
      }
      case `mask`: {
        const maskSvg =
          shapeName && svgImageMask(shapeName, thisId, _viewportKey);
        if (!maskSvg) return null;
        return {
          id: `${_viewportKey}-${payload.id}`,
          artpackMode,
          classNamesParent,
          styles: {
            backgroundImage: `url(/${artpackCollection}-artpack/${viewportPrefix}/${filenamePrefix}${artpackImage}.${artpackFiletype})`,
            backgroundSize: artpack ? artpack.objectFit : `cover`,
            WebkitMaskImage: maskSvg.mask,
            maskImage: maskSvg.mask,
            maskRepeat: `no-repeat`,
            WebkitMaskSize: `100% AUTO`,
            maskSize: `100% AUTO`,
          },
        };
      }

      default:
        return {
          id: `${_viewportKey}-${payload.id}`,
          shapeName,
          classNamesParent,
        };
    }
  });

  return (
    <>
      {[0, 1, 2].map((i: number) => {
        if (
          options &&
          options[i] &&
          !options[i]?.artpackMode &&
          options[i]?.id &&
          options[i]?.shapeName
        ) {
          const thisOptions = cleanShapeOptionsDatum(
            options[i]
          ) as ShapeOptionsDatum;
          if (thisOptions)
            return (
              <div
                key={i}
                className={classNames(
                  baseClasses[viewportLookup[i]],
                  thisOptions.classNamesParent || ``
                )}
              >
                <Svg
                  shapeName={thisOptions.shapeName || ``}
                  viewportKey={viewportLookup[i]}
                  id={thisOptions.id}
                />
              </div>
            );
        } else if (options[i] && options[i]?.artpackMode === `break`) {
          const thisOptions = options[i] as BreakOptionsDatum;
          return (
            <div
              key={i}
              className={baseClasses[viewportLookup[i]] || ``}
              style={thisOptions.styles || {}}
            >
              <Svg
                shapeName={thisOptions.shapeName}
                viewportKey={viewportLookup[i]}
                id={thisOptions.id}
              />
            </div>
          );
        } else if (options[i] && options[i]?.artpackMode === `mask`) {
          const thisOptions = options[i] as MaskOptionsDatum;
          return (
            <div
              key={i}
              className={classNames(
                `w-full h-full`,
                baseClasses[viewportLookup[i]],
                thisOptions.classNamesParent
              )}
              style={thisOptions.styles}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default BgPane;

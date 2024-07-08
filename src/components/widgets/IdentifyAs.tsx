import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { heldBeliefsScales } from "@assets/beliefs";
import { classNames } from "../../utils/helpers";
import { heldBeliefs } from "../../store/beliefs";
import { events } from "../../store/events";
import type { BeliefDatum, EventStream } from "../../types";

export const IdentifyAs = ({
  value,
}: {
  value: { slug: string; target: string; extra: string };
}) => {
  const $heldBeliefsAll = useStore(heldBeliefs);
  const thisTitle = `Tell me more!`;
  const extra = value && typeof value.extra === `string` ? value.extra : null;
  const thisScale = heldBeliefsScales.agreement;
  const start = { id: 0, slug: `0`, name: `0`, color: `` };
  const [selected, setSelected] = useState(start);

  useEffect(() => {
    const hasMatchingBelief = $heldBeliefsAll
      .filter((e: BeliefDatum) => e.slug === value.slug)
      .at(0);
    if (hasMatchingBelief && hasMatchingBelief.object === value.target)
      setSelected(thisScale[0]);
    else setSelected(start);
  }, [$heldBeliefsAll]);

  const handleClick = () => {
    // toggle ON
    if (selected.id === 0) {
      const newScale = thisScale.at(0)!;
      setSelected(newScale);
      const event = {
        id: value.slug,
        verb: `IDENTIFY_AS`,
        object: value.target.toUpperCase(),
        type: `Belief`,
      };
      const belief = {
        id: value.slug,
        verb: `IDENTIFY_AS`,
        slug: value.slug,
        object: value.target.toUpperCase(),
      };
      const prevBeliefs = $heldBeliefsAll.filter(
        (b: BeliefDatum) => b.slug !== value.slug
      );
      heldBeliefs.set([...prevBeliefs, belief]);
      const prevEvents = events
        .get()
        .filter(
          (e: EventStream) => !(e.type === `Belief` && e.id === value.slug)
        );
      events.set([...prevEvents, event]);

      // toggle OFF
    } else {
      setSelected(start);
      const event = {
        id: value.slug,
        // this removes the identifyAs from the db and graph
        verb: `UNSET`,
        object: true,
        type: `Belief`,
      };
      const prevBeliefs = $heldBeliefsAll.filter(
        (b: BeliefDatum) => b.slug !== value.slug
      );
      heldBeliefs.set([...prevBeliefs]);
      const prevEvents = events
        .get()
        .filter(
          (e: EventStream) => !(e.type === `Belief` && e.id === value.slug)
        );
      events.set([...prevEvents, event]);
    }
  };

  return (
    <>
      {extra ? <span className="mr-2">{extra}</span> : null}
      <div className="block mt-3 w-fit">
        <button
          type="button"
          onClick={handleClick}
          className={classNames(
            selected.id === 0
              ? `bg-white hover:bg-myorange/5 ring-myorange/50`
              : `bg-white hover:bg-myorange/5 ring-mygreen/5`,
            `rounded-md px-3 py-2 text-lg text-black shadow-sm ring-1 ring-inset`
          )}
        >
          <div className="flex items-center">
            <span
              aria-label="Color swatch for belief"
              className={classNames(
                `motion-safe:animate-pulse`,
                selected.color || `bg-myorange`,
                `inline-block h-2 w-2 flex-shrink-0 rounded-full`
              )}
            />
            <span className="ml-3 block truncate">{thisTitle}</span>
          </div>
        </button>
      </div>
    </>
  );
};

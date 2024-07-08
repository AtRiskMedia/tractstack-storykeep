import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Switch } from "@headlessui/react";
import { classNames } from "../../utils/helpers";
import { heldBeliefs } from "../../store/beliefs";
import { events } from "../../store/events";
import type { BeliefDatum, EventStream } from "../../types";

export const ToggleBelief = ({
  belief,
  prompt,
}: {
  belief: string;
  prompt: string;
}) => {
  const [enabled, setEnabled] = useState<undefined | boolean>(undefined);
  const $heldBeliefsAll = useStore(heldBeliefs);

  useEffect(() => {
    const hasMatchingBelief = $heldBeliefsAll
      .filter((e: BeliefDatum) => e.slug === belief)
      .at(0);
    if (
      hasMatchingBelief &&
      hasMatchingBelief?.slug &&
      typeof enabled === `boolean`
    )
      setEnabled(!enabled);
    else if (hasMatchingBelief && hasMatchingBelief?.verb)
      setEnabled(hasMatchingBelief.verb === `BELIEVES_YES`);
    else if (typeof enabled === `undefined`) setEnabled(false);
  }, [heldBeliefs]);

  const handleClick = () => {
    const event = {
      verb: enabled ? `BELIEVES_NO` : `BELIEVES_YES`,
      id: belief,
      type: `Belief`,
    };
    const thisBelief = {
      id: belief,
      slug: belief,
      verb: enabled ? `BELIEVES_NO` : `BELIEVES_YES`,
    };
    setEnabled(!enabled);
    const prevBeliefs = $heldBeliefsAll.filter(
      (b: BeliefDatum) => b.slug !== belief
    );
    heldBeliefs.set([...prevBeliefs, thisBelief]);
    const prevEvents = events
      .get()
      .filter((e: EventStream) => !(e.type === `Belief` && e.id === belief));
    events.set([...prevEvents, event]);
  };

  if (typeof enabled === `undefined`) return <div />;
  return (
    <Switch.Group as="div" className={classNames(`flex items-center mt-6`)}>
      <Switch
        checked={enabled}
        onChange={handleClick}
        className={classNames(
          enabled ? `bg-myorange` : `bg-myblue`,
          `relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? `translate-x-5` : `translate-x-0 motion-safe:animate-wig`,
            `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="cursor-pointer">{prompt}</span>
      </Switch.Label>
    </Switch.Group>
  );
};

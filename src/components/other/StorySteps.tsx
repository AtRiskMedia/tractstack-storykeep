import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { sync, auth } from "../../store/auth";
import { MapIcon } from "@heroicons/react/24/outline";

export const StorySteps = () => {
  const [hidden, setHidden] = useState(true);
  const $sync = useStore(sync);
  const $auth = useStore(auth);

  useEffect(() => {
    if ($sync && $auth.neo4jEnabled) setHidden(false);
    else setHidden(true);
  }, [$sync]);
  if (hidden) return <div />;

  return <MapIcon className="h-6 w-6 mx-2" />;
};

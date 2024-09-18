import { RectangleGroupIcon, BeakerIcon } from "@heroicons/react/24/outline";

export const OpenStoryKeep = ({
  slug,
  isContext,
  isStoryKeep = false,
  isEditable = false,
}: {
  slug: string;
  isContext: boolean;
  isStoryKeep?: boolean;
  isEditable?: boolean;
}) => {
  return (
    <>
      {isStoryKeep ? (
        <a
          href="/storykeep"
          className="hover:text-myblue hover:rotate-6"
          title="Your Story Keep Dashboard"
        >
          <RectangleGroupIcon className="h-6 w-6 text-myblue/80" />
        </a>
      ) : (
        <a
          data-astro-reload
          href="/storykeep"
          className="hover:text-myblue hover:rotate-6"
          title="Your Story Keep Dashboard"
        >
          <RectangleGroupIcon className="h-6 w-6 text-myblue/80" />
        </a>
      )}
      {isStoryKeep && slug !== `storykeep-settings` ? (
        <a
          href={!isContext ? `/${slug}/edit` : `/context/${slug}/edit`}
          className="hover:text-myblue hover:rotate-6"
          title="Modify this page"
        >
          <BeakerIcon className="h-6 w-6 text-myblue/80" />
        </a>
      ) : isEditable ? (
        <a
          data-astro-reload
          href={!isContext ? `/${slug}/edit` : `/context/${slug}/edit`}
          className="hover:text-myblue hover:rotate-6"
          title="Modify this page"
        >
          <BeakerIcon className="h-6 w-6 text-myblue/80" />
        </a>
      ) : null}
    </>
  );
};

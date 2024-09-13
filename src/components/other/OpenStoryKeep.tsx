import { RectangleGroupIcon, BeakerIcon } from "@heroicons/react/24/outline";

export const OpenStoryKeep = ({
  slug,
  isContext,
}: {
  slug: string;
  isContext: boolean;
}) => {
  return (
    <>
      <a
        href="/storykeep"
        className="hover:text-myblue hover:rotate-6"
        title="Your Story Keep Dashboard"
      >
        <RectangleGroupIcon className="h-6 w-6 text-myblue/80" />
      </a>
      <a
        href={!isContext ? `/${slug}/edit` : `/context/${slug}/edit`}
        className="hover:text-myblue hover:rotate-6"
        title="Modify this page"
      >
        <BeakerIcon className="h-6 w-6 text-myblue/80" />
      </a>
    </>
  );
};

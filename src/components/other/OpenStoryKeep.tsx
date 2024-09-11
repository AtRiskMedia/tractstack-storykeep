import { BeakerIcon } from "@heroicons/react/24/outline";

export const OpenStoryKeep = ({
  slug,
  isContext,
}: {
  slug: string;
  isContext: boolean;
}) => {
  return (
    <a
      href={!isContext ? `/${slug}/edit` : `/context/${slug}/edit`}
      className="hover:text-myblue hover:rotate-6"
      title="Modify this page"
    >
      <BeakerIcon className="h-6 w-6 mx-2 text-myblue/80" />
    </a>
  );
};

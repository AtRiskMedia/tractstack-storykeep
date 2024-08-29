import { useStore } from "@nanostores/react";
import {
  paneFiles,
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  //  uncleanDataStore,
} from "../../../store/storykeep";

interface PaneFilesProps {
  id: string;
}

const PaneFiles = ({ id }: PaneFilesProps) => {
  const $paneFiles = useStore(paneFiles, { keys: [id] });
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [id],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[id]?.current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  //  const $uncleanData = useStore(uncleanDataStore, { keys: [id] });
  console.log($paneFiles[id]?.current);
  console.log($paneFragmentMarkdown[markdownFragmentId]?.current);

  return <div>Files on Pane: {id}</div>;
};

export default PaneFiles;

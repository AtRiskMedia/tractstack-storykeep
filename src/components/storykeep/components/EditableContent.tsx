import { useState, useCallback, useEffect } from "react";
import ContentEditableField from "./ContentEditableField";
import { paneMarkdownBody, toolModeStore } from "../../../store/storykeep";
import { updateMarkdownPart } from "../../../utils/compositor/markdownUtils";
import { useStore } from "@nanostores/react";

interface EditableContentProps {
  content: string;
  tag: string;
  paneId: string;
  classes: string;
  nthIndex: number;
  parentTag?: string;
}

const EditableContent = ({
  content,
  tag,
  paneId,
  classes,
  nthIndex,
  parentTag,
}: EditableContentProps) => {
  const $toolMode = useStore(toolModeStore);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing($toolMode.value === "text");
  }, [$toolMode.value]);

  const handleEdit = useCallback(
    (newContent: string) => {
      const currentMarkdown = paneMarkdownBody.get()[paneId].current;
      const updatedMarkdown = updateMarkdownPart(
        currentMarkdown,
        newContent,
        tag,
        nthIndex,
        parentTag
      );

      paneMarkdownBody.setKey(paneId, {
        ...paneMarkdownBody.get()[paneId],
        current: updatedMarkdown,
      });
      return true;
    },
    [paneId, tag, nthIndex, parentTag]
  );

  const handleClick = () => {
    console.log(`click`, isEditing, $toolMode.value);
    if ($toolMode.value === "text") {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <ContentEditableField
        id={`${tag}-${paneId}`}
        value={content}
        onChange={handleEdit}
        onEditingChange={() => {}}
        className={classes}
      />
    );
  }

  return (
    <div className={classes} onClick={handleClick}>
      {content}
    </div>
  );
};

export default EditableContent;

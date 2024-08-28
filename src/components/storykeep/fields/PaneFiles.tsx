interface PaneFilesProps {
  id: string;
}

const PaneFiles = ({ id }: PaneFilesProps) => {
  return <div>Files on Pane: {id}</div>;
};

export default PaneFiles;

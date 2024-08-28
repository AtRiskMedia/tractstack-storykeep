interface PaneShapesProps {
  id: string;
}

const PaneShapes = ({ id }: PaneShapesProps) => {
  return <div>Shapes on Pane: {id}</div>;
};

export default PaneShapes;

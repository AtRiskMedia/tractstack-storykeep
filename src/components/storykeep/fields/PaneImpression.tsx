interface PaneImpressionProps {
  id: string;
}

const PaneImpression = ({ id }: PaneImpressionProps) => {
  return <div>Impression on Pane: {id}</div>;
};

export default PaneImpression;

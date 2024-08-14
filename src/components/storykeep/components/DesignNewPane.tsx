const DesignNewPane = (props: { id: string; index: number }) => {
  const { id, index } = props;
  return (
    <div>
      Insert new pane pos:{index}, story fragment: ${id}
    </div>
  );
};

export default DesignNewPane;

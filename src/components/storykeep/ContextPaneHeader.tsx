export const ContextPaneHeader = (props: { id: string }) => {
  const { id } = props;
  console.log(id);

  return <div>{id}</div>;
};

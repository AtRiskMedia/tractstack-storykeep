export const StoryFragmentHeader = (props: { id: string }) => {
  const { id } = props;
  console.log(id);

  const handleToggleOn = () => {
    const event = new CustomEvent("toggle-on-edit-modal");
    document.dispatchEvent(event);
  };
  const handleToggleOff = () => {
    const event = new CustomEvent("toggle-off-edit-modal");
    document.dispatchEvent(event);
  };

  return (
    <div>
      <button onClick={handleToggleOn}>Edit Pane On</button>
      <button onClick={handleToggleOff}>Edit Pane Off</button>
    </div>
  );

  //return <div>{id}</div>;
};

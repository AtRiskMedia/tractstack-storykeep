import type { StoryFragmentDatum, PaneDatum } from "../../types";

export const StoryFragment = (props: { storyfragment: StoryFragmentDatum }) => {
  const { storyfragment } = props;
  console.log(`goes in nano store`, storyfragment);

  return (
    <>
      <div>{storyfragment.slug}</div>
      <ul>
        {storyfragment.panesPayload.map((p: PaneDatum) => (
          <li key={p.id}>{p.id}</li>
        ))}
      </ul>
    </>
  );
};

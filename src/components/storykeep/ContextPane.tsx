import type { ContextPaneDatum } from "../../types";

export const ContextPane = (props: { context: ContextPaneDatum }) => {
  const { context } = props;
  console.log(context);

  return <div>{context.slug}</div>;
};

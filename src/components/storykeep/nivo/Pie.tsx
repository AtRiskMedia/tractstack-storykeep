import { ResponsivePie } from "@nivo/pie";
import { oneDarkTheme } from "../../../assets/nivo";

const Pie = ({ data }: { data: { id: string; value: number }[] }) => (
  <div style={{ height: "200px" }}>
    <ResponsivePie
      data={data}
      colors={oneDarkTheme}
      margin={{ top: 30, right: 10, bottom: 30, left: 10 }}
      animate={true}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={4}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
    />
  </div>
);

export default Pie;

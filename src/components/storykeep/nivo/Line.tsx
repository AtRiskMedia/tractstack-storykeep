import { useState, useEffect, useRef, useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { theme, oneDarkTheme } from "../../../assets/nivo";
import type { LineDataSeries } from "../../../types";

const Line = ({ data, legend }: { data: LineDataSeries[]; legend: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [key, setKey] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width !== dimensions.width || height !== dimensions.height) {
          setDimensions({ width, height });
          setKey(prevKey => prevKey + 1); // Force re-render of the chart
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateDimensions(); // Initial dimensions

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const reduceDataPoints = (
    originalData: LineDataSeries[],
    targetPoints: number
  ) => {
    return originalData.map(series => {
      if (series.data.length <= targetPoints) {
        return series;
      }

      const interval = Math.ceil(series.data.length / targetPoints);
      const reducedData = series.data.filter(
        (_, index) =>
          index === 0 ||
          index === series.data.length - 1 ||
          index % interval === 0
      );

      return { ...series, data: reducedData };
    });
  };

  const processedData = useMemo(() => {
    const minWidth = 500; // Minimum width to show all 24 points
    const maxPoints = 24; // Maximum number of points
    const minPoints = 8; // Minimum number of points to show

    if (dimensions.width >= minWidth) {
      return data;
    }

    const targetPoints = Math.max(
      minPoints,
      Math.floor((dimensions.width / minWidth) * maxPoints)
    );

    return reduceDataPoints(data, targetPoints);
  }, [data, dimensions.width]);

  // Calculate the maximum y value across all series
  const maxY = Math.max(
    ...processedData.flatMap(series => series.data.map(point => point.y))
  );

  // Generate appropriate tick values based on the max value
  const yTickValues = useMemo(() => {
    if (maxY <= 5) {
      return Array.from({ length: maxY + 1 }, (_, i) => i);
    } else if (maxY <= 10) {
      return [0, 2, 4, 6, 8, 10].filter(v => v <= maxY);
    } else {
      const step = Math.ceil(maxY / 5);
      return Array.from({ length: 6 }, (_, i) => i * step).filter(
        v => v <= maxY
      );
    }
  }, [maxY]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ResponsiveLine
        key={key}
        data={processedData}
        theme={theme}
        colors={oneDarkTheme}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: 0,
          max: Math.max(...yTickValues),
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.0f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: legend || "Time",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Events",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: yTickValues,
          format: value => Math.round(value).toString(),
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default Line;

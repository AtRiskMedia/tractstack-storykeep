import type { Theme } from "@nivo/core";

export const theme: Theme = {
  background: "rgba(255,255,255,.2)",
  axis: {
    ticks: {
      line: {
        stroke: "rgb(57, 61, 52)",
      },
      text: {
        fill: "rgb(57, 61, 52)",
        fontWeight: 600,
      },
    },
    legend: {
      text: {
        fill: "rgb(57, 61, 52)",
        fontSize: 15,
      },
    },
  },
  grid: {
    line: {
      fill: "rgb(57, 61, 52)",
      strokeDasharray: "2 4",
      strokeWidth: 2,
    },
  },
};

export const oneDarkTheme = [
  "#46d9ff",
  "#98be65",
  "#ff6c6b",
  "#c678dd",
  "#51afef",
  "#5699af",
  "#5b6268",
  "#da8548",
  "#4db5bd",
  "#ecbe7b",
  "#da8548",
  "#3071db",
  "#dfdfdf",
  "#a7b1b7",
  "#a9a1e1",
];

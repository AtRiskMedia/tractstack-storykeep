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
  "#ff6c6b",
  "#98be65",
  "#da8548",
  "#51afef",
  "#c678dd",
  "#5699af",
  "#a7b1b7",
  "#5b6268",
  "#da8548",
  "#4db5bd",
  "#ecbe7b",
  "#3071db",
  "#a9a1e1",
  "#46d9ff",
  "#dfdfdf",
];

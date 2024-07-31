//import { storySteps } from "../store/events";
import { tailwindColors } from "../assets/tailwindColors";
import type {
  GraphNodes,
  GraphNode,
  GraphNodeDatum,
  GraphRelationshipDatum,
  ClassNamesPayloadValue,
} from "../types";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(` `);
}

export function getClassNames(
  input: string | { classes: ClassNamesPayloadValue }
): string[] {
  if (!input) {
    return [];
  }
  if (typeof input === "string") {
    return [input];
  } else {
    return Object.values(input.classes).flat();
  }
}

function getScrollBarWidth() {
  // Create a temporary element to measure the scrollbar width
  const div = document.createElement('div');
  div.style.overflow = 'scroll';
  div.style.width = '100px';
  div.style.height = '100px';
  div.style.position = 'absolute';
  div.style.top = '-9999px'; // Move it out of the viewport
  document.body.appendChild(div);

  // Create an inner element to measure the difference
  const innerDiv = document.createElement('div');
  innerDiv.style.width = '100%';
  innerDiv.style.height = '100%';
  div.appendChild(innerDiv);

  // Calculate the scrollbar width
  const scrollBarWidth = div.offsetWidth - innerDiv.offsetWidth;

  // Clean up
  document.body.removeChild(div);

  return scrollBarWidth;
}

export function handleResize() {
  const scrollBarWidth = getScrollBarWidth();
  const innerWidth = window.innerWidth;
  const thisScale =
    innerWidth < 801
      ? (innerWidth - scrollBarWidth) / 600
      : innerWidth < 1367
        ? (innerWidth - scrollBarWidth) / 1080
        : (innerWidth - scrollBarWidth) / 1920;
  document.documentElement.style.setProperty(`--scale`, thisScale.toString());
}

export function handleEditorResize() {
  const previewElement = document.getElementById("storykeep-preview");
  if (!previewElement) return;

  const resizeObserver = new ResizeObserver(() => {
    // Calculate scrollbar width
    const scrollBarOffset =
      window.innerWidth - document.documentElement.clientWidth;

    // Get the actual width of the preview element
    const previewWidth = previewElement.clientWidth;

    // Adjust the width to account for the scrollbar
    const adjustedWidth = previewWidth + scrollBarOffset;

    let baseWidth;

    // Use adjustedWidth for breakpoint checks
    if (adjustedWidth <= 800) {
      baseWidth = 600;
    } else if (adjustedWidth <= 1367) {
      baseWidth = 1080;
    } else {
      baseWidth = 1920;
    }

    // Use the actual previewWidth for scale calculation
    const thisScale = previewWidth / baseWidth;

    previewElement.style.setProperty(`--scale`, thisScale.toString());
  });

  resizeObserver.observe(previewElement);

  // Clean up function
  return () => {
    resizeObserver.disconnect();
  };
}

export function scrollToTop() {
  const button = document.querySelector("button#top");
  button?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: `smooth`,
    });
  });
}

// scroll to top functionality
export function handleScroll() {
  const rootElement = document.documentElement;
  const button = document.querySelector("button#top");
  //const scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
  const aboveFold = window.innerHeight > rootElement.scrollTop;
  //const hitBottom = scrollTotal - rootElement.scrollTop < 150;
  if (!aboveFold /* && !hitBottom */ && button) {
    // Show button
    button.classList.add("block");
    button.classList.remove("hidden");
  } else if (button) {
    // Hide button
    button.classList.add("hidden");
    button.classList.remove("block");
  }
}

export const processGraphPayload = (rows: GraphNodes[]) => {
  const graphNodes: GraphNode[] = [];
  const graphNodeIds: string[] = [];
  const graphRelationships: GraphNode[] = [];
  const graphRelationshipIds: string[] = [];
  rows.forEach((row: GraphNodes) => {
    if (row?.v?.id && !graphNodeIds.includes(row.v.id)) {
      graphNodes.push(row.v);
      graphNodeIds.push(row.v.id);
    }
    if (row?.b?.id && !graphNodeIds.includes(row.b.id)) {
      graphNodes.push(row.b);
      graphNodeIds.push(row.b.id);
    }
    if (row?.c?.id && !graphNodeIds.includes(row.c.id)) {
      graphNodes.push(row.c);
      graphNodeIds.push(row.c.id);
    }
    if (row?.f?.id && !graphNodeIds.includes(row.f.id)) {
      graphNodes.push(row.f);
      graphNodeIds.push(row.f.id);
    }
    if (row?.s?.id && !graphNodeIds.includes(row.s.id)) {
      graphNodes.push(row.s);
      graphNodeIds.push(row.s.id);
    }
    if (row?.t?.id && !graphNodeIds.includes(row.t.id)) {
      graphNodes.push(row.t);
      graphNodeIds.push(row.t.id);
    }
    if (row?.a?.id && !graphRelationshipIds.includes(row.a.id)) {
      graphRelationships.push(row.a);
      graphRelationshipIds.push(row.a.id);
    }
    if (row?.bb?.id && !graphRelationshipIds.includes(row.bb.id)) {
      graphRelationships.push(row.bb);
      graphRelationshipIds.push(row.bb.id);
    }
    if (row?.cc?.id && !graphRelationshipIds.includes(row.cc.id)) {
      graphRelationships.push(row.cc);
      graphRelationshipIds.push(row.cc.id);
    }
    if (row?.d?.id && !graphRelationshipIds.includes(row.d.id)) {
      graphRelationships.push(row.d);
      graphRelationshipIds.push(row.d.id);
    }
    if (row?.r?.id && !graphRelationshipIds.includes(row.r.id)) {
      graphRelationships.push(row.r);
      graphRelationshipIds.push(row.r.id);
    }
    if (row?.rsf?.id && !graphRelationshipIds.includes(row.rsf.id)) {
      graphRelationships.push(row.rsf);
      graphRelationshipIds.push(row.rsf.id);
    }
    if (row?.ts1?.id && !graphRelationshipIds.includes(row.ts1.id)) {
      graphRelationships.push(row.ts1);
      graphRelationshipIds.push(row.ts1.id);
    }
    if (row?.ts2?.id && !graphRelationshipIds.includes(row.ts2.id)) {
      graphRelationships.push(row.ts2);
      graphRelationshipIds.push(row.ts2.id);
    }
    if (row?.rc?.id && !graphRelationshipIds.includes(row.rc.id)) {
      graphRelationships.push(row.rc);
      graphRelationshipIds.push(row.rc.id);
    }
  });

  const nodes: GraphNodeDatum[] = [];
  graphNodes.forEach((e: GraphNode) => {
    // colours by https://github.com/catppuccin/catppuccin Macchiato theme
    const color =
      e?.labels?.at(0) === `StoryFragment`
        ? `#f4dbd6`
        : e?.labels?.at(0) === `TractStack`
          ? `#f0c6c6`
          : e?.labels?.at(0) === `Corpus`
            ? `#f5bde6`
            : e?.labels?.at(0) === `Visit`
              ? `#c6a0f6`
              : e?.labels?.at(0) === `Belief`
                ? `#ed8796`
                : e?.labels?.at(0) === `Fingerprint`
                  ? `#ee99a0`
                  : `#f5a97f`;
    if (e?.id && e?.properties?.object_type && e?.properties?.object_name)
      nodes.push({
        id: e.id,
        title: e.properties.object_type,
        label: e.properties.object_name,
        value: e.properties.pageRank || 0,
        color: color,
      });
    else if (e?.id && e?.properties?.fingerprint_id)
      nodes.push({
        id: e.id,
        title: `You`,
        label: `You`,
        color: color,
      });
    else if (e?.id && e?.properties?.belief_id) {
      nodes.push({
        id: e.id,
        title: `Belief`,
        label: e.properties.belief_id,
        color: color,
      });
    } else if (e?.id && e?.properties?.visit_id)
      nodes.push({
        id: e.id,
        title: `Visit`,
        label: `Visit`,
        color: color,
      });
  });
  const edges: GraphRelationshipDatum[] = graphRelationships.map(
    (e: GraphNode) => {
      const label =
        typeof e?.properties?.object === `string`
          ? e.properties.object
          : typeof e?.type === `string`
            ? e.type
            : `unknown`;
      return {
        from: e.startNodeId,
        to: e.endNodeId,
        label: label,
        font: { align: `top`, size: `8` },
        arrows: {
          to: {
            enabled: true,
            type: `triangle`,
          },
        },
      };
    }
  );

  return { nodes, edges };
};

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

// Loading indicator and animation logic
let progressInterval: NodeJS.Timeout | null = null;

export function startLoadingAnimation() {
  const loadingIndicator = document.getElementById(
    "loading-indicator"
  ) as HTMLElement;
  const content = document.getElementById("content") as HTMLElement;

  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    loadingIndicator.style.transform = "scaleX(0)";
    loadingIndicator.style.display = "block";
    content.style.opacity = "0.7";

    let progress = 0;
    progressInterval = setInterval(() => {
      progress += 2;
      if (progress > 90) {
        if (progressInterval !== null) {
          clearInterval(progressInterval);
        }
      }
      loadingIndicator.style.transform = `scaleX(${progress / 100})`;
    }, 20);
  }
}

export function stopLoadingAnimation() {
  const loadingIndicator = document.getElementById(
    "loading-indicator"
  ) as HTMLElement;
  const content = document.getElementById("content") as HTMLElement;

  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    if (progressInterval !== null) {
      clearInterval(progressInterval);
    }
    loadingIndicator.style.transform = "scaleX(1)";
    content.style.opacity = "1";

    setTimeout(() => {
      loadingIndicator.style.display = "none";
      loadingIndicator.style.transform = "scaleX(0)";
    }, 300);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export const tailwindToHex = (tailwindColor: string): string => {
  const [colorName, shade] = tailwindColor.replace("bg-", "").split("-");
  if (
    colorName in tailwindColors &&
    shade &&
    Number(shade) / 100 - 1 >= 0 &&
    Number(shade) / 100 - 1 < (tailwindColors as any)[colorName].length
  ) {
    return (tailwindColors as any)[colorName][Number(shade) / 100 - 1];
  }
  return "#FFFFFF"; // Default to white if color not found
};

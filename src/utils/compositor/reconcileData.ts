import { ulid } from "ulid";
import {
  unsavedChangesStore,
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTractStackId,
  storyFragmentMenuId,
  storyFragmentPaneIds,
  storyFragmentSocialImagePath,
  storyFragmentTailwindBgColour,
  paneTitle,
  paneSlug,
  paneIsContextPane,
  paneHeightOffsetDesktop,
  paneHeightOffsetMobile,
  paneHeightOffsetTablet,
  paneHeightRatioDesktop,
  paneHeightRatioMobile,
  paneHeightRatioTablet,
  paneFiles,
  paneFragmentIds,
  paneFragmentMarkdown,
  paneFragmentBgPane,
  paneFragmentBgColour,
  paneCodeHook,
  paneImpression,
  paneHeldBeliefs,
  paneWithheldBeliefs,
} from "../../store/storykeep";

import type {
  StoryFragmentDatum,
  ContextPaneDatum,
  BgColourDatum,
  BgPaneDatum,
  MarkdownPaneDatum,
  MarkdownDatum,
  ImpressionDatum,
  PaneDatum,
  TursoQuery,
  ReconciledData,
  ContextPaneQueries,
  StoryFragmentQueries,
} from "../../types";

export const resetUnsavedChanges = (id: string, isContext: boolean) => {
  const resetChanges = (storeId: string) => {
    const currentChanges = unsavedChangesStore.get()[storeId] || {};
    const resetChanges = Object.keys(currentChanges).reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {} as Record<string, boolean>
    );
    unsavedChangesStore.setKey(storeId, resetChanges);
  };

  if (isContext) {
    // Reset ContextPane changes
    resetChanges(id);

    // Reset PaneFragment changes
    const fragmentIds = paneFragmentIds.get()[id]?.current || [];
    fragmentIds.forEach(fragmentId => {
      resetChanges(fragmentId);
    });
  } else {
    // Reset StoryFragment changes
    resetChanges(id);

    // Reset Pane and PaneFragment changes
    const paneIds = storyFragmentPaneIds.get()[id]?.current || [];
    paneIds.forEach(paneId => {
      resetChanges(paneId);
      const fragmentIds = paneFragmentIds.get()[paneId]?.current || [];
      fragmentIds.forEach(fragmentId => {
        resetChanges(fragmentId);
      });
    });
  }
};

export function reconcileData(
  id: string,
  isContext: boolean,
  originalData: StoryFragmentDatum | ContextPaneDatum | null
): ReconciledData {
  if (isContext) {
    return reconcileContextPane(id, originalData as ContextPaneDatum);
  } else {
    return reconcileStoryFragment(id, originalData as StoryFragmentDatum);
  }
}

function reconcileStoryFragment(
  id: string,
  originalData: StoryFragmentDatum
): ReconciledData {
  const isNewStoryFragment = originalData === null;
  const currentData: StoryFragmentDatum = {
    id,
    title: storyFragmentTitle.get()[id].current,
    slug: storyFragmentSlug.get()[id].current,
    tractStackId: storyFragmentTractStackId.get()[id].current,
    tractStackTitle: originalData?.tractStackTitle ?? "",
    tractStackSlug: originalData?.tractStackSlug ?? "",
    menuId: storyFragmentMenuId.get()[id].current,
    socialImagePath: storyFragmentSocialImagePath.get()[id].current,
    tailwindBgColour: storyFragmentTailwindBgColour.get()[id].current,
    created: originalData?.created ?? new Date(),
    changed: new Date(),
    panesPayload: reconcilePanes(storyFragmentPaneIds.get()[id].current),
    hasMenu: !!storyFragmentMenuId.get()[id].current,
    menuPayload: null,
    impressions: [],
    resourcesPayload: {
      resources: [],
      headerWidget: [],
      perCodeHookPayload: {},
      perCodeHookOptions: {},
      perCodeHookResourceCategory: {},
    },
  };

  const queries: StoryFragmentQueries = {
    storyfragment: createStoryFragmentQuery(currentData, originalData),
    panes: [],
    markdowns: [],
    storyfragment_pane: [],
    file_pane: [],
    file_markdown: [],
  };

  // Reconcile panes and their related data
  currentData.panesPayload.forEach((pane, index) => {
    const originalPane = originalData.panesPayload.find(p => p.id === pane.id);

    queries.panes.push(createPaneQuery(pane, originalPane));
    queries.storyfragment_pane.push(
      createStoryFragmentPaneQuery(id, pane.id, index)
    );

    if (pane.markdown) {
      queries.markdowns.push(
        createMarkdownQuery(pane.markdown, originalPane?.markdown)
      );
    }

    reconcileFiles(
      pane,
      originalPane,
      queries.file_pane,
      queries.file_markdown
    );
  });

  return { storyFragment: { data: currentData, queries } };
}

function reconcileContextPane(
  id: string,
  originalData: ContextPaneDatum
): ReconciledData {
  const isNewContextPane = originalData === null;
  console.log(isNewContextPane, id);
  const currentData: ContextPaneDatum = {
    id,
    title: paneTitle.get()[id].current,
    slug: paneSlug.get()[id].current,
    created: originalData?.created ?? new Date(),
    changed: new Date(),
    panePayload: reconcilePanePayload(id, originalData?.panePayload),
    impressions: [],
    resourcesPayload: [],
    codeHookOptions: {},
  };

  const panePayload = reconcilePanePayload(id, originalData?.panePayload);
  const queries: ContextPaneQueries = {
    pane: createPaneQuery(panePayload, originalData.panePayload),
    file_pane: [],
    file_markdown: [],
  };

  if (panePayload.markdown) {
    queries.markdown = createMarkdownQuery(
      panePayload.markdown,
      originalData.panePayload?.markdown
    );
  }

  reconcileFiles(
    panePayload,
    originalData.panePayload ?? undefined,
    queries.file_pane,
    queries.file_markdown
  );

  return { contextPane: { data: currentData, queries } };
}

// Helper functions for creating specific queries and reconciling data

function reconcilePanePayload(
  id: string,
  originalPayload: PaneDatum | null
): PaneDatum {
  return {
    id,
    title: paneTitle.get()[id].current,
    slug: paneSlug.get()[id].current,
    isContextPane: paneIsContextPane.get()[id].current,
    created: originalPayload?.created ?? new Date(),
    changed: new Date(),
    heightOffsetDesktop: paneHeightOffsetDesktop.get()[id].current,
    heightOffsetMobile: paneHeightOffsetMobile.get()[id].current,
    heightOffsetTablet: paneHeightOffsetTablet.get()[id].current,
    heightRatioDesktop: paneHeightRatioDesktop.get()[id].current,
    heightRatioMobile: paneHeightRatioMobile.get()[id].current,
    heightRatioTablet: paneHeightRatioTablet.get()[id].current,
    files: paneFiles.get()[id].current,
    optionsPayload: {
      paneFragmentsPayload: reconcilePaneFragments(
        id,
        paneFragmentIds.get()[id].current
      ),
      codeHook: paneCodeHook.get()[id].current || undefined,
      impressions: paneImpression.get()[id].current
  ? [paneImpression.get()[id].current as ImpressionDatum]
  : [] as ImpressionDatum[],
      heldBeliefs: paneHeldBeliefs.get()[id].current,
      withheldBeliefs: paneWithheldBeliefs.get()[id].current,
    },
    markdown: paneFragmentMarkdown.get()[id]?.current?.markdown || null,
  };
}

function createStoryFragmentQuery(
  currentData: StoryFragmentDatum,
  originalData: StoryFragmentDatum | null
): TursoQuery {
  const isNewStoryFragment = originalData === null;
  if (isNewStoryFragment) {
    return {
      sql: `INSERT INTO storyfragment (id, title, slug, social_image_path, tailwind_background_colour, menu_id, tractstack_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        currentData.id,
        currentData.title,
        currentData.slug,
        currentData.socialImagePath,
        currentData.tailwindBgColour,
        currentData.menuId,
        currentData.tractStackId,
      ],
    };
  } else {
    return {
      sql: `UPDATE storyfragment SET title = ?, slug = ?, social_image_path = ?, tailwind_background_colour = ?, menu_id = ?, tractstack_id = ? WHERE id = ?`,
      args: [
        currentData.title,
        currentData.slug,
        currentData.socialImagePath,
        currentData.tailwindBgColour,
        currentData.menuId,
        currentData.tractStackId,
        currentData.id,
      ],
    };
  }
}

function createPaneQuery(
  currentPane: PaneDatum,
  originalPane: PaneDatum | null | undefined
): TursoQuery {
  if (!originalPane) {
    return {
      sql: `INSERT INTO pane (id, title, slug, is_context_pane, height_offset_desktop, height_offset_mobile, height_offset_tablet, height_ratio_desktop, height_ratio_mobile, height_ratio_tablet, options_payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        currentPane.id,
        currentPane.title,
        currentPane.slug,
        currentPane.isContextPane,
        currentPane.heightOffsetDesktop,
        currentPane.heightOffsetMobile,
        currentPane.heightOffsetTablet,
        currentPane.heightRatioDesktop,
        currentPane.heightRatioMobile,
        currentPane.heightRatioTablet,
        JSON.stringify(currentPane.optionsPayload),
      ],
    };
  } else {
    return {
      sql: `UPDATE pane SET title = ?, slug = ?, is_context_pane = ?, height_offset_desktop = ?, height_offset_mobile = ?, height_offset_tablet = ?, height_ratio_desktop = ?, height_ratio_mobile = ?, height_ratio_tablet = ?, options_payload = ? WHERE id = ?`,
      args: [
        currentPane.title,
        currentPane.slug,
        currentPane.isContextPane,
        currentPane.heightOffsetDesktop,
        currentPane.heightOffsetMobile,
        currentPane.heightOffsetTablet,
        currentPane.heightRatioDesktop,
        currentPane.heightRatioMobile,
        currentPane.heightRatioTablet,
        JSON.stringify(currentPane.optionsPayload),
        currentPane.id,
      ],
    };
  }
}

function createStoryFragmentPaneQuery(
  storyFragmentId: string,
  paneId: string,
  weight: number
): TursoQuery {
  return {
    sql: `INSERT INTO storyfragment_pane (id, storyfragment_id, pane_id, weight) VALUES (?, ?, ?, ?) ON CONFLICT(storyfragment_id, pane_id) DO UPDATE SET weight = ?`,
    args: [ulid(), storyFragmentId, paneId, weight, weight],
  };
}

function createMarkdownQuery(
  currentMarkdown: MarkdownDatum | false | null,
  originalMarkdown?: MarkdownDatum | false | null
): TursoQuery {
  if (!currentMarkdown) {
    throw new Error("Current markdown is falsy");
  }
  if (!originalMarkdown) {
    return {
      sql: `INSERT INTO markdown (id, body) VALUES (?, ?)`,
      args: [currentMarkdown.id, currentMarkdown.body],
    };
  } else {
    return {
      sql: `UPDATE markdown SET body = ? WHERE id = ?`,
      args: [currentMarkdown.body, currentMarkdown.id],
    };
  }
}

function reconcilePanes(currentPaneIds: string[]): PaneDatum[] {
  return currentPaneIds.map(id => ({
    id,
    title: paneTitle.get()[id].current,
    slug: paneSlug.get()[id].current,
    isContextPane: paneIsContextPane.get()[id].current,
    created: new Date(), // You might want to get this from somewhere else
    changed: new Date(),
    heightOffsetDesktop: paneHeightOffsetDesktop.get()[id].current,
    heightOffsetMobile: paneHeightOffsetMobile.get()[id].current,
    heightOffsetTablet: paneHeightOffsetTablet.get()[id].current,
    heightRatioDesktop: paneHeightRatioDesktop.get()[id].current,
    heightRatioMobile: paneHeightRatioMobile.get()[id].current,
    heightRatioTablet: paneHeightRatioTablet.get()[id].current,
    files: paneFiles.get()[id].current,
    optionsPayload: {
      paneFragmentsPayload: reconcilePaneFragments(
        id,
        paneFragmentIds.get()[id].current
      ),
      codeHook: paneCodeHook.get()[id].current || undefined,
      impression: paneImpression.get()[id].current,
      heldBeliefs: paneHeldBeliefs.get()[id].current,
      withheldBeliefs: paneWithheldBeliefs.get()[id].current,
    },
    markdown: paneFragmentMarkdown.get()[id]?.current?.markdown || null,
  }));
}

function reconcilePaneFragments(
  paneId: string,
  fragmentIds: string[]
): (BgColourDatum | BgPaneDatum | MarkdownPaneDatum)[] {
  return fragmentIds.map(id => {
    if (paneFragmentBgColour.get()[id]) {
      return paneFragmentBgColour.get()[id].current;
    } else if (paneFragmentBgPane.get()[id]) {
      return paneFragmentBgPane.get()[id].current;
    } else if (paneFragmentMarkdown.get()[id]) {
      return paneFragmentMarkdown.get()[id].current.payload;
    }
    throw new Error(`Unknown fragment type for id: ${id}`);
  });
}

function reconcileFiles(
  currentPane: PaneDatum,
  originalPane: PaneDatum | undefined,
  filePaneQueries: TursoQuery[],
  fileMarkdownQueries: TursoQuery[]
) {
  const currentFileIds = new Set(currentPane.files.map(f => f.id));
  const originalFileIds = new Set(originalPane?.files.map(f => f.id) || []);

  // Files to add
  currentFileIds.forEach(fileId => {
    if (!originalFileIds.has(fileId)) {
      filePaneQueries.push({
        sql: `INSERT INTO file_pane (id, file_id, pane_id) VALUES (?, ?, ?)`,
        args: [ulid(), fileId, currentPane.id],
      });
    }
  });

  // Files to remove
  originalFileIds.forEach(fileId => {
    if (!currentFileIds.has(fileId)) {
      filePaneQueries.push({
        sql: `DELETE FROM file_pane WHERE file_id = ? AND pane_id = ?`,
        args: [fileId, currentPane.id],
      });
    }
  });

  // Handle markdown files if markdown exists
  if (currentPane.markdown && typeof currentPane.markdown !== 'boolean') {
  const currentMarkdownFileIds = new Set<string>(
    ((currentPane.markdown as any).images?.map((f: any) => f.id) ?? []) as string[]
  );
  const originalMarkdownFileIds = new Set<string>(
    ((originalPane?.markdown as any)?.images?.map((f: any) => f.id) ?? []) as string[]
  );

  currentMarkdownFileIds.forEach((fileId) => {
    if (!originalMarkdownFileIds.has(fileId)) {
      fileMarkdownQueries.push({
        sql: `INSERT INTO file_markdown (id, file_id, markdown_id) VALUES (?, ?, ?)`,
        args: [ulid(), fileId, (currentPane.markdown as MarkdownDatum).id ?? ulid()],
      });
    }
  });

  originalMarkdownFileIds.forEach((fileId) => {
    if (!currentMarkdownFileIds.has(fileId)) {
      fileMarkdownQueries.push({
        sql: `DELETE FROM file_markdown WHERE file_id = ? AND markdown_id = ?`,
        args: [fileId, (currentPane.markdown as MarkdownDatum).id ?? ulid()],
      });
    }
  });
}
}

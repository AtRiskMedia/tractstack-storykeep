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
  PaneDatum,
  TursoQuery,
  ImpressionDatum,
  ReconciledData,
  StoryFragmentQueries,
  ContextPaneQueries,
  MarkdownDatum,
  BgColourDatum,
  BgPaneDatum,
  MarkdownPaneDatum,
} from "../../types";

const isImageDataUrl = (str: string) =>
  /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(str);

function formatDateForUrl(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

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
  originalData: StoryFragmentDatum | null
): ReconciledData {
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
    created: originalData!.created!,
    changed: new Date(),
    panesPayload: reconcilePanes(
      storyFragmentPaneIds.get()[id].current,
      originalData?.panesPayload
    ),
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
    storyfragment: { sql: "", args: [] },
    panes: [],
    markdowns: [],
    storyfragment_pane: [],
    file_pane: [],
    file_markdown: [],
    files: [],
  };

  if (originalData) {
    const changedFields = compareStoryFragmentFields(currentData, originalData);
    if (Object.keys(changedFields).length > 0) {
      queries.storyfragment = createStoryFragmentUpdateQuery(
        id,
        changedFields as Partial<StoryFragmentDatum>
      );
    }
  } else {
    queries.storyfragment = createStoryFragmentInsertQuery(currentData);
  }
  // Reconcile panes
  currentData.panesPayload.forEach((pane, index) => {
    const originalPane = originalData?.panesPayload.find(p => p.id === pane.id);
    const paneQueries = reconcilePaneData(pane, originalPane);
    queries.panes.push(...paneQueries.pane);
    queries.markdowns.push(...paneQueries.markdown);
    queries.file_pane.push(...paneQueries.file_pane);
    queries.file_markdown.push(...paneQueries.file_markdown);
    queries.files.push(...paneQueries.files);

    if (!originalPane) {
      queries.storyfragment_pane.push(
        createStoryFragmentPaneQuery(id, pane.id, index)
      );
    }
  });

  return { storyFragment: { data: currentData, queries } };
}

function reconcileContextPane(
  id: string,
  originalData: ContextPaneDatum | null
): ReconciledData {
  const currentData: ContextPaneDatum = {
    id,
    title: paneTitle.get()[id].current,
    slug: paneSlug.get()[id].current,
    created: originalData!.created!,
    changed: new Date(),
    panePayload: reconcilePanePayload(id, true, originalData?.panePayload),
    impressions: [],
    resourcesPayload: [],
    codeHookOptions: {},
  };
  const queries: ContextPaneQueries = {
    pane: createPaneQuery(currentData.panePayload!, originalData?.panePayload),
    file_pane: [],
    file_markdown: [],
    files: [],
  };

  if (currentData?.panePayload?.markdown) {
    queries.markdown = createMarkdownQuery(
      currentData.panePayload.markdown,
      originalData?.panePayload?.markdown
    );
  }

  reconcileFiles(currentData.panePayload!, originalData?.panePayload ?? null, {
    files: queries.files,
    file_pane: queries.file_pane,
    file_markdown: queries.file_markdown,
  });

  return { contextPane: { data: currentData, queries } };
}

function compareStoryFragmentFields(
  current: StoryFragmentDatum,
  original: StoryFragmentDatum
): Partial<StoryFragmentDatum> {
  const changedFields: Partial<StoryFragmentDatum> = {};
  const validFields: Array<keyof StoryFragmentDatum> = [
    "id",
    "title",
    "slug",
    "tractStackId",
    "menuId",
    "socialImagePath",
    "tailwindBgColour",
    "created",
    "changed",
  ];

  function setChangedField<K extends keyof StoryFragmentDatum>(
    key: K,
    value: StoryFragmentDatum[K]
  ) {
    changedFields[key] = value;
  }

  validFields.forEach(key => {
    if (current[key] !== original[key] && current[key] != null) {
      setChangedField(
        key,
        current[key] as NonNullable<StoryFragmentDatum[typeof key]>
      );
    }
  });

  return changedFields;
}

function createStoryFragmentUpdateQuery(
  id: string,
  changedFields: Partial<StoryFragmentDatum>
): TursoQuery {
  const fields = Object.keys(changedFields);
  const values = Object.values(changedFields);

  return {
    sql: `UPDATE storyfragment SET ${fields
      .map(f => {
        // Map the fields to their correct database column names
        switch (f) {
          case "tractStackId":
            return "tractstack_id";
          case "menuId":
            return "menu_id";
          case "socialImagePath":
            return "social_image_path";
          case "tailwindBgColour":
            return "tailwind_background_colour";
          default:
            return f;
        }
      })
      .join(" = ?, ")} = ? WHERE id = ?`,
    args: [
      ...values.map(v =>
        v instanceof Date
          ? v.toISOString()
          : typeof v === "object"
            ? JSON.stringify(v)
            : v
      ),
      id,
    ],
  };
}

function createStoryFragmentInsertQuery(data: StoryFragmentDatum): TursoQuery {
  const fields = [
    "id",
    "title",
    "slug",
    "tractstack_id",
    "menu_id",
    "social_image_path",
    "tailwind_background_colour",
    "created",
    "changed",
  ];
  const placeholders = fields.map(() => "?").join(", ");

  return {
    sql: `INSERT INTO storyfragment (${fields.join(", ")}) VALUES (${placeholders})`,
    args: [
      data.id,
      data.title,
      data.slug,
      data.tractStackId,
      data.menuId,
      data.socialImagePath,
      data.tailwindBgColour,
      data.created.toISOString(),
      data.changed?.toISOString() ?? null,
    ],
  };
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

function reconcilePanes(
  currentPaneIds: string[],
  originalPanes: PaneDatum[] | undefined
): PaneDatum[] {
  return currentPaneIds.map(id => {
    const originalPane = originalPanes?.find(p => p.id === id);
    return reconcilePanePayload(id, false, originalPane);
  });
}

function reconcilePanePayload(
  id: string,
  isContext: boolean,
  originalPayload?: PaneDatum | null
): PaneDatum {
  const fragmentIds = paneFragmentIds.get()[id].current;
  const markdownFragment = fragmentIds.find(
    fragId => paneFragmentMarkdown.get()[fragId]
  );
  const markdownId = markdownFragment
    ? paneFragmentMarkdown.get()[markdownFragment]?.current.markdown.id
    : null;

  return {
    id,
    title: paneTitle.get()[id].current,
    slug: paneSlug.get()[id].current,
    isContextPane: isContext,
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
      paneFragmentsPayload: reconcilePaneFragments(fragmentIds),
      codeHook: paneCodeHook.get()[id].current || undefined,
      impressions: paneImpression.get()[id].current
        ? [paneImpression.get()[id].current].filter(
            (i): i is ImpressionDatum => i !== null
          )
        : [],
      heldBeliefs: paneHeldBeliefs.get()[id].current,
      withheldBeliefs: paneWithheldBeliefs.get()[id].current,
    },
    markdown:
      markdownId && markdownFragment
        ? {
            id: markdownId,
            body:
              paneFragmentMarkdown.get()[markdownFragment]?.current.markdown
                .body ?? "",
            slug: `${paneSlug.get()[id].current}-markdown`,
            title: `Copy for ${paneTitle.get()[id].current}`,
            htmlAst:
              paneFragmentMarkdown.get()[markdownFragment]?.current.markdown
                .htmlAst ?? {},
          }
        : null,
  };
}

function reconcilePaneFragments(
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

function reconcilePaneData(
  currentPane: PaneDatum,
  originalPane: PaneDatum | null | undefined
) {
  const queries = {
    pane: [] as TursoQuery[],
    markdown: [] as TursoQuery[],
    file_pane: [] as TursoQuery[],
    file_markdown: [] as TursoQuery[],
    files: [] as TursoQuery[],
  };

  // Pane handling
  if (originalPane) {
    const changedFields = comparePaneFields(currentPane, originalPane);
    if (Object.keys(changedFields).length > 0) {
      queries.pane.push(createPaneUpdateQuery(currentPane.id, changedFields));
    }
  } else {
    queries.pane.push(createPaneInsertQuery(currentPane));
  }

  // Markdown handling
  if (currentPane.markdown) {
    if (originalPane?.markdown) {
      if (currentPane.markdown.body !== originalPane.markdown.body) {
        queries.markdown.push(createMarkdownUpdateQuery(currentPane.markdown));
      }
    } else {
      queries.markdown.push(createMarkdownInsertQuery(currentPane.markdown));
    }
  } else if (originalPane?.markdown) {
    queries.markdown.push({
      sql: `DELETE FROM markdown WHERE id = ?`,
      args: [originalPane.markdown.id],
    });
  }

  // Reconcile files
  reconcileFiles(currentPane, originalPane ?? null, {
    files: queries.files,
    file_pane: queries.file_pane,
    file_markdown: queries.file_markdown,
  });

  return queries;
}

function comparePaneFields(
  current: PaneDatum,
  original: PaneDatum
): Partial<PaneDatum> {
  const changedFields: Partial<PaneDatum> = {};
  const validFields: Array<keyof PaneDatum> = [
    "id",
    "title",
    "slug",
    "isContextPane",
    "created",
    "changed",
    "heightOffsetDesktop",
    "heightOffsetMobile",
    "heightOffsetTablet",
    "heightRatioDesktop",
    "heightRatioMobile",
    "heightRatioTablet",
    "optionsPayload",
    "markdown",
  ];

  validFields.forEach(key => {
    if (key === "optionsPayload") {
      if (JSON.stringify(current[key]) !== JSON.stringify(original[key])) {
        if (current[key]?.paneFragmentsPayload) {
          current[key].paneFragmentsPayload.forEach(p => {
            if ("optionsPayload" in p) {
              if (p.optionsPayload.classNames?.desktop) {
                delete p.optionsPayload.classNames.desktop;
              }
              if (p.optionsPayload.classNames?.tablet) {
                delete p.optionsPayload.classNames.tablet;
              }
              if (p.optionsPayload.classNames?.mobile) {
                delete p.optionsPayload.classNames.mobile;
              }
            }
          });
        }
        changedFields[key] = current[key];
      }
    } else if (key === "markdown") {
      if (current[key] && original[key]) {
        if (current[key]!.body !== original[key]!.body) {
          changedFields[key] = current[key];
        }
      } else if (current[key] !== original[key]) {
        changedFields[key] = current[key];
      }
    } else if (current[key] !== original[key]) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      changedFields[key] = current[key] as any;
    }
  });

  return changedFields;
}

function createPaneUpdateQuery(
  id: string,
  changedFields: Partial<PaneDatum>
): TursoQuery {
  const fields = Object.keys(changedFields);
  const values = Object.values(changedFields).map(value =>
    typeof value === "object" ? JSON.stringify(value) : value
  );

  return {
    sql: `UPDATE pane SET ${fields
      .map(f => {
        // Map the fields to their correct database column names
        switch (f) {
          case "isContextPane":
            return "is_context_pane";
          case "heightOffsetDesktop":
            return "height_offset_desktop";
          case "heightOffsetMobile":
            return "height_offset_mobile";
          case "heightOffsetTablet":
            return "height_offset_tablet";
          case "heightRatioDesktop":
            return "height_ratio_desktop";
          case "heightRatioMobile":
            return "height_ratio_mobile";
          case "heightRatioTablet":
            return "height_ratio_tablet";
          case "optionsPayload":
            return "options_payload";
          default:
            return f;
        }
      })
      .join(" = ?, ")} = ? WHERE id = ?`,
    args: [...values, id],
  };
}

function createPaneInsertQuery(data: PaneDatum): TursoQuery {
  const fields = [
    "id",
    "title",
    "slug",
    "is_context_pane",
    "created",
    "changed",
    "height_offset_desktop",
    "height_offset_mobile",
    "height_offset_tablet",
    "height_ratio_desktop",
    "height_ratio_mobile",
    "height_ratio_tablet",
    "options_payload",
    "markdown_id",
  ];
  const placeholders = fields.map(() => "?").join(", ");

  return {
    sql: `INSERT INTO pane (${fields.join(", ")}) VALUES (${placeholders})`,
    args: [
      data.id,
      data.title,
      data.slug,
      data.isContextPane,
      data.created.toISOString(),
      data.changed ? data.changed.toISOString() : null,
      data.heightOffsetDesktop,
      data.heightOffsetMobile,
      data.heightOffsetTablet,
      data.heightRatioDesktop,
      data.heightRatioMobile,
      data.heightRatioTablet,
      JSON.stringify(data.optionsPayload),
      data.markdown && typeof data.markdown === "object"
        ? data.markdown.id
        : null,
    ],
  };
}

function createMarkdownUpdateQuery(markdown: MarkdownDatum): TursoQuery {
  return {
    sql: `UPDATE markdown SET body = ? WHERE id = ?`,
    args: [markdown.body, markdown.id],
  };
}

function createMarkdownInsertQuery(markdown: MarkdownDatum): TursoQuery {
  return {
    sql: `INSERT INTO markdown (id, body) VALUES (?, ?)`,
    args: [markdown.id, markdown.body],
  };
}

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

function reconcileFiles(
  currentPane: PaneDatum,
  originalPane: PaneDatum | null,
  queries: {
    files: TursoQuery[];
    file_pane: TursoQuery[];
    file_markdown: TursoQuery[];
  }
) {
  const currentFiles = currentPane.files || [];
  const originalFiles = originalPane?.files || [];

  const currentFileIds = new Set(currentFiles.map(f => f.id));
  const originalFileIds = new Set(originalFiles.map(f => f.id));

  // Handle markdown files
  if (
    currentPane.markdown &&
    typeof currentPane.markdown === "object" &&
    "body" in currentPane.markdown
  ) {
    const markdownBody = currentPane.markdown.body;
    const fileRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    const foundFileIds = new Set<string>();

    while ((match = fileRegex.exec(markdownBody)) !== null) {
      const [, altText, filename] = match;
      const file = currentFiles.find(f => f.filename === filename);

      if (file) {
        foundFileIds.add(file.id);
        if (!originalFileIds.has(file.id) || isImageDataUrl(file.src)) {
          const currentDate = new Date();
          const url = `/custom/images/${formatDateForUrl(currentDate)}/${file.filename}`;

          queries.files.push({
            sql: `INSERT INTO file (id, filename, url, alt_description) 
                  VALUES (?, ?, ?, ?)
                  ON CONFLICT (id) DO UPDATE SET 
                  filename = excluded.filename, 
                  url = excluded.url, 
                  alt_description = excluded.alt_description`,
            args: [
              file.id,
              file.filename,
              url,
              altText || file.altDescription || null,
            ],
          });

          queries.file_markdown.push({
            sql: `INSERT INTO file_markdown (id, file_id, markdown_id) VALUES (?, ?, ?)
                  ON CONFLICT (file_id, markdown_id) DO NOTHING`,
            args: [
              ulid(),
              file.id,
              currentPane.markdown && typeof currentPane.markdown === "object"
                ? currentPane.markdown.id
                : null,
            ],
          });
        }
      }
    }

    // Remove file_markdown entries for files that are no longer referenced in the markdown body
    currentFileIds.forEach(fileId => {
      if (
        !foundFileIds.has(fileId) &&
        typeof currentPane?.markdown === "object"
      ) {
        queries.file_markdown.push({
          sql: `DELETE FROM file_markdown WHERE file_id = ? AND markdown_id = ?`,
          args: [fileId, currentPane.markdown!.id],
        });
      }
    });
  }

  // Remove file_pane entries for files that no longer exist
  originalFileIds.forEach(fileId => {
    if (!currentFileIds.has(fileId)) {
      queries.file_pane.push({
        sql: `DELETE FROM file_pane WHERE file_id = ? AND pane_id = ?`,
        args: [fileId, currentPane.id],
      });
    }
  });

  // Remove files that are no longer associated with either pane or markdown
  originalFileIds.forEach(fileId => {
    if (!currentFileIds.has(fileId)) {
      queries.files.push({
        sql: `DELETE FROM file WHERE id = ? AND NOT EXISTS (
                SELECT 1 FROM file_pane WHERE file_id = ?
              ) AND NOT EXISTS (
                SELECT 1 FROM file_markdown WHERE file_id = ?
              )`,
        args: [fileId, fileId, fileId],
      });
    }
  });
}

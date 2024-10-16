import { cleanTursoPane } from "../../utils/compositor/tursoPane";
import { getResourcesByCategorySlug } from "../../api/turso";
import {getOptimizedImage} from "../../utils/helpers"
import type { Row } from "@libsql/client";
import type {
  ContextPaneDatum,
  TursoFileNode,
  ResourceDatum,
  ImpressionDatum,
  PaneFileNode,
  FileNode,
} from "../../types";

export async function cleanTursoContextPane(rows: Row[]) {
  if (!rows.length) return null;

  const contextPane: Promise<ContextPaneDatum | null> = (async () => {
    const payload = await Promise.all(
      rows?.map(async (r: Row) => {
        if (
          typeof r?.id === `string` &&
          typeof r?.title === `string` &&
          typeof r?.slug === `string` &&
          typeof r?.created === `string`
        ) {
          const files = typeof r?.files === `string` && JSON.parse(r.files);

          // optimize images
          const optimizedImagesPre: TursoFileNode[] = [];
          files?.forEach((f: TursoFileNode) => {
            if (
              !optimizedImagesPre.filter(
                (i: TursoFileNode) => i.filename === f.filename
              ).length
            )
              optimizedImagesPre.push({
                id: f.id,
                filename: f.filename,
                alt_description: f.alt_description,
                url: f.url,
                src_set: f.src_set,
                paneId: f.paneId,
                markdown: f.markdown,
              });
          });
          const optimizedImages: FileNode[] = await Promise.all(
            optimizedImagesPre.map(async (i: TursoFileNode) => {
              const src = `${import.meta.env.PUBLIC_IMAGE_URL}${i.url}`;
              const _optimizedSrc = await getOptimizedImage(src);
              const optimizedSrc =
                (typeof _optimizedSrc === `string` && _optimizedSrc) ||
                undefined;
              return {
                id: i.id,
                filename: i.filename,
                altDescription: i.alt_description,
                optimizedSrc,
                src,
                srcSet: i.src_set,
                paneId: i.paneId,
                markdown: i.markdown,
              };
            })
          );
          const paneFileNodes: PaneFileNode[] = [];
          const thisFilesPayload: FileNode[] = [];
          files?.forEach((f: FileNode) => {
            const optimizedSrc = optimizedImages.find(
              (o: FileNode) => o.filename === f.filename
            );
            if (optimizedSrc) thisFilesPayload.push(optimizedSrc);
          });
          if (thisFilesPayload.length)
            paneFileNodes.push({
              id: r.id,
              files: thisFilesPayload,
            });

          // now prepare panes payload
          const paneOptionsPayload =
            typeof r?.options_payload === `string` &&
            JSON.parse(r.options_payload);

          const thisFilesArray = paneFileNodes
            .filter((f: PaneFileNode) => f.id === r.id)
            .at(0);
          const panePayload = cleanTursoPane(r, thisFilesArray?.files || []);

          // impressions
          const impressions =
            (paneOptionsPayload?.impressions &&
              (paneOptionsPayload.impressions as ImpressionDatum[])) ||
            [];
          // check if resources are referenced
          const isCodeHook = !!paneOptionsPayload?.codeHook;
          const codeHookOptions =
            isCodeHook &&
            paneOptionsPayload?.codeHook?.options &&
            JSON.parse(paneOptionsPayload?.codeHook?.options);
          const resourceCategory =
            codeHookOptions?.category && codeHookOptions.category.split(`|`);

          // if resources are referenced, load and pass
          let resourcesPayload: ResourceDatum[] = [];
          if (resourceCategory?.length) {
            const result = await getResourcesByCategorySlug(resourceCategory);
            if (result.length) resourcesPayload = result;
          }

          return {
            id: r.id,
            title: r.title,
            slug: r.slug,
            created: new Date(r.created),
            changed:
              (typeof r?.changed === `string` && new Date(r.changed)) || null,
            panePayload,
            impressions,
            resourcesPayload,
            codeHookOptions,
          };
        }
        return null;
        //});
      }) ?? []
    );
    const row = payload?.at(0);
    return row || null;
  })();
  return await contextPane;
}

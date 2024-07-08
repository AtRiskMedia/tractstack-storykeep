import { createClient } from "@libsql/client/web";
import { cleanTursoResource } from "../utils/compositor/tursoResource";
import { cleanTursoContentMap } from "../utils/compositor/tursoContentMap";
import { cleanTursoStoryFragment } from "../utils/compositor/tursoStoryFragment";
import { cleanTursoContextPane } from "../utils/compositor/tursoContextPane";
import type {
  ResourceDatum,
  StoryFragmentDatum,
  ContextPaneDatum,
  ContentMap,
} from "../types.ts";

export const turso = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export async function getResourcesBySlug(
  slugs: string[]
): Promise<ResourceDatum[]> {
  const placeholders = slugs.map(() => "?").join(",");
  try {
    const { rows } = await turso.execute({
      sql: `SELECT * FROM resource WHERE slug IN (${placeholders})`,
      args: slugs,
    });
    const resources = cleanTursoResource(rows) || [];
    return resources;
  } catch (error) {
    console.error("Error fetching ResourceBySlug:", error);
    throw error;
  }
}

export async function getResourcesByCategorySlug(
  slugs: string[]
): Promise<ResourceDatum[]> {
  const placeholders = slugs.map(() => "?").join(",");
  try {
    const { rows } = await turso.execute({
      sql: `SELECT * FROM resource WHERE category_slug IN (${placeholders})`,
      args: slugs,
    });
    const resources = cleanTursoResource(rows) || [];
    return resources;
  } catch (error) {
    console.error("Error fetching ResourceByCategorySlug:", error);
    throw error;
  }
}

export async function getStoryFragmentBySlug(
  slug: string
): Promise<StoryFragmentDatum | null> {
  try {
    const { rows } = await turso.execute({
      sql: `SELECT 
                     sf.id AS id,
                     sf.title AS title,
                     sf.slug AS slug,
                     sf.created AS created,
                     sf.changed AS changed,
                     sf.social_image_path,
                     sf.tailwind_background_colour,
                     m.title AS menu_title,
                     m.options_payload AS menu_options_payload,
                     m.theme AS menu_theme,
                     ts.id AS tractstack_id,
                     ts.title AS tractstack_title,
                     ts.slug AS tractstack_slug,
                     (
                         SELECT json_group_array(json_object(
                             'id', p.id,
                             'title', p.title,
                             'slug', p.slug,
                             'created', p.created,
                             'changed', p.changed,
                             'height_offset_desktop', p.height_offset_desktop,
                             'height_offset_mobile', p.height_offset_mobile,
                             'height_offset_tablet', p.height_offset_tablet,
                             'height_ratio_desktop', p.height_ratio_desktop,
                             'height_ratio_mobile', p.height_ratio_mobile,
                             'height_ratio_tablet', p.height_ratio_tablet,
                             'options_payload', p.options_payload,
                             'markdown_body', md.body,
                             'files', (
                                 SELECT json_group_array(json_object(
                                     'filename', f.filename,
                                     'url', f.url
                                 ))
                                 FROM (
                                     SELECT fp.file_id
                                     FROM file_pane fp
                                     WHERE fp.pane_id = p.id
                                     UNION
                                     SELECT fm.file_id
                                     FROM file_markdown fm
                                     WHERE fm.markdown_id = p.markdown_id
                                 ) AS combined_files
                                 JOIN file f ON combined_files.file_id = f.id
                             )
                         ))
                         FROM storyfragment_pane sp
                         JOIN pane p ON sp.pane_id = p.id
                         LEFT JOIN markdown md ON p.markdown_id = md.id
                         WHERE sp.storyfragment_id = sf.id
                     ) AS panes
                 FROM storyfragment sf
                 LEFT JOIN menu m ON sf.menu_id = m.id
                 JOIN tractstack ts ON sf.tractstack_id = ts.id
                 WHERE sf.slug = ?`,
      args: [slug],
    });
    const storyfragments = await cleanTursoStoryFragment(rows);
    const storyfragment = storyfragments?.at(0);
    if (storyfragment) return storyfragment;
    return null;
  } catch (error) {
    console.error("Error fetching StoryFragmentBySlug:", error);
    throw error;
  }
}

export async function getContextPaneBySlug(
  slug: string
): Promise<ContextPaneDatum | null> {
  try {
    const { rows } = await turso.execute({
      sql: `SELECT 
                   p.id, 
                   p.title, 
                   p.is_context_pane, 
                   p.slug, 
                   p.created, 
                   p.changed, 
                   p.height_offset_desktop, 
                   p.height_offset_mobile, 
                   p.height_offset_tablet, 
                   p.height_ratio_desktop, 
                   p.height_ratio_mobile, 
                   p.height_ratio_tablet,
                   p.options_payload, 
                   m.body AS markdown_body,
                   (
                       SELECT json_group_array(
                           json_object(
                               'filename', f.filename,
                               'url', f.url
                           )
                       )
                       FROM (
                           SELECT fp.file_id
                           FROM file_pane fp
                           WHERE fp.pane_id = p.id
                           UNION
                           SELECT fm.file_id
                           FROM file_markdown fm
                           WHERE fm.markdown_id = p.markdown_id
                       ) AS combined_files
                       JOIN file f ON combined_files.file_id = f.id
                   ) AS files
               FROM pane p
               LEFT JOIN markdown m ON p.markdown_id = m.id
               WHERE p.slug = ? AND p.is_context_pane = 1`,
      args: [slug],
    });

    const contextPane = await cleanTursoContextPane(rows);
    if (contextPane) return contextPane;
    return null;
  } catch (error) {
    console.error("Error fetching ContextPaneBySlug:", error);
    throw error;
  }
}

export async function getContentMap(): Promise<ContentMap[]> {
  try {
    const { rows: storyfragments } = await turso.execute(
      `SELECT 
              sf.id AS id,
              sf.title AS title,
              sf.slug AS slug,
              sf.created AS created,
              sf.changed AS changed,
              ts.id AS tractstack_id,
              ts.title AS tractstack_title,
              ts.slug AS tractstack_slug,
              GROUP_CONCAT(sp.pane_id) AS pane_ids
              FROM 
                  storyfragment sf
              JOIN 
                  tractstack ts ON sf.tractstack_id = ts.id
              LEFT JOIN 
                  storyfragment_pane sp ON sf.id = sp.storyfragment_id
              GROUP BY 
                  sf.id, sf.title, sf.slug, ts.id, ts.title, ts.slug`
    );
    const { rows: panes } = await turso.execute(
      `SELECT id, slug, title, is_context_pane, changed, created FROM pane`
    );
    return cleanTursoContentMap(storyfragments, panes);
  } catch (error) {
    console.error("Error fetching ContentMap:", error);
    throw error;
  }
}

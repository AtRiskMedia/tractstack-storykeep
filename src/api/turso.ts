import { createClient } from "@libsql/client/web";
import { cleanTursoResource } from "../utils/compositor/tursoResource";
import { cleanTursoPayload } from "../utils/compositor/tursoPayload";
import { cleanTursoContentMap } from "../utils/compositor/tursoContentMap";
import { cleanTursoStoryFragment } from "../utils/compositor/tursoStoryFragment";
import { cleanTursoContextPane } from "../utils/compositor/tursoContextPane";
import { cleanTursoFile } from "../utils/compositor/tursoFile";
import { cleanPaneDesigns } from "../utils/compositor/paneDesigns";
import type {
  ResourceDatum,
  StoryFragmentDatum,
  ContextPaneDatum,
  ContentMap,
  DatumPayload,
  PaneDesign,
  TursoFileNode,
} from "../types.ts";

export const turso = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export async function getDatumPayload(): Promise<DatumPayload> {
  try {
    const { rows } = await turso.execute(
      `WITH dummy AS (SELECT 1),
resource_data AS (
  SELECT json_group_array(json_object(
    'id', id,
    'title', title,
    'slug', slug,
    'category_slug', category_slug,
    'oneliner', oneliner,
    'options_payload', options_payload,
    'action_lisp', action_lisp
  )) AS resources
  FROM resource
),
file_data AS (
  SELECT json_group_array(json_object(
    'id', id,
    'filename', filename,
    'url', url
  )) AS files
  FROM file
),
tractstack_data AS (
  SELECT json_group_array(json_object(
    'id', id,
    'title', title,
    'slug', slug,
    'social_image_path', social_image_path
  )) AS tractstack
  FROM tractstack
),
menu_data AS (
  SELECT json_group_array(json_object(
    'id', id,
    'title', title,
    'theme', theme,
    'options_payload', options_payload
  )) AS menus
  FROM menu
)
SELECT
  json_object(
    'resources', COALESCE(resource_data.resources, '[]'),
    'files', COALESCE(file_data.files, '[]'),
    'tractstack', COALESCE(tractstack_data.tractstack, '[]'),
    'menus', COALESCE(menu_data.menus, '[]')
  ) AS result
FROM
  dummy
  LEFT JOIN resource_data ON 1=1
  LEFT JOIN file_data ON 1=1
  LEFT JOIN tractstack_data ON 1=1
  LEFT JOIN menu_data ON 1=1
LIMIT 1;`
    );
    const rawPayload = rows?.at(0)?.result;
    const payload =
      typeof rawPayload === `string` && rawPayload && JSON.parse(rawPayload);
    return cleanTursoPayload(
      payload || {
        files: [],
        menus: [],
        tractstack: [],
        resources: [],
      }
    );
  } catch (error) {
    console.error("Error fetching ResourceBySlug:", error);
    throw error;
  }
}

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
                     COALESCE(sf.social_image_path, ts.social_image_path) AS social_image_path,
                     sf.tailwind_background_colour,
                     m.id as menu_id,
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
                             'markdown_id', md.id,
                             'files', (
                                 SELECT json_group_array(json_object(
                                     'id', f.id,
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
                         ORDER BY sp.weight ASC
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

export async function getPaneDesigns(): Promise<PaneDesign[]> {
  try {
    const { rows } = await turso.execute(`
      WITH file_data AS (
        SELECT pane_id, json_group_array(json_object(
          'id', f.id,
          'filename', f.filename,
          'url', f.url
        )) AS files
        FROM (
          SELECT fp.pane_id, fp.file_id
          FROM file_pane fp
          UNION
          SELECT p.id as pane_id, fm.file_id
          FROM pane p
          JOIN file_markdown fm ON p.markdown_id = fm.markdown_id
        ) AS combined_files
        JOIN file f ON combined_files.file_id = f.id
        GROUP BY pane_id
      )
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.created,
        p.changed,
        p.markdown_id,
        p.options_payload,
        p.is_context_pane,
        p.height_offset_desktop,
        p.height_offset_tablet,
        p.height_offset_mobile,
        p.height_ratio_desktop,
        p.height_ratio_tablet,
        p.height_ratio_mobile,
        m.body AS markdown_body,
        COALESCE(fd.files, '[]') AS files
      FROM pane p
      LEFT JOIN markdown m ON p.markdown_id = m.id
      LEFT JOIN file_data fd ON p.id = fd.pane_id
      ORDER BY p.created DESC
    `);
    return cleanPaneDesigns(rows);
  } catch (error) {
    console.error("Error fetching pane designs:", error);
    throw error;
  }
}

export async function getAllFileDatum(): Promise<TursoFileNode[]> {
  try {
    const { rows } = await turso.execute(`
      SELECT id, filename, url
      FROM file
    `);

    return cleanTursoFile(rows);
  } catch (error) {
    console.error("Error fetching all file data:", error);
    throw error;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@libsql/client/web";
import { cleanTursoResource } from "../utils/compositor/tursoResource";
import { cleanTursoPayload } from "../utils/compositor/tursoPayload";
import { cleanTursoContentMap } from "../utils/compositor/tursoContentMap";
import { cleanTursoStoryFragment } from "../utils/compositor/tursoStoryFragment";
import { cleanTursoContextPane } from "../utils/compositor/tursoContextPane";
import { cleanTursoFile } from "../utils/compositor/tursoFile";
import { cleanTursoMenu } from "../utils/compositor/tursoMenu";
import { cleanTursoTractStack } from "../utils/compositor/tursoTractStack";
import { cleanPaneDesigns } from "../utils/compositor/paneDesigns";
import { getTailwindWhitelist } from "../utils/compositor/tursoTailwindWhitelist";
import type {
  ResourceDatum,
  TractStackDatum,
  StoryFragmentDatum,
  ContextPaneDatum,
  ContentMap,
  DatumPayload,
  PaneDesign,
  TursoFileNode,
  FullContentMap,
  MenuDatum,
  FileDatum,
  TursoQuery,
} from "../types.ts";

let tursoClient: ReturnType<typeof createClient> | null = null;

function getTursoClient() {
  if (
    !import.meta.env.TURSO_DATABASE_URL?.trim() ||
    !import.meta.env.TURSO_AUTH_TOKEN?.trim()
  ) {
    throw new Error("Turso credentials not configured");
  }
  try {
    new URL(import.meta.env.TURSO_DATABASE_URL);
  } catch (e) {
    throw new Error("Invalid Turso database URL format");
  }
  if (!tursoClient) {
    tursoClient = createClient({
      url: import.meta.env.TURSO_DATABASE_URL,
      authToken: import.meta.env.TURSO_AUTH_TOKEN,
    });
  }
  return tursoClient;
}

export async function getUniqueTailwindClasses(id: string) {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute({
      sql: `SELECT id, options_payload FROM pane WHERE id != ?`,
      args: [id],
    });
    return getTailwindWhitelist(rows);
  } catch (error) {
    console.error("Error fetching pane payloads:", error);
    throw error;
  }
}

export async function getAllResources(): Promise<ResourceDatum[]> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute(`
      SELECT * FROM resource
      ORDER BY title ASC
    `);
    return cleanTursoResource(rows);
  } catch (error) {
    console.error("Error fetching all resources:", error);
    throw error;
  }
}

export async function getAllMenus(): Promise<MenuDatum[]> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute(`
      SELECT id, title, theme, options_payload
      FROM menu
      ORDER BY title
    `);
    return cleanTursoMenu(rows);
  } catch (error) {
    console.error("Error fetching all menus:", error);
    throw error;
  }
}

export async function getMenuById(id: string): Promise<MenuDatum | null> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute({
      sql: `SELECT id, title, theme, options_payload
            FROM menu
            WHERE id = ?`,
      args: [id],
    });
    const menus = cleanTursoMenu(rows);
    return menus[0] || null;
  } catch (error) {
    console.error("Error fetching menu by ID:", error);
    throw error;
  }
}

export async function getDatumPayload(): Promise<DatumPayload> {
  try {
    const turso = getTursoClient();
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
    'alt_description', alt_description,
    'url', url,
    'src_set', src_set
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
    const turso = getTursoClient();
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
    const turso = getTursoClient();
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

export async function getAllTractStack(): Promise<TractStackDatum[]> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute(`
SELECT id, title, slug, social_image_path FROM tractstack
    `);
    return cleanTursoTractStack(rows);
  } catch (error) {
    console.error("Error fetching all file data:", error);
    throw error;
  }
}

export async function getTractStackBySlug(
  slug: string
): Promise<TractStackDatum[] | null> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute({
      sql: `SELECT id, title, slug, social_image_path FROM tractstack WHERE slug = ?`,
      args: [slug],
    });
    return cleanTursoTractStack(rows);
  } catch (error) {
    console.error("Error fetching TractStackIdBySlug:", error);
    throw error;
  }
}

export async function getTractStackIdBySlug(
  slug: string
): Promise<string | null> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute({
      sql: `SELECT id FROM tractstack WHERE slug = ?`,
      args: [slug],
    });

    if (rows.length > 0 && rows[0].id) {
      return rows[0].id as string;
    }

    return null;
  } catch (error) {
    console.error("Error fetching TractStackIdBySlug:", error);
    throw error;
  }
}

export async function getStoryFragmentBySlug(
  slug: string
): Promise<StoryFragmentDatum | null> {
  try {
    const turso = getTursoClient();
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
                                SELECT json_group_array(
                                   json_object(
                                       'id', f.id,
                                       'filename', f.filename,
                                       'alt_description', f.alt_description,
                                       'url', f.url,
                                       'src_set', f.src_set,
                                       'paneId', p.id,
                                       'markdown', CASE 
                                           WHEN md.id IS NOT NULL THEN json('true')
                                           ELSE json('false')
                                       END
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
                               LEFT JOIN file_markdown fm ON fm.file_id = f.id AND fm.markdown_id = p.markdown_id 
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
    const turso = getTursoClient();
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
                   m.id AS markdown_id,
                   (
                       SELECT json_group_array(
                           json_object(
                               'id', f.id,
                               'filename', f.filename,
                               'alt_description', f.alt_description,
                               'url', f.url,
                               'src_set', f.src_set,
                               'paneId', p.id,
                               'markdown', CASE 
                                   WHEN m.id IS NOT NULL THEN json('true')
                                   ELSE json('false')
                               END
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
    const turso = getTursoClient();
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
    const turso = getTursoClient();
    const { rows } = await turso.execute(`
     WITH file_data AS (
       SELECT 
         combined_files.pane_id,
         json_group_array(
           json_object(
             'id', f.id,
             'filename', f.filename,
             'alt_description', f.alt_description,
             'url', f.url,
             'src_set', f.src_set,
             'paneId', combined_files.pane_id,
             'markdown', CASE 
               WHEN fm.file_id IS NOT NULL THEN json('true')
               ELSE json('false')
             END
           )
         ) AS files
       FROM (
         SELECT fp.pane_id, fp.file_id
         FROM file_pane fp
         UNION
         SELECT p.id as pane_id, fm.file_id
         FROM pane p
         JOIN file_markdown fm ON p.markdown_id = fm.markdown_id
       ) AS combined_files
       JOIN file f ON combined_files.file_id = f.id
       LEFT JOIN file_markdown fm ON fm.file_id = f.id AND fm.markdown_id = (
         SELECT markdown_id FROM pane WHERE id = combined_files.pane_id
       )
       GROUP BY combined_files.pane_id
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

export async function getFileById(id: string): Promise<FileDatum | null> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute({
      sql: `SELECT id, filename, alt_description, url, src_set
            FROM file
            WHERE id = ?`,
      args: [id],
    });
    const files = cleanTursoFile(rows);
    if (files.length > 0) {
      const file = files[0];
      if (file.src_set)
        return {
          id: file.id,
          filename: file.filename,
          altDescription: file.alt_description,
          paneId: file.paneId,
          markdown: file.markdown,
          src: `${import.meta.env.PUBLIC_IMAGE_URL}${file.url}`.replace(
            /(\.[^.]+)$/,
            "_1920px$1"
          ),
          srcSet: false,
        };
      return {
        id: file.id,
        filename: file.filename,
        altDescription: file.alt_description,
        paneId: file.paneId,
        markdown: file.markdown,
        src: `${import.meta.env.PUBLIC_IMAGE_URL}${file.url}`,
        srcSet: false,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching file by ID:", error);
    throw error;
  }
}

export async function getAllFileDatum(): Promise<TursoFileNode[]> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute(`
      SELECT id, filename, alt_description, url, src_set
      FROM file
    `);
    return cleanTursoFile(rows);
  } catch (error) {
    console.error("Error fetching all file data:", error);
    throw error;
  }
}

export async function getFullContentMap(): Promise<FullContentMap[]> {
  try {
    const turso = getTursoClient();
    const { rows } = await turso.execute(`
      SELECT id, id as slug, title, 'Menu' as type
      FROM menu
      UNION ALL
      SELECT id, slug, title, 'Pane' as type
      FROM pane
      UNION ALL
      SELECT id, slug, title, 'Resource' as type
      FROM resource
      UNION ALL
      SELECT id, slug, title, 'StoryFragment' as type
      FROM storyfragment
      UNION ALL
      SELECT id, slug, title, 'TractStack' as type
      FROM tractstack
      ORDER BY title
    `);

    return rows.map(row => {
      const base = {
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
      };

      switch (row.type) {
        case "Menu":
          return {
            ...base,
            type: "Menu",
            theme: row.theme as string,
          };
        case "Resource":
          return {
            ...base,
            type: "Resource",
            categorySlug: row.category_slug as string | null,
          };
        case "Pane":
          return {
            ...base,
            type: "Pane",
            isContext: Boolean(row.is_context_pane),
          };
        case "StoryFragment":
          return {
            ...base,
            type: "StoryFragment",
          };
        case "TractStack":
          return {
            ...base,
            type: "TractStack",
          };
        default:
          throw new Error(`Unknown type: ${row.type}`);
      }
    });
  } catch (error) {
    console.error("Error fetching full content map:", error);
    throw error;
  }
}

export async function executeQueries(
  queries: TursoQuery[]
): Promise<{ success: boolean; results: any[] }> {
  const results = [];

  for (const query of queries) {
    try {
      const turso = getTursoClient();
      //console.log(query);
      const result = await turso.execute(query);
      results.push(result);
    } catch (error) {
      console.error("Error executing query:", query, error);
      throw error;
    }
  }

  return { success: true, results };
}

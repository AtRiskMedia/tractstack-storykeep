import type { TursoFileNode, FileDatum } from "../../types";

export function cleanTursoFileDatum(rows: TursoFileNode[]): FileDatum[] {
  if (!rows.length) return [];

  const payload: (FileDatum | null)[] = rows?.map((r: TursoFileNode) => {
    if (
      typeof r?.id === `string` &&
      typeof r?.filename === `string` &&
      typeof r?.alt_description === `string` &&
      typeof r?.url === `string` &&
      typeof r?.src_set === `boolean` &&
      typeof r?.src_set === `boolean` &&
      typeof r?.paneId === `string` &&
      typeof r?.markdown === `boolean`
    )
      return {
        id: r.id,
        filename: r.filename,
        altDescription: r.alt_description,
        url: r.url,
        src: `${import.meta.env.PUBLIC_IMAGE_URL}${r.url}`,
        srcSet: r.src_set,
        paneId: r.paneId,
        markdown: r.markdown,
      } as FileDatum;
    return null;
  });

  return payload.filter((n): n is FileDatum => n !== null);
}

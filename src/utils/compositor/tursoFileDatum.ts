import type { TursoFileNode, FileDatum } from "../../types";

export function cleanTursoFileDatum(rows: TursoFileNode[]): FileDatum[] {
  if (!rows.length) return [];

  const payload: (FileDatum | null)[] = rows?.map((r: TursoFileNode) => {
    if (
      typeof r?.id === `string` &&
      typeof r?.filename === `string` &&
      typeof r?.altDescription === `string` &&
      typeof r?.url === `string`
    )
      return {
        id: r.id,
        filename: r.filename,
        altDescription: r.altDescription,
        url: r.url,
        src: `${import.meta.env.PUBLIC_IMAGE_URL}${r.url}`,
      } as FileDatum;
    return null;
  });

  return payload.filter((n): n is FileDatum => n !== null);
}

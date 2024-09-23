import type { Row } from "@libsql/client";
import type {
  BgPaneDatum,
  BgColourDatum,
  MarkdownPaneDatum,
} from "../../types";

export function cleanOptionsPayload(rows: Row[]) {
  if (!rows.length) return [];

  let whitelistString = ``;
  rows.forEach((r: Row) => {
    if (typeof r?.id === `string` && typeof r?.options_payload === `string`) {
      const optionsPayload = JSON.parse(r.options_payload) || null;
      const paneFragmentsPayload = optionsPayload.paneFragmentsPayload;
      const markdown = paneFragmentsPayload
        ?.filter(
          (p: BgPaneDatum | BgColourDatum | MarkdownPaneDatum) =>
            p.type === `markdown`
        )
        ?.at(0);
      const payload = markdown && markdown.optionsPayload;
      if (payload) {
        const classNames = payload?.classNames;
        const classNamesModal = payload?.classNamesModal;
        const classNamesParent = payload?.classNamesParent;
        const classNamesButtons = payload?.buttons;
        if (classNamesButtons) {
          Object.keys(classNamesButtons).forEach((j: string) => {
            if (
              typeof classNamesButtons[j] === `object` &&
              typeof classNamesButtons[j].className === `string`
            )
              whitelistString = `${whitelistString} ${classNamesButtons[j].className}`;
          });
        }
        const all = [
          { ...classNames },
          { ...classNamesParent },
          { ...classNamesModal },
        ];
        /* eslint-disable @typescript-eslint/no-explicit-any */
        Object.keys(all).forEach((a: any) => {
          if (typeof all[a] !== `undefined`) {
            const payload = typeof all[a] === `object` ? all[a] : null;
            Object.keys(payload).forEach((v: string) => {
              const value = payload[v];
              if (typeof value === `string`)
                whitelistString = `${whitelistString} ${value}`;
              if (typeof value === `object`) {
                Object.keys(value).forEach((s: string) => {
                  if (typeof value[s] === `string`)
                    whitelistString = `${whitelistString} ${value[s]}`;
                  if (typeof value[s] === `object`) {
                    Object.keys(value[s]).forEach((t: string) => {
                      if (typeof value[s][t] === `string`)
                        whitelistString = `${whitelistString} ${value[s][t]}`;
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  });
  const whitelistArray = whitelistString.split(` `);
  const whitelistArrayUnique = whitelistArray
    .filter((item, index) => whitelistArray.indexOf(item) === index)
    .filter(e => e);
  return whitelistArrayUnique || [];
}

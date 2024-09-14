import { useMemo } from "react";

interface Stat {
  name: string;
  value: number;
}

const stats: Stat[] = [
  { name: "Daily Page Views", value: 1234 },
  { name: "Weekly Page Views", value: 12345 },
  { name: "Monthly Page Views", value: 123456 },
];

function formatNumber(num: number): string {
  if (num < 10000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "K";
  return (num / 1000000).toFixed(2) + "M";
}

export function PageViewStats() {
  const formattedStats = useMemo(
    () =>
      stats.map(stat => ({
        ...stat,
        formattedValue: formatNumber(stat.value),
      })),
    []
  );

  return (
    <div className="w-full">
      <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {formattedStats.map(item => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow"
          >
            <dt className="truncate text-md font-bold text-mydarkgrey">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-myblack">
              {item.formattedValue}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import { useStore } from "@nanostores/react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import Pie from "./Pie";
import {
  analyticsDuration,
} from "../../../store/storykeep";
import { classNames } from "../../../utils/helpers";

const AnalyticsWrapper = (props: { title: string; 
isPane:boolean
  data: 
{ id: string; value: number }[]
}) => {
  const { title, data,isPane } = props;
  const $analyticsDuration = useStore(analyticsDuration);
  const duration = $analyticsDuration;

  const updateDuration = (newValue: `daily` | `weekly` | `monthly`) => {
    analyticsDuration.set(newValue);
  };

  return (
    <div
      className="bg-myblue px-3.5 py-1.5 flex flex-nowrap"
      style={{ height: "220px",
backgroundImage: "repeating-linear-gradient( 45deg, transparent, transparent 10px, rgba(0,0,0, 0.1) 10px, rgba(0,0,0, 0.1) 20px )",
      }}
    >
      <div className="rounded-xl max-w-64 text-pretty bg-mywhite h-fit mr-4 shadow">
        <div className="p-3.5 text-xl space-y-4">
          <p>
            {isPane && <ArrowUpIcon className="h-5 w-5 inline" />} {title}
          </p>
          <div className="flex flex-wrap gap-x-2 text-md">
            <span className="font-action">Stats for past:</span>
            {["daily", "weekly", "monthly"].map(period => (
              <button
                key={period}
                onClick={() =>
                  updateDuration(period as "daily" | "weekly" | "monthly")
                }
                className={classNames(
                  duration === period ? "font-bold" : "underline",
                  "hover:text-myorange"
                )}
              >
                {period === `daily`
                  ? `24 hours`
                  : period === `weekly`
                    ? `7 days`
                    : `4 weeks`}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        className="rounded-xl max-w-xs bg-mywhite shadow-inner flex-grow"
        style={{ minWidth: "200px" }}
      >
        {data.length > 0 ? <Pie data={data} /> : "No data"}
      </div>
    </div>
  );
};

export default AnalyticsWrapper;

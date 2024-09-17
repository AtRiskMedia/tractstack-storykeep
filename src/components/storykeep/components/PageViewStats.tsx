import { useState, useEffect } from "react";

interface Stat {
  name: string;
  value: number;
}

const initialStats: Stat[] = [
  { name: "Daily Page Views", value: 1234 },
  { name: "Weekly Page Views", value: 12345 },
  { name: "Monthly Page Views", value: 123456 },
];

function formatNumber(num: number): string {
  if (num < 10000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "K";
  return (num / 1000000).toFixed(2) + "M";
}

export default function PageViewStats() {
  const [stats, setStats] = useState(initialStats);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchExampleData();
  }, []);

  async function fetchExampleData() {
    try {
      const slug = "example-slug"; // This could be dynamic based on your needs
      const otherParam = "some-value";
      const response = await fetch(`/api/concierge/storykeep/example?slug=${encodeURIComponent(slug)}&otherParam=${encodeURIComponent(otherParam)}`);
      const data = await response.json();
      if (data.success) {
        console.log("Example data fetched successfully:", data.message,data);
        setMessage(data.message);
        // You could update stats here if the API returns relevant data
        // setStats([...]);
      } else {
        console.error("Failed to fetch example data");
        setMessage("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching example data:", error);
      setMessage("Error fetching data");
    }
  }

  async function postExampleData() {
    try {
      const response = await fetch("/api/concierge/storykeep/example", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exampleData: "This is some example POST data",
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("Example data posted successfully:", data.message,data);
        setMessage("Data posted successfully: " + data.message);
      } else {
        console.error("Failed to post example data");
        setMessage("Failed to post data");
      }
    } catch (error) {
      console.error("Error posting example data:", error);
      setMessage("Error posting data");
    }
  }

  return (
    <div className="w-full">
      <p className="text-mydarkgrey mb-4">{message}</p>
      <button 
        onClick={postExampleData}
        className="bg-myorange text-mywhite font-bold py-2 px-4 rounded mb-4"
      >
        Post Example Data
      </button>
      <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map(item => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-mywhite px-4 py-5 shadow"
          >
            <dt className="truncate text-md font-bold text-mydarkgrey">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-myblack">
              {formatNumber(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

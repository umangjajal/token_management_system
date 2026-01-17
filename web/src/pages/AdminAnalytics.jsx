import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminAnalytics({ shopId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get(`/admin/analytics/heatmap/${shopId}`)
      .then(res => setData(res.data));
  }, [shopId]);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Staffing Heatmap</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Day</th>
            <th>Hour</th>
            <th>Avg Wait</th>
            <th>Tokens</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d._id.day}</td>
              <td>{d._id.hour}</td>
              <td>{Math.round(d.avgWait / 60)} min</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(0);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    if (!on) return;

    const i = setInterval(async () => {
      const res = await axios.get("http://localhost:5000/api/video/stats");
      setCount(res.data.count);
      setAlert(res.data.alert);
    }, 700);

    return () => clearInterval(i);
  }, [on]);

  return (
    <div className="min-h-screen w-screen bg-black text-white overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold">Sentinel Flow</h1>

        {!on && (
          <button
            onClick={() => setOn(true)}
            className="mt-4 px-6 py-3 bg-green-600 rounded"
          >
            Start Surveillance
          </button>
        )}

        <input
          type="file"
          accept="video/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("video", file);

            await axios.post(
              "http://localhost:5000/api/video/analyze-video",
              formData
            );

            setOn(true);
          }}
          className="block mt-4"
        />
      </div>

      {on && (
        <div className="relative w-full h-[calc(100vh-120px)]">
          <img
            src="http://localhost:5000/api/video/stream-video"
            className="w-full h-full object-contain"
            alt="Live Stream"
          />

          <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded">
            <p className="text-sm">People</p>
            <p className="text-3xl font-bold">{count}</p>
          </div>

          {alert && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-center py-3 font-bold z-10">
              ⚠ INTRUSION ALERT
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

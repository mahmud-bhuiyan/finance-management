import { useEffect, useState } from "react";

type HealthResponse = {
  ok: boolean;
  service?: string;
  timestamp?: string;
  database?: {
    connected: boolean;
    message: string;
  };
};

const App = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = (await response.json()) as HealthResponse;
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reach API");
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    void loadHealth();
  }, []);

  const dbOk = health?.database?.connected === true;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Finance Management System
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          Step 01 scaffold is running
        </h1>
        <p className="text-lg text-slate-600">
          PERN stack: PostgreSQL + Express + React + Node. Tailwind is enabled.
          This page calls the API health endpoint.
        </p>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-medium text-slate-900">
            API / database status
          </h2>

          {loading && <p className="text-slate-500">Checking /api/health…</p>}

          {!loading && error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
              {error}. Start the backend on port 4000 and ensure Postgres is up.
            </p>
          )}

          {!loading && health && (
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                API:{" "}
                <span className={health.ok ? "text-teal-700" : "text-red-700"}>
                  {health.ok ? "OK" : "Unavailable"}
                </span>
              </li>
              <li>
                Database:{" "}
                <span className={dbOk ? "text-teal-700" : "text-amber-700"}>
                  {health.database?.message ?? "Unknown"}
                </span>
              </li>
              {health.timestamp && <li>Checked at: {health.timestamp}</li>}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;

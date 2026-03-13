import { getLogStore } from "@/lib/log-store";

export const dynamic = "force-dynamic";

export default function Home() {
  const log = getLogStore();

  console.log("Current log:", log);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-16">
      <section className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
          Webhook Log
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
          Homepage Log Viewer
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          POST data to <code>/api/log</code>, and each request will be appended
          to the global log array with a timestamp.
        </p>
        <pre className="mt-8 overflow-x-auto rounded-xl bg-zinc-950 p-6 text-sm leading-6 text-zinc-100">
          {JSON.stringify(log, null, 2)}
        </pre>
      </section>
    </main>
  );
}

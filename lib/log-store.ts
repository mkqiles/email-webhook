import { get, list, put } from "@vercel/blob";

export type LogPayload = Record<string, unknown>;

export type LogEntry = {
  id: string;
  time: string;
  payload: LogPayload;
};

export type LogStore = LogEntry[];

const LOG_PREFIX = "webhook-logs/";
const MAX_LOGS = 200;

declare global {
  var __webhookLogStore__: LogStore | undefined;
}

const memoryLogStore = globalThis.__webhookLogStore__ ?? [];

if (!globalThis.__webhookLogStore__) {
  globalThis.__webhookLogStore__ = memoryLogStore;
}

export function getLogStorageMode() {
  return process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "memory";
}

async function readBlobText(pathname: string) {
  const result = await get(pathname, {
    access: "public",
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  return new Response(result.stream).text();
}

async function getBlobLogStore() {
  const allBlobs = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: LOG_PREFIX,
      limit: 1000,
      cursor,
    });

    allBlobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const latestBlobs = allBlobs
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(0, MAX_LOGS);

  const entries = await Promise.all(
    latestBlobs.map(async (blob) => {
      const text = await readBlobText(blob.pathname);

      if (!text) {
        return null;
      }

      try {
        return JSON.parse(text) as LogEntry;
      } catch {
        return null;
      }
    }),
  );

  return entries.filter((entry): entry is LogEntry => entry !== null);
}

export async function getLogStore() {
  if (getLogStorageMode() === "vercel-blob") {
    return getBlobLogStore();
  }

  return memoryLogStore;
}

export async function appendLogStore(payload: LogPayload) {
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    payload,
  };

  if (getLogStorageMode() === "vercel-blob") {
    await put(`${LOG_PREFIX}${entry.time}-${entry.id}.json`, JSON.stringify(entry), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json",
    });

    return entry;
  }

  memoryLogStore.unshift(entry);
  memoryLogStore.splice(MAX_LOGS);
  return entry;
}

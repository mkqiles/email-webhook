export type LogPayload = Record<string, unknown>;

export type LogEntry = {
  time: string;
  payload: LogPayload;
};

export type LogStore = LogEntry[];

declare global {
  var __webhookLogStore__: LogStore | undefined;
}

const logStore = globalThis.__webhookLogStore__ ?? [];

if (!globalThis.__webhookLogStore__) {
  globalThis.__webhookLogStore__ = logStore;
}

export function getLogStore() {
  return logStore;
}

export function appendLogStore(payload: LogPayload) {
  const entry: LogEntry = {
    time: new Date().toISOString(),
    payload,
  };

  logStore.push(entry);
  return entry;
}

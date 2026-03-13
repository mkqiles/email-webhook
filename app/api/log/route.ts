import { NextResponse } from "next/server";
import {
  appendLogStore,
  getLogStorageMode,
  getLogStore,
} from "@/lib/log-store";

function normalizePayload(payload: unknown) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  return { value: payload };
}

async function readRequestPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return normalizePayload(await request.json());
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    return Object.fromEntries(await request.formData());
  }

  const rawBody = await request.text();

  if (!rawBody) {
    return {};
  }

  try {
    return normalizePayload(JSON.parse(rawBody));
  } catch {
    return { rawBody };
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readRequestPayload(request);
    const entry = await appendLogStore(payload);

    return NextResponse.json({
      message: "log appended",
      storage: getLogStorageMode(),
      entry,
      log: await getLogStore(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "failed to append log",
        storage: getLogStorageMode(),
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}

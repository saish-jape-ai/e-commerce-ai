export class PlatformApiError extends Error {
  status: number;
  url: string;
  details?: unknown;

  constructor(input: { message: string; status: number; url: string; details?: unknown }) {
    super(input.message);
    this.name = 'PlatformApiError';
    this.status = input.status;
    this.url = input.url;
    this.details = input.details;
  }
}

const withTimeoutSignal = (signal: AbortSignal | undefined, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout);
      if (signal) signal.removeEventListener('abort', onAbort);
    },
  };
};

export const platformFetchJson = async <T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> => {
  const timeoutMs = init.timeoutMs ?? 20_000;
  const { signal, cleanup } = withTimeoutSignal(init.signal, timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      signal,
      headers: {
        Accept: 'application/json, text/plain, */*',
        ...(init.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

    if (!res.ok) {
      const messageFromBody = (() => {
        if (!body || typeof body !== 'object') return undefined;
        if (!('message' in body)) return undefined;
        const msg = (body as { message?: unknown }).message;
        return typeof msg === 'string' && msg.trim().length ? msg : undefined;
      })();
      const message = messageFromBody || `Request failed with status ${res.status}`;
      throw new PlatformApiError({ message, status: res.status, url, details: body });
    }

    return body as T;
  } finally {
    cleanup();
  }
};

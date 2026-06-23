export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // ignore empty body
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Ошибка запроса: ${res.status}`;
    throw new Error(message);
  }

  return payload as T;
}

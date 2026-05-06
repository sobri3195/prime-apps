const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

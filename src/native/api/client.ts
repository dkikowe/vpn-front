import { API_BASE_URL } from "../config/apiBaseUrl";
import type { ApiEnvelope, AuthPayload, AuthUser } from "./types";

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Сервер вернул неверный ответ");
  }
}

function getMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return fallback;
}

export async function checkHealth(): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/health`);
  const json = (await parseJson(res)) as { ok?: boolean };
  return res.ok && json?.ok === true;
}

export async function registerRequest(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await parseJson(res)) as ApiEnvelope<AuthPayload>;

  if (body.success === false) {
    throw new Error(getMessage(body, "Ошибка регистрации"));
  }
  if (!res.ok) {
    throw new Error(getMessage(body, "Ошибка регистрации"));
  }
  if (!body.data?.token || !body.data?.user) {
    throw new Error(getMessage(body, "Некорректный ответ сервера"));
  }
  return body.data;
}

export async function loginRequest(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await parseJson(res)) as ApiEnvelope<AuthPayload>;

  if (body.success === false) {
    throw new Error(getMessage(body, "Ошибка входа"));
  }
  if (!res.ok) {
    throw new Error(getMessage(body, "Ошибка входа"));
  }
  if (!body.data?.token || !body.data?.user) {
    throw new Error(getMessage(body, "Некорректный ответ сервера"));
  }
  return body.data;
}

export async function fetchMeRequest(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = (await parseJson(res)) as ApiEnvelope<{ user: AuthUser }>;

  if (body.success === false) {
    throw new Error(getMessage(body, "Сессия недействительна"));
  }
  if (!res.ok) {
    throw new Error(getMessage(body, "Сессия недействительна"));
  }
  if (!body.data?.user) {
    throw new Error(getMessage(body, "Некорректный ответ сервера"));
  }
  return body.data.user;
}

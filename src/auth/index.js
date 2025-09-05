// Módulo de autenticação: gerencia token no sessionStorage e chamadas ao backend
const TOKEN_KEY = "api_token";

export async function loginRequest(email, senha) {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const res = await fetch(`${apiUrl}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao autenticar");
  return data;
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export async function logoutRequest() {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const token = getToken();
  // tenta avisar o servidor para revogar (endpoint opcional no backend)
  try {
    await fetch(`${apiUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (e) {
    // ignore
  }
  sessionStorage.removeItem(TOKEN_KEY);
}

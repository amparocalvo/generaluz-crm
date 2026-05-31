export const AUTH_API_URL = "http://localhost:3000/api/auth";
export const AUTH_TOKEN_KEY = "generaluzAuthToken";

export function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

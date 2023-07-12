import instance from "../api/api.interceptor.js";

export async function getUsers(limit = 5, page = 1) {
  try {
    return await instance.get("users", {
      params: {
        limit,
        page,
      },
    });
  } catch {
    throw new Error("Что то пошло не так!");
  }
}

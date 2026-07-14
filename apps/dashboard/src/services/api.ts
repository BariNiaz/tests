const API_URL = "http://localhost:3001";

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${url}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Ошибка сервера");
  }

  return data;
}

export async function loginUser(data: any) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getUsers() {
  return request("/users");
}

export async function createUser(data: any) {
  return request("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function createTest(data: any) {
  return request("/tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getCategories() {
  return request("/categories");
}

export async function assignTests(data: any) {
  return request("/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function resolveAccessLink(token: string) {
  return request(`/access/${token}`);
}

export async function getUserTests(userId: number) {
  return request(`/tests/user/${userId}`);
}

export async function getTest(testId: number) {
  return request(`/tests/${testId}`);
}

export async function saveResult(data: any) {
  return request("/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getResults() {
  const res = await fetch("http://localhost:3001/results");

  if (!res.ok) {
    throw new Error("Не удалось загрузить результаты");
  }

  return await res.json();
}

export async function resetAttempt(userId: number, testId: number) {
  return request(`/results/${userId}/${testId}`, {
    method: "DELETE"
  });
}

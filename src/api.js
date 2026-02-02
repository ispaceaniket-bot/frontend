const BASE_URL = "https://backend-2e54.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/* AUTH */
export async function login(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail);
  return data;
}

export async function register(user) {
  console.log("Registering user:", user);
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  const data = await res.json();
  console.log("Register response status:", res.status, "data:", data);
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

export async function getCurrentUser() {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail);
  return data;
}

/* CASES */
export async function createCase(payload) {
  const res = await fetch(`${BASE_URL}/cases`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function myCases() {
  const res = await fetch(`${BASE_URL}/cases/my`, {
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch my cases");
  return data;
}

export async function uploadDocument(caseId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/cases/${caseId}/upload/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Upload failed");
  }
  return res.json();
}

export async function getDocuments(caseId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/cases/${caseId}/documents/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }
  return res.json();
}

/* MESSAGES / DISCUSSION THREADS */
export async function getCaseMessages(caseId) {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/discuss/`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function postCaseMessage(caseId, payload) {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/discuss/`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to post message");
  return data;
}

/* GP DECISIONS */
export async function gpDecision(caseId, payload) {
  const res = await fetch(`${BASE_URL}/gp/cases/${caseId}/decision`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to submit decision");
  return data;
}

export async function deleteCase(caseId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/cases/${caseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to delete case");
  }
  return res.json();
}

/* ADMIN */
export async function adminCases() {
  const res = await fetch(`${BASE_URL}/admin/cases/all`, {
    headers: authHeader(),
  });
  return res.json();
}

export async function adminGPs() {
  const res = await fetch(`${BASE_URL}/admin/gps`, {
    headers: authHeader(),
  });
  return res.json();
}

export async function getCaseDetails(caseId) {
  const res = await fetch(`${BASE_URL}/admin/cases/${caseId}`, {
    headers: authHeader(),
  });
  return res.json();
}

export async function assignGP(caseId, gpData) {
  const res = await fetch(`${BASE_URL}/admin/cases/${caseId}/assign`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(gpData),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Failed to assign case");
  }
  return res.json();
}

export const getMyCases = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/cases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch cases");
  return data;
};

/* GP */
export async function gpCases() {
  const res = await fetch(`${BASE_URL}/gp/cases`, {
    headers: authHeader(),
  });
  return res.json();
}

export async function approveCase(caseId) {
  return fetch(`${BASE_URL}/gp/approve/${caseId}`, {
    method: "PUT",
    headers: authHeader(),
  });
}

/* QA */
export async function qaCases() {
  const res = await fetch(`${BASE_URL}/qa/cases`, {
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch QA pool cases");
  return data;
}

// QA-specific helpers
export async function getMyQACases() {
  const res = await fetch(`${BASE_URL}/qa/my-cases`, {
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch QA cases");
  return data;
}

export async function assignRandomQA() {
  const res = await fetch(`${BASE_URL}/qa/assign-random`, {
    method: "POST",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "No QA cases available");
  return data;
}

export async function submitQaFeedback(caseId, payload) {
  const res = await fetch(`${BASE_URL}/qa/cases/${caseId}/feedback`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to submit QA feedback");
  return data;
}

/* Download a specific document as a Blob (used by Dashboard) */
export async function downloadDocument(caseId, fileId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/cases/${caseId}/download/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to download document");
  }

  const blob = await res.blob();
  return blob;
}

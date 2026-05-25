const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getPatients() {
  return request("/patients");
}

export function loginUser(credentials) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function createUser(user) {
  return request("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function getUsers() {
  return request("/users");
}

export function deleteUser(userId) {
  return request(`/users/${userId}`, {
    method: "DELETE",
  });
}

export function getPatient(patientId) {
  return request(`/patients/${patientId}`);
}

export function getCaretakerPatients(caretakerId) {
  return request(`/caretakers/${caretakerId}/patients`);
}

export function addCaretakerPatient(caretakerId, username) {
  return request(`/caretakers/${caretakerId}/patients`, {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function createPatient(patient) {
  return request("/patients", {
    method: "POST",
    body: JSON.stringify(patient),
  });
}

export function createMedicine(patientId, medicine) {
  return request(`/patients/${patientId}/medicines`, {
    method: "POST",
    body: JSON.stringify(medicine),
  });
}

export function createCourse(patientId, medicineId, course) {
  return request(`/patients/${patientId}/medicines/${medicineId}/courses`, {
    method: "POST",
    body: JSON.stringify(course),
  });
}

export function deleteMedicine(patientId, medicineId) {
  return request(`/patients/${patientId}/medicines/${medicineId}`, {
    method: "DELETE",
  });
}

export function createDoseLog(patientId, medicineId, doseLog) {
  return request(`/patients/${patientId}/medicines/${medicineId}/doseLogs`, {
    method: "POST",
    body: JSON.stringify(doseLog),
  });
}

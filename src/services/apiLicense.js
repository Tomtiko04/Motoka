import { api } from "./apiClient";

export async function createDriverLicense(formData) {
  const data = new FormData();

  // Map formData fields to match backend expectations
  if (formData.application_type) {
    data.append("application_type", formData.application_type);
  }
  data.append("full_name", formData.full_name);
  data.append("phone_number", formData.phone_number);
  data.append("address", formData.address);
  data.append("date_of_birth", formData.date_of_birth);
  data.append("place_of_birth", formData.place_of_birth);
  data.append("state_of_origin", formData.state_of_origin);
  data.append("local_government", formData.local_government);
  data.append("blood_group", formData.blood_group);
  data.append("height", formData.height);
  data.append("occupation", formData.occupation);
  data.append("next_of_kin", formData.next_of_kin);
  data.append("next_of_kin_phone", formData.next_of_kin_phone);
  data.append("mother_maiden_name", formData.mother_maiden_name);
  if (formData.license_year) {
    data.append("license_year", formData.license_year);
  }

  if (formData.passport_photograph) {
    data.append("passport_photograph", formData.passport_photograph);
  }

  if (formData.affidavit) {
    data.append("affidavit", formData.affidavit);
  }

  // Use the backend endpoint for driver license applications
  const response = await api.put("/driver-license-applications/me", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getDriverLicenses(type = 'new') {
  // Use the backend endpoint to get the user's driver license application
  const { data } = await api.get("/driver-license-applications/me", {
    params: { type }
  });
  return data;
}

export async function getDriverLicenseById(id) {
  // Backend uses /me endpoint with type parameter, not by ID
  // If id represents type, use it; otherwise default to 'new'
  const applicationType = id === 'renew' ? 'renew' : 'new';
  const { data } = await api.get("/driver-license-applications/me", {
    params: { type: applicationType }
  });
  return data;
}

export async function updateDriverLicense(id, formData) {
  // Backend uses /me endpoint, id parameter is ignored
  const dataToSend = formData instanceof FormData ? formData : new FormData();
  
  if (!(formData instanceof FormData)) {
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        dataToSend.append(key, value);
      }
    });
  }

  const config = formData instanceof FormData || Object.values(formData).some(v => v instanceof File)
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};

  const { data } = await api.put("/driver-license-applications/me", dataToSend, config);
  return data;
}

export async function deleteDriverLicense(id) {
  // Backend doesn't support delete, return error or no-op
  throw new Error("Delete operation not supported for driver license applications");
} 
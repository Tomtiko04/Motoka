import { api } from "./apiClient";

export async function createDriverLicense(formData) {
  try {
    const data = new FormData();

    data.append("license_type", formData.license_type);
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
    data.append("license_year", formData.license_year);
    
    if (formData.passport_photograph) {
      data.append("passport_photograph", formData.passport_photograph);
    }
    
    if (formData.affidavit) {
      data.append("affidavit", formData.affidavit);
    }

    const response = await api.post("/driver-license", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Driver License Creation Failed");
  }
}

export async function getDriverLicenses() {
  try {
    const { data } = await api.get("/driver-license");
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch driver licenses");
  }
}

export async function getDriverLicenseById(id) {
  try {
    const { data } = await api.get(`/driver-license/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch driver license");
  }
}

export async function updateDriverLicense(id, formData) {
  try {
    const { data } = await api.put(`/driver-license/${id}`, { ...formData });
    return data;
  } catch (error) {
    throw new Error(error.message || "Driver License Update Failed");
  }
}

export async function deleteDriverLicense(id) {
  try {
    const { data } = await api.delete(`/driver-license/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.message || "Driver License Deletion Failed");
  }
} 
import { api } from "./apiClient";

const getAllState = async() => {
  try {
    const { data } = await api.get("/get-all-state");
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllLocalGovernment = async () => {
  try {
    const { data } = await api.get("/get-lga/27");
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export { getAllState, getAllLocalGovernment };

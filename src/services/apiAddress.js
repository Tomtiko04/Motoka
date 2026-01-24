import { api } from "./apiClient";

const getAllState = async () => {
  const { data } = await api.get("/get-all-state");
  return data;
};

const getAllLocalGovernment = async (stateId) => {
  const { data } = await api.get(`/get-lga/${stateId}`);
  return data;
};

export { getAllState, getAllLocalGovernment };

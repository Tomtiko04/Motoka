import Cookies from "js-cookie";
import { api } from "./apiClient";

export async function addCar(formData) {
  try {
    const { data } = await api.post("/car/reg", { ...formData });
    console.log("dataaa", data);
    return data;
  } catch (error) {
    throw new Error(error.message || "Car Registration Failed");
  }
}

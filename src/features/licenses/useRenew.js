import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAllLocalGovernment as getAllLocalGovernmentApi,
  getAllState as getAllStateApi,
} from "../../services/apiAddress";

export function useGetState() {
  const { data, isPending } = useQuery({
    queryKey: ["states"],
    queryFn: getAllStateApi,
  });

  return { data, isPending };
}

export function useGetLocalGovernment() {
  const { mutate,data, isPending } = useMutation({
    mutationFn: getAllLocalGovernmentApi,
    mutationKey: ["LG"]
  });

  return { mutate, data, isPending };
}

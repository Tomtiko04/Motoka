import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProfile, uploadProfileImage } from "../../services/apiProfile";

export const PROFILE_QUERY_KEY = ["profile"];

export const MAX_BYTES = 5 * 1024 * 1024;
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * The signed-in user's profile, cached so the avatar in the header and the one
 * in settings are the same fetch rather than two.
 *
 * Deliberately React Query rather than the older useProfile hook, which holds
 * its own state per component — that is fine for one settings screen, but the
 * header needs the same value and must update the moment a new picture is
 * uploaded, from anywhere in the app.
 */
export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const profile = data?.data ?? data ?? null;
  return { profile, imageUrl: profile?.image ?? null, isLoading };
}

export function validatePicture(file) {
  if (!file) return "Choose an image first.";
  if (!ACCEPTED.includes(file.type)) {
    return "That file is not an image. Use a JPG, PNG or WebP.";
  }
  if (file.size > MAX_BYTES) {
    return `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please use one under 5MB.`;
  }
  return null;
}

/**
 * Upload a new display picture.
 *
 * The server response is checked for an image rather than trusted: a backend
 * that ignores the file would otherwise return 200 and leave the user believing
 * their picture was saved. If nothing comes back, this reports failure and the
 * cache is refetched so the UI shows what is actually stored.
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const problem = validatePicture(file);
      if (problem) throw new Error(problem);

      const response = await uploadProfileImage(file);
      const saved = response?.data?.image ?? response?.image ?? null;
      if (!saved) {
        throw new Error(
          "The upload finished but no picture came back from the server, so it has not been saved.",
        );
      }
      return saved;
    },
    onSuccess: () => {
      toast.success("Display picture updated.");
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (err, _file, _ctx) => {
      toast.error(err.message || "Could not update your display picture.");
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

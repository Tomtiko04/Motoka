export const SITE_ORIGIN = "https://www.motokaapp.ng";

export function absoluteUrl(path = "/") {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalised === "/" ? "/" : normalised}`;
}

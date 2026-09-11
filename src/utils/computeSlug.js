// Builds the URL slug for a blog post from its title.
//
// Previously this was just `title.trim().replace(/\s+/g, "-")`, which left
// two problems:
//
//   1. Slugs kept the title's capitalisation, so every post URL was
//      mixed-case (/blog/How-to-Keep-Your-Car-Documents-Safe-in-Nigeria).
//      Lowercase is the convention search engines expect, and mixed-case
//      invites duplicate-content splits because URL paths are case-sensitive.
//   2. Punctuation passed straight through. A title containing a colon or
//      question mark produced a URL needing percent-encoding, which meant
//      titles had to be written around the slug function rather than for
//      readers.
//
// Anything not alphanumeric now collapses to a single hyphen, so titles can
// be punctuated freely without affecting the URL.
//
// NOTE: this changes the slug for posts published before it landed. See
// findPostBySlug below — resolution is case-insensitive so previously
// indexed mixed-case URLs keep working rather than 404ing.
export const computeSlug = (title) =>
  String(title ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Resolve a post from a URL slug.
//
// Compared case-insensitively on purpose: the posts published before slugs
// were lowercased are already indexed at their mixed-case URLs, and those
// links exist in the wild. Matching loosely keeps them resolving, while every
// newly rendered link uses the lowercase form. The canonical tag on the page
// always points at computeSlug(title), so an old URL consolidates onto the
// new one rather than competing with it.
export const findPostBySlug = (posts, slug) => {
  const wanted = String(slug ?? "").toLowerCase();
  return posts.find((p) => computeSlug(p.title) === wanted);
};

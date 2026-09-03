import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import blogData from "../Data/blogs";
import { computeSlug, findPostBySlug } from "../utils/computeSlug";
import Seo from "../components/Seo";
import { blogPostingSchema } from "../utils/schema";


export default function BlogPage() {
  const { slug } = useParams();

  // Case-insensitive so the mixed-case URLs indexed before slugs were
  // lowercased still resolve instead of 404ing.
  const blog = findPostBySlug(blogData, slug);
  const prevBlog = blogData[blogData.indexOf(blog) - 1];
  const nextBlog = blogData[blogData.indexOf(blog) + 1];

  // Canonical is built from the title, never from the slug in the URL. A
  // visitor arriving on an old mixed-case link would otherwise self-canonicalise
  // to that old URL, leaving both variants indexed and competing. Pointing at
  // the computed slug consolidates them onto one.
  const canonicalPath = blog ? `/blog/${computeSlug(blog.title)}` : `/blog/${slug}`;

  const jsonLd = useMemo(
    () =>
      blog
        ? [
            blogPostingSchema({
              title: blog.title,
              description: blog.content.slice(0, 160),
              path: canonicalPath,
              date: blog.date,
              image: blog.image,
            }),
          ]
        : undefined,
    [blog, canonicalPath],
  );

  if (!blog) {
    return <div className="p-10">Blog not found</div>;
  }

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <Seo
          title={blog.title}
          description={blog.content.slice(0, 160)}
          path={canonicalPath}
          jsonLd={jsonLd}
        />
        {/* Image */}
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>

        {/* Date */}
        <p className="text-gray-400 mb-6 text-lg">{blog.date}</p>

        {/* Content */}
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm mb-12">
          {blog.content}
        </div>
        <div className="flex justify-between gap-4 border-t pt-6">

          {/* Previous */}
          {prevBlog ? (
            <Link to={`/blog/${computeSlug(prevBlog.title)}`} className="group">
              <p className="text-sm text-gray-400">← Previous</p>
              <p className="font-medium group-hover:text-blue-600 text-sm">
                {prevBlog.title}
              </p>
            </Link>
          ) : <div />}

          {/* Next */}
          {nextBlog ? (
            <Link to={`/blog/${computeSlug(nextBlog.title)}`} className="text-right group">
              <p className="text-sm text-gray-400">Next →</p>
              <p className="font-medium group-hover:text-blue-600 text-sm">
                {nextBlog.title}
              </p>
            </Link>
          ) : <div />}
        </div>
      </div>
    </section>
  );
}
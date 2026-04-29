import { useParams, Link } from "react-router-dom";
import blogData from "../Data/blogs";
import { computeSlug } from "../utils/computeSlug";
import { Helmet } from "react-helmet";


export default function BlogPage() {
  const { slug } = useParams();

  const blog = blogData.find((b) => computeSlug(b.title) === slug);
  const prevBlog = blogData[blogData.indexOf(blog) - 1];
  const nextBlog = blogData[blogData.indexOf(blog) + 1];

  if (!blog) {
    return <div className="p-10">Blog not found</div>;
  }

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <Helmet>
          <title>{blog.title} | Motoka</title>
          <meta name="description" content={blog.content.slice(0, 120)} />
        </Helmet>
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
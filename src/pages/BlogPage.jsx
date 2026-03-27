import { useParams } from "react-router-dom";
import  blogData  from "../Data/blogs";
import { computeSlug } from "../utils/computeSlug";

export default function BlogPage() {
  const { slug } = useParams();

  const blog = blogData.find((b) => computeSlug(b.title) === slug);

  if (!blog) {
    return <div className="p-10">Blog not found</div>;
  }

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        
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
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
          {blog.content}
        </div>

      </div>
    </section>
  );
}
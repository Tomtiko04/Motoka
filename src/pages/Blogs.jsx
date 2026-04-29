import blogData  from "../Data/blogs";
import { Link } from "react-router-dom";
import {computeSlug} from '../utils/computeSlug';
export default function BlogsPage() {
  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Our Blog
          </h1>
          <p className="text-gray-600 mt-3 text-sm">
            Tips, guides, and updates on managing your vehicle documents.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogData.map((blog) => (
            <Link
              to={`/blog/${computeSlug(blog.title)}`}
              key={blog.id}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">

                {/* Image */}
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-48 w-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm text-gray-400 mb-2">
                    {blog.date}
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-3">
                    {blog.content}
                  </p>

                  <span className="text-blue-600 text-sm font-medium mt-3 inline-block">
                    Read more →
                  </span>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
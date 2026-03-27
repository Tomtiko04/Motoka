import React from "react";
import { Link } from "react-router-dom";
import { computeSlug } from "../../utils/computeSlug";
import blogData from "../../Data/blogs";
// const blogs = [
//     {
//     id: 1,
//     title: "How to Keep Your Car Documents Safe in Nigeria",
//     excerpt: "Learn the best practices for storing and managing your vehicle papers digitally.",
//     image: "https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=800",
//     date: "Mar 20, 2026",
//   },
//   {
//     id: 2,
//     title: "Why Digital Vehicle Records Matter",
//     excerpt: "Avoid fines and stress by keeping your car records organized and accessible.",
//     image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800",
//     date: "Mar 18, 2026",
//   },
//   {
//     id: 3,
//     title: "Top 5 Mistakes Car Owners Make",
//     excerpt: "Don’t fall into these common traps when managing your vehicle documents.",
//     image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800",
//     date: "Mar 15, 2026",
//   },
//   {
//     id: 4,
//     title: "How Motoka Simplifies Your Life",
//     excerpt: "Discover how our platform helps you manage everything in one place.",
//     image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800",
//     date: "Mar 10, 2026",
//   },
// ];

export default function BlogSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-10  text-center">
          <h2 className="text-[56px] font-bold text-[#05243F]">
            Blogs
          </h2>
          <p className="text-gray-600 mt-2 px-3 text-sm">
            Tips, updates, and insights on managing your vehicle documents.
          </p>
        </div>

        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 sm:ps-12">

          {blogData.map((blog) => (
            <div
              key={blog.id}
              className="min-w-[300px] max-w-[300px] bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="h-40 w-full object-cover rounded-t-2xl"
              />

              <div className="p-5">
                <p className="text-sm text-gray-400 mb-2">{blog.date}</p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {blog.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {blog.excerpt}
                </p>
                <Link to={computeSlug(blog.title)}>
                  <button className="text-blue-600 font-medium hover:underline text-sm">
                    Read more →
                  </button>
                </Link>
              </div>
            </div>
          ))}

        </div>
        <div className="text-center">
          <Link to="/blogs">
            <button className="uppercase bg-none border-gray-300 border-2 text-sm font-medium py-3 px-6 rounded-full my-10 mt-12">
              View More posts
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
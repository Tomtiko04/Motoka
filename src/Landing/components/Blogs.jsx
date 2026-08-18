import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
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
  // The row scrolls horizontally but used `scrollbar-hide` with no arrows, dots
  // or fade, so cards were cut off at the right edge with nothing to say more
  // existed. These track scroll position so the arrows and the edge fade only
  // appear when there is actually something to scroll to.
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    syncScrollState();
    window.addEventListener("resize", syncScrollState);
    return () => window.removeEventListener("resize", syncScrollState);
  }, [syncScrollState]);

  const scrollByCard = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    // 300px card + 24px gap (min-w-[300px] and gap-6 below).
    el.scrollBy({ left: direction * 324, behavior: "smooth" });
  };

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
        <div className="relative">
          {/* Edge fades: the visual cue that the row continues past the cut. */}
          {canScrollLeft && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-gray-50 to-transparent"
            />
          )}
          {canScrollRight && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-gray-50 to-transparent"
            />
          )}

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll to previous posts"
              className="absolute top-1/2 left-1 z-20 hidden -translate-y-1/2 rounded-full bg-white p-3 text-[#05243F] shadow-md transition hover:bg-gray-100 sm:block"
            >
              <Icon icon="mdi:chevron-left" width="22" height="22" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll to more posts"
              className="absolute top-1/2 right-1 z-20 hidden -translate-y-1/2 rounded-full bg-white p-3 text-[#05243F] shadow-md transition hover:bg-gray-100 sm:block"
            >
              <Icon icon="mdi:chevron-right" width="22" height="22" />
            </button>
          )}

          <div
            ref={scrollerRef}
            onScroll={syncScrollState}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scrollbar-hide pb-4 sm:ps-12"
          >

          {blogData.map((blog) => (
            <div
              key={blog.id}
              className="min-w-[300px] max-w-[300px] snap-start bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300"
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
                <Link to={`blog/${computeSlug(blog.title)}`}>
                  <button className="text-blue-600 font-medium hover:underline text-sm">
                    Read more →
                  </button>
                </Link>
              </div>
            </div>
          ))}

          </div>
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
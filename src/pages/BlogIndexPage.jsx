import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import useSeoHead from '../hooks/useSeoHead'
import { BLOG_POSTS } from '../data/blogPosts'

export default function BlogIndexPage() {
  useSeoHead(
    'Blog — Vehicle Document Guides Nigeria | Motoka',
    'Guides on renewing your vehicle license, road worthiness certificate, driver\'s license, and insurance in Nigeria — plus how Motoka\'s features work.'
  )

  return (
    <PageLayout>
      <section className="bg-[#daebfa]" style={{ paddingTop: 96, paddingBottom: 64 }}>
        <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', maxWidth: 780 }}>
          <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#0e6fc6', textTransform: 'uppercase', marginBottom: 12 }}>
            Blog
          </p>
          <h1 style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 50.9px)', color: '#0e6fc6', lineHeight: 1.15 }}>
            Guides for keeping your vehicle documents in order
          </h1>
        </div>
      </section>

      <section style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 64, paddingBottom: 96 }}>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24, maxWidth: 1000 }}>
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="hover:brightness-105 transition-all"
              style={{ display: 'block', background: '#f8fafc', border: '1px solid rgba(5,36,63,0.13)', borderRadius: 20, padding: 28 }}
            >
              <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#0e6fc6', textTransform: 'uppercase', marginBottom: 12 }}>
                {post.eyebrow}
              </p>
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#05243f', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h2>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 15 }}>{post.intro.slice(0, 140)}…</p>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}

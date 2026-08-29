import { Link, useParams, Navigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import useSeoHead from '../hooks/useSeoHead'
import useJsonLd from '../hooks/useJsonLd'
import { getPostBySlug } from '../data/blogPosts'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  useSeoHead(post?.seoTitle, post?.seoDescription)
  // No publish/modified date in the post data — omitted rather than faked,
  // since Article schema is still valid without datePublished/dateModified.
  useJsonLd(
    post && {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.seoDescription,
      author: { '@type': 'Organization', name: 'Motoka' },
      publisher: {
        '@type': 'Organization',
        name: 'Motoka',
        logo: { '@type': 'ImageObject', url: 'https://www.motoka.ng/og-image.png' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.motoka.ng/blog/${post.slug}` },
    }
  )

  if (!post) return <Navigate to="/blog" replace />

  return (
    <PageLayout>
      <article>
        <section className="bg-[#daebfa]" style={{ paddingTop: 96, paddingBottom: 64 }}>
          <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', maxWidth: 780 }}>
            <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#0e6fc6', textTransform: 'uppercase', marginBottom: 12 }}>
              {post.eyebrow}
            </p>
            <h1 style={{ fontWeight: 500, fontSize: 'clamp(30px, 4vw, 44px)', color: '#0e6fc6', lineHeight: 1.2 }}>{post.title}</h1>
          </div>
        </section>

        <section style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 64, paddingBottom: 40, maxWidth: 780 }}>
          <p style={{ color: '#334155', lineHeight: 1.8, fontSize: 17 }}>{post.intro}</p>
        </section>

        <section style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingBottom: 64, maxWidth: 780 }}>
          {post.sections.map((s) => (
            <div key={s.title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: '#05243f', marginBottom: 8 }}>{s.title}</h2>
              <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 16 }}>{s.body}</p>
            </div>
          ))}
        </section>

        <section className="bg-[#f8fafc]" style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 56, paddingBottom: 56 }}>
          <div style={{ maxWidth: 780 }}>
            <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 16, marginBottom: 24 }}>{post.closing}</p>
            <Link
              to={post.ctaTo}
              className="inline-flex items-center justify-center hover:brightness-110 transition-all"
              style={{ background: '#21b993', color: 'white', fontWeight: 600, fontSize: 16, padding: '14px 32px', borderRadius: 10 }}
            >
              {post.ctaText}
            </Link>
          </div>
        </section>
      </article>
    </PageLayout>
  )
}

import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays, Tag, Sparkles } from "lucide-react";
import { PageShell, AuthorBio } from "../components/PageShell";
import { Reveal } from "../components/fx/Reveal";
import { injectJsonLd } from "../components/Seo";
import { api, imgUrl } from "../lib/api";
import { srcSetFor } from "../lib/img";

const Section = ({ children, className = "" }) => <section className={`max-w-[880px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20 ${className}`}>{children}</section>;

const BlogPostPage = () => {
  const { slug } = useParams();
  // The server sends the post's data with the page (#rk-post), so the first render shows
  // the full article instead of an empty page that then jumps into place.
  const [post, setPost] = useState(() => {
    try {
      const p = JSON.parse(document.getElementById("rk-post")?.textContent || "null");
      return p && p.slug === slug ? p : null;
    } catch { return null; }
  });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (post && post.slug === slug) return;
    setPost(null);
    setNotFound(false);
    api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => setNotFound(true));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!post) return;
    injectJsonLd("ld-json-blogposting", post.schema?.article);
    injectJsonLd("ld-json-blogauthor", post.schema?.author);
    injectJsonLd("ld-json-blogfaq", post.schema?.faq);
    return () => { ["ld-json-blogposting", "ld-json-blogauthor", "ld-json-blogfaq"].forEach((id) => injectJsonLd(id, null)); };
  }, [post]);

  if (notFound) return <Navigate to="/blog" replace />;
  if (!post) return null;

  const page = {
    path: `/blog/${post.slug}`,
    canonical: `https://rekhakrishnamurthy.com/blog/${post.slug}`,
    metaTitle: post.meta_title || post.title,
    metaDescription: post.meta_description || post.excerpt,
    ogTitle: post.meta_title || post.title,
    ogDescription: post.meta_description || post.excerpt,
    name: post.title,
    h1: post.title,
  };

  return (
    <PageShell page={page} title={post.title} faq={post.faqs?.length ? post.faqs.map((f) => [f.q, f.a]) : undefined}>
      <div data-testid="blog-post-page">
        <Section className="pb-0">
          <Reveal>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#E62E6B] font-medium mb-6" data-testid="blog-post-back-link"><ArrowLeft size={14} /> Back to Blog</Link>
            <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-[#E62E6B]">
              <span className="inline-flex items-center gap-1"><Tag size={12} /> {post.category}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {post.publish_date}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#4A2530] mt-4 leading-tight" data-testid="blog-post-title">{post.title}</h1>
            {post.key_takeaway && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-[#F1DCE3] bg-[#FBE9F0] px-5 py-4" data-testid="blog-key-takeaway">
                <Sparkles size={18} className="text-[#E62E6B] shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B]">Key takeaway</div>
                  <p className="mt-1 text-sm sm:text-base text-[#4A2530] font-medium leading-relaxed">{post.key_takeaway}</p>
                </div>
              </div>
            )}
            <div className="mt-4 text-sm text-[#5C4E52]">By {post.author}</div>
          </Reveal>
        </Section>
        <Section className="pb-0">
          <Reveal delay={0.05}>
            <img width="1200" height="630" fetchPriority="high" decoding="async" src={imgUrl(post.featured_image)} srcSet={srcSetFor(post.featured_image)} sizes={srcSetFor(post.featured_image) ? "(max-width: 1024px) 100vw, 1000px" : undefined} alt={post.alt_text || post.title} className="w-full h-64 sm:h-96 object-cover rounded-3xl" data-testid="blog-post-image" />
          </Reveal>
        </Section>
        <Section>
          <Reveal delay={0.1}>
            <article className="legal-md text-sm sm:text-base text-[#5C4E52] leading-relaxed mt-8" data-testid="blog-post-body">
              <ReactMarkdown components={{ h1: "h2" }}>{post.body}</ReactMarkdown>
              {post.faqs?.map((f, i) => (
                <div key={i} className="mt-6">
                  <h3 className="font-display text-lg sm:text-xl text-[#4A2530]">{f.q}</h3>
                  <p className="mt-2">{f.a}</p>
                </div>
              ))}
            </article>
            {post.interlink_url && (
              <Link to={post.interlink_url} className="inline-flex items-center gap-1.5 mt-8 text-sm font-medium text-[#E62E6B]" data-testid="blog-post-interlink">Explore this service →</Link>
            )}
          </Reveal>
          <div className="mt-10"><AuthorBio /></div>
        </Section>
      </div>
    </PageShell>
  );
};

export default BlogPostPage;

import { blogPosts } from '../../generated/blog-posts.generated';

export const writingPreviews = blogPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  summary: post.description,
  category: 'Writing',
  kind: 'Article',
  path: `/blog/${post.slug}`,
}));

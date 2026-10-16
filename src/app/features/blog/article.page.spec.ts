import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { blogPosts } from '../../../generated/blog-posts.generated';
import { ArticlePage } from './article.page';

describe('ArticlePage', () => {
  it('restores code copy controls when another article reuses the page', async () => {
    const article = blogPosts.find(({ html }) => html.includes('code-frame'))!;
    const other = blogPosts.find(({ slug }) => slug !== article.slug)!;
    const params = new BehaviorSubject(convertToParamMap({ slug: article.slug }));
    await TestBed.configureTestingModule({
      imports: [ArticlePage],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: params } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.copy-code').length).toBeGreaterThan(0);

    params.next(convertToParamMap({ slug: other.slug }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('h1')?.textContent).toContain(other.title);

    params.next(convertToParamMap({ slug: article.slug }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('h1')?.textContent).toContain(article.title);
    expect(root.querySelectorAll('.copy-code')).toHaveLength(
      root.querySelectorAll('.code-frame').length,
    );
    expect(root.querySelectorAll('.copy-code').length).toBeGreaterThan(0);

    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelectorAll('.copy-code')).toHaveLength(
      root.querySelectorAll('.code-frame').length,
    );
  });

  it('reports clipboard failure without rejecting the click handler', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: blogPosts[0].slug })) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ArticlePage);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Clipboard denied')) },
    });
    await expect(fixture.componentInstance.copyUrl()).resolves.toBeUndefined();
    expect(fixture.componentInstance.copyFailed()).toBe(true);
    expect(fixture.componentInstance.copied()).toBe(false);
  });

  it('keeps table-of-contents fragments on the current article route', async () => {
    const article = blogPosts[0];
    await TestBed.configureTestingModule({
      imports: [ArticlePage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: article.slug })) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePage);
    fixture.detectChanges();
    const firstLink = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      '.article-toc a',
    );

    expect(firstLink?.getAttribute('href')).toBe(
      `/blog/${article.slug}#${article.tableOfContents[0]?.id}`,
    );
  });

  it('renders a matching heading target for every table-of-contents fragment', async () => {
    const article = blogPosts[0];
    await TestBed.configureTestingModule({
      imports: [ArticlePage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: article.slug })) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const expectedIds = article.tableOfContents.map(({ id }) => id);
    const headingIds = [
      ...root.querySelectorAll<HTMLElement>('.article-body h2, .article-body h3'),
    ].map(({ id }) => id);
    const linkedFragments = [...root.querySelectorAll<HTMLAnchorElement>('.article-toc a')].map(
      ({ hash }) => hash.slice(1),
    );

    expect(headingIds).toEqual(expectedIds);
    expect(linkedFragments).toEqual(expectedIds);
  });
});

import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it } from 'vitest';
import SEO from './SEO';

describe('SEO canonical source', () => {
  it('uses an external canonical source without replacing the Postify share URL', async () => {
    render(
      <HelmetProvider>
        <SEO
          title="Imported knowledge"
          type="article"
          url="https://postify.zekiakgul.dev/posts/imported"
          canonicalUrl="https://example.com/original?edition=2#section"
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
        .toBe('https://example.com/original?edition=2');
    });
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content'))
      .toBe('https://postify.zekiakgul.dev/posts/imported');
  });
});

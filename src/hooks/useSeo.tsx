import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description?: string;
  canonicalPath?: string; // path part, e.g. "/privacy-policy"
  suffix?: string;
}

/**
 * Per-route SEO updater for Vite + react-router-dom (no react-helmet).
 * Updates document.title, meta description, canonical link, and og:title/url
 * on mount and restores them on unmount.
 */
export function useSeo({ title, description, canonicalPath, suffix = 'EduFlow' }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${suffix}` : suffix;
    const prevTitle = document.title;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string, create?: () => HTMLElement) => {
      let el = document.querySelector(selector) as HTMLElement | null;
      let created = false;
      if (!el && create) {
        el = create();
        document.head.appendChild(el);
        created = true;
      }
      const prev = el?.getAttribute(attr) ?? null;
      if (el) el.setAttribute(attr, value);
      return () => {
        if (!el) return;
        if (created) el.remove();
        else if (prev !== null) el.setAttribute(attr, prev);
      };
    };

    const restorers: Array<() => void> = [];

    if (description) {
      restorers.push(
        setMeta('meta[name="description"]', 'content', description, () => {
          const m = document.createElement('meta');
          m.setAttribute('name', 'description');
          return m;
        })
      );
      restorers.push(
        setMeta('meta[property="og:description"]', 'content', description, () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:description');
          return m;
        })
      );
    }

    restorers.push(
      setMeta('meta[property="og:title"]', 'content', fullTitle, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:title');
        return m;
      })
    );

    if (canonicalPath) {
      restorers.push(
        setMeta('link[rel="canonical"]', 'href', canonicalPath, () => {
          const l = document.createElement('link');
          l.setAttribute('rel', 'canonical');
          return l;
        })
      );
      restorers.push(
        setMeta('meta[property="og:url"]', 'content', canonicalPath, () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:url');
          return m;
        })
      );
    }

    return () => {
      document.title = prevTitle;
      restorers.forEach((r) => r());
    };
  }, [title, description, canonicalPath, suffix]);
}

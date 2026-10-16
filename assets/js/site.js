// Site behaviour + Fluent UI web components. Bundled by Hugo (js.Build) in baseof.html.
// Only the components the site uses are registered, to keep the bundle small.

import '@fluentui/web-components/accordion.js';
import '@fluentui/web-components/accordion-item.js';
import '@fluentui/web-components/avatar.js';
import '@fluentui/web-components/button.js';
import '@fluentui/web-components/dialog.js';
import '@fluentui/web-components/dialog-body.js';
import '@fluentui/web-components/divider.js';
import '@fluentui/web-components/drawer.js';
import '@fluentui/web-components/drawer-body.js';
import '@fluentui/web-components/message-bar.js';
import '@fluentui/web-components/tab.js';
import '@fluentui/web-components/tablist.js';
import '@fluentui/web-components/tooltip.js';

import { initCopyable } from './copyable.js';

// Sticky header: add a shadow once the page is scrolled -------------------------------------

function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) {
        return;
    }
    const update = () => header.toggleAttribute('data-stuck', window.scrollY > 10);
    update();
    window.addEventListener('scroll', update, { passive: true });
}

// Mobile navigation drawer ----------------------------------------------------------------

function initNavDrawer() {
    const drawer = document.getElementById('nav-drawer');
    const toggle = document.querySelector('.nav-toggle');
    if (!drawer || !toggle) {
        return;
    }
    toggle.addEventListener('click', () => {
        drawer.show();
        toggle.setAttribute('aria-expanded', 'true');
    });
    drawer.addEventListener('toggle', (e) => {
        toggle.setAttribute('aria-expanded', String(e.detail?.newState === 'open'));
    });
}

// Accordions: open the item a URL fragment points to, and keep the fragment in sync -------

function openFragmentTarget() {
    if (!location.hash) {
        return;
    }
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const item = target?.closest('fluent-accordion-item');
    if (item) {
        item.expanded = true;
        requestAnimationFrame(() => item.scrollIntoView({ block: 'start' }));
    }
}

function initAccordions() {
    openFragmentTarget();
    window.addEventListener('hashchange', openFragmentTarget);

    document.addEventListener('click', (e) => {
        const item = e.target.closest?.('fluent-accordion-item[id]');
        if (!item || !e.composedPath().some((el) => el.part?.contains('button'))) {
            return;
        }
        // Expanded state flips after the click handler; read it on the next frame.
        requestAnimationFrame(() => {
            if (item.expanded) {
                history.replaceState(null, '', `#${item.id}`);
            }
        });
    });
}

// Lightbox: any link to an image inside [data-lightbox] opens in a Fluent dialog -----------

function initLightbox() {
    const dialog = document.getElementById('lightbox');
    if (!dialog) {
        return;
    }
    const img = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    const navButtons = dialog.querySelectorAll('.lightbox-nav');
    let group = [];
    let index = 0;

    const show = (i) => {
        index = (i + group.length) % group.length;
        const link = group[index];
        const label = link.dataset.caption || link.querySelector('img')?.alt || '';
        img.src = link.href;
        img.alt = label;
        caption.textContent = label;
        caption.hidden = !label;
    };

    document.addEventListener('click', (e) => {
        const link = e.target.closest?.('[data-lightbox] a[href]');
        if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
            return;
        }
        e.preventDefault();
        group = [...link.closest('[data-lightbox]').querySelectorAll('a[href]')]
            .filter((a) => !a.closest('[data-lightbox-ignore]'));
        navButtons.forEach((b) => (b.hidden = group.length < 2));
        show(group.indexOf(link));
        dialog.show();
    });

    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.hide());
    dialog.querySelector('.lightbox-nav.prev').addEventListener('click', () => show(index - 1));
    dialog.querySelector('.lightbox-nav.next').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('keydown', (e) => {
        if (group.length < 2) {
            return;
        }
        if (e.key === 'ArrowLeft') {
            show(index - 1);
        } else if (e.key === 'ArrowRight') {
            show(index + 1);
        }
    });
}

// Carousels: scroll-snap track with previous/next buttons ---------------------------------

function initCarousels() {
    for (const carousel of document.querySelectorAll('.carousel')) {
        const track = carousel.querySelector('.carousel-track');
        const step = (dir) => {
            const item = track.firstElementChild;
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            const width = item ? item.getBoundingClientRect().width + gap : track.clientWidth;
            const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
            if (dir > 0 && atEnd) {
                track.scrollTo({ left: 0 });
            } else if (dir < 0 && track.scrollLeft <= 0) {
                track.scrollTo({ left: track.scrollWidth });
            } else {
                track.scrollBy({ left: dir * width });
            }
        };
        carousel.querySelector('.carousel-nav.prev')?.addEventListener('click', () => step(-1));
        carousel.querySelector('.carousel-nav.next')?.addEventListener('click', () => step(1));

        if (carousel.hasAttribute('data-autoplay') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            let paused = false;
            carousel.addEventListener('pointerenter', () => (paused = true));
            carousel.addEventListener('pointerleave', () => (paused = false));
            carousel.addEventListener('focusin', () => (paused = true));
            carousel.addEventListener('focusout', () => (paused = false));
            setInterval(() => !paused && !document.hidden && step(1), 6000);
        }
    }
}

// Tooltips: <fluent-tooltip> needs an anchor id; wire up [data-tooltip] declaratively ------

function initTooltips() {
    let n = 0;
    for (const el of document.querySelectorAll('[data-tooltip]')) {
        el.id ||= `tooltip-anchor-${++n}`;
        const tip = document.createElement('fluent-tooltip');
        tip.setAttribute('anchor', el.id);
        tip.textContent = el.dataset.tooltip;
        el.after(tip);
    }
}

// User Guide: collapse the chapter list on small screens, highlight the section in view -----

function initGuideNav() {
    const nav = document.querySelector('.guide-nav');
    if (!nav) {
        return;
    }
    if (matchMedia('(max-width: 959px)').matches) {
        nav.querySelector('details')?.removeAttribute('open');
    }

    const links = new Map([...nav.querySelectorAll('.guide-nav-sections a')]
        .map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const headings = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    if (!headings.length) {
        return;
    }
    const update = () => {
        // The current section is the last heading scrolled past the top third of the viewport
        const line = window.innerHeight / 3;
        let current = null;
        for (const h of headings) {
            if (h.getBoundingClientRect().top <= line) {
                current = h;
            }
        }
        for (const [id, a] of links) {
            a.toggleAttribute('aria-current', current?.id === id);
        }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
}

function init() {
    initHeader();
    initNavDrawer();
    initAccordions();
    initLightbox();
    initCarousels();
    initTooltips();
    initCopyable();
    initGuideNav();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

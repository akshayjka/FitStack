
/* ==========================================================
   FITSTACK - Main Frontend JavaScript
   Products, blogs, enquiries, navigation and animations
========================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

/* -------------------- API HELPER -------------------- */

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

/* -------------------- HTML ESCAPING -------------------- */

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[char]);
}

/* -------------------- DEFAULT IMAGES -------------------- */

const fallbackImages = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80'
];

function fallbackImage(index = 0) {
  return fallbackImages[index % fallbackImages.length];
}

/*
  Supports absolute URLs and local Express static paths.

  Examples:
  uploads/product.jpg       -> /uploads/product.jpg
  /uploads/product.jpg      -> /uploads/product.jpg
  https://example.com/a.jpg -> unchanged
*/
function mediaUrl(value) {
  if (!value || typeof value !== 'string') return '';

  const url = value.trim();

  if (/^(https?:\/\/|data:image\/)/i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return url;
  }

  return '/' + url.replace(/^\.?\//, '');
}

/* -------------------- SAFE IMAGE HTML -------------------- */

function imageMarkup(source, alt, index = 0) {
  const image = mediaUrl(source) || fallbackImage(index);

  return `
    <img
      src="${esc(image)}"
      alt="${esc(alt || 'FITSTACK product')}"
      loading="lazy"
      onerror="this.onerror=null;this.src='${fallbackImage(index)}';"
    >
  `;
}

/* -------------------- STATIC DEMO CARD -------------------- */

/*
  This demo is intentionally rendered inside productsGrid.
  Do not add another static simulator card in index.html.
  This prevents duplicate demo cards.
*/

function demoProductCard() {
  return `
    <article class="product-card simulator-product reveal">

      <div class="product-media">
        ${imageMarkup(
          fallbackImage(0),
          'Fitness CRM Workflow Simulator',
          0
        )}

        <span class="product-tag">INTERACTIVE DEMO</span>
      </div>

      <div class="product-body">

        <span class="eyebrow">FITNESS MANAGEMENT</span>

        <h3>Fitness CRM Workflow Simulator</h3>

        <p>
          Explore member management, attendance, classes
          and payments in an interactive fitness CRM demo.
        </p>

        <div class="product-actions">
          <a
            class="button button-sm"
            href="/prod-vid/fitness_crm_workflow_simulator.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Live Demo →
          </a>
        </div>

      </div>
    </article>
  `;
}

/* -------------------- PRODUCT CARD -------------------- */

function productCard(product, index) {
  const title = product.title || 'Untitled Product';

  const imageSource =
    product.imageUrl ||
    product.image ||
    product.imagePath ||
    product.featuredImage ||
    '';

  const videoFile = mediaUrl(
    product.videoFile || product.videoPath || ''
  );

  const videoUrl = mediaUrl(product.videoUrl || '');
  const demoUrl = mediaUrl(product.demoUrl || '');

  const media = videoFile
    ? `
      <video
        src="${esc(videoFile)}"
        controls
        muted
        playsinline
        preload="metadata"
        poster="${esc(mediaUrl(imageSource) || fallbackImage(index))}"
      ></video>
    `
    : imageMarkup(imageSource, title, index);

  return `
    <article class="product-card dynamic-product reveal">

      <div class="product-media">

        ${media}

        <span class="product-tag">
          ${esc(product.category || 'FITNESS SOFTWARE')}
        </span>

      </div>

      <div class="product-body">

        <h3>${esc(title)}</h3>

        <p>${esc(product.description || '')}</p>

        <div class="product-actions">

          ${
            demoUrl
              ? `
                <a
                  class="button button-sm"
                  href="${esc(demoUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Demo →
                </a>
              `
              : ''
          }

          ${
            videoUrl
              ? `
                <a
                  class="text-link"
                  href="${esc(videoUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Video ↗
                </a>
              `
              : ''
          }

          ${
            product.price
              ? `<span class="price">${esc(product.price)}</span>`
              : ''
          }

        </div>

      </div>

    </article>
  `;
}

/* -------------------- LOAD PRODUCTS -------------------- */

async function loadProducts() {
  const grid = $('#productsGrid');

  if (!grid) return;

  /*
    Preserve the demo card while rendering database products.
    If index.html contains an old demo card, remove it there.
  */

  grid.innerHTML = `
    ${demoProductCard()}
    <div class="loading-card">Loading products…</div>
  `;

  try {
    const result = await api('/api/products');

    const products = Array.isArray(result)
      ? result
      : (result.products || []);

    /*
      Remove duplicate database entries with the same title.
      Keep the first occurrence. Products with different titles
      are preserved.
    */

    const seenTitles = new Set();

    const uniqueProducts = products.filter(product => {
      const title = String(product.title || '')
        .trim()
        .toLowerCase();

      if (!title) return true;

      if (seenTitles.has(title)) return false;

      seenTitles.add(title);
      return true;
    });

    /*
      Replace only the loading placeholder.
      The demo remains in the same shared grid.
    */

    const loadingCard = grid.querySelector('.loading-card');

    if (loadingCard) {
      loadingCard.remove();
    }

    if (uniqueProducts.length) {
      grid.insertAdjacentHTML(
        'beforeend',
        uniqueProducts
          .map((product, index) => productCard(product, index + 1))
          .join('')
      );
    } else {
      grid.insertAdjacentHTML(
        'beforeend',
        `
          <div class="loading-card">
            More products are coming soon.
          </div>
        `
      );
    }

    initReveal();

  } catch (error) {
    console.error('Failed to load products:', error);

    const loadingCard = grid.querySelector('.loading-card');

    if (loadingCard) {
      loadingCard.textContent =
        'Unable to load additional products. Please try again later.';
    } else {
      grid.insertAdjacentHTML(
        'beforeend',
        `
          <div class="loading-card">
            Unable to load additional products. Please try again later.
          </div>
        `
      );
    }
  }
}

/* -------------------- BLOG CARD -------------------- */

function blogCard(post, index = 0) {
  const image =
    post.featuredImage ||
    fallbackImage((index + 1) % fallbackImages.length);

  const date = post.publicationDate
    ? new Date(post.publicationDate).toLocaleDateString()
    : '';

  const content = post.content || '';

  return `
    <article class="blog-card reveal">

      ${imageMarkup(image, post.title, index + 1)}

      <div>

        <small>${esc(date)}</small>

        <h3>${esc(post.title || 'Untitled Article')}</h3>

        <p>
          ${esc(content.slice(0, 145))}
          ${content.length > 145 ? '…' : ''}
        </p>

        <a
          class="text-link"
          href="/blog#${encodeURIComponent(post.slug || '')}"
        >
          Read Article →
        </a>

      </div>

    </article>
  `;
}

/* -------------------- LOAD HOME PAGE -------------------- */

async function loadHome() {
  await Promise.all([
    loadProducts(),
    loadHomeBlogs()
  ]);
}

async function loadHomeBlogs() {
  const grid = $('#blogGrid');

  if (!grid) return;

  try {
    const result = await api('/api/blogs');

    const posts = Array.isArray(result)
      ? result
      : (result.posts || []);

    grid.innerHTML = posts.length
      ? posts.slice(0, 3).map(blogCard).join('')
      : `
        <div class="loading-card">
          Publish your first article from the admin panel.
        </div>
      `;

    initReveal();

  } catch (error) {
    console.error('Failed to load blog posts:', error);

    grid.innerHTML = `
      <div class="loading-card">
        Unable to load blog posts.
      </div>
    `;
  }
}

/* -------------------- BLOG READER -------------------- */

async function loadBlog() {
  const grid = $('#blogGrid');

  if (!grid) return;

  try {
    const result = await api('/api/blogs');

    const posts = Array.isArray(result)
      ? result
      : (result.posts || []);

    const selectedSlug = location.hash
      ? decodeURIComponent(location.hash.slice(1))
      : '';

    if (selectedSlug) {
      const post = posts.find(
        item => item.slug === selectedSlug
      );

      if (post) {
        const image = post.featuredImage
          ? `
            <img
              class="article-image"
              src="${esc(mediaUrl(post.featuredImage))}"
              alt="${esc(post.title)}"
              onerror="this.style.display='none'"
            >
          `
          : '';

        grid.innerHTML = `
          <article class="article reveal visible">

            <a class="text-link" href="/blog">
              ← All Posts
            </a>

            <h1>${esc(post.title)}</h1>

            <div class="article-meta">
              By ${esc(post.author || 'FITSTACK')}
              ·
              ${
                post.publicationDate
                  ? esc(new Date(post.publicationDate).toLocaleDateString())
                  : ''
              }
            </div>

            ${image}

            <div class="article-content">
              ${esc(post.content || '').replace(/\n/g, '<br>')}
            </div>

          </article>
        `;

        return;
      }
    }

    grid.innerHTML = posts.length
      ? posts.map(blogCard).join('')
      : `
        <div class="loading-card">
          No articles published yet.
        </div>
      `;

    initReveal();

  } catch (error) {
    console.error('Failed to load blog:', error);

    grid.innerHTML = `
      <div class="loading-card">
        Unable to load articles.
      </div>
    `;
  }
}

/* -------------------- ENQUIRY FORM -------------------- */

function setupEnquiry() {
  const form = $('#enquiryForm');

  if (!form) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const status = $('#formStatus');

    if (!button || !status) return;

    button.disabled = true;
    status.textContent = 'Sending…';

    try {
      await api('/api/enquiries', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(
          Object.fromEntries(new FormData(form))
        )
      });

      form.reset();

      status.textContent =
        'Thank you! We received your enquiry.';

    } catch (error) {
      status.textContent =
        error.message || 'Unable to send your enquiry.';
    } finally {
      button.disabled = false;
    }
  });
}

/* -------------------- SCROLL REVEAL ANIMATIONS -------------------- */

function initReveal() {
  const items = $$('.reveal:not(.visible)');

  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12
  });

  items.forEach(item => observer.observe(item));
}

/* -------------------- MOBILE NAVIGATION -------------------- */

function initMenu() {
  const toggle = $('#menuToggle');
  const nav = $('#mainNav');

  if (!toggle || !nav) return;

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');

    toggle.setAttribute(
      'aria-expanded',
      String(isOpen)
    );
  });

  $$('#mainNav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* -------------------- INITIALIZATION -------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  setupEnquiry();
  initReveal();

  if (location.pathname === '/') {
    loadHome().catch(error => {
      console.error('Home page initialization failed:', error);
    });
  }

  if (location.pathname.replace(/\/+$/, '') === '/blog') {
    loadBlog().catch(error => {
      console.error('Blog initialization failed:', error);
    });
  }
});

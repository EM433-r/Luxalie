/* ============================================================
   LUXALIE — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. STICKY HEADER
  ---------------------------------------------------------- */
  const header = document.getElementById('site-header') || document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     2. MOBILE DRAWER
  ---------------------------------------------------------- */
  const hamburgerBtn    = document.getElementById('hamburgerBtn');
  const drawer          = document.getElementById('mobileDrawer');
  const drawerOverlay   = document.getElementById('drawerOverlay');
  const drawerCloseBtn  = document.getElementById('drawerCloseBtn');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawerOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    document.body.style.overflow = '';
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn?.addEventListener('click', openDrawer);
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  // Close drawer with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ----------------------------------------------------------
     3. SCROLL REVEAL — IntersectionObserver
  ---------------------------------------------------------- */
  const revealSelectors = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right';
  const revealEls = document.querySelectorAll(revealSelectors);

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     4. PRODUCT GALLERY — Thumbnail click → change main image
  ---------------------------------------------------------- */
  function initGallery(thumbsId, mainImgId) {
    const thumbsContainer = document.getElementById(thumbsId);
    const mainImg         = document.getElementById(mainImgId);
    if (!thumbsContainer || !mainImg) return;

    const thumbs = thumbsContainer.querySelectorAll('.fp-gallery__thumb');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.dataset.src;
        if (!newSrc) return;

        // Fade transition
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = newSrc;
          mainImg.style.opacity = '1';
        }, 160);

        // Active state
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  initGallery('serumThumbs', 'serumMainImg');
  initGallery('styloThumbs', 'styloMainImg');

  // Also handle galleries on product pages (different structure)
  document.querySelectorAll('.product-gallery').forEach(gallery => {
    const mainImg = gallery.querySelector('.product-gallery__main img');
    const thumbs  = gallery.querySelectorAll('.product-gallery__thumb');
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.dataset.src;
        if (!newSrc) return;
        mainImg.style.opacity = '0';
        setTimeout(() => { mainImg.src = newSrc; mainImg.style.opacity = '1'; }, 160);
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  });

  /* ----------------------------------------------------------
     5. VARIANT CARDS — Click to select
  ---------------------------------------------------------- */
  document.querySelectorAll('.variant-cards').forEach(container => {
    const cards = container.querySelectorAll('.variant-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  });

  /* ----------------------------------------------------------
     6. REVIEWS SLIDER (mobile only)
  ---------------------------------------------------------- */
  const reviewsGrid = document.getElementById('reviewsGrid');
  const prevBtn     = document.getElementById('reviewPrev');
  const nextBtn     = document.getElementById('reviewNext');

  if (reviewsGrid && prevBtn && nextBtn) {
    let current = 0;
    const getCards = () => reviewsGrid.querySelectorAll('.review-card');

    function updateSlider() {
      if (window.innerWidth >= 750) {
        reviewsGrid.style.transform = '';
        return;
      }
      const cards = getCards();
      const total = cards.length;
      if (!total) return;
      current = Math.max(0, Math.min(current, total - 1));
      reviewsGrid.style.transform = `translateX(${-current * 100}%)`;
    }

    prevBtn.addEventListener('click', () => {
      const total = getCards().length;
      current = (current - 1 + total) % total;
      updateSlider();
    });

    nextBtn.addEventListener('click', () => {
      const total = getCards().length;
      current = (current + 1) % total;
      updateSlider();
    });

    updateSlider();
    window.addEventListener('resize', updateSlider, { passive: true });
  }

  /* ----------------------------------------------------------
     7. SMOOTH IMAGE LOAD
  ---------------------------------------------------------- */
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.35s';
      img.addEventListener('load',  () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '0.3'; });
    }
  });

  /* ----------------------------------------------------------
     8. PRODUCT PAGE — Quantity selector
  ---------------------------------------------------------- */
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus  = document.querySelector('.qty-plus');
  const qtyInput = document.querySelector('.qty-input');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10);
      qtyInput.value = val + 1;
    });
  }

  /* ----------------------------------------------------------
     9. CART — localStorage
  ---------------------------------------------------------- */
  const CART_KEY = 'luxalie_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    saveCart(cart);
    updateCartCount();
  }

  function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    });
  }

  // Wire up "Commander maintenant"
  const addToCartBtn = document.querySelector('.btn-add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const activeCard  = document.querySelector('.variant-card.active');
      const title       = document.querySelector('.fp-info__title')?.textContent?.trim() || '';
      const mainImg     = document.querySelector('.fp-gallery__main img')?.src || '';
      const variantName = activeCard?.querySelector('.variant-card__name')?.textContent?.trim() || '';
      const price       = activeCard?.dataset?.price || '';
      const slug        = window.location.pathname.split('/').pop().replace('.html', '');

      addToCart({ id: slug + '-' + variantName.replace(/\s+/g, '-').toLowerCase(), name: title, variant: variantName, price, img: mainImg });
      window.location.href = '../cart.html';
    });
  }

  // Wire up upsell "Ajouter" button
  const upsellBtn = document.querySelector('.fp-upsell__btn');
  if (upsellBtn) {
    upsellBtn.addEventListener('click', () => {
      const upsell  = upsellBtn.closest('.fp-upsell');
      const name    = upsell?.querySelector('.fp-upsell__name')?.textContent?.trim() || '';
      const priceEl = upsell?.querySelector('.fp-upsell__price');
      // First text node before any <s> tag
      const price   = priceEl?.childNodes[0]?.textContent?.trim() || '';
      const img     = upsell?.querySelector('.fp-upsell__img img')?.src || '';
      const id      = 'upsell-' + name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      addToCart({ id, name, variant: '', price, img });

      upsellBtn.textContent = '✓ Ajouté';
      upsellBtn.style.cssText = 'background:var(--brown);color:var(--white);border-color:var(--brown)';
      setTimeout(() => {
        upsellBtn.textContent = 'Ajouter';
        upsellBtn.style.cssText = '';
      }, 2000);
    });
  }

  // Init cart count on every page
  updateCartCount();

});

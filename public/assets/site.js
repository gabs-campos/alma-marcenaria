(function () {
  'use strict';

  function initAdminSidebar() {
    var body = document.body;
    if (!body || !body.classList.contains('admin')) {
      return;
    }

    var toggleButton = document.querySelector('[data-admin-sidebar-toggle]');
    if (!toggleButton) {
      return;
    }

    var storageKey = 'adminSidebarCollapsed';
    var isCollapsed = false;

    try {
      isCollapsed = window.localStorage.getItem(storageKey) === '1';
    } catch (error) {
      isCollapsed = false;
    }

    function applyState(collapsed) {
      body.classList.toggle('sidebar-collapsed', collapsed);
      toggleButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggleButton.setAttribute('aria-label', collapsed ? 'Expandir menu' : 'Colapsar menu');
    }

    applyState(isCollapsed);

    toggleButton.addEventListener('click', function () {
      isCollapsed = !body.classList.contains('sidebar-collapsed');
      applyState(isCollapsed);
      try {
        window.localStorage.setItem(storageKey, isCollapsed ? '1' : '0');
      } catch (error) {
        // Ignora erro de storage em ambientes restritos.
      }
    });
  }

  initAdminSidebar();

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('reveal-visible');
    });
    return;
  }

  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('reveal-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var mainImage = gallery.querySelector('[data-gallery-main]');
    var thumbs = gallery.querySelectorAll('[data-gallery-thumb]');

    if (!mainImage || thumbs.length === 0) {
      return;
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-image-src');
        if (!src) {
          return;
        }

        mainImage.setAttribute('src', src);
        thumbs.forEach(function (item) {
          item.classList.remove('is-active');
        });
        thumb.classList.add('is-active');
      });
    });
  });
})();

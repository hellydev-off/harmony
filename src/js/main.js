(function ($) {
  'use strict';

  // ─── List pagination ────────────────────────────────────────────────────────
  // listSel   – selector for the items wrapper (.news-list / .reviews-list)
  // itemSel   – selector for each item inside the wrapper
  // perPage   – items per page
  function initPagination(listSel, itemSel, perPage) {
    var list = document.querySelector(listSel);
    if (!list) return;

    var footer  = list.parentNode.querySelector('.list-footer');
    if (!footer) return;

    var items   = [].slice.call(list.querySelectorAll(itemSel));
    if (!items.length) return;

    var total   = Math.ceil(items.length / perPage);
    var cur     = 1;
    var cumul   = false; // true while in "show more" (append) mode

    var btnMore = footer.querySelector('.btn-show-more');
    var pgNav   = footer.querySelector('.pg');

    var prevSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    var nextSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="9 18 15 12 9 6"></polyline></svg>';

    // Determine which page numbers to show in the nav
    function pageNums(active, last) {
      if (last <= 7) {
        return Array.from({length: last}, function (_, i) { return i + 1; });
      }
      if (active <= 4)         return [1, 2, 3, 4, 5, '…', last];
      if (active >= last - 3)  return [1, '…', last - 4, last - 3, last - 2, last - 1, last];
      return [1, '…', active - 1, active, active + 1, '…', last];
    }

    // Render item visibility
    function renderItems(page, append) {
      var from = append ? 0 : (page - 1) * perPage;
      var to   = page * perPage;
      items.forEach(function (el, i) {
        el.style.display = (i >= from && i < to) ? '' : 'none';
      });
    }

    // Rebuild pagination nav and bind its events
    function buildPg(active) {
      var html = '<a href="#" class="pg__item" aria-label="Назад" data-dir="-1">' + prevSVG + '</a>';

      pageNums(active, total).forEach(function (p) {
        if (p === '…') {
          html += '<span class="pg__item pg__item--dots">…</span>';
        } else {
          html += '<a href="#" class="pg__item' + (p === active ? ' pg__item--active' : '') +
                  '" data-pg="' + p + '">' + p + '</a>';
        }
      });

      html += '<a href="#" class="pg__item pg__item--filled" aria-label="Вперёд" data-dir="1">' + nextSVG + '</a>';

      pgNav.innerHTML = html;

      pgNav.querySelectorAll('[data-pg]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          goTo(+this.getAttribute('data-pg'), false);
        });
      });

      pgNav.querySelectorAll('[data-dir]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var next = cur + (+this.getAttribute('data-dir'));
          if (next >= 1 && next <= total) goTo(next, false);
        });
      });
    }

    // Navigate to a page
    function goTo(page, append) {
      cur   = page;
      cumul = append;
      renderItems(page, append);
      buildPg(page);
      syncMore();
      if (!append) {
        var top = list.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
      }
    }

    // Keep "Показать еще" in sync
    function syncMore() {
      if (!btnMore) return;
      btnMore.style.display = cur >= total ? 'none' : '';
    }

    if (btnMore) {
      btnMore.addEventListener('click', function (e) {
        e.preventDefault();
        if (cur < total) goTo(cur + 1, true);
      });
    }

    // Single-page edge case – hide controls
    if (total === 1) {
      if (pgNav)   pgNav.style.display   = 'none';
      if (btnMore) btnMore.style.display = 'none';
      return;
    }

    goTo(1, false);
  }

  // ─── Mobile menu (burger) ─────────────────────────────────────────────────────
  function initMobileMenu() {
    var burger  = document.getElementById('headerBurger');
    var menu    = document.getElementById('mobileMenu');
    var overlay = document.getElementById('mobileMenuOverlay');
    if (!burger || !menu) return;

    function open() {
      burger.classList.add('is-open');
      menu.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      burger.classList.remove('is-open');
      menu.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function () {
      if (menu.classList.contains('is-open')) close(); else open();
    });

    if (overlay) overlay.addEventListener('click', close);

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992) close();
    });
  }

  $(document).ready(function () {
    console.log('Harmony theme ready');

    initMobileMenu();

    // Doctor card → profile page navigation
    $(document).on('click', '[data-doctor-name]', function (e) {
      e.preventDefault();
      var name  = $(this).data('doctor-name');
      var photo = $(this).data('doctor-photo') || '';
      window.location.href =
        'doctor-profile.html?name=' + encodeURIComponent(name) +
        '&photo=' + encodeURIComponent(photo);
    });

    // Paginate news list (8 per page)
    initPagination('.news-list', '.news-list-item', 8);

    // Paginate reviews list (4 per page)
    initPagination('.reviews-list', '.review-card', 4);

    // Paginate encyclopedia grid (8 per page)
    initPagination('.enc-grid', '.enc-card', 8);
  });

}(jQuery));

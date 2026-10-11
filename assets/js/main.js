//   <!-- Navbar -->
  (async function () {
    try {
      const res = await fetch('navbar.html', { cache: 'no-cache' });
      const html = await res.text();
      const placeholder = document.getElementById('navbar-placeholder');
      placeholder.innerHTML = html;
      syncMobileMenu();  
      setActiveLinks();
      enableMobileDropdownClicks();
      setActiveMenu();
      initMobileSidebar();
      const topbar = document.querySelector('.topbar-drubbix');
      const nav    = document.querySelector('.nav-drubbix');
      let spacer   = document.querySelector('.topbar-spacer');

      if (!spacer && nav) {
        spacer = document.createElement('div');
        spacer.className = 'topbar-spacer';
        nav.insertAdjacentElement('afterend', spacer);
      }
      const root = document.documentElement;

      function applyHeights() {
        const topH = topbar ? topbar.offsetHeight : 0;
        const navH = nav ? nav.offsetHeight : 0;
        root.style.setProperty('--topbar-h', topH + 'px');
        root.style.setProperty('--nav-h', navH + 'px');

        const hidden = topbar?.classList.contains('is-hidden');
        root.style.setProperty('--nav-top', hidden ? '0px' : topH + 'px');
      }

      let lastY = window.scrollY;
      function onScroll() {
        const y = window.scrollY;
        const nearTop = y < 50;

        if (!topbar) return;

        if (y > lastY && y > 100 && !nearTop) {
          topbar.classList.add('is-hidden');
        } else {
          topbar.classList.remove('is-hidden');
        }
        applyHeights();
        lastY = y;
      }

      const ro = new ResizeObserver(applyHeights);
      if (topbar) ro.observe(topbar);
      if (nav)    ro.observe(nav);
      applyHeights();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', applyHeights);
    } catch (e) {
      console.error('Gagal memuat navbar:', e);
    }
  })();

    document.addEventListener('DOMContentLoaded', () => {
      const attachDropdownClick = () => {
        const layanan = document.querySelector('.nav-center .has-dropdown');
        if (!layanan) return;

        const trigger = layanan.querySelector('.nav-link');

        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          layanan.classList.toggle('open');
        });

        // Klik di luar → tutup
        document.addEventListener('click', (e) => {
          if (!layanan.contains(e.target)) {
            layanan.classList.remove('open');
          }
        });

        // Tekan Escape → tutup
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            layanan.classList.remove('open');
          }
        });
      };

      const checkNav = setInterval(() => {
        if (document.querySelector('.nav-center .has-dropdown')) {
          clearInterval(checkNav);
          attachDropdownClick();
        }
      }, 100);
    });
  
    function enableMobileDropdownClicks(){
      const menu = document.getElementById('mobileMenu');
      if (!menu) return;

      // Satu listener untuk seluruh menu
      menu.addEventListener('click', (e) => {
        // cari trigger dropdown (klik pada teks/caret tetap ketangkap)
        const trigger = e.target.closest('.has-dropdown > .nav-link');
        if (!trigger || !menu.contains(trigger)) return;

        // cegah navigasi & bubbling ke handler penutup
        e.preventDefault();
        e.stopPropagation();

        const parent = trigger.closest('.has-dropdown');
        parent?.classList.toggle('open');
      });
    }

    // panggil SETELAH navbar.html diinsert ke DOM
    function initMobileSidebar(){
      const nav     = document.querySelector('.nav-drubbix');
      const toggle  = document.getElementById('navToggle');
      const panel   = document.getElementById('mobileMenu');
      const overlay = document.getElementById('navOverlay'); // lihat poin #2
      const btnClose = document.getElementById('navClose'); // tombol X

      if (!nav || !toggle || !panel || !overlay) return;

      const open = () => {
        nav.classList.add('is-open');
        panel.hidden = false;
        if (overlay) overlay.hidden = false;
        toggle.setAttribute('aria-expanded','true');
      };
      const close = () => {
      nav.classList.remove('is-open');
      panel.hidden = true;                // <-- tadinya false, ubah ke true
      if (overlay) overlay.hidden = true;
      toggle.setAttribute('aria-expanded','false');
    };

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        nav.classList.contains('is-open') ? close() : open();
      });
      overlay.addEventListener('click', close);
      if (btnClose) btnClose.addEventListener('click', close);

      // klik link biasa → tutup; klik trigger dropdown → JANGAN tutup
      panel.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const isDropdownTrigger =
          link.classList.contains('nav-link') &&
          link.closest('.has-dropdown') &&
          !link.classList.contains('dd-link');

        if (isDropdownTrigger) return; // biarkan dropdown toggle di handler atas

        // link biasa / item submenu → boleh tutup
        close();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });


      // Tutup menu otomatis saat kembali ke desktop
      const mq = window.matchMedia('(min-width: 901px)');
      const handleViewport = () => {
        if (mq.matches) {             
          nav.classList.remove('is-open');
          panel.hidden = true;
          if (overlay) overlay.hidden = true;
        }
      };
      handleViewport();
      mq.addEventListener('change', handleViewport);
    }


// --- SALIN MENU DESKTOP KE MOBILE ---
    function syncMobileMenu(){
      const desktopMenu = document.querySelector('.nav-center');                 // sumber (desktop)
      const mobileLinks = document.querySelector('#mobileMenu .mobile-links');   // target (mobile)

      if (!desktopMenu || !mobileLinks) return;

      mobileLinks.innerHTML = '';

      [...desktopMenu.children].forEach((item) => {
        const clone = item.cloneNode(true);
        mobileLinks.appendChild(clone);
      });
    }

// === HIGHLIGHT ACTIVE NAV (desktop & mobile) ===
function setActiveLinks() {
  // Normalisasi path saat ini
  let path = location.pathname.toLowerCase().replace(/\/+$/, '');
  if (path === '' || path === '/') path = '/beranda';

  // Peta simplifikasi beberapa URL jadi key yang konsisten
  const alias = new Map([
    ['/index.html', '/beranda'],
    ['/home', '/beranda'],
  ]);
  if (alias.has(path)) path = alias.get(path);

  // Ambil key terakhir (mis. "/tentang-kami" -> "tentang-kami")
  const key = path.split('/').filter(Boolean).pop(); // "beranda", "blog", "produk", "pengangkutan", "tentang-kami"

  const selectors = [
    `.nav-drubbix a.nav-link[href="${key}"]`,
    `.nav-drubbix a.nav-link[href="/${key}"]`,
    `.nav-drubbix .dd-link[href="${key}"]`,
    `.nav-drubbix .dd-link[href="/${key}"]`,
  ];

  // Bersihkan state lama
  document
    .querySelectorAll('.nav-drubbix .nav-link.active, .nav-drubbix .dd-link.active')
    .forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-drubbix .has-dropdown.open')
    .forEach(dd => dd.classList.remove('open'));

  // Tandai link yang cocok
  const matched = new Set();
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('active');
      matched.add(el);
    });
  });

  // Jika yang aktif adalah item dropdown (produk/pengangkutan), tandai parent "Layanan"
  matched.forEach(el => {
    const parentDD = el.closest('.has-dropdown');
    if (parentDD) {
      parentDD.querySelector('.nav-link')?.classList.add('active');
      // Di sidebar mobile, sekalian buka panelnya biar terlihat
      if (window.matchMedia('(max-width: 900px)').matches) {
        parentDD.classList.add('open');
      }
    }
  });
}

function setActiveMenu() {
  const current = location.pathname.replace(/\/+$/, '').split('/').pop() || 'beranda';

  // Bersihkan active lama
  document.querySelectorAll('.nav-link.active, .dd-link.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.has-dropdown.open').forEach(el => el.classList.remove('open'));

  // Cari link sesuai halaman
  const match = document.querySelectorAll(`.nav-link[href="${current}"], .dd-link[href="${current}"]`);
  match.forEach(el => {
    el.classList.add('active');

    // Kalau ini submenu, aktifkan juga parent 'Layanan'
    if (el.classList.contains('dd-link')) {
      const parentDD = el.closest('.has-dropdown');
      if (parentDD) {
        parentDD.querySelector('.nav-link').classList.add('active');
        parentDD.classList.add('open'); // supaya dropdown terbuka
      }
    }
  });
}

// Panggil setelah menu desktop & mobile sinkron
syncMobileMenu();
enableMobileDropdownClicks();
setActiveMenu();



// Jaga-jaga: jika user klik link (SPA/halaman tanpa reload), re-apply
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-drubbix a.nav-link, .nav-drubbix .dd-link');
  if (!link) return;
  // beri waktu DOM close/open menu, lalu set active lagi
  requestAnimationFrame(setActiveLinks);
});

//   <!-- Zoom-in Images -->
// --- Zoom-in Images (aman jika modal/produk tidak ada) ---
  document.addEventListener('DOMContentLoaded', () => {
    const modal    = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal__img');
    const closeBtn = document.querySelector('.image-modal__close');

    // Kalau halaman ini tidak punya modal, jangan lanjut.
    if (!modal || !modalImg || !closeBtn) return;

    let lastFocusEl = null;

    // event delegation untuk semua tombol zoom
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('.zoom-btn');
      if (!btn) return;

      const card = btn.closest('.product-card');
      const img  = card?.querySelector('.product-image');
      if (!img) return;

      lastFocusEl = document.activeElement;       // simpan fokus sebelumnya
      modalImg.src = img.src;
      modal.classList.add('open');
      modal.removeAttribute('aria-hidden');       // buka aksesibilitas
      closeBtn.focus();                           // arahkan fokus ke tombol close
    });

  function closeModal(){
    // lepaskan fokus dari tombol sebelum aria-hidden untuk menghindari warning
    closeBtn.blur();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';

    // kembalikan fokus ke elemen pemicu (kalau ada)
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
      lastFocusEl.focus();
    }
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});
  
//   <!-- Testimonials-Slider -->
  (function () {
      try {
        const slider  = document.getElementById('testiSlider');
        const dotsWrap = document.getElementById('testiDots');
        if (!slider || !dotsWrap) return; // <-- keluar diam-diam jika section tidak ada

        const track  = slider.querySelector('.testi-track');
        if (!track) return;

        const slides = Array.from(track.children);
        // buat dots
        dotsWrap.innerHTML = '';
        slides.forEach((_, i) => {
          const d = document.createElement('span');
          d.className = 'dot' + (i === 0 ? ' active' : '');
          d.dataset.index = i;
          dotsWrap.appendChild(d);
        });

        let idx = 0, timer;
        const to = (i) => {
          idx = (i + slides.length) % slides.length;
          track.style.transform = `translateX(-${idx * 100}%)`;
          dotsWrap.querySelectorAll('.dot').forEach((el, j) => {
            el.classList.toggle('active', j === idx);
          });
        };

        dotsWrap.addEventListener('click', (e) => {
          const d = e.target.closest('.dot');
          if (!d) return;
          to(+d.dataset.index);
          restart();
        });

        function next()    { to(idx + 1); }
        function start()   { timer = setInterval(next, 5000); }
        function stop()    { clearInterval(timer); }
        function restart() { stop(); start(); }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
      } catch (err) {
        console.error('Testimonial init error:', err);
      }
    })();
  
//   <!-- Load external footer -->
    (function loadFooter(){
      const mount = document.getElementById('footer');
      if (!mount) return;
      fetch('footer.html', { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
          return res.text();
        })
        .then(html => { mount.innerHTML = html; })
        .catch(err => console.error('Gagal memuat footer:', err));
    })();

  

//   <!-- input form pesan  -->
document.addEventListener('DOMContentLoaded', () => {
  const tgl    = document.getElementById('hf-tanggal'); 
  const waktu  = document.getElementById('hf-waktu');   
  const form   = document.getElementById('heroForm');
  const nama   = document.getElementById('hf-nama');
  const nomor  = document.getElementById('hf-nomor');
  const lokasi = document.getElementById('hf-lokasi');

  if (tgl) {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    tgl.min = today;
  }

  function attachPickerOpen(el){
    if (!el) return;
    el.addEventListener('click', () => {
      if (typeof el.showPicker === 'function') { try { el.showPicker(); } catch {} }
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof el.showPicker === 'function') { try { el.showPicker(); } catch {} }
      }
    });
  }
  attachPickerOpen(tgl);
  attachPickerOpen(waktu);

  const WA_TARGET = '6282298848072';

  // <-- TAMBAHKAN GUARD INI
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!nama.value.trim() || !nomor.value.trim()){
      alert('Nama dan Nomor wajib diisi.');
      return;
    }
    const formatTanggal = (val) => {
      if (!val) return '-';
      const [Y,M,D] = val.split('-');
      return `${D}/${M}/${String(Y).slice(2)}`;
    };
    const formatWaktu = (val) => val || '-';

    const pesan = [
      'Halo D’Rubbix, saya ingin pesan pickup sampah.',
      '',
      `Nama   : ${nama.value.trim()}`,
      `Nomor  : ${nomor.value.trim()}`,
      `Lokasi : ${lokasi.value.trim() || '-'}`,
      `Tanggal: ${formatTanggal(tgl?.value || '')}`,
      `Waktu  : ${formatWaktu(waktu?.value || '')}`
    ].join('\n');

    const url = `https://wa.me/${WA_TARGET}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');
  });
});

  (function () {
    const buttons = document.querySelectorAll('.btn-filter');
    const cols = document.querySelectorAll('.row.g-4 > [class*="col-"]'); 
    const cards = document.querySelectorAll('.product-card[data-group]');

    function applyFilter(key){
      cards.forEach((card) => {
        const group = card.dataset.group;              
        const col = card.closest('[class*="col-"]');      
        const show = (key === 'all') || (group === key);
        col.style.display = show ? '' : 'none';
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelector('.btn-filter.active')?.classList.remove('active');
        btn.classList.add('active');
        applyFilter(btn.id); // id tombol = kunci filter
      });
    });

    applyFilter('all');
  })();

  
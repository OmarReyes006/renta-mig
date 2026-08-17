(() => {
  'use strict';

  const EVENT_DATE = new Date('2026-11-14T20:00:00-06:00');
  const body = document.body;
  const intro = document.getElementById('intro');
  const enterBtn = document.getElementById('enterExperience');
  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  const musicPlay = document.getElementById('musicPlay');
  const waveform = document.getElementById('waveform');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const demoModal = document.getElementById('demoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');

  let ytPlayer = null;
  let ytReady = false;
  let wantsSound = false;
  const YOUTUBE_VIDEO_ID = 'jNk9tM6VtKM';

  const setSoundUI = (playing) => {
    soundToggle.classList.toggle('playing', playing);
    soundToggle.setAttribute('aria-pressed', String(playing));
    soundLabel.textContent = playing ? 'SOUND ON' : 'SOUND OFF';
    musicPlay.classList.toggle('playing', playing);
    waveform.classList.toggle('playing', playing);
  };

  const playAudio = () => {
    wantsSound = true;
    if (!ytReady || !ytPlayer) return;
    try {
      ytPlayer.setVolume(28);
      ytPlayer.playVideo();
    } catch {
      setSoundUI(false);
    }
  };

  const pauseAudio = () => {
    wantsSound = false;
    if (ytReady && ytPlayer) {
      try { ytPlayer.pauseVideo(); } catch {}
    }
    setSoundUI(false);
  };

  const toggleAudio = () => {
    if (!ytReady || !ytPlayer) {
      playAudio();
      return;
    }
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) pauseAudio();
    else playAudio();
  };

  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player('youtubePlayer', {
      videoId: YOUTUBE_VIDEO_ID,
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        playsinline: 1,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID
      },
      events: {
        onReady: () => {
          ytReady = true;
          ytPlayer.setVolume(28);
          if (wantsSound) ytPlayer.playVideo();
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) setSoundUI(true);
          if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setSoundUI(false);
        },
        onError: () => {
          wantsSound = false;
          setSoundUI(false);
          soundLabel.textContent = 'SOUND ERROR';
        }
      }
    });
  };

  const ytApi = document.createElement('script');
  ytApi.src = 'https://www.youtube.com/iframe_api';
  ytApi.async = true;
  document.head.appendChild(ytApi);

  enterBtn.addEventListener('click', () => {
    intro.classList.add('hidden');
    body.classList.remove('locked');
    playAudio();
  });
  soundToggle.addEventListener('click', toggleAudio);
  musicPlay.addEventListener('click', toggleAudio);

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
  const updateCountdown = () => {
    const now = new Date();
    let diff = Math.max(0, EVENT_DATE - now);
    const days = Math.floor(diff / 86400000); diff %= 86400000;
    const hours = Math.floor(diff / 3600000); diff %= 3600000;
    const minutes = Math.floor(diff / 60000); diff %= 60000;
    const seconds = Math.floor(diff / 1000);
    document.getElementById('days').textContent = pad(days);
    document.getElementById('hours').textContent = pad(hours);
    document.getElementById('minutes').textContent = pad(minutes);
    document.getElementById('seconds').textContent = pad(seconds);
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const updateScrollProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? scrollY / max : 0;
    document.getElementById('pageProgress').style.width = `${progress * 100}%`;
    document.getElementById('energyValue').textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}%`;
  };
  updateScrollProgress();
  addEventListener('scroll', updateScrollProgress, { passive: true });

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };
  menuBtn.addEventListener('click', () => {
    const opening = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', opening);
    menuBtn.classList.toggle('open', opening);
    menuBtn.setAttribute('aria-expanded', String(opening));
    mobileMenu.setAttribute('aria-hidden', String(!opening));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  const openModal = (title, text) => {
    modalTitle.textContent = title;
    modalText.textContent = text;
    if (typeof demoModal.showModal === 'function') demoModal.showModal();
  };
  document.querySelectorAll('.demo-action').forEach(btn => btn.addEventListener('click', () => {
    openModal(`${btn.dataset.ticket.toUpperCase()} · DEMO`, 'Esta es una demostración interactiva. En una versión real, este botón puede conectarse con un sistema de venta, registro o plataforma de boletaje.');
  }));
  document.querySelectorAll('.demo-info').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.info === 'location') openModal('LOCATION REVEAL SOON', 'En un evento real, aquí puede mostrarse la ubicación exacta o abrir Google Maps cuando el organizador decida revelarla.');
    else openModal('WEB INTERACTIVA · DEMO', 'Este botón puede conectarse posteriormente con WhatsApp, un formulario de cotización o el medio de contacto del negocio.');
  }));
  demoModal.querySelector('.modal-close').addEventListener('click', () => demoModal.close());
  demoModal.querySelector('.modal-ok').addEventListener('click', () => demoModal.close());
  demoModal.addEventListener('click', e => { if (e.target === demoModal) demoModal.close(); });

  document.querySelectorAll('.gallery-card').forEach(card => card.addEventListener('click', () => {
    lightboxImage.src = card.dataset.image;
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

  const navLinks = [...document.querySelectorAll('.mobile-bottom-nav a')];
  const sectionMap = navLinks.map(link => ({ link, section: document.querySelector(link.getAttribute('href')) })).filter(item => item.section);
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionMap.forEach(item => item.link.classList.toggle('active', item.section === entry.target));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sectionMap.forEach(item => navObserver.observe(item.section));

  const cursorGlow = document.getElementById('cursorGlow');
  if (matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
      if (demoModal.open) demoModal.close();
      if (lightbox.open) lightbox.close();
    }
  });
})();

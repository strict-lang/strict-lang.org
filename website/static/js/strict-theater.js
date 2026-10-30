/**
 * Strict Web Games Theater
 * Manages launching games in an embedded modal player, handling WebGL/WASM lifecycles,
 * audio unlocking, keyboard event sandboxing, store links, and fullscreen toggling.
 */
(function () {
  'use strict';

  const GAME_DATA = {
    soulcraft: {
      title: 'SoulCraft',
      year: 2012,
      genre: 'Action RPG',
      desc: 'Fight as an Angel against Demons and Humans in real-world locations, with SoulCraft 2 and Heroes of SoulCraft merged in. Ported to Strict on the DeltaEngine.',
      webPath: '',
      isPlayableWeb: false,
      isComingSoon: true,
      storeLinks: {
        steam: 'https://store.steampowered.com/app/369700/SoulCraft/',
        googlePlay: 'https://play.google.com/store/apps/details?id=de.mobilebits.soulcraftdefault',
        appStore: 'https://apps.apple.com/app/soulcraft-action-rpg/id558133054'
      },
      storeNote: 'Web release coming soon! Available now on Steam, Google Play, and App Store.'
    },
    arenawars: {
      title: 'Arena Wars',
      year: 2004,
      genre: 'Real Time Strategy · Capture the Flag',
      desc: 'Fast real time strategy without base building: buy units, capture the enemy flag and bring it home. The Close Combat level of Arena Wars Reloaded.',
      webPath: '',
      isPlayableWeb: false,
      isComingSoon: true,
      storeLinks: {
        steam: 'https://store.steampowered.com/app/468800/Arena_Wars_Reloaded/'
      },
      storeNote: 'Web release coming soon! Wishlist on Steam.'
    },
    webwars: {
      title: 'WebWars',
      year: 1999,
      genre: 'Real Time Strategy · Capture the Flag',
      desc: 'Work in progress: two bases, six unit types with the original art, capture the flag against a computer player (1999). Unit movement and gameplay are unfinished with plenty of bugs.',
      webPath: '/games/WebWars/WebWars.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Work in progress: gameplay code is unfinished with plenty of bugs.'
    },
    racinggame: {
      title: 'Racing Game',
      year: 2006,
      genre: 'Racing',
      desc: 'Work in progress: three courses with banked splines, scenery, car selection and lap records. Physics and gameplay code are unfinished with plenty of bugs.',
      webPath: '/games/RacingGame/RacingGame.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Work in progress: gameplay code is unfinished with plenty of bugs.'
    },
    rocketcommander: {
      title: 'Rocket Commander',
      year: 2005,
      genre: 'Space Flight',
      desc: 'Fly through moving asteroid fields and collect fuel, health and points before the rocket runs dry.',
      webPath: '/games/RocketCommander/RocketCommander.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    artifex: {
      title: 'Artifex',
      year: 2016,
      genre: 'Physics Puzzle · Game Jam',
      desc: 'Game jam entry: drag and rotate the fallen pieces of an ancient temple and stack them above the finishing line.',
      webPath: '/games/Artifex/Artifex.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    breakout: {
      title: 'Breakout',
      year: 2013,
      genre: 'Arcade',
      desc: 'Paddle, ball and bricks with the original artwork and sounds.',
      webPath: '/games/Breakout/Breakout.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    armiesofsteel: {
      title: 'Armies of Steel',
      year: 2005,
      genre: 'Real Time Strategy',
      desc: 'Tank skirmish with 24-direction tank art, revived in 2023: select squads, attack-move and build more tanks.',
      webPath: '/games/ArmiesOfSteel/ArmiesOfSteel.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    ghostwars: {
      title: 'GhostWars',
      year: 2013,
      genre: 'Strategy · Game Jam',
      desc: 'Game jam entry: send ghosts between trees and capture every tree on three levels.',
      webPath: '/games/GhostWars/GhostWars.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    tinybat: {
      title: 'Tiny Bat',
      year: 2018,
      genre: 'Arcade · Game Jam',
      desc: 'Fly a bat through dark caves and emit echoes to light up the walls before you hit them.',
      webPath: '/games/TinyBat/TinyBat.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    elemental: {
      title: 'Elemental',
      year: 2020,
      genre: 'Real Time Strategy',
      desc: 'Fire against Earth: capture buildings with your units and let them produce more.',
      webPath: '/games/Elemental/Elemental.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to play in the browser.'
    },
    logoapp: {
      title: 'LogoApp',
      year: 2009,
      genre: 'Sample',
      desc: '16 colored DeltaEngine logos rotate and bounce, the first sample of every engine version since 2009.',
      webPath: '/games/LogoApp/LogoApp.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
    },
    fractalzoomer: {
      title: 'FractalZoomer',
      year: 1997,
      genre: 'Sample',
      desc: 'Mandelbrot explorer reviving a 1997 DirectDraw sample: wheel or Space zooms, drag pans, 1 and 2 switch the precision. All fractal math is Strict, natively its pixel loops become GPU kernels.',
      webPath: '/games/FractalZoomer/FractalZoomer.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
    }
  };

  let modalEl = null;

  function createTheaterModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.id = 'strictTheaterModal';
    modalEl.className = 'strictTheaterModal hidden';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', 'Game Theater Player');

    modalEl.innerHTML = `
      <div class="stm-backdrop"></div>
      <div class="stm-window">
        <div class="stm-header">
          <div class="stm-title-group">
            <h2 class="stm-title" id="stmGameTitle">Playing Game</h2>
            <span class="stm-badge">WASM / WebGL 2</span>
            <span class="stm-badge f2p">Free to Play</span>
          </div>
          <div class="stm-controls">
            <button type="button" class="stm-btn" id="stmFullscreenBtn" title="Toggle Fullscreen">⛶ Fullscreen</button>
            <button type="button" class="stm-btn close" id="stmCloseBtn" title="Close Theater (Esc)">✕</button>
          </div>
        </div>
        <div class="stm-body">
          <div class="stm-loading" id="stmLoading">
            <div class="stm-spinner"></div>
            <p id="stmLoadingMsg">Loading WebAssembly & Game Assets...</p>
          </div>
          <iframe id="stmFrame" title="Strict Game View" allow="autoplay; fullscreen; gamepad"></iframe>
        </div>
        <div class="stm-footer" id="stmFooter">
          <div class="stm-store-note" id="stmStoreNote"></div>
          <div class="stm-store-links" id="stmStoreLinks"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Event listeners
    modalEl.querySelector('.stm-backdrop').addEventListener('click', closeTheater);
    document.getElementById('stmCloseBtn').addEventListener('click', closeTheater);
    document.getElementById('stmFullscreenBtn').addEventListener('click', toggleFullscreen);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
        closeTheater();
      }
    });
  }

  function launchGame(gameKey) {
    createTheaterModal();
    const game = GAME_DATA[gameKey];
    if (!game) return;

    const titleEl = document.getElementById('stmGameTitle');
    const frameEl = document.getElementById('stmFrame');
    const loadingEl = document.getElementById('stmLoading');
    const storeNoteEl = document.getElementById('stmStoreNote');
    const storeLinksEl = document.getElementById('stmStoreLinks');

    titleEl.textContent = game.title + ' (' + game.year + ') — ' + game.genre;
    storeNoteEl.textContent = game.storeNote || '';

    // Render Store links
    let linksHtml = '';
    if (game.storeLinks.steam) {
      linksHtml += `<a class="stm-store-btn steam" href="${game.storeLinks.steam}" target="_blank" rel="noopener">Steam Store</a>`;
    }
    if (game.storeLinks.googlePlay) {
      linksHtml += `<a class="stm-store-btn gplay" href="${game.storeLinks.googlePlay}" target="_blank" rel="noopener">Google Play</a>`;
    }
    if (game.storeLinks.appStore) {
      linksHtml += `<a class="stm-store-btn appstore" href="${game.storeLinks.appStore}" target="_blank" rel="noopener">App Store</a>`;
    }
    storeLinksEl.innerHTML = linksHtml;

    // Handle games that are coming soon
    const spinner = loadingEl.querySelector('.stm-spinner');
    if (game.isComingSoon || !game.isPlayableWeb) {
      loadingEl.style.display = 'flex';
      if (spinner) spinner.style.display = 'none';
      loadingEl.querySelector('#stmLoadingMsg').innerHTML = `
        <div style="text-align:center;padding:20px;max-width:540px;">
          <h3 style="color:#ffd166;font-size:1.45rem;margin:0 0 12px;">${game.title} — Web Version Coming Soon</h3>
          <p style="color:#c5d8e2;line-height:1.6;font-size:0.95rem;margin:0 0 16px;">
            The standalone web release is currently being finalized with the latest DeltaEngine optimizations.<br><br>
            In the meantime, you can play the full game on Steam or mobile stores using the links below!
          </p>
        </div>
      `;
      frameEl.src = 'about:blank';
      modalEl.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      return;
    }

    if (spinner) spinner.style.display = '';

    // Show loading indicator
    loadingEl.style.display = 'flex';
    loadingEl.querySelector('#stmLoadingMsg').textContent = `Loading ${game.title} (WebAssembly & WebGL)...`;

    // Set frame source
    frameEl.onload = () => {
      loadingEl.style.display = 'none';
      try {
        frameEl.contentWindow.focus();
      } catch (e) {
        // cross-origin protection if hosted on another port/domain
      }
    };

    // If game has a built web path, load it; otherwise show demo placeholder
    frameEl.src = game.webPath;

    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeTheater() {
    if (!modalEl) return;
    const frameEl = document.getElementById('stmFrame');
    if (frameEl) {
      frameEl.src = 'about:blank'; // Destroy canvas, audio, and wasm memory
    }
    modalEl.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function toggleFullscreen() {
    const frameWrapper = document.querySelector('.stm-body');
    if (!frameWrapper) return;

    if (!document.fullscreenElement) {
      frameWrapper.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  function setupArcadeButtons() {
    document.querySelectorAll('[data-play-game]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-play-game');
        if (key) {
          launchGame(key);
        }
      });
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupArcadeButtons);
  } else {
    setupArcadeButtons();
  }

  window.StrictTheater = {
    launch: launchGame,
    close: closeTheater,
    games: GAME_DATA
  };
})();

/**
 * Strict Web Games Theater
 * Playable games open as their own page, the others show their store links in a modal.
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
    torinstowers: {
      title: 'Torins Towers',
      year: 2023,
      genre: 'Real Time Strategy · Action',
      desc: 'Your army is your resource: sacrifice units at towers to upgrade, research and counter the enemy across campaign and multiplayer levels. Ported to Strict on the DeltaEngine.',
      webPath: '',
      isPlayableWeb: false,
      isComingSoon: true,
      storeLinks: {
        steam: 'https://store.steampowered.com/app/1673670/Torins_Towers_Rise_of_Heroes/',
        googlePlay: 'https://play.google.com/store/apps/details?id=net.deltaengine.towers',
        appStore: 'https://apps.apple.com/us/app/towers-rts/id1178379069'
      },
      storeNote: 'Web release coming soon! Available now on Steam, Google Play, and App Store.'
    },
    starfalldefense: {
      title: 'Starfall Defense',
      year: 2026,
      genre: 'Tower Defense',
      desc: 'Defend the power core from alien machines across 10 handcrafted levels with laser, rocket and plasma towers, pilot upgrades and the Armory shop.',
      webPath: '/games/StarfallDefense/StarfallDefense.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
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
      desc: 'Capture the flag against a computer player, from 1999. The browser build is still being finished.',
      webPath: '',
      isPlayableWeb: false,
      isComingSoon: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'The browser build is still being finished.'
    },
    quillhop: {
      title: 'Quillhop',
      year: 2026,
      genre: 'Platformer',
      desc: 'Nim the Quill hops through ten chapters of a torn atlas.',
      webPath: '/games/Quillhop/Quillhop.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
    },
    racinggame: {
      title: 'Racing Game',
      year: 2006,
      genre: 'Racing',
      desc: 'Three courses with banked splines, scenery, car selection and lap records.',
      webPath: '/games/RacingGame/RacingGame.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
    },
    blocks: {
      title: 'Blocks',
      year: 2013,
      genre: 'Puzzle',
      desc: 'Falling jewels. Arrows move and rotate, Space drops.',
      webPath: '/games/Blocks/Blocks.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
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
      storeNote: 'Free to run in the browser.'
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
      desc: 'Mandelbrot and Julia explorer reviving a 1997 DirectDraw sample: drag pans, wheel or pinch zooms down to 1e35x. All fractal math is Strict, its pixel loops become WebGPU compute shaders in the browser and GPU kernels natively.',
      webPath: '/games/FractalZoomer/FractalZoomer.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
    },
    forest: {
      title: 'Forest',
      year: 2026,
      genre: 'Sample',
      desc: '3D instancing stress test: 10,000 low poly fir trees on rolling hills sway in the wind every frame, all drawn with one instanced draw call.',
      webPath: '/games/Forest/Forest.html',
      isPlayableWeb: true,
      isFreeToPlay: true,
      storeLinks: {},
      storeNote: 'Free to run in the browser.'
    },
    bentris: {
      title: 'BenTris',
      year: 1996,
      genre: 'Puzzle',
      desc: 'The oldest game here, written as a teenager, last released in 1996. Falling blocks with the recovered DOS graphics.',
      webPath: '/games/BenTris/BenTris.html',
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
            <button type="button" class="stm-btn close" id="stmCloseBtn" title="Close Theater (Esc)">✕</button>
          </div>
        </div>
        <div class="stm-body">
          <div class="stm-loading" id="stmLoading">
            <p id="stmLoadingMsg">Loading WebAssembly & Game Assets...</p>
          </div>
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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
        closeTheater();
      }
    });
  }

  function launchGame(gameKey) {
    const game = GAME_DATA[gameKey];
    if (!game) return;
    // Playable games open as their own page: all of the screen, a fullscreen button and the back button to return.
    if (game.isPlayableWeb && !game.isComingSoon) {
      location.href = game.webPath;
      return;
    }
    createTheaterModal();

    const titleEl = document.getElementById('stmGameTitle');
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

    // Games without a web build show their store links
    const hasStore = game.storeLinks && (game.storeLinks.steam || game.storeLinks.googlePlay || game.storeLinks.appStore);
    loadingEl.style.display = 'flex';
    loadingEl.querySelector('#stmLoadingMsg').innerHTML = `
      <div style="text-align:center;padding:20px;max-width:540px;">
        <h3 style="color:#ffd166;font-size:1.45rem;margin:0 0 12px;">${game.title} — Coming Soon</h3>
        <p style="color:#c5d8e2;line-height:1.6;font-size:0.95rem;margin:0 0 16px;">
          ${game.storeNote || 'The browser build is not ready yet.'}${hasStore ? '<br><br>Until then, the released game is on the stores below.' : ''}
        </p>
      </div>
    `;
    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeTheater() {
    if (!modalEl) return;
    modalEl.classList.add('hidden');
    document.body.style.overflow = '';
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

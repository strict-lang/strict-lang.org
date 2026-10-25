const React = require("react");
const path = require("path");

let hljs;
try {
  const hljsPath = require.resolve("highlight.js", { paths: [process.cwd()] });
  hljs = require(hljsPath);
} catch (e) {
  hljs = require("highlight.js");
}

if (!hljs.getLanguage('strict')) {
  hljs.registerLanguage('strict', hljs => ({
    aliases: ['str'],
    keywords: {
      keyword: 'has constant let mutable if else then for in is not and or xor return to from with as long',
      literal: 'true false None',
      built_in: 'value index outer',
    },
    contains: [
      hljs.QUOTE_STRING_MODE,
      { className: 'comment', begin: /(#|\/\/).*$/ },
      { className: 'number', begin: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/, relevance: 0 },
      {
        className: 'title',
        begin: /^(?!(has|constant|mutable|let|if|else|for|return)\b)([A-Za-z]+|[+\-*\/%^<>=]+)(?=[( ]|$)/,
      },
      { className: 'type', begin: /\b[A-Z][A-Za-z]*\b/, relevance: 0 },
    ],
  }));
}

const spotlightGames = [
  { key: "soulcraft", title: "SoulCraft", year: 2012, genre: "Action RPG", price: "Free to Play", image: "SoulCraft.webp", featured: true,
    comingSoon: true,
    desc: "Fight as an Angel against Demons and Humans in real-world locations, 3D heroes with custom shaders and loot.",
    facts: ["50M downloads"],
    stores: [["Steam", "https://store.steampowered.com/app/369700/SoulCraft/"], ["Google Play", "https://play.google.com/store/apps/details?id=de.mobilebits.soulcraftdefault"], ["App Store", "https://apps.apple.com/app/soulcraft-action-rpg/id558133054"]] },
  { key: "arenawars", title: "Arena Wars", year: 2004, genre: "Real Time Strategy · Capture the Flag", price: "Free to Play", image: "ArenaWars.webp",
    comingSoon: true,
    desc: "Fast real time strategy without base building: buy units, steal the enemy flag and bring it home.",
    facts: ["First commercial .NET game ever", "1st Place German Innovation Price 2004", "GameStar 80%+ Award", "PC Action 80%"],
    review: ["GameStar review 09/2004 (PDF)", "https://download.gamestar.de/public/30100/30173/09_2004_081ff.pdf"],
    stores: [["Wishlist on Steam", "https://store.steampowered.com/app/468800/Arena_Wars_Reloaded/"]] },
  { key: "webwars", title: "WebWars", year: 1999, genre: "Real Time Strategy · Capture the Flag", price: "Free", image: "games/WebWars.jpg",
    wip: true,
    desc: "Work in progress: created in 2 months back in 1999, capture the flag against a computer player. Gameplay code is unfinished with plenty of bugs.", stores: [] },
  { key: "racinggame", title: "Racing Game", year: 2006, genre: "Racing", price: "Free", image: "games/RacingGame.webp",
    wip: true,
    desc: "Work in progress: stress test for XNA on Xbox 360 with three courses and lap records. Physics and gameplay code are unfinished with plenty of bugs.", stores: [] }
];

const moreGames = [
  { key: "rocketcommander", title: "Rocket Commander", year: 2005, genre: "Space Flight", image: "games/RocketCommander.webp",
    desc: "Fly through moving asteroid fields, collect fuel and points." },
  { key: "artifex", title: "Artifex", year: 2016, genre: "Physics Puzzle · Game Jam", image: "games/Artifex.webp",
    desc: "Drag and rotate temple ruins to stack a tower above the line." },
  { key: "breakout", title: "Breakout", year: 2013, genre: "Arcade", image: "games/Breakout.webp",
    desc: "Paddle, ball and bricks with the original art and sounds." },
  { key: "armiesofsteel", title: "Armies of Steel", year: 2005, genre: "Real Time Strategy", image: "games/ArmiesOfSteel.jpg",
    desc: "Tank skirmish from 2005, revived in 2023." },
  { key: "ghostwars", title: "GhostWars", year: 2013, genre: "Strategy · Game Jam", image: "games/GhostWars.webp",
    desc: "Send ghosts between trees until you own every tree." },
  { key: "tinybat", title: "Tiny Bat", year: 2018, genre: "Arcade · Game Jam", image: "games/TinyBat.jpg",
    desc: "Echo through dark caves without touching the walls." },
  { key: "elemental", title: "Elemental", year: 2020, genre: "Real Time Strategy", image: "games/Elemental.webp",
    desc: "Fire against Earth: capture buildings that produce units." },
  { key: "logoapp", title: "LogoApp", year: 2009, genre: "Sample", image: "games/LogoApp.webp",
    desc: "Bouncing logos, the first sample of every engine version." }
];

const gpt2Speed = [
  { label: "Strict, RTX 3080", value: 909, strict: true },
  { label: "PyTorch, CUDA float16", value: 187 },
  { label: "PyTorch, CUDA float32", value: 173 },
  { label: "Strict, CPU threads", value: 108, strict: true },
  { label: "PyTorch, CPU 1 thread", value: 50 },
  { label: "PyTorch, CPU 24 threads", value: 36 }
];

const mossTotalSpeed = [
  { label: "Strict + Spectrum (spectrum8_w3p3)", value: 2.4, strict: true },
  { label: "Strict (cached merged LoRA)", value: 3.4, strict: true },
  { label: "Strict (runtime LoRA)", value: 5.3, strict: true },
  { label: "ComfyUI (reported warm pipeline)", value: 6.5 }
];

const mossSamplingSpeed = [
  { label: "Strict + Spectrum (5 steps evaluated)", value: 1.8, strict: true },
  { label: "Strict (8 steps, cached merged INT8)", value: 2.9, strict: true },
  { label: "ComfyUI (8 steps, headless INT8)", value: 3.2 }
];

const blurOneThread = [
  { label: "Strict, 1 thread", value: 189.5, strict: true },
  { label: "C (clang 23 -O3)", value: 193.3 },
  { label: "C (clang 22 -O3, Oct 21)", value: 282.4 },
  { label: "Rust (rustc -O3)", value: 487.6 },
  { label: "Goose (via clang)", value: 583.5 },
  { label: "C# (.NET 11)", value: 851.3 },
  { label: "Python 3.13 with NumPy", value: 1647.5 },
  { label: "TypeScript (Node 26)", value: 1959.6 },
  { label: "Python 3.13", value: 264479 }
];

const blurParallel = [
  { label: "Strict, default (cpu+gpu)", value: 6.6, strict: true },
  { label: "Strict, no gpu", value: 21.0, strict: true },
  { label: "C, OpenMP (clang 22, Oct 21)", value: 53.0 },
  { label: "C, OpenMP (clang 23)", value: 57.6 },
  { label: "Rust, scoped threads", value: 74.8 },
  { label: "C#, Parallel.For", value: 122.4 }
];

const blurCode = [
  { name: "Strict", lang: "strict", code: `Blurred(bitmap Bitmap) Colors
	BenchBlur.Blurred(Bitmap.Tiny)(0) is Color(4, 4, 4)
	for bitmap.Colors
		Neighbors(bitmap, index).Average
Neighbors(bitmap Bitmap, pixel Number) Colors
	BenchBlur.Neighbors(Bitmap.Tiny, 0).Length is 9
	for Range(-Radius, Radius + 1)
		for Range(-Radius, Radius + 1)
			if bitmap.IsInside(pixel, value, outer)
				bitmap.Colors(pixel + outer * bitmap.Size.Width + value)` },
  { name: "C", lang: "c", code: `#pragma omp parallel for
for (int y = 0; y < height; ++y)
	for (int x = 0; x < width; ++x)
	{
		int red = 0, green = 0, blue = 0, alpha = 0, count = 0;
		for (int dy = -4; dy <= 4; ++dy)
			for (int dx = -4; dx <= 4; ++dx)
				if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height)
				{
					int sourceIndex = ((y + dy) * width + x + dx) * 4;
					red += data[sourceIndex];
					green += data[sourceIndex + 1];
					blue += data[sourceIndex + 2];
					alpha += data[sourceIndex + 3];
					++count;
				}
		int targetIndex = (y * width + x) * 4;
		blurred[targetIndex] = red / count;
		blurred[targetIndex + 1] = green / count;
		blurred[targetIndex + 2] = blue / count;
		blurred[targetIndex + 3] = alpha / count;
	}` },
  { name: "Rust", lang: "rust", code: `for y in 0..height {
	for x in 0..width {
		let (mut red, mut green, mut blue, mut alpha, mut count) = (0u32, 0u32, 0u32, 0u32, 0u32);
		for dy in -4..=4 {
			for dx in -4..=4 {
				if x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height {
					let source_index = (((y + dy) * width + x + dx) * 4) as usize;
					red += data[source_index] as u32;
					green += data[source_index + 1] as u32;
					blue += data[source_index + 2] as u32;
					alpha += data[source_index + 3] as u32;
					count += 1;
				}
			}
		}
		let target_index = ((y * width + x) * 4) as usize;
		blurred[target_index] = (red / count) as u8;
		blurred[target_index + 1] = (green / count) as u8;
		blurred[target_index + 2] = (blue / count) as u8;
		blurred[target_index + 3] = (alpha / count) as u8;
	}
}` },
  { name: "Goose", lang: "c", code: `for y in height {
	for x in width {
		var red = 0;
		var green = 0;
		var blue = 0;
		var alpha = 0;
		var count = 0;
		for dy in -4..5 {
			for dx in -4..5 {
				if x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height {
					let sourceIndex = ((y + dy) * width + x + dx) * 4;
					red += data[sourceIndex];
					green += data[sourceIndex + 1];
					blue += data[sourceIndex + 2];
					alpha += data[sourceIndex + 3];
					count++;
				}
			}
		}
		let targetIndex = (y * width + x) * 4;
		blurred[targetIndex] = (red / count) as! u8;
		blurred[targetIndex + 1] = (green / count) as! u8;
		blurred[targetIndex + 2] = (blue / count) as! u8;
		blurred[targetIndex + 3] = (alpha / count) as! u8;
	}
}` },
  { name: "C#", lang: "csharp", code: `for (var y = 0; y < height; ++y)
	for (var x = 0; x < width; ++x)
	{
		int red = 0, green = 0, blue = 0, alpha = 0, count = 0;
		for (var dy = -4; dy <= 4; ++dy)
			for (var dx = -4; dx <= 4; ++dx)
				if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height)
				{
					var sourceIndex = ((y + dy) * width + x + dx) * 4;
					red += data[sourceIndex];
					green += data[sourceIndex + 1];
					blue += data[sourceIndex + 2];
					alpha += data[sourceIndex + 3];
					++count;
				}
		var targetIndex = (y * width + x) * 4;
		blurred[targetIndex] = (byte)(red / count);
		blurred[targetIndex + 1] = (byte)(green / count);
		blurred[targetIndex + 2] = (byte)(blue / count);
		blurred[targetIndex + 3] = (byte)(alpha / count);
	}` },
  { name: "TypeScript", lang: "typescript", code: `for (let y = 0; y < height; ++y)
	for (let x = 0; x < width; ++x) {
		let red = 0, green = 0, blue = 0, alpha = 0, count = 0;
		for (let dy = -4; dy <= 4; ++dy)
			for (let dx = -4; dx <= 4; ++dx)
				if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
					const sourceIndex = ((y + dy) * width + x + dx) * 4;
					red += data[sourceIndex];
					green += data[sourceIndex + 1];
					blue += data[sourceIndex + 2];
					alpha += data[sourceIndex + 3];
					++count;
				}
		const targetIndex = (y * width + x) * 4;
		blurred[targetIndex] = Math.floor(red / count);
		blurred[targetIndex + 1] = Math.floor(green / count);
		blurred[targetIndex + 2] = Math.floor(blue / count);
		blurred[targetIndex + 3] = Math.floor(alpha / count);
	}` },
  { name: "Python", lang: "python", code: `for y in range(height):
	for x in range(width):
		red = green = blue = alpha = count = 0
		for dy in range(-4, 5):
			for dx in range(-4, 5):
				if 0 <= x + dx < width and 0 <= y + dy < height:
					source_index = ((y + dy) * width + x + dx) * 4
					red += data[source_index]
					green += data[source_index + 1]
					blue += data[source_index + 2]
					alpha += data[source_index + 3]
					count += 1
		target_index = (y * width + x) * 4
		blurred[target_index] = red // count
		blurred[target_index + 1] = green // count
		blurred[target_index + 2] = blue // count
		blurred[target_index + 3] = alpha // count` }
];

const qwen8Speed = [
  { label: "Strict, 32 sequences", value: 2357, strict: true },
  { label: "Strict, 16 sequences", value: 1655, strict: true },
  { label: "Strict, 8 sequences", value: 953, strict: true },
  { label: "llama.cpp, 8 sequences", value: 727 },
  { label: "Strict, 4 sequences", value: 530, strict: true },
  { label: "llama.cpp, 4 sequences", value: 439 },
  { label: "Strict, 1 sequence", value: 151, strict: true },
  { label: "llama.cpp, 1 sequence", value: 138 }
];

const qwen30Speed = [
  { label: "Strict", value: 210, strict: true },
  { label: "llama.cpp", value: 190 },
  { label: "GPT-6 Sol (cloud)", value: 118, muted: true },
  { label: "Claude Opus 5.5 (cloud)", value: 95, muted: true },
  { label: "Grok 4.7 (cloud)", value: 92, muted: true }
];

const qwen38Speed = [
  { label: "llama.cpp / Ollama (MTP drafts)", value: 74.7, muted: true },
  { label: "Strict (MTP drafts)", value: 73.0, strict: true },
  { label: "Strict (Qwen3.8 27B)", value: 46.6, strict: true },
  { label: "Strict (Brilliance 50X)", value: 45.3, strict: true },
  { label: "llama.cpp (Brilliance 50X)", value: 43.5 },
  { label: "llama.cpp (Qwen3.8 27B, no drafts)", value: 43.0 }
];

function BarChart({ rows, unit, lower }) {
  const best = lower ? Math.min(...rows.map(row => row.value)) : Math.max(...rows.map(row => row.value));
  return (
    <div className="strictBarChart">
      {rows.map(row => (
        <div className={"strictBarRow" + (row.muted ? " muted" : "")} key={row.label}>
          <span className="strictBarLabel">{row.label}</span>
          <div className="strictBarTrack">
            <div className={"strictBarFill" + (row.strict ? " winner" : "")} style={{ width: Math.max(2, 100 * (lower ? best / row.value : row.value / best)) + "%" }}></div>
          </div>
          <span className={"strictBarVal" + (row.strict ? " winner" : "")}>{row.value.toLocaleString("en-US")} {unit}</span>
        </div>
      ))}
    </div>
  );
}

function CodeTabs({ name, tabs }) {
  return (
    <div className="strictTabs">
      {tabs.map((tab, index) => [
        <input type="radio" name={name} id={name + index} key={"input" + index} defaultChecked={index === 0} />,
        <label htmlFor={name + index} key={"label" + index}>{tab.name}</label>
      ])}
      {tabs.map((tab, index) => {
        const lang = tab.lang || (tab.name.toLowerCase() === 'strict' ? 'strict' : tab.name.toLowerCase());
        const highlighted = hljs.getLanguage(lang)
          ? hljs.highlight(tab.code, { language: lang }).value
          : hljs.highlightAuto(tab.code).value;
        return (
          <pre className={"strictTabPanel strictTabPanel" + index} key={"panel" + index}>
            <code className={"hljs language-" + lang} dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        );
      })}
    </div>
  );
}

function Index({ config: siteConfig }) {
  const { baseUrl } = siteConfig;
  const doc = name => baseUrl + "docs/" + name;
  const img = name => baseUrl + "img/" + name;

  return (
    <main className="strictHome">
      {/* Hero Section */}
      <section className="strictHero wrapper">
        <img
          className="strictBrand"
          src={img("StrictBanner.png")}
          alt="Strict Programming Language"
          width="500"
          height="150"
        />
        <h1>Clean &amp; Fast Anywhere</h1>
        <p className="strictHeroLead">
          Runs directly on the bare metal, generates native code, utilizes GPU kernels and runs on Windows, Linux, macOS, Android, iOS and the web. Runs 3D games locally or in browser.
        </p>
        <div className="strictActions">
          <a className="button strictPrimary" href="#games">Play Games in Browser</a>
          <a className="button strictPrimary" href="#performance">Performance</a>
          <a className="button" href="#scrunch">VS Code SCrunch Demo</a>
          <a className="button" href={doc("GettingStarted")}>Get Started</a>
          <a className="button" href={siteConfig.repoUrl}>GitHub</a>
        </div>
      </section>

      {/* Interactive Browser Demo */}
      <section className="strictPlaygroundSection" id="playground">
        <div className="wrapper">
          <div className="strictSectionHeading" style={{ marginBottom: "8px" }}>
            <p className="strictEyebrow" style={{ margin: 0 }}>Try Strict right now</p>
          </div>
          <div id="strictPlaygroundApp" className="strictPlaygroundContainer">
            <div style={{ padding: "20px", textAlign: "center", color: "var(--strict-muted)" }}>
              Loading interactive Strict evaluator...
            </div>
          </div>
        </div>
      </section>

      {/* Web Games Theater & Arcade */}
      <section className="strictArcadeSection" id="games">
        <div className="wrapper">
          <div className="strictSectionHeading">
            <p className="strictEyebrow">Games written or ported to Strict run in the browser</p>
          </div>
          <div className="strictArcadeSpotlight">
            {spotlightGames.map(game => (
              <article className={"strictSpotlightCard" + (game.featured ? " featured" : "")} key={game.key}>
                <div className="strictCardMedia">
                  <img src={img(game.image)} alt={game.title + " " + game.genre} loading="lazy" width="960" height="540" />
                  <div className="strictCardBadges">
                    <span className="strictBadge year">{game.year}</span>
                    <span className="strictBadge f2p">{game.price}</span>
                    {game.wip && <span className="strictBadge wip">Work in Progress</span>}
                    {game.comingSoon && <span className="strictBadge comingSoon">Coming Soon</span>}
                    {game.genre.split(" · ").map(genre => <span className="strictBadge genre" key={genre}>{genre}</span>)}
                  </div>
                </div>
                <div className="strictSpotlightBody">
                  <div className="strictSpotlightHeader">
                    <h3>{game.title}</h3>
                  </div>
                  <p className="strictSpotlightDesc">{game.desc}</p>
                  {game.facts && (
                    <p className="strictSpotlightFacts">
                      {game.facts.join(" · ")}
                      {game.review && <span> · <a href={game.review[1]} target="_blank" rel="noopener">{game.review[0]}</a></span>}
                    </p>
                  )}
                  <div className="strictCardActions">
                    <button
                      type="button"
                      className={"strictPlayBtn" + (game.comingSoon ? " comingSoon" : "") + (game.wip ? " wip" : "")}
                      data-play-game={game.key}
                    >
                      {game.comingSoon ? "Play in Browser (Coming Soon)" : (game.wip ? "▶ Play in Browser (Work in Progress)" : "▶ Play in Browser")}
                    </button>
                    <div className="strictStoreLinks">
                      {game.stores.map(([name, url]) => (
                        <a className="strictStoreBadge" href={url} target="_blank" rel="noopener" key={name}>{name}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <h3 className="strictMoreGamesTitle">More games</h3>
          <div className="strictMoreGames">
            {moreGames.map(game => (
              <div className="strictMoreGameCard" key={game.key}>
                <div className="strictCardMedia">
                  <img src={img(game.image)} alt={game.title + " " + game.genre} loading="lazy" width="480" height="300" />
                  <div className="strictCardBadges">
                    <span className="strictBadge year">{game.year}</span>
                    {game.genre.split(" · ").map(genre => <span className="strictBadge genre" key={genre}>{genre}</span>)}
                  </div>
                </div>
                <div className="strictMoreGameBody">
                  <h4>{game.title}</h4>
                  <p title={game.desc}>{game.desc}</p>
                  <button type="button" className="strictPlayBtn" data-play-game={game.key}>▶ Play in Browser</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCrunch in VS Code Section */}
      <section className="strictScrunchSection wrapper" id="scrunch">
        <div className="strictScrunchHeader">
          <h2>SCrunch in VS Code: See immediately what every change does.</h2>
          <p>
            Tests run in the background with immediate subsecond feedback. Green and red marks highlight results as you type, and runtime values appear right beside each line.
          </p>
        </div>
        <figure className="strictDemo">
          <video autoPlay controls muted loop playsInline preload="auto" poster={img("screenshots/scrunch-demo-poster.jpg")} width="960" height="720" aria-label="Write Fibonacci in VS Code: the tests fail first, then pass and the loop values appear beside each line">
            <source src={img("SCrunchDemo.mp4")} type="video/mp4" />
            <a href={img("SCrunchDemo.mp4")}>Watch the red-to-green test demo</a>
          </video>
          <figcaption>Write the tests. See why they fail. Implement it and watch the values appear. Actual VS Code capture from Strict/Examples.</figcaption>
        </figure>
      </section>

      {/* Raw Performance & Automatic Parallelism */}
      <section className="strictPerfSection" id="performance">
        <div className="wrapper">
          <div className="strictSectionHeading">
            <p className="strictEyebrow">Raw Performance</p>
            <h2>Simple code, fast results</h2>
            <p style={{ color: "var(--strict-muted)", maxWidth: "800px" }}>
              The same plain loops in every language. Strict optimizes them by itself and uses as many threads as make sense.
            </p>
          </div>

          <div className="strictBenchCard strictBenchWide">
            <h3>Image Blur</h3>
            <p className="sub">9x9 box blur of a 4096x2048 photo, milliseconds per image on one i9-13900KF (and one Nvidia RTX 3080 GPU, October 2026), the same output image in every language</p>
            <div className="strictPerfGrid">
              <div>
                <h4>One thread</h4>
                <BarChart rows={blurOneThread} unit="ms" lower />
              </div>
              <div>
                <h4>All cores</h4>
                <BarChart rows={blurParallel} unit="ms" lower />
              </div>
            </div>
            <CodeTabs name="blurCode" tabs={blurCode} />
            <p className="strictBenchNote">C keeps getting faster too: clang 23 runs the same plain C loop in 193 instead of 282 ms with clang 22, Strict is on par on one thread; with all cores and the GPU Strict is far ahead without any code change and even has 2 unit tests. Goose keeps a bounds check on every pixel read it cannot prove and runs on one thread. Sources: <a href={siteConfig.repoUrl + "/tree/master/ImageProcessing/Compare"}>ImageProcessing/Compare</a>.</p>
          </div>

          <div className="strictPerfGrid">
            <div className="strictBenchCard">
              <h3>Qwen3 Models (RTX 4090)</h3>
              <p className="sub">Generated tokens per second, 4-bit weights (Q4_K_M), all kernels written in Strict</p>
              <div className="strictBenchGroup">
                <h4>Qwen3-8B (Dense)</h4>
                <BarChart rows={qwen8Speed} unit="tok/s" />
              </div>
              <div className="strictBenchGroup">
                <h4>Qwen3-Coder-30B-A3B (MoE)</h4>
                <BarChart rows={qwen30Speed} unit="tok/s" />
                <p className="strictBenchNote">llama.cpp b11658 on the same GPU. Hosted models for scale (Artificial Analysis, Oct 2026).</p>
              </div>
            </div>
            <div className="strictBenchCard">
              <h3>Qwen3.8 &amp; Reasoning Models (RTX 4090)</h3>
              <p className="sub">Hybrid Gated DeltaNet with full attention and linear recurrence, 4-bit (Q4_K_M)</p>
              <div className="strictBenchGroup">
                <h4>Qwen3.8 27B &amp; Brilliance 50X</h4>
                <BarChart rows={qwen38Speed} unit="tok/s" />
                <p className="strictBenchNote">The newly released Qwen3.8 Brilliance 50X uses extensive thinking tokens to give it a shot against much larger models, runs out of the box. MTP drafting reaches 73 tok/s (Ollama 74.7), prefill is being tuned.</p>
              </div>
            </div>
          </div>

          <div className="strictPerfGrid" style={{ marginTop: "24px" }}>
            <div className="strictBenchCard">
              <h3>Moss Image Generation (RTX 3080)</h3>
              <p className="sub">720x1280 portrait, 8-step turbo with DMD LoRA, warm resident generations (seconds per image, lower is better)</p>
              <div className="strictBenchGroup">
                <h4>Total Generation (Sampling + VAE + Save)</h4>
                <BarChart rows={mossTotalSpeed} unit="s" lower />
              </div>
              <div className="strictBenchGroup">
                <h4>Diffusion Sampling (8 steps)</h4>
                <BarChart rows={mossSamplingSpeed} unit="s" lower />
                <p className="strictBenchNote">With <code>--spectrum spectrum8_w3p3</code> and cached stochastic INT8 LoRA merging, Strict evaluates 5 transformer steps and forecasts 3. Recent warm batches with DMD plus four additional LoRAs take about 2.4 s per image. ComfyUI's observed warm pipeline takes 6–6.5 s; the headless sampling measurement above is separate. Merging and prediction can change image details. Times exclude startup, model loading and prompt encoding.</p>
              </div>
              <div className="strictBenchGroup">
                <h4>Warm Image Time Breakdown</h4>
                <ul>
                  <li>Diffusion sampling: <strong>~1.8 s</strong></li>
                  <li>VAE decode: <strong>~0.5 s</strong></li>
                  <li>JPEG saving (quality 85): <strong>~0.016 s</strong></li>
                  <li>Other per-image overhead: <strong>~0.02 s</strong></li>
                </ul>
                <p className="strictBenchNote">Rounded stage times; model and VAE stay loaded across images with <code>--count</code>. The LoRA stack is merged once and reused from cache.</p>
              </div>
            </div>
            <div className="strictBenchCard">
              <h3>GPT-2 Text Generation (RTX 3080 &amp; CPU)</h3>
              <p className="sub">GPT-2 124M, greedy decoding, generated tokens per second (higher is better)</p>
              <div className="strictBenchGroup">
                <BarChart rows={gpt2Speed} unit="tok/s" />
                <p className="strictBenchNote">GPT-2 124M, greedy decoding. PyTorch 2.7 with Hugging Face transformers, best of 3 runs.</p>
              </div>
            </div>
          </div>

          {/* Interop & Ecosystem */}
          <div className="strictInteropSection">
            <div className="strictInteropCard">
              <h4>Direct Native Bindings</h4>
              <p>
                Strict calls system libraries directly: GLFW, OpenGL, WebGL, miniaudio, Box2D and input controllers without runtime bridges.
              </p>
            </div>
            <div className="strictInteropCard">
              <h4>Generated C# Bindings</h4>
              <p>
                Build standalone native libraries with automatically generated C# bindings to share records, collections, and fast logic with existing .NET apps.
              </p>
            </div>
            <div className="strictInteropCard">
              <h4>Use the Right Tool</h4>
              <p>
                Keep TypeScript, React, Vite, or ASP.NET for web UI and presentation — Strict handles the compute, game loops, math, and high-performance algorithms.
              </p>
            </div>
          </div>

          <div className="strictParallelCallout" style={{ marginTop: "20px" }}>
            Strict runs in parallel automatically: loops are split over the CPU cores or sent to the GPU, without manual locks or thread pools. <a href={doc("Concurrency")}>Explore Concurrency &amp; GPU Kernels →</a>
          </div>
        </div>
      </section>

      {/* Latest Development News */}
      <section className="strictLatest">
        <div className="wrapper">
          <p className="strictEyebrow">Latest Development</p>
          <h2>Qwen3.8 27B &amp; Brilliance 50X Run in Strict, 30B MoE at 210 tok/s</h2>
          <p>
            Qwen3.8 27B and the newly released <strong>Brilliance 50X</strong> reasoning model run directly in Strict with Gated DeltaNet layers, reaching 46.6 and 45.3 tokens/second on an RTX 4090 — matching and slightly beating llama.cpp base decoding. Qwen3-Coder-30B-A3B MoE now reaches 210 tokens/second in Strict (ahead of llama.cpp at 190). All DeltaEngine games and samples also compile to WebAssembly and WebGL 2 via <code>strict build Game.strict web</code>.
          </p>
          <a className="button" href={baseUrl + "blog/"}>Read the Development Blog</a>
        </div>
      </section>
    </main>
  );
}

module.exports = Index;

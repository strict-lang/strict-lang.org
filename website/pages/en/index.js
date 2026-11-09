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
  { key: "fractalzoomer", title: "FractalZoomer", year: 1997, genre: "Sample", price: "Free", image: "games/FractalZoomer.webp",
    desc: "Real time Mandelbrot and Julia explorer down to 1e35x zoom, all fractal math in Strict, running as WebGPU compute shaders in the browser.",
    facts: ["13 ms per half megapixel image in the browser", "60 fps while zooming", "deep views find their iterations by themselves"],
    review: ["Benchmarks and details", "/docs/Benchmarks#fractalzoomer"], stores: [] },
  { key: "webwars", title: "WebWars", year: 1999, genre: "Real Time Strategy · Capture the Flag", price: "Free", image: "games/WebWars.jpg",
    wip: true,
    desc: "Work in progress: created in 2 months back in 1999, capture the flag against a computer player. Gameplay code is unfinished with plenty of bugs.", stores: [] }
];

const moreGames = [
  { key: "forest", title: "Forest", year: 2026, genre: "Sample", image: "screenshots/Forest.webp",
    desc: "Fir trees on rolling hills, all in one instanced draw call." },
  { key: "elemental", title: "Elemental", year: 2020, genre: "Real Time Strategy", image: "games/Elemental.webp",
    desc: "Fire against Earth: capture buildings that produce units." },
  { key: "tinybat", title: "Tiny Bat", year: 2018, genre: "Arcade · Game Jam", image: "games/TinyBat.jpg",
    desc: "Echo through dark caves without touching the walls." },
  { key: "artifex", title: "Artifex", year: 2016, genre: "Physics Puzzle · Game Jam", image: "games/Artifex.webp",
    desc: "Drag and rotate temple ruins to stack a tower above the line." },
  { key: "breakout", title: "Breakout", year: 2013, genre: "Arcade", image: "games/Breakout.webp",
    desc: "Paddle, ball and bricks with the original art and sounds." },
  { key: "ghostwars", title: "GhostWars", year: 2013, genre: "Strategy · Game Jam", image: "games/GhostWars.webp",
    desc: "Send ghosts between trees until you own every tree." },
  { key: "logoapp", title: "LogoApp", year: 2009, genre: "Sample", image: "games/LogoApp.webp",
    desc: "Bouncing logos, the first sample of every engine version." },
  { key: "racinggame", title: "Racing Game", year: 2006, genre: "Racing", image: "games/RacingGame.webp",
    desc: "Work in progress: three courses and lap records, physics still unfinished." },
  { key: "rocketcommander", title: "Rocket Commander", year: 2005, genre: "Space Flight", image: "games/RocketCommander.webp",
    desc: "Fly through moving asteroid fields, collect fuel and points." },
  { key: "armiesofsteel", title: "Armies of Steel", year: 2005, genre: "Real Time Strategy", image: "games/ArmiesOfSteel.jpg",
    desc: "Tank skirmish from 2005, revived in 2023." },
  { key: "bentris", title: "BenTris", year: 1996, genre: "Puzzle", image: "games/BenTris.webp",
    desc: "The oldest game here, written as a teenager, still being restored." }
];

const gpt2Speed = [
  { label: "Strict, RTX 3080", value: 575, strict: true },
  { label: "PyTorch, CUDA float16", value: 187 },
  { label: "PyTorch, CUDA float32", value: 173 },
  { label: "Strict, CPU threads", value: 94, strict: true },
  { label: "PyTorch, CPU 1 thread", value: 50 },
  { label: "PyTorch, CPU 24 threads", value: 36 }
];

const mossSpeed = [
  { label: "MossImage fastest2steps ★", value: 1.12, strict: true },
  { label: "MossImage fastest ★★", value: 1.33, strict: true },
  { label: "MossImage faster ★★★", value: 1.75, strict: true },
  { label: "MossImage fast ★★★★", value: 1.91, strict: true },
  { label: "MossImage best ★★★★★", value: 2.91, strict: true },
  { label: "MossWeb fastest2steps 480p ★", value: 3.3, strict: true },
  { label: "MossWeb fastest 480p ★", value: 4.4, strict: true },
  { label: "ComfyUI + Strict node ★★★★★", value: 5.9, strict: true },
  { label: "MossWeb fast 480p ★★★", value: 7.4, strict: true },
  { label: "ComfyUI 8 steps ★★★★★", value: 7.5 },
  { label: "MossWeb fastest 720p ★", value: 13.7, strict: true },
  { label: "MossWeb fast 720p ★★★", value: 22.6, strict: true },
  { label: "ComfyUI 25 steps ★★★★★", value: 24 },
  { label: "ComfyUI 50 steps ★★★★★", value: 45 }
];

const mossSpeed4090 = [
  { label: "MossImage fastest2steps ★", value: 0.37, strict: true },
  { label: "MossImage fastest ★★", value: 0.50, strict: true },
  { label: "MossImage faster ★★★", value: 0.63, strict: true },
  { label: "MossImage fast ★★★★", value: 0.75, strict: true },
  { label: "MossImage best ★★★★★", value: 1.2, strict: true },
  { label: "MossWeb fastest2steps 480p ★", value: 1.3, strict: true },
  { label: "MossWeb fastest 480p ★", value: 2.2, strict: true },
  { label: "ComfyUI 8 steps ★★★★★", value: 3.2 }
];

const h3Speed = [
  { label: "H3Video fastest2steps ★", value: 26.9, strict: true },
  { label: "H3Video fastest3steps ★★", value: 31.9, strict: true },
  { label: "H3Video fastest4steps ★★★", value: 32.9, strict: true },
  { label: "H3Video faster ★★★★", value: 33.8, strict: true },
  { label: "H3Video fast ★★★★", value: 44.0, strict: true },
  { label: "H3Video best ★★★★", value: 61.2, strict: true },
  { label: "ComfyUI TaoMate 3 steps ★", value: 62.4 },
  { label: "ComfyUI turbo 4 steps ★★", value: 71.5 },
  { label: "ComfyUI turbo 8 steps ★★★★", value: 148.9 },
  { label: "ComfyUI base 20 steps ★★★★★", value: 291.0 }
];

const h3ComfySpeed = [
  { label: "H3Video best", value: 19.0, strict: true },
  { label: "ComfyUI + Strict H3 Sampler node", value: 25.4, strict: true },
  { label: "ComfyUI default workflow", value: 38.5 }
];

const blurOneThread = [
  { label: "Strict, 1 thread", value: 181.1, strict: true },
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
  { label: "Strict, default (cpu+gpu)", value: 6.4, strict: true },
  { label: "Strict, no gpu", value: 20.6, strict: true },
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

const leibnizSpeed = [
  { label: "Strict, all cores", value: 9.7, strict: true },
  { label: "Strict, 1 thread", value: 87.93, strict: true },
  { label: "C++ (AVX2)", value: 383.78 },
  { label: "C (clang, vectorized)", value: 417.68 },
  { label: "Rust", value: 771.89 },
  { label: "Go", value: 1276.59 },
  { label: "Mojo", value: 1277.68 },
  { label: "C#", value: 1308.34 },
  { label: "JavaScript (Node)", value: 1326.95 },
  { label: "Python (PyPy)", value: 1376.22 },
  { label: "Lua", value: 10032.03 },
  { label: "Python", value: 49899.23 }
];

const leibnizCode = [
  { name: "Strict", lang: "strict", code: `mutable pi = 1
for Range(1, rounds + 1)
	pi = pi + (1 - 2 * (value % 2)) / (2 * value + 1)` },
  { name: "C", lang: "c", code: `double pi = 1.0;
rounds += 2u; // do this outside the loop
for (unsigned i=2u; i < rounds; ++i) // use ++i instead of i++
{
    double x = -1.0 + 2.0 * (i & 0x1); // allows vectorization
    pi += (x / (2u * i - 1u)); // double / unsigned = double
}` },
  { name: "C++ AVX2", lang: "cpp", code: `unsigned int unroll = 4;
__m256d x       = _mm256_set_pd(-1.0,1.0,-1.0,1.0);
__m256d den     = _mm256_set_pd(0.0,0.0,0.0,0.0);
__m256d inc     = _mm256_set_pd(4.0,4.0,4.0,4.0);
__m256d two     = _mm256_set_pd(2.0,2.0,2.0,2.0);
__m256d mone    = _mm256_set_pd(-1.0,-1.0,-1.0,-1.0);
__m256d ivec    = _mm256_set_pd(2.0,3.0,4.0,5.0);
__m256d pivec   = _mm256_set_pd(0.0,0.0,0.0,0.0);
rounds += 2u; // do this outside the loop
unsigned int vec_end = rounds - rounds % unroll;
for (unsigned i=2u ; i < vec_end ; i+=unroll)
{
    // compute den = (2 * i - 1)
    den     = _mm256_add_pd(_mm256_mul_pd(two,ivec),mone);
    // increment ivec, so ivec += inc
    ivec    = _mm256_add_pd(ivec,inc);
    // compute partial sums
    pivec   = _mm256_add_pd(pivec,_mm256_div_pd(x,den));
}
// gather the partial sums
double* pi_v = (double*)&pivec;
pi +=  pi_v[0] + pi_v[1] + pi_v[2] + pi_v[3];
// now the wind-down loop
for (unsigned i=vec_end ; i < rounds ; ++i)
{
    _x = -_x;
    pi += (_x / (2u * i - 1u));
}` },
  { name: "Rust", lang: "rust", code: `let mut pi: f64 = 1.0;
(2..rounds).for_each(|i| {
    let x = -1.0f64 + (2.0 * (i & 0x1) as f64);
    pi += x / (2 * i - 1) as f64;
});` },
  { name: "C#", lang: "csharp", code: `var pi = 1.0D;
var x = 1.0D;
for (var i = 2; i < rounds + 2; i++) {
    x = -x;
    pi += x / (2 * i - 1);
}` },
  { name: "JS", lang: "javascript", code: `let x = 1.0;
let pi = 1.0;
for (let i = 2; i < rounds + 2; i++) {
  x *= -1;
  pi += x / (2 * i - 1);
}` },
  { name: "Mojo", lang: "python", code: `var result = Float64(0)
var sign = Float64(1)
for i in range(rounds):
    result += sign / Float64(2 * i + 1)
    sign = -sign` },
  { name: "Go", lang: "go", code: `x := 1.0
pi := 1.0
stop := float64(rounds + 2)
for i := 2.0; i <= stop; i++ {
	x = -x
	pi += x / (2.0*i - 1.0)
}` }
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
  { label: "Strict (MTP drafts)", value: 76.4, strict: true },
  { label: "llama.cpp / Ollama (MTP)", value: 74.7, muted: true },
  { label: "Strict (Qwen3.8 27B)", value: 46.6, strict: true },
  { label: "Strict (Brilliance 50X)", value: 45.3, strict: true },
  { label: "llama.cpp (Brilliance 50X)", value: 43.5 },
  { label: "llama.cpp (Qwen3.8 27B)", value: 43.0 }
];

const logoFrames = [
  ["1,000", 0.34, 1.13],
  ["10,000", 1.55, 6.05],
  ["100,000", 16.0, 75.8]
];

const forestFrames = [
  ["1,000", 0.2, 0.4, 0.28],
  ["10,000", 0.73, 2.85, 2.06],
  ["100,000", 6.68, 31.6, 20.3]
];

const particleTicks = [
  ["1,000", 0.028, 0.07, 0.97],
  ["100,000", 0.62, 0.87, 97.5],
  ["1,000,000", 7.9, 9.5, 1068]
];

const platforms = [["Windows", "windows"], ["Linux", "linux"], ["macOS", "macos"], ["Android", "android"], ["iOS", "ios"], ["Web", "web"]];

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
          <span className={"strictBarVal" + (row.strict ? " winner" : "")}>{row.value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {unit}</span>
        </div>
      ))}
    </div>
  );
}

function ResultTable({ columns, rows }) {
  return (
    <table className="strictResultTable">
      <thead>
        <tr>{columns.map(column => <th key={column}>{column}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(([label, ...milliseconds]) => (
          <tr key={label}>
            <td>{label}</td>
            {milliseconds.map((value, index) => (
              <td className={index === 0 ? "winner" : ""} key={columns[index + 1]}>
                {value.toLocaleString("en-US", { maximumFractionDigits: value < 0.1 ? 3 : 2 })} ms
                <span className="strictFps">{(1000 / value).toLocaleString("en-US", { maximumFractionDigits: value > 100 ? 1 : 0 })} fps</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
      {/* Hero Section with the interactive browser demo */}
      <section className="strictHero">
        <div className="wrapper strictHeroGrid">
          <div className="strictHeroText">
            <h1 className="strictEyebrow">Simple to read code for humans and computers alike</h1>
            <p className="strictHeroSpeed">
              <strong>Fastest native speed in the universe out of the box.</strong> For the amount of code you write, no language comes close: highly optimized low level code, splits loops over all cores or into GPU kernels and rewrites slow parts automatically: Games, Math, LLM, image/video generation can run faster than C, Rust, PyTorch, llama.cpp, game engines, etc.
            </p>
            <ul className="strictHeroBenchmarks">
              <li><a href="#llm">LLM</a>: 10% faster than llama.cpp</li>
              <li><a href="#generation">Image generation</a>: Moss 3-5x faster</li>
              <li><a href="#generation">Video generation</a>: 2-3x faster</li>
              <li><a href="#leibniz">Leibniz benchmark</a>: 4x faster</li>
              <li><a href="#performance">Game Engine</a>: 2-10x faster</li>
              <li><a href={doc("Benchmarks") + "#fractalzoomer"}>FractalZoomer</a>: fastest fractal zoomer in the web, 60 fps while zooming (<a href={baseUrl + "games/FractalZoomer/FractalZoomer.html"}>try it</a>)</li>
            </ul>
            <p className="strictPlatforms">
              {platforms.map(([name, anchor]) => (
                <a href={doc("Platforms") + "#" + anchor} key={anchor}>{name}</a>
              ))}
            </p>
            <div className="strictActions">
              <a className="button strictPrimary" href="#games" title="Play games in the browser">Play Games</a>
              <a className="button strictPrimary" href={baseUrl + "moss/MossWeb.html"} title="Generate images with Moss on your own GPU, in the browser">Moss in the Browser</a>
              <a className="button strictPrimary" href="#performance">Performance</a>
              <a className="button" href="#llm" title="LLM inference benchmarks">LLM</a>
              <a className="button" href="#generation" title="Image and video generation benchmarks">Image/Video</a>
              <a className="button" href="#scrunch" title="SCrunch in VS Code">SCrunch Demo</a>
              <a className="button" href={doc("Projects")}>Projects</a>
              <a className="button" href={doc("GettingStarted")}>Get Started</a>
              <a className="button" href={siteConfig.repoUrl}>GitHub</a>
            </div>
            <br /><br />
          </div>
          <div className="strictHeroPlayground" id="playground">
            <p className="strictEyebrow">Try Strict right now</p>
            <div id="strictPlaygroundApp" className="strictPlaygroundContainer">
              <div style={{ padding: "20px", textAlign: "center", color: "var(--strict-muted)" }}>
                Loading interactive Strict evaluator...
              </div>
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
                <div className="strictCardMedia" data-play-game={game.key} title={"Play " + game.title}>
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
                <div className="strictCardMedia" data-play-game={game.key} title={"Play " + game.title}>
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
          <p>
            All tests run in the Strict VM. It is not as fast as the generated native code (sometimes up to 100x slower), but fast enough to run all tests of huge projects and packages in milliseconds or seconds. Slow code is not allowed by default, slow tests have to be marked with <code>Slow(ReturnType)</code>. <a href={doc("Tests") + "#tests-must-be-fast"}>Tests must be fast →</a>
          </p>
          <p>
            <strong>Mutation testing on every run.</strong> Once the tests pass, Strict changes each method in tiny ways (a comparison always true, <code>+</code> swapped with <code>-</code>, a call dropped, the result replaced by <code>0</code>) and runs the tests again. A change no test notices fails the run: either a case is untested or the code makes no difference and can go. Mutants swap one bytecode instruction right before execution, so a full run over the Strict repository executes several million mutation tests. Results are cached per type and VS Code only retests what your change affects, so feedback stays sub millisecond; <code>strict test &lt;package&gt; unit</code> skips mutants, <code>full</code> runs everything. <a href={doc("Tests") + "#mutation-testing"}>Mutation testing →</a>
          </p>
          <p>
            <strong>Everything is tested, all the time.</strong> Every single .strict method has multiple tests, so every line runs many times, and mutation testing tries every possible change hundreds of times more. All of this runs far faster than other languages ever could, because the whole language is designed around this concept.
          </p>
          <p>
            <strong>Safe code from LLMs and agents.</strong> It is extremely easy and safe to let LLMs and agents write .strict code, because everything they write has to follow the Strict rules, limits and guardrails: no duplicate code, everything must be tested, every method starts with its tests, no surviving mutants, no errors and no warnings. Each of these fails the build, so an LLM or a human has to rewrite the code before it is even allowed to build.
          </p>
          <p>
            <strong>A language that keeps moving.</strong> The flip side: when a new feature, a design change or a new limit comes in, all code on top has to change as well. Strict does not stay the same, it is very flexible and currently changes all the time. You can pin a specific version for benchmarks or if you don't want to update.
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
              Plain code without manual tuning. Strict optimizes it by itself and uses as many threads as make sense.
            </p>
          </div>

          <div className="strictPerfGrid">
            <div className="strictBenchStack">
              <div className="strictBenchCard">
                <h3>Game Engine Stress Test: Bouncing Logos</h3>
                <p className="sub">Every logo entity is: sprite, velocity, spin, moving, turning, bouncing, sound</p>
                <ResultTable columns={["Logos", "Strict", "Unity 2022.3"]} rows={logoFrames} />
                <p className="strictBenchNote">Strict: new immutable entities built on all cores, one instanced draw call. Unity: a SpriteRenderer per logo. Sources: <a href="https://github.com/strict-lang/DeltaEngine/tree/main/Games/LogoApp">LogoApp</a>, <a href="https://github.com/strict-lang/DeltaEngine/tree/main/Games/LogoApp/Compare">Unity scene</a>.</p>
              </div>
              <div className="strictBenchCard">
                <h3>Entity Stress Test: Particles</h3>
                <p className="sub">Every particle is an entity: position, velocity, rotation, scale and lifetime</p>
                <ResultTable columns={["Particles", "Strict", "Unity, ParticleSystem", "Unity, MonoBehaviours"]} rows={particleTicks} />
                <p className="strictBenchNote">Strict: a new immutable list built on all cores every tick. Unity: its native particle system, or 5 MonoBehaviour Updates per particle. Sources: <a href="https://github.com/strict-lang/DeltaEngine/tree/main/Games/ParticleStress">ParticleStress</a>, <a href="https://github.com/strict-lang/DeltaEngine/tree/main/Games/ParticleStress/Compare">Unity scene</a>.</p>
              </div>
            </div>
            <div className="strictBenchCard">
              <h3>3D Instancing Stress Test: Forest</h3>
              <p className="sub">Fir trees of 192 triangles on a landscape with hills, every tree circles around its spot and turns every frame</p>
              <img className="strictBenchImage" src={img("screenshots/Forest.webp")} alt="Low poly fir trees seen from just above the forest, rendered by the Strict Forest stress test" loading="lazy" width="960" height="540" />
              <ResultTable columns={["Trees", "Strict", "Unity, GameObjects", "Unity, instanced"]} rows={forestFrames} />
              <p className="strictBenchNote">Strict: one instanced draw call, 19.2 million triangles at 100,000 trees. Unity: GameObjects or RenderMeshInstanced. Sources: <a href="https://github.com/strict-lang/DeltaEngine/tree/main/Games/Forest">Forest</a>, <a href="https://github.com/strict-lang/DeltaEngine/tree/main/Games/Forest/Compare">Unity scene</a>.</p>
            </div>
          </div>

          <div className="strictBenchCard strictBenchWide">
            <h3>Image Blur</h3>
            <p className="sub">9x9 box blur of a 4096x2048 photo, milliseconds per image on one i9-13900KF (and one Nvidia RTX 3080 GPU, November 2026), the same output image in every language</p>
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
            <p className="strictBenchNote">C keeps getting faster too: clang 23 runs the same plain C loop in 193.30 instead of 282.40 ms with clang 22, and Strict is faster on one thread (181.10 ms); with all cores and the GPU Strict is far ahead without any code change and even has 2 unit tests. Goose keeps a bounds check on every pixel read it cannot prove and runs on one thread. Sources: <a href={siteConfig.repoUrl + "/tree/master/ImageProcessing/Compare"}>ImageProcessing/Compare</a>, <a href={doc("Benchmarks") + "#image-blur"}>Benchmarks</a>.</p>
          </div>

          <div className="strictBenchCard strictBenchWide" id="leibniz">
            <h3>Leibniz Formula for Pi</h3>
            <p className="sub">1 billion terms of the Leibniz series, milliseconds per run (lower is better). Strict: average of the best 3 of 100 runs on one i9-13900KF (November 2026); C++, C, Rust and Python from <a href="https://speed-comparison.vercel.app/">speed-comparison</a> measured on the same PC, the other languages scaled to it by the Rust run (771.89 ms here, 705.02 ms there)</p>
            <div className="strictPerfGrid">
              <div>
                <BarChart rows={leibnizSpeed} unit="ms" lower />
              </div>
              <div>
                <CodeTabs name="leibnizCode" tabs={leibnizCode} />
              </div>
            </div>
            <p className="strictBenchNote">Three lines of plain Strict, no intrinsics, unrolling or threads: the compiler vectorizes the loop and splits it over all cores. A GPU version works too, but its startup cost doesn't pay off for a 10 ms job. Sources: <a href={siteConfig.repoUrl + "/blob/master/Examples/Leibniz.strict"}>Leibniz.strict</a>, <a href="https://github.com/niklas-heer/speed-comparison/tree/master/src">speed-comparison</a>.</p>
          </div>

          <div className="strictPerfGrid" id="llm">
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
                <p className="strictBenchNote">llama.cpp b11658, same GPU. Hosted models for scale (<a href="https://artificialanalysis.ai/">Oct 2026</a>). <a href={doc("Benchmarks") + "#qwen3-and-qwen38"}>Qwen3Benchmark.strict</a></p>
              </div>
            </div>
            <div className="strictBenchStack">
              <div className="strictBenchCard">
                <h3>Qwen3.8 &amp; Reasoning Models (RTX 4090)</h3>
                <p className="sub">Hybrid Gated DeltaNet with full attention and linear recurrence, 4-bit (Q4_K_M)</p>
                <div className="strictBenchGroup">
                  <h4>Qwen3.8 27B &amp; Brilliance 50X</h4>
                  <BarChart rows={qwen38Speed} unit="tok/s" />
                  <p className="strictBenchNote">Qwen3.8 Brilliance 50X uses extensive thinking to give it a shot against much larger models, runs out of the box. MTP drafting reaches 76.40 tok/s (Ollama 74.70).</p>
                </div>
                <p className="strictBenchNote">Source: <a href={doc("Benchmarks") + "#qwen3-and-qwen38"}>Qwen3Benchmark.strict</a></p>
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
          </div>

          <div className="strictPerfGrid" id="generation" style={{ marginTop: "24px" }}>
            <div className="strictBenchCard">
              <h3>Moss Image Generation (RTX 3080 and RTX 4090)</h3>
              <p className="sub">A batch of 720x1280 images of the default prompt (50 on the RTX 3080, 100 on the RTX 4090), int8 Convrot Moss, warm, average seconds per image from the prompt to the saved image (text encoding, sampling, VAE, save; lower is better), ★ = quality rated by eye</p>
              <div className="strictBenchGroup">
                <BarChart rows={mossSpeed} unit="s" lower />
                <p className="strictBenchNote"><code>MossImage.exe</code> needs no Python or ComfyUI, only the model files; its presets use the DMD turbo LoRA with 8 steps or fewer, <code>fast</code>, <code>faster</code> and <code>fastest</code> let Spectrum forecast skipped steps, which changes the image. The Strict Moss Sampler node replaces the KSampler of ComfyUI's graph with a resident <code>MossImage.exe</code>, ComfyUI still encodes the prompt and decodes. ComfyUI 8 steps is its default workflow with the turbo LoRA, 25 and 50 steps run without it (two model runs per step). With an unchanged prompt ComfyUI and the node both take 3.2–3.3 s per image. The node's gain grows with the size: single images take 6.5 s with ComfyUI against 4.5–4.8 s with the node at 720p, 13.7 s against about 7 s at 1088p; at 480p and below ComfyUI's own overhead dominates. MossWeb is the same Strict code in Chrome on WebGPU with the int4 4-step model (one star less for int4), seconds per image without loading the models or encoding the prompt; 480p is the better choice on the web. <a href={baseUrl + "moss/MossWeb.html"}>Try MossWeb</a>: Chrome, Edge and Firefox with WebGPU, 4 GB of GPU memory or more; on a Galaxy S25 Ultra a 160p image takes about 13 s, 240p about 22 s. RTX 3080, MossImage November 8, ComfyUI October 29, MossWeb November 3, its fastest2steps November 9.</p>
              </div>
              <div className="strictBenchGroup">
                <h4>RTX 4090</h4>
                <BarChart rows={mossSpeed4090} unit="s" lower />
                <p className="strictBenchNote">The same batches on the RTX 4090 with 8 bit attention: <code>best</code> samples an image in 1.0 s (8 steps of 122 ms), ComfyUI's default workflow takes 2.3 s for its 8 steps. MossWeb in Chrome as above, a new prompt adds about 9 s there. November 9.</p>
              </div>
              <p className="strictBenchNote">More: <a href={doc("MossImage")}>Moss Image Generation</a>, <a href={baseUrl + "moss/MossWeb.html"}>MossWeb in the browser</a>, source: <a href="https://github.com/strict-lang/StrictComfy">StrictComfy</a></p>
            </div>            
            <div className="strictBenchCard">
              <h3>MiniMax H3 Video + Audio Generation (RTX 4090)</h3>
              <p className="sub">Text to video with sound, 12 s clip (480x832, 294 frames), warm, seconds per video from the prompt to the mp4 (text encoding, sampling, video and audio VAE, mp4; lower is better), ★ = quality rated by eye</p>
              <div className="strictBenchGroup">
                <BarChart rows={h3Speed} unit="s" lower />
                <p className="strictBenchNote">With the same model and steps <code>H3Video.exe</code> is 2.2x (fastest against turbo 4 steps) to 2.4x (best against turbo 8 steps) faster than ComfyUI. Strict side November 6. <code>faster</code> and the fewest-step presets skip work with Spectrum or fewer steps.</p>
              </div>
              <div className="strictBenchGroup">
                <h4>ComfyUI Workflow, 5 s Clip (124 frames, Prompt Cached)</h4>
                <BarChart rows={h3ComfySpeed} unit="s" lower />
                <p className="strictBenchNote">ComfyUI's default workflow (turbo LoRA, 8 steps), the same graph with the Strict H3 Sampler node (samples and decodes in a resident <code>H3Video.exe</code>) and <code>H3Video.exe</code> on its own. October 29.</p>
              </div>
              <p className="strictBenchNote">More: <a href={doc("H3Video")}>MiniMax H3 Video Generation</a>, source: <a href="https://github.com/strict-lang/StrictComfy">StrictComfy</a></p>
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
      <section className="strictLatest" id="latest">
        <div className="wrapper">
          <p className="strictEyebrow">Latest Development</p>
          <h2>Mutation Testing for Every Test: Over 6,400 Survivors Fixed in a Day</h2>
          <p>
            <code>strict test</code> now mutates every tested method after its tests pass and fails on any change the tests don't notice. Running it over all Strict packages uncovered thousands of untested corner cases and checks that made no difference; close to 160 commits since 1 am today fixed over 6,400 of them, removed dead code like an unused parser with 26 node types, and turned repeated patterns into new rules for magic numbers and loops. <a href={baseUrl + "blog/2026/11/05/mutation-testing-for-every-test"}>Read the story →</a>
          </p>
          <h2>Qwen3.8 27B &amp; Brilliance 50X Run in Strict, 30B MoE at 210.00 tok/s</h2>
          <p>
            Qwen3.8 27B and the newly released <strong>Brilliance 50X</strong> reasoning model run directly in Strict with Gated DeltaNet layers, reaching 46.60 and 45.30 tokens/second on an RTX 4090 — matching and slightly beating llama.cpp base decoding. Qwen3-Coder-30B-A3B MoE now reaches 210.00 tokens/second in Strict (ahead of llama.cpp at 190.00). All DeltaEngine games and samples also compile to WebAssembly and WebGL 2 via <code>strict build Game.strict web</code>.
          </p>
          <a className="button" href={baseUrl + "blog/"}>Read the Development Blog</a>
        </div>
      </section>
    </main>
  );
}

module.exports = Index;


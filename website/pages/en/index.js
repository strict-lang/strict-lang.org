const React = require("react");
const { MarkdownBlock } = require("../../core/CompLibrary.js");
const snippets = {
  "small": "has celsius Number\nhas logger\nToFahrenheit Number\n\tTemperatureConverter(100).ToFahrenheit is 212\n\tTemperatureConverter(0).ToFahrenheit is 32\n\tcelsius * 9 / 5 + 32",
  "compiler": "Built(path Text, root Text) Number\n\tlet failed = Execute(logger).Test(path, root)\n\tfailed > 0 then failed else Compile(path, root)",
  "gpu": "IsPure Boolean\n\tDoubling.IsPure\n\tMlirGpuCheck(MlirKernel.Doubler, 2).IsPure\n\tRandomizing.IsPure is false\n\tlet isSimple = MlirKernel(function, position).IsSimple and MlirLoops(function, position).IsCollecting\n\tisSimple or MlirParallel(function, position).IsParallel",
  "quickstart": "has width Number\nhas height Number\nhas logger\nArea Number\n\tAreaCalculator(3, 4).Area is 12\n\tAreaCalculator(10, 5).Area is 50\n\twidth * height"
};
const codeBlock = code => "```\n" + code + "\n```";

function Card({ title, image, alt, children, href, code, source }) {
  return (
    <article className="strictCard">
      {image && <a className="strictCardImage" href={href}><img src={image} alt={alt} loading="lazy" width="960" height="540" /></a>}
      <div className="strictCardBody">
        <h3><a href={href}>{title}</a></h3>
        <p>{children}</p>
        {code && <div className="strictCardCode"><p className="strictSourceLabel">{source}</p><MarkdownBlock>{codeBlock(code)}</MarkdownBlock></div>}
        <a className="strictReadMore" href={href}>Explore →</a>
      </div>
    </article>
  );
}

function Index({ config: siteConfig }) {
  const { baseUrl } = siteConfig;
  const doc = name => baseUrl + "docs/" + name;
  const img = name => baseUrl + "img/" + name;
  return (
    <main className="strictHome">
      <section className="strictHero wrapper">
        <img className="strictBrand" src={img("StrictBanner.png")} alt="Strict Programming Language" width="1000" height="340" />
        <h1>Clean code. Native speed.</h1>
        <p className="strictHeroLead">Change an expression. See tests respond. Follow the values beside your code.
          Strict and SCrunch bring immediate feedback to VS Code, so you can stay with the idea you're working on.</p>
        <figure className="strictDemo">
          <video autoPlay controls muted loop playsInline preload="auto" poster={img("screenshots/scrunch-demo-poster.jpg")} width="960" height="720" aria-label="Write Fibonacci in VS Code: the tests fail first, then pass and the loop values appear beside each line">
            <source src={img("SCrunchDemo.mp4")} type="video/mp4" />
            <a href={img("SCrunchDemo.mp4")}>Watch the red-to-green test demo</a>
          </video>
          <figcaption>Write the tests. See why they fail. Implement it and watch the values appear. Actual VS Code capture from Strict/Examples; pauses shortened.</figcaption>
        </figure>
        <div className="strictFlow">
          <h2>Stay in the flow. See what every change does.</h2>
          <p>Tests run in the background. Green and red marks show the result where you write the code; line values show how it got there.
            Thousands of small tests with subsecond feedback are the goal behind the whole experience.</p>
        </div>
        <div className="strictActions">
          <a className="button strictPrimary" href={doc("GettingStarted")}>Get Started</a>
          <a className="button" href={doc("VSCode")}>The VS Code Experience</a>
          <a className="button" href={siteConfig.repoUrl}>GitHub</a>
        </div>
      </section>

      <section className="strictQuickstart" id="quickstart">
        <div className="wrapper strictExample">
          <div>
            <p className="strictEyebrow">Start in VS Code</p>
            <h2>Quickstart</h2>
            <ol>
              <li>Open the Strict repository in VS Code with the Strict extension installed.</li>
              <li>Open <code>Examples/AreaCalculator.strict</code> and keep the Testing view beside it.</li>
              <li>Change <code>width * height</code> to <code>width + height</code> and save. Read the failure, restore the multiplication, and watch the tests turn green.</li>
            </ol>
            <p>The tests explain the method. The last line is the result. Values beside each line let you follow the calculation.</p>
            <a href={doc("GettingStarted")}>Install Strict and get started →</a>
          </div>
          <div className="strictCodeExample"><p className="strictSourceLabel">Examples/AreaCalculator.strict · excerpt</p><MarkdownBlock>{codeBlock(snippets.quickstart)}</MarkdownBlock></div>
        </div>
      </section>

      <section className="wrapper strictShowcase">
        <div className="strictSectionHeading"><p className="strictEyebrow">Built with Strict</p><h2>Real projects. Real performance.</h2></div>
        <div className="strictCards">
          <Card title="Games, websites and applications" image={img("SoulCraft.webp")} alt="SoulCraft gameplay running on the Strict port of DeltaEngine" href={doc("Projects")}>
            DeltaEngine and SoulCraft bring game logic into Strict. Keep ASP.NET, Vite and existing frameworks for the rest of your application.
          </Card>
          <Card title="Qwen3-8B at 142 tokens/s" image={img("QwenInference.svg")} alt="Qwen3-8B transformer inference on an RTX 4090 at 142 tokens per second" href={doc("MachineLearning")}>
            Local Q4_K_M inference on an RTX 4090 now decodes faster than llama.cpp. Transformer logic written in Strict, with more optimizations underway.
          </Card>
          <Card title="C, C# and exact decimals" image={img("NativeInterop.svg")} alt="A Strict native library connects C callers and generated C# bindings" href={doc("UsingApis")}>
            Build a native library with generated C# bindings. Share records, lists and exact decimal values with the application you already have.
          </Card>
        </div>
        <a className="strictGameStrip" href={doc("Projects")}>
          <img src={img("ArenaWars.webp")} alt="Arena Wars battle with blue units and bases in the current DeltaEngine port" loading="lazy" width="1280" height="720" />
          <div><p className="strictEyebrow">DeltaEngine</p><h3>SoulCraft. Arena Wars. And more.</h3><p>A shared engine, a growing collection of games, and gameplay written in Strict.</p><span>Explore the projects →</span></div>
        </a>
      </section>

      <section className="wrapper strictLanguageCards">
        <div className="strictSectionHeading"><p className="strictEyebrow">Under the hood</p><h2>Small methods. Serious programs.</h2></div>
        <div className="strictCards">
          <Card title="A small, readable language" href={doc("Types")} code={snippets.small} source="Examples/TemperatureConverter.strict">
            One file per type, short methods and examples beside the implementation. Immutable values and one consistent style keep code readable.
          </Card>
          <Card title="A compiler written in Strict" href={doc("Architecture")} code={snippets.compiler} source="Compiler/NativeBuild.strict">
            The parser, type inference, validators, VM and native code generator build themselves into one executable.
          </Card>
          <Card title="Fast performance" href={doc("Concurrency")} code={snippets.gpu} source="Compiler/MlirGpuCheck.strict">
            SIMD, CPU workers and NVIDIA GPU kernels accelerate numeric workloads. Tests and profiling guide each optimization.
          </Card>
        </div>
      </section>
      <section className="wrapper strictAlgorithm">
        <a href={doc("VSCode") + "#read-the-execution-beside-the-code"}><img src={img("screenshots/fibonacci-values.jpg")} alt="Fibonacci in VS Code showing passing tests, loop hit counts and the values of first, second and next on each iteration" loading="lazy" width="1442" height="901" /></a>
        <p>Follow an algorithm through the values from its tests. <a href={doc("VSCode")}>Explore the VS Code experience →</a></p>
      </section>
      <section className="strictLatest">
        <div className="wrapper"><p className="strictEyebrow">October 16, 2026</p><h2>Strict feels alive</h2><p>SCrunch, Qwen3-8B, exact decimals, interop and the projects driving it all.</p><a className="button" href={baseUrl + "blog/2026/10/16/strict-live-feedback-qwen3-and-interop"}>Read the development post</a></div>
      </section>
    </main>
  );
}
module.exports = Index;

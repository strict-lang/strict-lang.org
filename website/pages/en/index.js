/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const exampleCode = `\`\`\`
has number
has logger
Classify Text
	FizzBuzz(3).Classify is "Fizz"
	FizzBuzz(5).Classify is "Buzz"
	FizzBuzz(15).Classify is "FizzBuzz"
	FizzBuzz(7).Classify is "7"
	if number % 15 is 0
		return "FizzBuzz"
	if number % 3 is 0
		return "Fizz"
	if number % 5 is 0
		return "Buzz"
	number to Text
Run
	logger.Log("FizzBuzz(15) = " + FizzBuzz(15).Classify)
\`\`\``;

const exampleText = `Every \`.strict\` file is one type, named after the file. Members come first, then methods.

The first lines of every method are its **tests**. They run once when the code is compiled and are then removed, so they cost nothing at runtime.

The last line is the result. There are no curly brackets, semicolons, comments, empty lines, \`null\` or exceptions.

[Read the language guide](/docs/Types) or [see more examples](/docs/Examples).`;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig } = this.props;
    const { baseUrl } = siteConfig;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <img src={`${baseUrl}img/StrictBanner.png`} alt={siteConfig.title} />
          <MarkdownBlock>{siteConfig.tagline}</MarkdownBlock>
          <PromoSection>
            <Button href={`${baseUrl}docs/GettingStarted`}>Get Started</Button>
            <Button href={`${baseUrl}docs/Types`}>Language Guide</Button>
            <Button href={siteConfig.repoUrl}>GitHub</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container
        padding={["bottom", "top"]}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align={props.align || "center"}
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const LearnHow = () => (
      <Block>
        {[
          {
            content:
              "Strict is a simple programming language that humans can read and understand, and that computers can also understand, modify and write. " +
              "The long-term goal is not just another programming language, but a foundation for computers to understand and write code themselves. " +
              "For that it has to be very fast, both when executing code and when writing it, so millions of lines of code can be evaluated in seconds.",
            image: `${baseUrl}img/StrictLogoBlue256x256.png`,
            imageAlign: "right",
            title: "A language computers can understand"
          }
        ]}
      </Block>
    );

    const Example = () => (
      <Container padding={["bottom", "top"]} background="light">
        <div className="gridBlock">
          <div className="blockElement twoByGridBlock">
            <div className="blockContent">
              <h2>Strict at a glance</h2>
              <MarkdownBlock>{exampleText}</MarkdownBlock>
            </div>
          </div>
          <div className="blockElement twoByGridBlock">
            <div className="blockContent">
              <MarkdownBlock>{exampleCode}</MarkdownBlock>
            </div>
          </div>
        </div>
      </Container>
    );

    const Features = () => (
      <Block layout="threeColumn">
        {[
          {
            title: "Tested by design",
            content:
              "Every method starts with tests that show how to use it. The base library is the documentation of the language. " +
              "In VS Code, SCrunch runs the tests on every save. " +
              "[Tests](/docs/Tests)"
          },
          {
            title: "Exactly one way",
            content:
              "Code that breaks the rules doesn't compile: unused values, `mutable` values that never change, long methods, wrong formatting. No warnings, only errors. " +
              "[Coding Style](/docs/CodingStyle)"
          },
          {
            title: "Immutable and functional",
            content:
              "Values never change, everything is an expression, and a `for` loop filters, maps, sums or multiplies in two lines. " +
              "[For](/docs/For)"
          },
          {
            title: "Written in Strict",
            content:
              "The compiler is a set of `.strict` packages that compiles itself into a native executable. No .NET or other runtime needed. " +
              "[Architecture](/docs/Architecture)"
          },
          {
            title: "Fast and native",
            content:
              "MLIR, LLVM and clang turn Strict into small native executables for Windows and Linux. Immutable values reuse memory in place instead of copying. " +
              "[Getting Started](/docs/GettingStarted)"
          },
          {
            title: "Small",
            content:
              "A few dozen base types: `Number`, `Text`, `List`, `Dictionary`, `Range`, `Error`, `Logger`, `File` and a handful of traits. External code plugs in through traits. " +
              "[Base Types](/docs/BaseTypes)"
          }
        ]}
      </Block>
    );

    const Pipeline = () => (
      <div
        className="productShowcaseSection"
        style={{ paddingTop: "30px", paddingBottom: "30px", background: "#f7f7f7" }}
      >
        <img
          src={`${baseUrl}img/StrictPipeline.svg`}
          alt="How Strict code becomes a program"
          style={{ maxWidth: "960px", width: "100%" }}
        />
      </div>
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <LearnHow />
          <Example />
          <Features />
          <Pipeline />
        </div>
      </div>
    );
  }
}

module.exports = Index;

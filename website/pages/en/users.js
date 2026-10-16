const React = require('react');
const { Container, GridBlock } = require('../../core/CompLibrary.js');
function Users(props) {
  const baseUrl = props.config.baseUrl;
  return (
    <div className="mainContainer">
      <Container padding={['bottom', 'top']}>
        <h1>Built with Strict</h1>
        <p>Games, web applications, neural networks and the language itself are driving development.</p>
        <GridBlock align="left" layout="threeColumn" contents={[
          { title: 'DeltaEngine and SoulCraft', content: '[DeltaEngine](https://deltaengine.net) is moving its ongoing work to Strict. The shared engine supports a growing game collection, with SoulCraft bringing its worlds, heroes and gameplay into Strict.' },
          { title: 'Websites and applications', content: 'Keep ASP.NET, Vite and existing services. Use tested Strict logic through native C and generated C# bindings, with exact decimal values across the boundary. [Integration guide](/docs/UsingApis).' },
          { title: 'Models and the compiler', content: 'From training networks to Qwen3-8B inference, the [machine-learning packages](/docs/MachineLearning) exercise native performance. The compiler, VM and validators are written in Strict too.' }
        ]} />
        <a className="button" href={baseUrl + 'docs/Projects'}>Explore the projects</a>
      </Container>
    </div>
  );
}
module.exports = Users;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

function Help(props) {
  const {config: siteConfig} = props;
  const {baseUrl, docsUrl, repoUrl} = siteConfig;
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const docUrl = (doc) => `${baseUrl}${docsPart}${doc}`;

  const supportLinks = [
    {
      content: `Try the [VS Code walkthrough](${docUrl('VSCode')}) and [Getting Started](${docUrl('GettingStarted')}), the [language guide](${docUrl(
        'Types',
      )}) and the [cheat sheet](${docUrl('EverythingNeededForKata')}).`,
      title: 'Browse Docs',
    },
    {
      content: `Explore [games and applications](${docUrl('Projects')}), [Qwen3 inference](${docUrl('MachineLearning')}) and the [source on GitHub](${repoUrl}) and the [Base Types](${docUrl(
        'BaseTypes',
      )}) overview.`,
      title: 'Explore Real Programs',
    },
    {
      content: `Found a bug or have a question? [Open an issue](${repoUrl}/issues), or follow the [blog](${baseUrl}blog).`,
      title: 'Get in Touch',
    },
  ];

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>Need help?</h1>
          </header>
          <GridBlock contents={supportLinks} layout="threeColumn" />
        </div>
      </Container>
    </div>
  );
}

module.exports = Help;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    return `${baseUrl}${docsPart}${doc}`;
  }

  render() {
    const { baseUrl, repoUrl, websiteRepoUrl } = this.props.config;
    return (
       <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('VSCode')}>The VS Code Experience</a>
            <a href={this.docUrl('GettingStarted')}>Getting Started</a>
            <a href={this.docUrl('Platforms')}>Platforms</a>
            <a href={this.docUrl('Projects')}>Built with Strict</a>
            <a href={this.docUrl('Types')}>Language Guide</a>
            <a href={this.docUrl('EverythingNeededForKata')}>Cheat Sheet</a>
            <a href={this.docUrl('CodingStyle')}>Coding Style</a>
          </div>
          <div className="strictFooterSource">
            <h5>Source</h5>
            <a href={this.docUrl('BaseTypes')}>Base Types</a>
            <a href={this.docUrl('Architecture')}>Architecture</a>
            <a href={this.docUrl('Examples')}>Examples</a>
            <a href={this.docUrl('MachineLearning')}>Qwen3 and Machine Learning</a>
            <a href={this.docUrl('UsingApis')}>C and C# Interop</a>
          </div>
          <div>
            <h5>More</h5>
            <a href={`${baseUrl}blog`}>Blog</a>
            <a href={repoUrl}>GitHub</a>
            <a href={`${repoUrl}/issues`}>Issues</a>
            <a href="https://github.com/strict-lang/strict-vscode-client">VS Code Extension</a>
            <a href={websiteRepoUrl}>Website Source</a>
            <a
              className="github-button"
              href={repoUrl}
              data-icon="octicon-star"
              data-count-href="/strict-lang/Strict/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star Strict on GitHub">
              Star
            </a>
          </div>
        </section>
        <section className="copyright">
          Copyright © 2000-2026 <a href={this.props.config.authorUrl}>Benjamin Nitschke</a>
        </section>
      </footer>
    );
  }
}

module.exports = Footer;

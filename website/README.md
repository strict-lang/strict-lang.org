Contains all documentation and the overview site for the Strict Programming Language.

Benchmark updates: retain available measurement precision in chart data and display benchmark times and rates with two decimal places, including prose and breakdowns. Use milliseconds for short stages when seconds would hide meaningful differences. Use recorded results; do not rerun benchmarks for formatting or invent missing hundredths. The shared BarChart formatter applies this convention to every chart, including future rows.

This website was created with [Docusaurus](https://docusaurus.io/).

Make sure all the dependencies for the website are installed (all of the following in this /website folder):

```sh
$ yarn
```

Run your dev server:

```sh
$ yarn start
```

Build to create all the html/js files to copy onto production webserver:

```sh
$ yarn build
```

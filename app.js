const _ = require('lodash');
const npmAPI = require('./src/api/npm');
const stackoverflowAPI = require('./src/api/stackoverflow');
const githubAPI = require('./src/api/github');
const writeJson = require('./src/writeJson');
const sources = require('./sources.json');

async function npmWeekInfo() {
  const weekData = sources.sources.map(res => npmAPI.transformNpmWeekData(res.repo, res.pkg));
  const combineWeekData = await Promise.all(weekData);
  const finalWeekData = _.flatten(combineWeekData);

  return finalWeekData;
}

async function stackoverflowWeekInfo() {
  let arr = [];

  for (const source in sources.sources) {
    let res = sources.sources[source];
    let weekData = await stackoverflowAPI.transformStackOverflowWeekData(res.repo, res.keyword);
    arr.push(weekData);
  }

  const finalWeekData = _.flatten(arr);

  return finalWeekData;
}

async function githubIssuesInfo() {
  const weekPromise = sources.sources.map(res => githubAPI.transformIssuesData(res.repo));
  const combineWeekData = await Promise.all(weekPromise);
  const finalWeekData = _.flatten(combineWeekData);
  return finalWeekData;
}

async function githubPrsInfo() {
  const weekPromise = sources.sources.map(res => githubAPI.transformPrsData(res.repo));
  const combineWeekData = await Promise.all(weekPromise);
  const finalWeekData = _.flatten(combineWeekData);
  return finalWeekData;
}

async function githubStarWeekInfo() {
  const weekPromise = sources.sources.map(res => githubAPI.transformStarsWeekData(res.repo));
  const combineWeekData = await Promise.all(weekPromise);
  const finalWeekData = _.flatten(combineWeekData);
  return finalWeekData;
}

async function main() {
  // const npm = await npmWeekInfo();
  // writeJson('./files/npm-last-year.json', { npm: npm });

  // const stackoverflow = await stackoverflowWeekInfo();
  // writeJson('./files/stackoverflow-last-year.json', { stackoverflow: stackoverflow });

  // const githubStar = await githubStarWeekInfo();
  // writeJson('./files/github-star-temp.json', { githubStar: githubStar });

  // const githubIssues = await githubIssuesInfo();
  // writeJson('./files/github-issues.json', { githubIssues: githubIssues });

  // const githubPrs = await githubPrsInfo();
  // writeJson('./files/github-prs.json', { githubPrs : githubPrs });
}

main();

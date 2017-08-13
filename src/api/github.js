const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

const access_token = [''];

const GITHUB_URL = 'https://api.github.com';

// use your github count
const axiosGit = axios.create({
  headers: {
    Accept: 'application/vnd.github.v3.star+json',
  },
  params: {
    client_id: '',
    client_secret: '',
    access_token: access_token[Math.floor(Math.random() * access_token.length)],
  },
});

async function reqGithubAPI(path, params) {
  const res = await axiosGit.get(`${GITHUB_URL}/${path}`, { params });
  return res;
}

async function getPageNum(path, perPage = 100) {
  const res = await reqGithubAPI(path, { per_page: perPage });
  const link = res.headers.link;

  if (!link) { return 1; }
  return parseInt(/next.*?per_page=100&page=(\d*).*?last/.exec(link)[1], 10);
}

async function getOriData(url, params) {
  const pageNum = await getPageNum(url);

  // const res = _.range(pageNum).map((i) => reqGithubAPI(url, _.merge({ page: (i + 1), per_page: 100 }, params)));
  // const combineRes = await Promise.all(res).catch(err => {
  //   throw 'Github api limit exceeded, Try in the new hour!'
  // });
  // const finRes = _.flatten(combineRes.map(res => res.data));

  let arr = [];
  for (let i in _.range(pageNum)) {
    let res = await reqGithubAPI(url, _.merge({ page: (i + 1), per_page: 100 }, params));
    arr.push(res.data);
  }
  let finRes = _.flatten(arr);

  return finRes;
}

async function transformIssuesData(repos) {
  const issues = await getOriData(`repos/${repos}/issues`, { state: 'all' });

  return issues.map(res => {
    const createdTime = moment(res.created_at);
    const closedTime = res.closed_at ? moment(res.closed_at) : null;

    return {
      repos_id: repos,
      issues_id: res.id,
      created_date: res.created_at ? res.created_at.slice(0, 10): null,
      closed_date: res.closed_at ? res.closed_at.slice(0, 10): null,
      close_diff_time: closedTime ? closedTime.diff(createdTime) : null,
      state: res.state,
      comments: res.comments,
      user_id: res.user.id,
      user_name: res.user.login,
    };
  });
}

async function transformPrsData(repos) {
  const prs = await getOriData(`repos/${repos}/pulls`, { state: 'all' });

  return prs.map(res => {
    const createdTime = moment(res.created_at);
    const closedTime = res.closed_at ? moment(res.closed_at) : null;
    const mergedTime = res.merged_at ? moment(res.merged_at) : null;

    return {
      repos_id: repos,
      prs_id: res.id,
      created_date: res.created_at ? res.created_at.slice(0, 10): null,
      closed_date: res.closed_at ? res.closed_at.slice(0, 10): null,
      merged_date: res.merged_at ? res.merged_at.slice(0, 10): null,
      close_diff_time: closedTime ? closedTime.diff(createdTime) : null,
      merge_diff_time: mergedTime ? mergedTime.diff(createdTime) : null,
      state: res.state,
      user_id: res.user.id,
      user_name: res.user.login,
    };
  });
}

async function transformStarsDetailData(repos) {
  const stars = await getOriData(`repos/${repos}/stargazers`);

  return stars.map(res => {
    return {
      repos_id: repos,
      stared_date: res.starred_at ? res.starred_at.slice(0, 10): null,
      user_id: res.user.id,
      user_name: res.user.login,
    };
  });
}

async function transformStarsDayData(repos) {
  const stars = await getOriData(`repos/${repos}/stargazers`);
  const days = {};

  stars.forEach(res => {
    const stared_date = res.starred_at ? res.starred_at.slice(0, 10): null;
    const stat_date = moment(stared_date).format('YYYY-MM-DD');

    if (!days[stat_date]) days[stat_date] = 1;
    days[stat_date] += 1;
  });

  return _.map(days, (res, key) => {
    return {
      stat_date: key,
      stared_count: res,
    }
  });
}

async function transformStarsWeekData(repos, startDate = '2016-07-31', endDate = '2017-08-06') {
  const stars = await getOriData(`repos/${repos}/stargazers`);
  const weeks = {};

  stars.forEach(res => {
    const stared_date = res.starred_at ? res.starred_at.slice(0, 10): null;
    const week_start_date = moment(stared_date).day(0).format('YYYY-MM-DD');

    if (!weeks[week_start_date]) weeks[week_start_date] = 1;
    weeks[week_start_date] += 1;
  });

  const startMomentDate = moment(startDate);
  let i = 0;
  let lastData = 0;
  let finalWeeks = {};

  while(1) {
    let currentDate = startMomentDate.day(7).format('YYYY-MM-DD');
    if (currentDate === endDate) break;

    let staredCount = weeks[currentDate] ? weeks[currentDate] : 0;

    finalWeeks[currentDate] = {
      stared_count: staredCount,
      compared_rate: (lastData && staredCount) ? ((weeks[currentDate] - lastData) / lastData).toFixed(2): null,
    };

    lastData = weeks[currentDate];
    i++;
  }

  return _.map(finalWeeks, (res, key) => {
    return {
      repos_id: repos,
      week_start_date: key,
      stared_count: res.stared_count,
      compared_rate: res.compared_rate,
    }
  });
}

async function transformCommitsWeekData(repos) {
  const commits = await getOriData(`repos/${repos}/stats/contributors`);
  let arr = [];

  commits.forEach(res => {
    let user_id = res.author.id;
    let user_login = res.author.login;
    let weeks = res.weeks;

    weeks.forEach(week => {
      let w = moment(week.w, 'X');

      if (week.a !== 0 && week.d !== 0 && week.c !== 0) {
        arr.push({
          repos_id: repos,
          user_id: user_id,
          user_login: user_login,
          week_start_date: w.format('YYYY-MM-DD'),
          add_count: week.a,
          del_count: week.d,
          commit_count: week.c,
        });
      }
    });
  });

  return arr;
}

module.exports = {
  transformPrsData,
  transformIssuesData,
  transformStarsDetailData,
  transformStarsWeekData,
  transformStarsDayData,
  transformCommitsWeekData,
}

const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

const NPM_STATS_URL = 'https://npm-stat.com/downloads/range';

const axiosJson = axios.create({
  headers: {
    Accept: 'application/json',
  },
});

async function reqNpmAPI(pkg) {
  const time = `2013-08-10:${moment().format('YYYY-MM-DD')}`;
  const res = await axiosJson.get(`${NPM_STATS_URL}/${time}/${pkg}`);
  return res.data.downloads;
}

async function transformNpmDayData(repos, pkg) {
  const npm = await reqNpmAPI(pkg);
  const arr = [];

  npm.forEach(res => {
    if (res.downloads !== 0) {
      arr.push({
        pkg_id: pkg,
        repos_id: repos,
        downloads_count: res.downloads,
        stat_date: res.day,
      });
    }
  });

  return arr;
}

async function transformNpmWeekData(repos, pkg, startDate = '2016-07-31', endDate = '2017-08-06') {
  const npm = await reqNpmAPI(pkg);
  const weeks = {};

  npm.forEach(res => {
    const week_start_date = moment(res.day).day(0).format('YYYY-MM-DD');

    if (!weeks[week_start_date]) { weeks[week_start_date] = res.downloads; }
    weeks[week_start_date] += res.downloads;
  });

  const startMomentDate = moment(startDate);
  let i = 0;
  let lastData = 0;
  let finalWeeks = {};

  while(1) {
    let currentDate = startMomentDate.day(7).format('YYYY-MM-DD');
    if (currentDate === endDate) break;

    finalWeeks[currentDate] = {
      downloads_count: weeks[currentDate] ? weeks[currentDate] : 0,
      compared_rate: lastData ? ((weeks[currentDate] - lastData) / lastData).toFixed(2) : null,
    };

    lastData = weeks[currentDate];
    i++;
  }

  return _.map(finalWeeks, (res, key) => {
    return {
      pkg_id: pkg,
      repos_id: repos,
      week_start_date: key,
      downloads_count: res.downloads_count,
      compared_rate: res.compared_rate,
    }
  });
}

module.exports = {
  transformNpmDayData,
  transformNpmWeekData,
}

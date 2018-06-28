const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

const NPM_STATS_URL = 'https://api.npmjs.org/downloads/range';

const axiosJson = axios.create({
  headers: {
    Accept: 'application/json',
  },
});

async function reqNpmAPI(startDate, endDate, pkg) {
  const res = await axiosJson.get(`${NPM_STATS_URL}/${startDate}:${endDate}/${pkg}`);
  return res.data.downloads;
}

async function transformNpmDayData(repos, pkg, startDate = '2017-07-31', endDate = '2018-06-28') {
  const npm = await reqNpmAPI(startDate, endDate, pkg);
  const arr = [];

  npm.forEach(res => {
    arr.push({
      pkg_id: pkg,
      repos_id: repos,
      downloads_count: res.downloads,
      stat_date: res.day,
    });
  });

  return arr;
}

async function transformNpmWeekData(repos, pkg, startDate = '2017-07-31', endDate = '2018-06-28') {
  const npm = await reqNpmAPI(startDate, endDate, pkg);
  const weeks = {};

  npm.forEach(res => {
    const week_start_date = moment(res.day).day(0).format('YYYY-MM-DD');

    if (!weeks[week_start_date]) { weeks[week_start_date] = res.downloads || 0; }
    weeks[week_start_date] += res.downloads;
  });

  const startMomentDate = moment(startDate);
  let i = 0;
  let lastData = 0;
  let finalWeeks = {};

  while(1) {
    let currentMoment = startMomentDate.day(7);
    let currentDate = currentMoment.format('YYYY-MM-DD');
    if (currentMoment.isAfter(endDate)) break;

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

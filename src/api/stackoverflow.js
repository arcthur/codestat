const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

const STACKOVERFLOW_STATS_URL = 'http://sotagtrends.com/api/tagByName';

const axiosJson = axios.create({
  headers: {
    Accept: 'application/json',
  },
});

async function reqStackOverflowAPI(keyword) {
  const res = await axiosJson.get(`${STACKOVERFLOW_STATS_URL}/${keyword}`);
  return res.data;
}

async function transformStackOverflowWeekData(repos, keyword, startDate = '2016-07-31', endDate = '2017-08-06') {
  const data = await reqStackOverflowAPI(keyword);
  let weeks = {};

  _.forEach(data.usageByWeek, (res, key) => {
    let firstDay = moment(key).day(0).format('YYYY-MM-DD');
    weeks[firstDay] = { numQuestions: res.numQuestions };
  });

  const startMomentDate = moment(startDate);
  let i = 0;
  let lastData = 0;
  let finalWeeks = {};

  while(1) {
    let currentDate = startMomentDate.day(7).format('YYYY-MM-DD');
    if (currentDate === endDate) break;

    let questionsCount = weeks[currentDate] ? weeks[currentDate].numQuestions : 0;

    finalWeeks[currentDate] = {
      questions_count: questionsCount,
      compared_rate: (lastData && questionsCount) ? ((questionsCount - lastData) / lastData).toFixed(2) : null,
    };

    lastData = questionsCount;
    i++;
  }

  return _.map(finalWeeks, (res, key) => {
    return {
      repos_id: repos,
      questions_count: res.questions_count,
      compared_rate: res.compared_rate,
      week_start_date: key,
    }
  });
}

module.exports =  {
  transformStackOverflowWeekData,
};

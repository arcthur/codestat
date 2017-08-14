const googleTrends = require('google-trends-api');
const moment = require('moment');
const _ = require('lodash');

async function requestGTrendInterestOverTime(params) {
  const res = await googleTrends.interestOverTime(params);
  return res;
}

async function transformGTrendinterestOverTime(repos, keyword, startDate = '2016-07-31', endDate = '2017-08-06') {
  const data = await requestGTrendInterestOverTime({
    keyword: keyword,
    startTime: new Date(startDate),
    endTime: new Date(endDate),
  });

  const timeline = (JSON.parse(data)).default.timelineData;

  return _.map(timeline, res => {
    return {
      repos_id: repos,
      week_start_date: moment(res.formattedAxisTime, 'MMM DD, YYYY').format('YYYY-MM-DD'),
      index: res.value[0],
    };
  });
}

module.exports =  {
  transformGTrendinterestOverTime
};

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
  let lastData = 0;

  return _.map(timeline, res => {
    let item = {
      repos_id: repos,
      week_start_date: moment(res.formattedAxisTime, 'MMM DD, YYYY').format('YYYY-MM-DD'),
      compared_rate: lastData ? ((res.value[0] - lastData) / lastData).toFixed(2): null,
      index: res.value[0],
    };

    lastData = res.value[0];

    return item;
  });
}

module.exports =  {
  transformGTrendinterestOverTime
};

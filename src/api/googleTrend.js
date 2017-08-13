const googleTrends = require('google-trends-api');

async function requestGoogleTrend(keyword) {
  const res = await googleTrends.interestOverTime({ keyword: keyword });
  return res;
}

async function transformGTrendData(repos, keyword) {
  const res = await requestGoogleTrend({ keyword: keyword });
  return res;
}

// vuejs/vue ['vuejs', 'vue.js'];
// facebook/react ['reactjs', 'react.js'];
// angular/angular.js ['angularjs', 'angular.js']);
// jquery/jquery (['jquery', 'jquery.js']);
module.exports = async (repos, keyword) => {
  const trend = await transformGTrendData(repos, keyword);

  return {
    trend,
  };
}

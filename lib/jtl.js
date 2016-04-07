const split = require("split");

module.exports = function (instream, outstream, done) {

  var results = {};

  function addLabel (label) {
    if (!results[label]) {
      results[label] = {
        label: label,
        errorCount: 0,
        requestCount: 0,
        maxTime: Number.MIN_VALUE,
        minTime: Number.MAX_VALUE,
        totalResponseTime: 0,
        elapsedTime: [],
        satisfied: 0,
        tolerating: 0,
        frustrated: 0
      };
    }
  }

  function parse (line) {
    var splits = line.split(",");
    return {
      timestamp: +splits[0],
      elapsed: +splits[1],
      label: splits[2],
      statusCode: +splits[3]
    };
  }

  const apdexT = 500;

  function setSatisfaction (label, responseTime) {
    if (responseTime <= apdexT) {
      return ++results[label].satisfied;
    }

    if (responseTime <= 4 * apdexT) {
      return ++results[label].tolerating;
    }

    return ++results[label].frustrated;
  }

  function data (line) {
    if (line) {
      var row = parse(line);
      addLabel(row.label);
      ++results[row.label].requestCount;
      if(row.statusCode !== 200) {
        ++results[row.label].errorCount;
      }

      results[row.label].maxTime = Math.max(results[row.label].maxTime, +row.elapsed);
      results[row.label].minTime = Math.min(results[row.label].minTime, +row.elapsed);
      results[row.label].totalResponseTime += +row.elapsed;
      results[row.label].elapsedTime.push(row.elapsed);
      setSatisfaction(row.label, row.elapsed);
    }
  }

  function calculatePercentile (dataArray, percentile) {
    var divisor = (100-percentile)/100
    dataArray.sort(function(a,b) { return b - a; });
    var xPercent = parseInt(Math.ceil(dataArray.length*divisor));
    return dataArray.slice(0, xPercent).slice(-1)[0]
  }

  function summarise () {
    for (var label of Object.keys(results)) {
      results[label].meanResponseTimeMillis = +(results[label].totalResponseTime / results[label].requestCount).toFixed(2);
      results[label].elapsedMillis = results[label].maxTime - results[label].minTime;

      results[label].meanRequestsPerSecond = +((1000 * results[label].requestCount) / results[label].elapsedMillis).toFixed(2);
      results[label].apdex = +((results[label].satisfied + results[label].tolerating / 2) / results[label].requestCount).toFixed(2);
      results[label].errorPercentage = +(results[label].errorCount / results[label].requestCount).toFixed(2);

      results[label].p50Percentile = calculatePercentile(results[label].elapsedTime,50);
      results[label].ninetiethPercentile = calculatePercentile(results[label].elapsedTime,90);
      results[label].p99Percentile = calculatePercentile(results[label].elapsedTime,99);
    }
  }

  function end () {
    summarise();
    var keys = ["label", "requestCount", "meanResponseTimeMillis", "maxTime", "minTime", "errorPercentage", "apdex", "satisfied", "tolerating", "frustrated",  "p50Percentile", "ninetiethPercentile", "p99Percentile"];
    outstream.write(keys.join(",") + "\n");
    for (var key of Object.keys(results)) {
      var values = keys.map((k) => {
        return results[key][k];
      });

      outstream.write(values.join(",") + "\n");
    }
    return done();
  }

  return instream
    .pipe(split())
    .on("data", data)
    .on("end", end)
};

const split = require("split");

module.exports = (instream, outstream, done) => {

  var results = {};

  function addLabel(label) {
    if (!results[label]) {
      results[label] = {
        label: label,
        requestCount: 0,
        maxTime: Number.MIN_VALUE,
        minTime: Number.MAX_VALUE,
        totalResponseTime: 0,
        satisfied: 0,
        tolerating: 0,
        frustrated: 0
      }
    }
  }

  function parse(line) {
    var splits = line.split(",");
    return {
      timestamp: splits[0],
      elapsed: splits[1],
      label: splits[2]
    }
  }

  const apdexT = 500;

  function setSatisfaction(label, responseTime) {
    if (responseTime <= apdexT) {
      return ++results[label].satisfied;
    }

    if (responseTime <= 4 * apdexT) {
      return ++results[label].tolerating;
    }

    return ++results[label].frustrated;
  };

  function data(line) {
    if (line) {
      var row = parse(line);
      addLabel(row.label);
      ++results[row.label].requestCount;
      results[row.label].maxTime = Math.max(results[row.label].maxTime, +row.timestamp);
      results[row.label].minTime = Math.min(results[row.label].minTime, +row.timestamp);
      results[row.label].totalResponseTime += +row.elapsed;
      setSatisfaction(row.label, row.elapsed);
    }
  }

  function summarise() {
    for (var label of Object.keys(results)) {
      results[label].meanResponseTimeMillis = +(results[label].totalResponseTime / results[label].requestCount).toFixed(2);
      results[label].elapsedMillis = results[label].maxTime - results[label].minTime;

      results[label].meanRequestsPerSecond = +((1000 * results[label].requestCount) / results[label].elapsedMillis).toFixed(2);
      results[label].apdex = +((results[label].satisfied + results[label].tolerating / 2) / results[label].requestCount).toFixed(2);
    }
  }

  function end() {
    summarise();
    var keys = ["label", "requestCount", "meanResponseTimeMillis", "meanRequestsPerSecond", "apdex"];
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

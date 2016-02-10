# jmeter-statistics
[![Circle CI](https://circleci.com/gh/roylines/jmeter-statistics.svg?style=svg)](https://circleci.com/gh/roylines/jmeter-statistics)

A CLI written in node for analysing jmeter jtl files. You can pipe a csv formatted jtl file into it, and it will output a .csv with aggregated data.

# Installation
```
> npm install -g jmeter-statistics
```

# Usage
The following commmand will analyse the results.jtl file and produce results into a comma separated file (csv).
```
> cat results.jtl | jmeter-statistics > statistics.csv
```
The csv will contain output similar to the following
```
> cat statistics.csv

label,requestCount,meanResponseTimeMillis,maxTime,minTime,errorPercentage,apdex,satisfied,tolerating,frustrated,ninetiethPercentile
label1,2,1838,2000,899,0.25,0,1,1,1900
label2,5,9566,11982,8746,35.57,10.29,0,1,9520,46,0,11982
```

# Fields
- **label**: the label as defined in the jmeter test
- **requestCount**: the total number of requests made
- **meanResponseTimeMillis**: the mean response time in milliseconds
- **maxTime**: the maximum time in milliseconds
- **minTime**: the maximum time in milliseconds
- **errorPercentage**: the percentage of requests that resulted in a non-200 response code (as a value between 0 and 1)
- **apdex**: the [apdex](https://en.wikipedia.org/wiki/Apdex) score based upon a target time (T) of 500ms
- **satisfied**: the number of requests defined as satisfied by the apdex target time (response time <= 500ms)
- **tolerating**: the number of requests defined as tolerating by the apdex target time (response time <= 2s)
- **frustrated**: the number of requests defined as frustrated by the apdex target time (response time > 2s)
- **ninetiethPercentile**: the value below which 90% of the samples fall (See [explanation](http://apmblog.dynatrace.com/2012/11/14/why-averages-suck-and-percentiles-are-great/))
- **p50Percentile**: The median request response time
- **p99Percentile**: The p99 response time (ie: only 1% were slower than this figure)

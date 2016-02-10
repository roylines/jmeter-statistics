const Lab = require("lab");
const jtl = require("../lib/jtl");
const fs = require("fs");
const streams = require("memory-streams");
const should = require("chai").should();
const lab = exports.lab = Lab.script();

lab.experiment("jtl", () => {
  lab.test("should", (done) => {
    var reader = fs.createReadStream('./test/fixture1.jtl');
    var writer = new streams.WritableStream();
    jtl(reader, writer, () => {
      var lines = writer.toString().split("\n");
      lines.should.be.length(4);
      lines[0].should.equal('label,requestCount,meanResponseTimeMillis,maxTime,minTime,errorPercentage,apdex,satisfied,tolerating,frustrated,p50Percentile,ninetiethPercentile,p99Percentile');
      var line1 = lines[1].split(',');

      line1[0].should.equal('call1');
      line1[1].should.equal('4');
      line1[2].should.equal(((1131 + 1023 + 1170 + 24)/4).toString());
      line1[3].should.equal('1170');
      line1[4].should.equal('24');
      line1[5].should.equal('0.25');
      line1[6].should.equal('0.63');
      line1[7].should.equal('1');
      line1[8].should.equal('3');
      line1[9].should.equal('0');
      line1[10].should.equal('1131');
      line1[11].should.equal('1170');
      line1[12].should.equal('1170');
      
      var line2 = lines[2].split(',');
      line2[0].should.equal('call2');
      line2[1].should.equal('4');
      line2[2].should.equal(((833 + 1907 + 2200 + 938)/4).toString());
      line2[3].should.equal('2200');
      line2[4].should.equal('833');
      line2[5].should.equal('0');
      line2[6].should.equal('0.38');
      line2[7].should.equal('0');
      line2[8].should.equal('3');
      line2[9].should.equal('1');
      line2[10].should.equal('1907');
      line2[11].should.equal('2200');
      line2[12].should.equal('2200');
      return done();
    });
  });
});

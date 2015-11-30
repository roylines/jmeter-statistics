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
      lines[0].should.equal('label,requestCount,meanResponseTimeMillis,meanRequestsPerSecond,apdex,errorPercentage');
      var line1 = lines[1].split(',');

      line1[0].should.equal('call1');
      line1[1].should.equal('4');
      line1[2].should.equal(((1131 + 1023 + 1170 + 24)/4).toString());
      line1[3].should.equal('3.46');
      line1[4].should.equal('0.63');
      line1[5].should.equal('0.25');
      
      var line2 = lines[2].split(',');
      line2[0].should.equal('call2');
      line2[1].should.equal('4');
      line2[2].should.equal(((833 + 1907 + 2200 + 938)/4).toString());
      line2[3].should.equal('35.71');
      line2[4].should.equal('0.38');
      line2[5].should.equal('0');
      return done();
    });
  });
});

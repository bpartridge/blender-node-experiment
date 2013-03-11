var express = require('express');
var app = express();
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs'), path = require('path');
var temp = require('temp'), rimraf = require('rimraf');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(app.router);
app.use(express.errorHandler());

app.all('*.png', function(req, res, next) {
  render({}, res, function(err) {
    if (err) next(err);
  });
});

function render(json, hasSendfile, next) {
  var paths = {};
  async.auto({
    tempDir: function(cb) {
      temp.mkdir('blender', cb);
    },
    pyTemplate: function(cb) {
      fs.readFile(path.resolve(__dirname, 'template.py'), 'utf-8', cb);
    },
    writePyTemplate: ['tempDir', 'pyTemplate', function(cb, r) {
      console.log(r);
      // TODO: do replacements based on the request parameters
      var rendered = r.pyTemplate;
      paths.program = path.resolve(r.tempDir, 'program.py');
      fs.writeFile(paths.program, rendered, cb);
    }],
    blenderOutput: ['tempDir', 'writePyTemplate', function(cb, r) {
      paths.blender = path.resolve(__dirname, 'blender', 'blender');
      paths.blend = path.resolve(__dirname, 'assets', 'main.blend');
      paths.outputNoSuffix = path.resolve(r.tempDir, 'output');
      paths.output = paths.outputNoSuffix + "0001.png";
      var command = paths.blender +
        " -b " + paths.blend +
        " -P " + paths.program +
        " -o " + paths.outputNoSuffix + 
        " -F PNG -f 1 -x 1";
      console.log(command);
      exec(command, cb);
    }],
    sendFile: ['tempDir', 'blenderOutput', function(cb, r) {
      console.log(r.blenderOutput[0]);
      hasSendfile.sendfile(paths.output, cb);
    }],
    finish: ['tempDir', 'sendFile', function(cb, r) {
      console.log("Removing", r.tempDir);
      rimraf(r.tempDir, cb);
    }]
  }, next);
}


if (process.env.SINGLE_RUN) {
  var fakeSendFile = function(f, cb) {
    console.log("Sending", f);
    fs.stat(f, function(err, stats) {
      console.log(stats);
      cb(err);
    });
  };
  render({}, {sendfile: fakeSendFile}, function(err) {
    if (err) console.error(err);
    else console.log('Success!');
  });
}
else {
  var port = process.env.PORT || 3001;
  app.listen(port, function() {
    console.log('Listening on ' + port);
  });
}

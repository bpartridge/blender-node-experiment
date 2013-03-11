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
  render(req.query, res, function(err) {
    if (err) next(err);
  });
});

// http://stackoverflow.com/questions/770523/escaping-strings-in-javascript
String.prototype.addSlashes = function() { 
  //no need to do (str+'') anymore because 'this' can only be a string
  return this.replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
};

function render(opts, response, next) {
  var paths = {};
  async.auto({
    tempDir: function(cb) {
      temp.mkdir('blender', cb);
    },
    pyTemplate: function(cb) {
      fs.readFile(path.resolve(__dirname, 'template.py'), 'utf-8', cb);
    },
    writePyTemplate: ['tempDir', 'pyTemplate', function(cb, r) {
      // TODO: do replacements based on the request parameters
      rendered = r.pyTemplate.replace(/\{\{(\w+)\}\}/gi, function(match, p1) {
        return (opts[p1] || "").addSlashes();
      });
      console.log(rendered);
      paths.program = path.resolve(r.tempDir, 'program.py');
      fs.writeFile(paths.program, rendered, cb);
    }],
    blenderOutput: ['tempDir', 'writePyTemplate', function(cb, r) {
      paths.blend = path.resolve(__dirname, 'assets', 'main.blend');
      paths.outputNoSuffix = path.resolve(r.tempDir, 'output');
      paths.output = paths.outputNoSuffix + "0001.png";
      var command = "blender" +
        " -b " + paths.blend +
        " -P " + paths.program +
        " -o " + paths.outputNoSuffix + 
        " -F PNG -f 1 -x 1 -noaudio";
      console.log(command);
      exec(command, cb);
    }],
    sendFile: ['tempDir', 'blenderOutput', function(cb, r) {
      console.log(r.blenderOutput[0]);
      if (response.header) {
        response.header("X-Blender-Output", JSON.stringify(r.blenderOutput));
      }
      response.sendfile(paths.output, cb);
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
    exec("open -a Preview -W " + f, cb);
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

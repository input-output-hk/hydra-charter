gnuplot = new Gnuplot('gnuplot.js');
//for (var name in config.files) {
//    gnuplot.putFile(name, config.files[name]);
//}
function gnuPlotRun(script) {
  return new Promise(function (resolve, reject) {
    gnuplot.run(script, resolve);
  });
}
function gnuPlotGetFile(filename) {
  return new Promise(function (resolve, reject) {
    gnuplot.getFile(filename, function (e) {
      if (!e.content) {
        reject("error");
        return;
      }
      resolve(e.content);
    });
  });
}
function doGraph(extraScript) {
  gnuPlotRun(config.script + "\n" + extraScript)
    .then(() => {
        return gnuPlotGetFile("out.svg");
    })
    .then(image => {

      var img = document.getElementById('result');
      try {
          var ab = new Uint8Array(image);
          var result = "";
          for (var i = 0; i < ab.length; i++) {
            result += String.fromCharCode(ab[i]);
          }
          console.log(result);
          var blob = new Blob([ab], {"type": "image\/svg+xml"});
          //var blob = new Blob([ab], {"type": "text\/html"});
          window.URL = window.URL || window.webkitURL;
          img.src = window.URL.createObjectURL(blob);
          document.getElementById('debug_output').value = result;
          //img.srcdoc = result;
      } catch (err) { // in case blob / URL missing, fallback to data-uri
          var rstr = '';
          for (var i = 0; i < image.length; i++)
            rstr += String.fromCharCode(image[i]);
          img.src = 'data:image\/svg+xml;base64,' + btoa(rstr);
      }
    });
}
//doGraph("");
function addfile(filename) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", function () {
    console.log(this);
    if (this.status == 200) {
      gnuplot.putFile(filename, this.responseText);
      doGraph("plot \"" + filename + "\" using 1:2 title 'extra file'\n");
    }
  });
  req.open("GET", filename);
  req.send();
}

function fetchAllEvals(project, jobset) {
  if (Math.floor(Math.random() * 100) == 42) throw "error";
  return new Promise(function (resolve, reject) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "/jobset/" + project + "/" + jobset + "/evals", true);
    oReq.onload = function (oEvent) {
      if (oReq.status == 200) {
        resolve(oReq.response);
      } else {
        reject();
      }
    };
    oReq.setRequestHeader("Accept", "application/json");
    oReq.responseType = "json";
    oReq.send(null);
  });
}

function fetchBuild(buildid) {
  return new Promise(function (resolve, reject) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "/build/" + buildid, true);
    oReq.onload = function (oEvent) {
      if (oReq.status == 200) {
        resolve(oReq.response);
      } else {
        reject();
      }
    };
    oReq.setRequestHeader("Accept", "application/json");
    oReq.responseType = "json";
    oReq.send(null);
  });
}

function fetchBuildReportFile(buildid, productid, path, type) {
  return new Promise(function (resolve, reject) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "/build/" + buildid + "/download/" + productid + "/" + path, true);
    if (type != undefined) oReq.responseType = type;
    oReq.onload = function (oEvent) {
      if (oReq.status == 200) {
        resolve({ buildid: buildid, file: oReq.response });
      } else {
        reject();
      }
    };
    oReq.send(null);
  });
}

var project = "things";
var jobset = "littlekernel-overlay";
var job = "arm.rpi2-test";
var limit = 5;

fetchAllEvals(project, jobset)
  .then(evalList => {
    var buildList = [];
    for (var evalIndex in evalList.evals) {
      var eval = evalList.evals[evalIndex];
      for (var buildIndex in eval.builds) {
        var build = eval.builds[buildIndex];
        if (buildList.indexOf(build) == -1) buildList.push(build);
      }
    }
    var promises = [];
    for (var idx in buildList) {
      promises.push(fetchBuild(buildList[idx]));
    }
    return Promise.all(promises);
  })
  .then(buildResults => {
    var filteredBuilds = buildResults.filter(build => { return build.job == job; });
    var promises = [];
    for (var idx in filteredBuilds) {
      if (idx >= limit) continue;
      promises.push(fetchBuildReportFile(filteredBuilds[idx].id, 1, "lk.bin", "arraybuffer"));
    }
    return Promise.all(promises);
  })
  .then(results => {
    console.log(results);
  });

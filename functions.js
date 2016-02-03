// functions.js

var express = require('express'),
    Parse = require('parse/node').Parse,
    PromiseRouter = require('./PromiseRouter'),
    rest = require('./rest');

var router = new PromiseRouter();

function objToMap(obj) {
    var strMap = new Map();
    for (var k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}
function handleCloudFunction(req) {
  if (Parse.Cloud.Functions[req.params.functionName]) {
    return new Promise(function (resolve, reject) {
      var response = createResponseObject(resolve, reject);
      var request = {
        parameters: objToMap(req.body) || new Map(),
        params: req.body || {},
        user: req.auth && req.auth.user || {}
      };
      Parse.Cloud.Functions[req.params.functionName](request, response);
    });
  } else {
    throw new Parse.Error(Parse.Error.SCRIPT_FAILED, 'Invalid function.');
  }
}

function createResponseObject(resolve, reject) {
  return {
    success: function(result) {
      resolve({
        response: {
          result: result
        }
      });
    },
    error: function(error) {
      reject(new Parse.Error(Parse.Error.SCRIPT_FAILED, error));
    }
  }
}

router.route('POST', '/functions/:functionName', handleCloudFunction);


module.exports = router;

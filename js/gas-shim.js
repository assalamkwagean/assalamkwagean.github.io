(function(){
  // Shim google.script.run menggunakan JSONP fallback ke Apps Script Web App
  // Memakai window.__BACKEND_URL__ yang di-set oleh frontend/config.js
  var backendUrl = window.__BACKEND_URL__ || '';

  function doJsonpCall(functionName, args, success, failure) {
    try {
      var callbackName = '__gas_cb_' + Math.random().toString(36).substr(2, 9);
      window[callbackName] = function(payload) {
        try {
          if (payload && payload.success) {
            if (success) success(payload.result || payload.data || payload);
          } else {
            if (failure) failure(payload);
            else console.error('GAS JSONP error', payload);
          }
        } finally {
          // cleanup
          try { delete window[callbackName]; } catch(e){}
          var s = document.getElementById(callbackName);
          if (s) s.parentNode.removeChild(s);
        }
      };

      var src = backendUrl + '?action=' + encodeURIComponent(functionName)
                + '&args=' + encodeURIComponent(JSON.stringify(args || []))
                + '&callback=' + callbackName;

      var script = document.createElement('script');
      script.src = src;
      script.id = callbackName;
      script.async = true;
      script.onerror = function(e) {
        if (failure) failure({ message: 'Network error' });
        else console.error('GAS JSONP network error', e);
        try { delete window[callbackName]; } catch(e){}
        script.parentNode.removeChild(script);
      };
      document.head.appendChild(script);
    } catch (err) {
      if (failure) failure({ message: err.message });
      else console.error(err);
    }
  }

  // Proxy to mimic google.script.run.withSuccessHandler(...).withFailureHandler(...).fnName(...)
  var runProxy = new Proxy({}, {
    get: function(target, prop, receiver) {
      if (prop === 'withSuccessHandler') {
        return function(success) {
          return new Proxy({}, {
            get: function(_, fnName) {
              if (fnName === 'withFailureHandler') {
                return function(failure) {
                  return new Proxy({}, {
                    get: function(__, actualFn) {
                      return function() {
                        var args = Array.prototype.slice.call(arguments);
                        doJsonpCall(actualFn, args, success, failure);
                      };
                    }
                  });
                };
              }
              return function() {
                var args = Array.prototype.slice.call(arguments);
                doJsonpCall(fnName, args, success, null);
              };
            }
          });
        };
      }

      // Default: allow google.script.run.fnName(...)
      return function() {
        var args = Array.prototype.slice.call(arguments);
        doJsonpCall(prop, args, null, null);
      };
    }
  });

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = runProxy;
})();

(function(){
  // Shim google.script.run menggunakan JSONP fallback ke Apps Script Web App
  // Memakai window.__BACKEND_URL__ yang di-set oleh frontend/config.js
  var backendUrl = window.__BACKEND_URL__ || '';

  function doJsonpCall(functionName, args, success, failure) {
    try {
      var callbackName = '__gas_cb_' + Math.random().toString(36).substr(2, 9);
      // Log the URL being called
      console.log('Calling URL:', src);

      window[callbackName] = function(payload) {
        try {
          console.log('JSONP Response:', payload); // Log full response
          if (payload && payload.success) {
            console.log('Success handler with payload:', payload);
            if (success) success(payload.result || payload.data || payload);
          } else {
            console.log('Error handler with payload:', payload);
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

      var url = new URL(backendUrl);
      
      // Add action parameter
      url.searchParams.set('action', functionName);
      url.searchParams.set('callback', callbackName);
      
      // Handle function arguments based on function name
      if (functionName === 'verifyAdminLogin') {
        url.searchParams.set('email', args[0]);
        url.searchParams.set('password', args[1]);
      } else if (functionName === 'verifySantriLogin') {
        url.searchParams.set('nis', args[0]);
        url.searchParams.set('password', args[1]);
      } else if (functionName === 'updatePasswordSantri') {
        url.searchParams.set('nis', args[0]);
        url.searchParams.set('oldPassword', args[1]);
        url.searchParams.set('newPassword', args[2]);
      } else if (args.length === 1 && typeof args[0] === 'object') {
        // For functions that take a single object parameter
        url.searchParams.set('data', JSON.stringify(args[0]));
      } else {
        // For other functions, pass args as is
        args.forEach((arg, index) => {
          url.searchParams.set('param' + (index + 1), arg);
        });
      }
      
      var src = url.toString();

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

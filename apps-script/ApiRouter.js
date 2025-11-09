// Router API sederhana untuk Google Apps Script
// Mendukung JSONP (GET with callback) dan POST JSON

function doGet(e) {
  var params = e.parameter || {};
  var action = params.action;
  var callback = params.callback;
  var result;
  
  try {
    if (!action) throw new Error('action parameter required');
    var fn = this[action];
    if (typeof fn !== 'function') throw new Error('Function not found: ' + action);
    
    // Handle parameters based on action
    var args = [];
    if (action === 'verifyAdminLogin') {
      args = [params.email, params.password];
    } else if (action === 'verifySantriLogin') {
      args = [params.nis, params.password];
    } else if (action === 'updatePasswordSantri') {
      args = [params.nis, params.oldPassword, params.newPassword];
    } else if (params.data) {
      args = [JSON.parse(params.data)];
    } else {
      // Handle other parameters numerically
      var i = 1;
      while (params['param' + i] !== undefined) {
        args.push(params['param' + i]);
        i++;
      }
    }
    
    var res = fn.apply(this, args);
    // Jika fungsi mengembalikan objek response yang sudah berstruktur (success/data), kembalikan langsung
    result = { success: true, result: res, data: res };
  } catch (err) {
    result = { success: false, message: err && err.message ? err.message : String(err) };
  }

  if (callback) {
    var out = callback + '(' + JSON.stringify(result) + ');';
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var action = data.action;
    var args = data.args || [];
    if (!action) throw new Error('action required');
    var fn = this[action];
    if (typeof fn !== 'function') throw new Error('Function not found: ' + action);
    var res = fn.apply(this, args);
    return ContentService.createTextOutput(JSON.stringify({ success: true, result: res })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err && err.message ? err.message : String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

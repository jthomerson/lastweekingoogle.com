'use strict';

module.exports = {

   // invoked by CloudFront (origin requests)
   handler: function(evt, context, cb) {
      var req = evt.Records[0].cf.request;

      // Add default document handling to any request that's for the root of a folder.
      if (req.uri && req.uri.length && req.uri.substring(req.uri.length - 1) === '/') {
         req.uri = req.uri + 'index.html';
      }

      cb(null, req);
   },

};

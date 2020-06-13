'use strict';

module.exports = {

   // invoked by CloudFront (origin requests)
   handler: function(evt, context, cb) {
      var req = evt.Records[0].cf.request;

      // Redirect all requests for www.lastweekingoogle.com/(.*) to lastweekingoogle.com/$1
      if (req.headers && req.headers.host && req.headers.host[0] && req.headers.host[0].value === 'www.lastweekingoogle.com') {
         cb(null, {
            status: '301',
            statusDescription: 'Moved',
            headers: {
               location: [ {
                  key: 'Location',
                  value: 'https://lastweekingoogle.com' + req.uri,
               } ],
            },
         });
      } else {
         cb(null, req);
      }
   },

};

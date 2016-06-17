var verifier = require('google-id-token-verifier');
var config = require("../config/config.js");
var mongo = require('../database/mongo.js');
var _ = require('lodash');

var auth = {
 facebook: function(req, res) {
  //@Todo: facebook OAuth2
 },

 google: function(req, res) {
  var idToken = req.query.token;
 
  verifier.verify(idToken, config.googleClientId, function (err, tokenInfo) {
    if (!err) {
      mongo.checkExistOtherSocial(tokenInfo.email, true, function(data) {
        if (data.isExist) {
          res.send(JSON.stringify({
            isSuccess: false,
            message: 'Same facebook account already exists!'
          }));
        } else {
          mongo.addUser({
            name: tokenInfo.name,
            email: tokenInfo.email,
            givenName: tokenInfo.given_name,
            familyName: tokenInfo.family_name,
            pictureUrl: tokenInfo.picture,
            isGoogle: true
          }, function(err, result) {
            if (err) {
              res.send(JSON.stringify({
                isSuccess: false,
                message: err.message
              }));
            }
            var respondJson = {
              isSuccess: true,
              user: _.pick(result, ['_id', 'email', 'name', 'givenName', 'familyName', 'pictureUrl'])
            }
            console.log(respondJson);
            
            res.send(JSON.stringify(respondJson));
          })
        }
      });
    }
  });
 }
}

module.exports = auth;
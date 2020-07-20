const jwt = require('jsonwebtoken');

const config = require('../config');

const isAuthorised = (req, res, next) => {
  const token = req.cookies[config.token_name];
  

  res.locals.returnURL = req.protocol + '://' + req.hostname;

  if (token) {
    let payload = null;

    try {
      let isAuthorised = false;

      payload = jwt.verify(token, config.hackney_jwt_secret);
      const groups = payload.groups;

      req.auth = {
        authName: payload.name,
        isAdmin: false,
        isAuthorised: false
      }

      if (groups) {
        if(groups.includes(config.authorised_user_group) || groups.includes(config.authorised_admin_group)) {
          isAuthorised = true;
          req.auth.isAuthorised = true;
        };
        
        if(groups.includes(config.authorised_admin_group)) {
          req.auth.isAdmin = true;
        }      
      }

    } catch (err) {
      const error = new Error(err);

      return next(error);
    } 
  }

  return next();
};

module.exports = {
  isAuthorised
};
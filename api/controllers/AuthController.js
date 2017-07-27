module.exports = {
  login: function (req, res) {
    var email = req.param('email');
    var password = req.param('password');

    verifyParams(res, email, password)

    User.findOne({email: email}).then(function (user) {
      if (!user) {
        return invalidEmailOrPassword(res);
      }
      signInUser(req, res, password, user)
    }).catch(function (err) {
      return invalidEmailOrPassword(res);
    })
  },

  isAuthenticated: function(req, res) {
    let token;

    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0],
          credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        return ResponseService.json(401, res, "Format is Authorization: Bearer [token]");
      }
    } else if (req.param('token')) {
      token = req.param('token');

      delete req.query.token;
    } else {
      return ResponseService.json(401, res, "No authorization header was found");
    }

    JwtService.verify(token, function(err, decoded){
      if (err) return ResponseService.json(401, res, "Invalid Token!");
      req.token = token;
      User.findOne({id: decoded.id})
        .populate('roles')
        .then(function(user){
          req.current_user = user;
          let responseData = {
            user: user
          };
          return ResponseService.json(200, res, "Authorized", responseData)
        })
    });
  }

};


function signInUser(req, res, password, user) {
  User.comparePassword(password, user).then(
    function (valid) {
      if (!valid) {
        return this.invalidEmailOrPassword();
      } else {
        var responseData = {
          user: user,
          token: generateToken(user.id)
        }
        return ResponseService.json(200, res, "Successfully signed in", responseData)
      }
    }
  ).catch(function (err) {
    return ResponseService.json(403, res, "Forbidden")
  })
};


function invalidEmailOrPassword(res){
  return ResponseService.json(401, res, "Invalid email or password")
};

function verifyParams(res, email, password){
  if (!email || !password) {
    return ResponseService.json(401, res, "Email and password required")
  }
};


function generateToken(user_id) {
  return JwtService.issue({id: user_id})
};

var _ = require('lodash');

module.exports = {
  create: function (req, res) {
    if (req.body.password !== req.body.confirmPassword) {
      return ResponseService.json(401, res, "Password doesn't match")
    }

    var allowedParameters = [
      "username",
      "email",
      "password"
    ]

    var data = _.pick(req.body, allowedParameters);

    User.create(data).then(function (user) {
      var responseData = {
        user: user,
        token: JwtService.issue({id: user.id})
      }
      return ResponseService.json(200, res, "User created successfully", responseData);
    }).catch(function (error) {
        if (error.invalidAttributes){
          return ResponseService.json(400, res, "User could not be created", error.Errors);
        }
      }
    )

  },

  getUsers: function(req, res) {
    User.find().exec(function (err, users){
      if (err) {
        return ResponseService.json(400, res, "Unable to get users", error.Errors);
      }

      let responseData = _.map(users, usr => {
        return {id: usr.id, email: usr.email};
      });

      return ResponseService.json(200, res, "Got users", responseData);
    });
  },

  addRole: function (req, res) {
    var allowedParameters = [
      "userId",
      "roleName"
    ]

    var data = _.pick(req.body, allowedParameters);

    if(data.userId == undefined || data.roleName == undefined){
      return ResponseService.json(400, res, "Missing userId or roleName");
    }

    Role.create({
        name: data.roleName,
        user: data.userId
      })
      .exec(function(err, role){
        if (err) {
          return ResponseService.json(400, res, "Unable to create role", err.Errors);
        }

        User.find(role.user)
          .populate('roles')
          .exec(function(err, users){
            if (err) {
              return ResponseService.json(400, res, "Unable to populate user roles", err.Errors);
            }

            return ResponseService.json(200, res, "Role added to user");
          });
      });

  }
};

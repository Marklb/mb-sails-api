/**
 * Role.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    user: {
      model: 'user',
      required: true,
    }
  },

  beforeCreate: function(values, cb){
    Role.find({name: values.name, user: values.user})
      .exec(function(err, roles){
        if(err) return cb(err);

        if(roles.length > 0) return cb('User already has role');

        cb();
      });
  }
};


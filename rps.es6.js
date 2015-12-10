// here's the lowdown 
// mongo interaction is unnecessary and will slow things down

'use strict'

let choices = {
  rock: 0,
  paper: 1,
  scissors: 2
}

let Status = new Mongo.Collection("status")

Router.route('/player:_id', {
    template: "main_layout",
    onBeforeAction: function () {
      console.log(this.params._id)
       Session.set('id', this.params._id)
       this.next()
    }
})


if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0)
  Session.setDefault('id', 0)

  Template.greeting.helpers({
    id: function () {
      return Session.get('id')
    }
  })

  Template.status.helpers({
    status: function () {
      console.log(Status.findOne())
      return Status.findOne()
    }
  })

  Template.choices.events({
    'click button': function (evt) {
      let choice = evt.target.getAttribute('choice')
      
      // on client
      Meteor.call('process', Session.get('id'), choice, function(error, result) {
        if (error) {
          throw error
        }
        else {
          console.log(result)
        }
      })
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    
    if (Status.find().count() === 0) {
      Status.insert({value: "Test"});
    } else {
      Status.update({value: true}, {
        $set: {value: "Test"}
      });
    }
    console.log(Status.find().count())
    Meteor.methods({
      process: function (id, choice) {
        var result = 'choice was: ' + choice
        return result
      },
    })
    // Router.map(function () {
    //   this.route('upload', {
    //     where: 'server',
    //     action: function () {
    //       console.log('upload hit')
    //       var request = this.request
    //       var response = this.response
    //       response.end('hello from the server\n')
    //     }
    //   })
    // })
  })
}

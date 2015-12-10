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
      Session.set('id', this.params._id)
      this.next()
    }
})


if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0)
  Session.setDefault('id', 0)
  Session.setDefault('statmsg', 'Currently trying to retrieve status...')

  Template.greeting.helpers({
    id: function () {
      return Session.get('id')
    }
  })

  Template.status.helpers({
    status: function () {
      return Status.find().fetch()
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
    let choices = []

    if (Status.find().count() === 0) {
      Status.insert({value: ""})
    } else {
      Status.update({value: true}, {
        $set: {value: ""}
      })
    }

    Meteor.methods({
      process: function (id, choice) {

        choices[id-1] = choice

        if( id == 1 || id == 2 ) {
          if (choices[0] && choices[1]) {

            // will remain 0 in the event of a tie
            let winner = 0
            
            switch (choices[0]) {
              case 'rock':
                if (choices[1] === 'scissors') 
                  winner = 1
                else if (choices[1] === 'paper')
                  winner = 2
                break
              case 'paper':
                if (choices[1] === 'rock') 
                  winner = 1
                else if (choices[1] === 'scissors')
                  winner = 2
                break
              case 'scissors':
                if (choices[1] === 'paper') 
                  winner = 1
                else if (choices[1] === 'rock')
                  winner = 2
                break
            }
            
            // cleanup in preparation for the next round
            choices = []

            let message = "It's a tie!"
            switch (winner) {
              case 1:
                message = "Player 1 won the round!"
                break
              case 2:
                message = "Player 2 won the round!"
                break
            }

            Status.update({}, {
              $set: {value: message}
            })

            return 'Round complete, starting a new one'

          } else {

            Status.update({}, {
              $set: {value: 'Waiting for Player ' + ( ((id-1) ^ 1) + 1) + '...'}
            })

            return 'Action received, waiting for other party.'

          }
        }
        return new Error('Bad player ID')
      },
    })
  })
}

const Discord = require('discord.js'),
	  client = new Discord.Client()
const tokens = require('./tokens.json')

client.on('ready', () => {
  client.user.setActivity('Deletboi', {type: 'PLAYING'})
})

client.on('message', msg => {
  let deleteStuff = () => {
    let count = 0
    msg.channel.fetchMessages({limit: 100})
      .then(messages => {
        let messagesArr = messages.array()
        let messageCount = messagesArr.length

        for (let i = 0; i < messageCount; i++) {
          messagesArr[i].delete()
            .then(function () {
              count = count + 1
              if (count >= 100) {
                deleteStuff()
              }
            })
            .catch(function () {
              count = count + 1
              if (count >= 100) {
                deleteStuff()
              }
            })
        }
      })
      .catch(function (err) {
        console.log('error thrown')
        console.log(err)
      })
  }

  if (msg.content === '!:cleanse') {
    deleteStuff()
  } else if (msg.content === '!movie') {
    msg.channel.send({'embed': {'color': 7059153, 'author': {'name': 'The Movie of the Day is Best of the Best II', 'icon_url': 'https://image.flaticon.com/icons/png/512/236/236626.png'}, 'thumbnail': {'url': 'https://a.ltrbxd.com/resized/film-poster/3/0/6/9/4/30694-best-of-the-best-2-0-230-0-345-crop.jpg?k=1e74c6573d'}, 'fields': [{'name': 'About the film:', 'value': '**Director:** Robert Radler\n**Release Year:** 1993\n**Genres:** Action, Crime\n**Runtime:** 101 mins\n**Rating:** 5.4/10\n[See More](https://letterboxd.com/film/best-of-the-best-2)', 'inline': true}, {'name': 'Want to suggest your movie?', 'value': "Post your link in **<#435892908839796739>**!\n\n**Not the droid you're looking for?**\nTry **!randmovie** for a random film!\n\n*Suggested by **<@204528346049150976>***", 'inline': true}], 'timestamp': '2018-03-20T23:14:14.024Z', 'footer': {'text': 'BETA'}}})
  }
})

client.login(tokens.BOT_TOKEN)

const Discord = require('discord.js')
const tokens = require('./tokens.json')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('Ready to play a game?')
})

let ANSWER
let COLLECTING
let SCOREBOARD = {}
let ANSWERED = 0
let KICKED = []
let JOINABLE = true
let ANSWERQUEUE = []

client.on('message', (message) => {
  if (message.content.toLowerCase() === `${tokens.PREFIX}join` && message.channel.id === tokens.ANSWERS_ID) {
    if (Object.keys(SCOREBOARD).length < 10 && !SCOREBOARD[message.author.id]) {
      if (!JOINABLE) return message.channel.send('Sorry, I\'m not accepting any more players!')
      let found = KICKED.find((element) => {
        return element === message.author.id
      })
      if (found) {
        message.reply('you were removed from the game! Sowwy :weary:')
        return
      }
      console.log(`Adding ${message.author.tag} to scoreboard!`)
      message.reply('got it! you have been added to the game!')
      SCOREBOARD[message.author.id] = { currentAns: null, points: 0, answered: false }
    }
  } else if (message.content.toLowerCase() === `${tokens.PREFIX}reset` && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    message.reply('Resetting to starting values!')
    process.exit()
  } else if (message.content.toLowerCase() === `${tokens.PREFIX}togglejoin` && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    if (JOINABLE) {
      message.reply('Rejecting joins!')
      JOINABLE = false
    } else {
      message.reply('Allowing joins!')
      JOINABLE = true
    }
  } else if (message.content.toLowerCase() === `${tokens.PREFIX}scoreboard` && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    let scoreArr = []
    for (var user in SCOREBOARD) {
      let userObj = message.guild.members.find('id', user)
      scoreArr.push({ name: userObj.user.tag, value: SCOREBOARD[user].points })
    }

    scoreArr.sort((a, b) => {
      return b.value - a.value
    })

    for (let i = 0; i < scoreArr.length; i++) {
      scoreArr[i].name = `${i + 1}. ` + scoreArr[i].name
      scoreArr[i].value = `Points: ` + scoreArr[i].value + '\n\u200b'
    }

    setTimeout(() => {
      let score = {
        embed: {
          color: 0x6bb6d1,
          author: {
            name: `Current Scores out of ${ANSWERED} Question${ANSWERED > 1 ? 's' : ''}`,
            icon_url: 'https://cdn.discordapp.com/attachments/281673478783107073/437653299496222722/MaF_circlent.png'
          },
          fields: scoreArr,
          timestamp: new Date(),
          footer: {
            text: 'BETA'
          }
        }
      }
      message.channel.send(score)
    }, 1000)
  } else if (message.content.toLowerCase().includes(`${tokens.PREFIX}unkick`) && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    let args = message.content.split(' ')
    if (args.length !== 2) {
      message.reply('Incorrect use of command!\n```Usage: !unkick @user```')
      return
    }
    if (!args[1].includes('<@')) {
      message.reply('Incorrect use of command!\n```Usage: !unkick @user```')
      return
    }
    console.log(args[1])
    if (args[1].includes('!')) {
      args[1] = args[1].substring(3, args[1].length - 1)
    } else {
      args[1] = args[1].substring(2, args[1].length - 1)
    }

    console.log(args[1])

    let userToRemove = message.guild.members.find('id', args[1])

    if (!userToRemove) return message.reply('User does not exist!')

    let found = KICKED.find((element) => {
      return element === userToRemove.user.id
    })
    if (found) {
      let index = KICKED.indexOf(userToRemove.user.id)
      console.log(`Found ${userToRemove.user.tag} at index ${index}`)
      KICKED.splice(index, 1)
      message.reply(`**${userToRemove.user.tag}** may rejoin the game!`)
    }
  } else if (message.content.toLowerCase().includes(`${tokens.PREFIX}kick`) && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    let args = message.content.split(' ')
    if (args.length !== 2) {
      message.reply('Incorrect use of command!\n```Usage: !kick @user```')
      return
    }
    if (!args[1].includes('<@')) {
      message.reply('Incorrect use of command!\n```Usage: !kick @user```')
      return
    }
    console.log(args[1])
    if (args[1].includes('!')) {
      args[1] = args[1].substring(3, args[1].length - 1)
    } else {
      args[1] = args[1].substring(2, args[1].length - 1)
    }

    console.log(args[1])

    let userToRemove = message.guild.members.find('id', args[1])

    if (SCOREBOARD[args[1]]) {
      delete SCOREBOARD[args[1]]
      message.reply(`Removed ${userToRemove.user} from the game!`)
      userToRemove.user.send('You were removed from the game! Sowwy :weary:')
      KICKED.push(args[1])
    } else {
      message.reply(`${userToRemove.user.tag} isn't in the game!`)
    }
  } else if (message.channel.type === 'dm' && SCOREBOARD[message.author.id] && message.author.id !== tokens.BOT_ID) {
    console.log(SCOREBOARD[message.author.id])
    if (COLLECTING) {
      if (!SCOREBOARD[message.author.id].answered) {
        if (message.content.match(/[a-d]/i) && message.content.length === 1) {
          console.log(`Got ${message.author.username}'s answer of ${message.content}`)
          message.reply(`got it! **${message.content.toUpperCase()}** collected as your answer!`)
          SCOREBOARD[message.author.id].currentAns = message.content.toUpperCase()
          SCOREBOARD[message.author.id].answered = true
        } else {
          message.reply('Not a valid answer!')
        }
      } else {
        message.reply('You have already answered!')
      }
    } else {
      message.reply('I\'m not accepting answers right now!')
    }
  } else if (message.content.toLowerCase().includes(`${tokens.PREFIX}bulkset`) && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    console.log('bulk set command')
    let temp = message.content.substring(message.content.indexOf(' ') + 1, message.content.length)
    if (temp === `${tokens.PREFIX}bulkset`) {
      message.reply('Oi, I need a comma delimited list of answers (ex. a, b, c, d)')
    } else {
      let answerList = temp.split(',')
      let invalidTerm = false
      for (let i = 0; i < answerList.length; i++) {
        if (answerList[i].trim().match(/[a-d]/i)) {
          ANSWERQUEUE.push(answerList[i].trim().toUpperCase())
        } else {
          message.reply(`Invalid answer **${answerList[i].trim().toUpperCase()}**!`)
          ANSWERQUEUE = ANSWERQUEUE.splice(0, ANSWERQUEUE.length - i)
          invalidTerm = true
          break
        }
      }
      if (!invalidTerm) {
        let currentAnswers = []
        for (let i = 0; i < ANSWERQUEUE.length; i++) {
          currentAnswers[i] = {
            name: `#${ANSWERED + (i + 1)}`,
            value: ANSWERQUEUE[i]
          }
        }
        let answerQueue = {
          embed: {
            color: 0x6bb6d1,
            author: {
              name: `Answer Queue`,
              icon_url: 'https://cdn.discordapp.com/attachments/281673478783107073/437653299496222722/MaF_circlent.png'
            },
            fields: currentAnswers,
            timestamp: new Date(),
            footer: {
              text: 'BETA'
            }
          }
        }
        message.reply('current answer queue', answerQueue)
      }
    }
  } else if (message.content.toLowerCase() === `${tokens.PREFIX}answers` && (message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID)) {
    let currentAnswers = []
    for (let i = 0; i < ANSWERQUEUE.length; i++) {
      currentAnswers[i] = {
        name: `#${ANSWERED + (i + 1)}`,
        value: ANSWERQUEUE[i]
      }
    }
    let answerQueue = {
      embed: {
        color: 0x6bb6d1,
        author: {
          name: `Answer Queue`,
          icon_url: 'https://cdn.discordapp.com/attachments/281673478783107073/437653299496222722/MaF_circlent.png'
        },
        fields: currentAnswers,
        timestamp: new Date(),
        footer: {
          text: 'BETA'
        }
      }
    }
    message.reply('current answer queue', answerQueue)
  } else if ((message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID) && message.channel.id === tokens.QUESTION_ID && message.content.toLowerCase().includes(`${tokens.PREFIX}setans`)) {
    console.log('Attempting to set answer for next question!')
    let temp = message.content.substring(message.content.indexOf(' ') + 1, message.content.length)
    if (temp.match(/[a-d]/i) && temp.length === 1) {
      message.reply(`got it! Setting **${temp.toUpperCase()}** as answer to next question! When ready, post your trivia card to the answers channel!`)
      ANSWER = temp.toUpperCase()
      console.log(`Setting answer as ${ANSWER}`)
    } else {
      message.reply('Invalid answer selection!')
    }
  } else if ((message.author.id === tokens.ADMIN_ID || message.author.id === tokens.OP_ID) && message.channel.id === tokens.ANSWERS_ID && message.attachments.array().length > 0) {
    if (!ANSWER) {
      if (ANSWERQUEUE.length > 0) {
        ANSWER = ANSWERQUEUE[0]
        ANSWERQUEUE = ANSWERQUEUE.slice(1, ANSWERQUEUE.length)
        console.log(ANSWERQUEUE)
      } else {
        console.log('No answer set')
        message.delete().then(message => { message.author.send('Oopsie woopsie, you made a fucksy wucksy! Try setting an answer before posting the card :weary:') }).catch(console.error())
        return
      }
    }
    if (Object.keys(SCOREBOARD).length === 0) {
      console.log('No members present')
      message.delete().then(message => { message.author.send('Oopsie woopsie, you made a fucksy wucksy! Try letting users join first :weary:') }).catch(console.error())
      return
    }
    for (var player in SCOREBOARD) {
      let userDM = message.guild.members.find('id', player)
      userDM.user.send('Collection process is beginning! You have **15 seconds** to send your answer!')
    }
    console.log('Starting collection process with current answer being ' + ANSWER)
    let answerChannel = message.guild.channels.find('id', tokens.ANSWERS_ID)
    COLLECTING = true
    let answerMessage
    answerChannel.send('Now accepting answers! You have **15 seconds** to DM me your answer!').then(message => { answerMessage = message }).catch(console.error())

    let counter = 14
    let secondsInterval = setInterval(() => {
      answerMessage.edit(`Now accepting answers! You have **${counter} second${counter > 1 ? 's' : ''}** to DM me your answer!`).then(() => {
        console.log('Decrementing counter')
        counter--
      }).catch(console.error())
    }, 1000)

    setTimeout(() => {
      message.delete()
      answerMessage.delete()
      console.log('Collection is done!')
      clearInterval(secondsInterval)
      COLLECTING = false
      let scoreArr = []
      for (var user in SCOREBOARD) {
        console.log(SCOREBOARD[user])
        if (SCOREBOARD[user].currentAns === ANSWER) {
          console.log(`User with ID ${user} got 100 points!`)
          SCOREBOARD[user].points += 100
        }
        SCOREBOARD[user].currentAns = null
        SCOREBOARD[user].answered = false
        let userObj = message.guild.members.find('id', user)

        scoreArr.push({ name: userObj.user.tag, value: SCOREBOARD[user].points })
      }

      scoreArr.sort((a, b) => {
        return b.value - a.value
      })

      for (let i = 0; i < scoreArr.length; i++) {
        scoreArr[i].name = `${i + 1}. ` + scoreArr[i].name
        scoreArr[i].value = `Points: ` + scoreArr[i].value + '\n\u200b'
      }

      setTimeout(() => {
        ANSWERED++
        console.log(scoreArr)
        let score = {
          embed: {
            color: 0x6bb6d1,
            author: {
              name: `Current Scores out of ${ANSWERED} Question${ANSWERED > 1 ? 's' : ''}`,
              icon_url: 'https://cdn.discordapp.com/attachments/281673478783107073/437653299496222722/MaF_circlent.png'
            },
            fields: scoreArr,
            timestamp: new Date(),
            footer: {
              text: 'BETA'
            }
          }
        }
        answerChannel.send(`__**Answers are no longer being accepted for question ${ANSWERED}!**__\nCorrect Answer: **${ANSWER}**`, score)
        ANSWER = null
      }, 1000)
    }, 15500)
  }
})

client.login(tokens.BOT_TOKEN)

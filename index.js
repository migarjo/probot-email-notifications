var CreateEmailNotifications = require('./lib/create-email-notifications')

function probotEmailNotifications (robot) {
  robot.on('repository.created', async context => {
    return CreateEmailNotifications.analyze(context.github, context.repo(), context.payload, robot.log)
  })

  robot.on('repository.archived', async context => {
    return CreateEmailNotifications.analyze(context.github, context.repo(), context.payload, robot.log)
  })


}

module.exports = probotEmailNotifications

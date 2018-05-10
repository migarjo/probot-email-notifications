const yaml = require('js-yaml')
const noOrgConfig = false
var nodemailer = require('nodemailer');

class CreateEmailNotifications {
  static analyze (github, repo, payload, logger) {
    const defaults = require('./defaults')
    const orgRepo = (process.env.ORG_WIDE_REPO_NAME) ? process.env.ORG_WIDE_REPO_NAME : defaults.ORG_WIDE_REPO_NAME
    const filename = (process.env.FILE_NAME) ? process.env.FILE_NAME : defaults.FILE_NAME
    logger.info('Get config from: ' + repo.owner + '/' + orgRepo + '/' + filename)

    return github.repos.getContent({
      owner: repo.owner,
      repo: orgRepo,
      path: filename
    }).catch(() => ({
      noOrgConfig
    }))
      .then((orgConfig) => {
        if ('noOrgConfig' in orgConfig) {
          logger.info('NOTE: config file not found in: ' + orgRepo + '/' + filename + ', using defaults.')
          return new CreateEmailNotifications(github, repo, payload, logger, '').notify()
        } else {
          const content = Buffer.from(orgConfig.data.content, 'base64').toString()
          return new CreateEmailNotifications(github, repo, payload, logger, content).notify()
        }
      })
  }

  constructor (github, repo, payload, logger, config) {
    this.github = github
    this.repo = repo
    this.payload = payload
    this.logger = logger
    this.config = yaml.safeLoad(config)
  }

  notify (repo) {
    var configParams = Object.assign({}, require('./defaults'), this.config || {})

    console.log('Action:', this.payload.action)
    if (this.payload.action === 'created') {
      if (!configParams.enableCreateNotification) {
          this.logger.info('Repo: ' + this.repo.repo + ' was created but enableCreateNotification is set to false')
          return
      }

      var transporter = nodemailer.createTransport(configParams.transportConfig);
      var mailText = configParams.createEmailBody + this.payload.repository.html_url // https://github.com/' + repo.owner + '/' + repo.repo
      var mailOptions = {
        from: configParams.transportConfig.auth.user,
        to: configParams.createRecipientList,
        subject: configParams.createEmailSubject,
        text: mailText
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          this.logger.error(error);
        } else {
          this.logger.info('Email sent: ' + info.response);
        }
      });
      return
    }

    if (this.payload.action === 'archived') {
      if (!configParams.enableArchiveNotification) {
          this.logger.info('Repo: ' + this.repo.repo + ' was archived but enableArchiveNotification is set to false')
          return
      }

      var transporter = nodemailer.createTransport(configParams.transportConfig);
      var mailText = configParams.archiveEmailBody + this.payload.repository.html_url // https://github.com/' + repo.owner + '/' + repo.repo
      var mailOptions = {
        from: configParams.transportConfig.auth.user,
        to: configParams.archiveRecipientList,
        subject: configParams.archiveEmailSubject,
        text: mailText
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          this.logger.error(error);
        } else {
          this.logger.info('Email sent: ' + info.response);
        }
      });
      return
    }

  }

  isPublicizedAndConvertDisabled (enableArchiveNotification) {
    if (this.payload.action === 'archived' && !enableArchiveNotification) {
      this.logger.info('Repo: ' + this.repo.repo + ' was archived but enableArchiveNotification is set to false')
      return true
    }
    return false
  }
}
module.exports = CreateEmailNotifications

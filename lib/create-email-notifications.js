const yaml = require('js-yaml')
const noOrgConfig = false
var nodemailer = require('nodemailer');

class CreateEmailNotifications {

  // Analyze checks for the existence of an organization-wide repository created for the purpose of configurng Probot apps. By default, the path of this configuration file is https://github.com/[ORG_NAME]/org-settings/.github/create-email-notifications.yml. Both the repository name and file path can be configured in defaults.js. If no configuration file exists at the specified location, default values are used as configured in defaults.js

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

    // This implementation block creates a notification email if a repository has been created.
    if (this.payload.action === 'created') {
      // If `enableCreateNotification = false in the configuration, no email will be sent.`
      if (!configParams.enableCreateNotification) {
          this.logger.info('Repo: ' + this.repo.repo + ' was created but enableCreateNotification is set to false')
          return
      }

      // Uses Nodemailer (https://nodemailer.com/about/) to send emails. The default transport configuration is set to use Gmail, but standard SMTP configuration options are also available (see https://nodemailer.com/smtp/). The transport configuration object can be created in defaults.js, or in the configuration yml file.
      const transporter = nodemailer.createTransport(configParams.transportConfig);

      // Generates the body of the email to be sent as well as the sender, recipent, and subject of the email from the configuration file.
      const mailText = configParams.createEmailBody + this.payload.repository.html_url
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

    // This implementation block creates a notification email if a repository has been archived.
    if (this.payload.action === 'archived') {
      if (!configParams.enableArchiveNotification) {
          this.logger.info('Repo: ' + this.repo.repo + ' was archived but enableArchiveNotification is set to false')
          return
      }

      var transporter = nodemailer.createTransport(configParams.transportConfig);
      var mailText = configParams.archiveEmailBody + this.payload.repository.html_url
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
}
module.exports = CreateEmailNotifications

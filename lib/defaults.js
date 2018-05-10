module.exports = {
  enableArchiveNotification: true,
  enableCreateNotification: true,
  archiveEmailSubject: 'GitHub Repository Archived',
  archiveEmailBody: 'The following repository has been archived in GitHub: ',  createEmailSubject: 'GitHub Repository Created',
  createEmailBody: 'A new repository has been created in GitHub at the following location: ',
  archiveRecipientList: 'migarjo@github.com;gracepark@github.com',
  createRecipientList: 'migarjo@github.com',
  transportConfig: {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_PASSWORD
    }
  },
  FILE_NAME: '.github/create-email-notifications.yml',
  ORG_WIDE_REPO_NAME: 'org-settings'
}

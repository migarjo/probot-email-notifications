# Probot Example: Email Notifications

This repository contains a sample GitHub App built with [probot](https://github.com/probot/probot) that gives a team read access to a new repository when it is created.

## Setup

Please note that this app is meant to demonstrate the functional capabilities of a Probot app and is not production-ready. It is strongly recommended that a user takes the following steps prior to use:

- [Duplicate](https://help.github.com/articles/duplicating-a-repository/) this repository into a repository in your own user account or organization
- In your new repository, open a pull request between the `email-notifications` and `master` branches and review the changes introduced. This represents all of the code used to implement this app.
  - Note that this app does not have any testing implemented. It is strongly recommended that you implement testing prior to production deployment. For guidance on implementing testing in a Probot app, see this [documentation](https://probot.github.io/docs/testing/).
- Configure a [GitHub App](https://probot.github.io/docs/development/#configuring-a-github-app) on GitHub
- Read the in-line documentation explaining the functionality of the app
- Customize the implementation to fit your needs

## Configuration
Under the current implementation, there are several configurable attributes. Defaults for these attributes can be set in the [defaults.js](./lib/defaults.js) file, but it is recommended that each org in which this is implemented creates an override file with a file called `.github/open-issue-on-repo-creation.yml` file in the Repository, `org-settings`. This Repository will contain global settings for the Organization. You can name the settings repository anything you'd like; just add the repository name to your defaults.js file.

```yml
# Configuration for Create Issue Upon Repo Creation


# Enables an email notification when a repository is archived
enableArchiveNotification: true

# Enables an email notification when a repository is created
enableCreateNotification: true

# Email subject when a repository is archived
archiveEmailSubject: 'GitHub Repository Archived'

# Email body when a repository is archived
archiveEmailBody: 'The following repository has been archived in GitHub: '

# Email subject when a repository is created
createEmailSubject: 'GitHub Repository Created'

# Email body when a repository is created
createEmailBody: 'A new repository has been created in GitHub at the following location: '

# Email list for the intended recipients of each notification type, delimited by semicolons
archiveRecipientList: 'email_address_1;email_address_2'
createRecipientList: 'email_address_1;email_address_2'

# Transport configuration object as defined by nodemailer (https://nodemailer.com/smtp/)
# This example configures the email for use with gmail (see https://medium.com/@manojsinghnegi/sending-an-email-using-nodemailer-gmail-7cfa0712a799)
transportConfig:
  service: 'gmail'
  auth:
    user: process.env.GMAIL_ADDRESS
    pass: process.env.GMAIL_PASSWORD
```

## Deployment

Probot is a standard NodeJS app, and thus can be deployed as such. [Documentation](https://probot.github.io/docs/deployment) is available on the Probot website, which provides directions for deployment using Glitch, Heroku, and Now.

If you have multiple Probot apps that you would like to deploy together, see [Combining apps](https://probot.github.io/docs/deployment/#combining-apps).

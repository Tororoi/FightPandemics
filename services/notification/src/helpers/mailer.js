const AWS = require("aws-sdk");

class Mailer {
  constructor(config) {
    AWS.config.update({
      accessKeyId: config.apiKeyId,
      secretAccessKey: config.apiKey,
      region: config.region,
    });
    this.client = new AWS.SESV2({
      apiVersion: "2019-09-27",
    });
  }

  // TODO we could consider using SES personalized emails based on templates. But I am not sure if our use case is
  // too complicated since we need to merge in HTML partials.
  // See https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html
  buildPayload(email) {
    return {
      Content: {
        Simple: {
          Body: {
            Html: {
              Data: email.htmlBody,
              Charset: "UTF-8",
            },
            Text: {
              Data: email.textBody,
              Charset: "UTF-8",
            },
          },
          Subject: {
            Data: email.subject,
            Charset: "UTF-8",
          }
        },
      },
      Destination: {
        ToAddresses: [email.toEmailAddress],
      },
      FeedbackForwardingEmailAddress: config.feedbackForwardingEmailAddress,
      //FeedbackForwardingEmailAddressIdentityArn: '',
      FromEmailAddress: config.fromEmailAddress,
      // FromEmailAddressIdentityArn: '', // TODO not sure if this should be set. See https://docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html
      ReplyToAddresses: [config.replyToEmailAddress],
    };
  }

  async send(emailPayload) {
    try {
      await this.client.sendEmail(emailPayload).promise();
    } catch (error) {
      // TODO log error to Papertrail, send to Sentry.
    }
  }
}

module.exports = {
  Mailer,
}
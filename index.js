const Imap = require("imap");
const simpleParser = require("mailparser").simpleParser;
require('dotenv').config();
const imapConfig = {
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  host: process.env.MAIL_HOST,
  port: 993, // IMAP SSL port
  tls: true,
};
const { EmbedBuilder, WebhookClient } = require("discord.js");

const webhook = new WebhookClient({
  url: process.env.WEBHOOK_URL,
});
const fetchMail = () => {
  const imap = new Imap(imapConfig);

  imap.once("error", (err) => {
    console.error("IMAP error:", err);
    imap.end();
  });

  imap.once("end", () => {
    console.log("IMAP connection ended");
  });

  imap.once("ready", () => {
    imap.openBox("INBOX", false, () => {
      imap.search(["UNSEEN"], (err, results) => {
        if (err) {
          console.error("Error searching for emails:", err);
          imap.end();
          return;
        }
        if (results.length === 0) {
          console.log("No unseen emails found.");
          imap.end();
          return;
        }

        const f = imap.fetch(results, { bodies: "", markSeen: true});
        f.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err);
                return;
              }

              const emailData = {
                body: parsed.text,
                title: parsed.subject,
                author: parsed.from.text,
                email: parsed.from.value[0].address,
              };

              console.log("Received email:", emailData.title);

              if (
                emailData.email === "noreply@notify.cloudflare.com" &&
                emailData.title === "DDoS Attack Detected"
              ) {
                const bodyLines = emailData.body.split("\n");
                let timeDetected,
                  type,
                  action,
                  maxRate,
                  targetZone,
                  targetHostname,
                  ruleId,
                  ruleDescription,
                  ruleOverrideId;

                try {
                  timeDetected = bodyLines
                    .find((line) => line.startsWith("Time detected:"))
                    .split(": ")[1];
                } catch (error) {
                  timeDetected = null;
                }

                try {
                  type = bodyLines
                    .find((line) => line.startsWith("Type:"))
                    .split(": ")[1];
                } catch (error) {
                  type = null;
                }

                try {
                  action = bodyLines
                    .find((line) => line.startsWith("Action:"))
                    .split(": ")[1];
                } catch (error) {
                  action = null;
                }

                try {
                  maxRate = bodyLines
                    .find((line) => line.startsWith("Max rate:"))
                    .split(": ")[1];
                } catch (error) {
                  maxRate = null;
                }

                try {
                  targetZone = bodyLines
                    .find((line) => line.startsWith("Target zone:"))
                    .split(": ")[1];
                } catch (error) {
                  targetZone = null;
                }

                try {
                  targetHostname = bodyLines
                    .find((line) => line.startsWith("Target hostname:"))
                    .split(": ")[1];
                } catch (error) {
                  targetHostname = null;
                }

                try {
                  ruleId = bodyLines
                    .find((line) => line.startsWith("Rule ID:"))
                    .split(": ")[1];
                } catch (error) {
                  ruleId = null;
                }

                try {
                  ruleDescription = bodyLines
                    .find((line) => line.startsWith("Rule description:"))
                    .split(": ")[1];
                } catch (error) {
                  ruleDescription = null;
                }

                try {
                  ruleOverrideId = bodyLines
                    .find((line) => line.startsWith("Rule override ID:"))
                    .split(": ")[1];
                } catch (error) {
                  ruleOverrideId = null;
                }

                const isDDosTestMessage = targetZone === "fake-zone-name";

                // Use the extracted information as needed
                console.log("Time detected:", timeDetected);
                console.log("Type:", type);
                console.log("Action:", action);
                console.log("Max rate:", maxRate);
                console.log("Target zone:", targetZone);
                console.log("Target hostname:", targetHostname);
                console.log("Rule ID:", ruleId);
                console.log("Rule description:", ruleDescription);
                console.log("Rule override ID:", ruleOverrideId);

                const embed = {
                  color: 0xff0000, // Red
                  title: "DDoS Attack on Our Service!",
                  description:
                    "Our service is currently experiencing a DDoS attack and may be inaccessible.",
                  fields: [
                    {
                      name: "Status",
                      value: "In Progress",
                      inline: true,
                    },
                    {
                      name: "Estimated Duration",
                      value: "Unknown",
                      inline: true,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    text: "For further information, please contact support.",
                  },
                };

                  modguardwebhook.send({
                    content: `<@&${process.env.DISCORD_ROLE}>`, embeds: [embed],
                  });
                
              } else if (
                emailData.email === "noreply@notify.cloudflare.com" &&
                emailData.title === "Cloudflare: Maintenance notification"
              ) {
                let maintenanceID,
                  pointOfPresence,
                  scheduledStart,
                  scheduledEnd;

                try {
                  maintenanceID = emailData.body.match(
                    /Maintenance ID: (\d+)/,
                  )[1];
                } catch (error) {
                  maintenanceID = null;
                }

                try {
                  pointOfPresence = emailData.body.match(
                    /Point of Presence: (.+)/,
                  )[1];
                } catch (error) {
                  pointOfPresence = null;
                }

                try {
                  scheduledStart = emailData.body
                    .match(/Scheduled Start: (.+)/)[1]
                    .split("Scheduled End: ")[0];
                } catch (error) {
                  scheduledStart = null;
                }

                try {
                  scheduledEnd = emailData.body.match(/Scheduled End: (.+)/)[1];
                } catch (error) {
                  scheduledEnd = null;
                }

                const embed = {
                  color: 0xf38020,
                  title: "Maintenance Information",
                  fields: [
                    {
                      name: "Maintenance ID",
                      value: maintenanceID
                        ? maintenanceID
                        : `Unknown Maintenance ID`,
                      inline: true,
                    },
                    {
                      name: "Point of Presence",
                      value: pointOfPresence
                        ? pointOfPresence
                        : `Unknown Point of Presence`,
                      inline: true,
                    },
                    {
                      name: "Scheduled Start",
                      value: scheduledStart
                        ? `<t:${Date.parse(scheduledStart)/1000}:f>`
                        : `Unknown Schedulded Start`,
                      inline: true,
                    },
                    {
                      name: "Scheduled End",
                      value: scheduledEnd
                      ? `<t:${Date.parse(scheduledEnd)/1000}:f>`
                      : `Unknown Schedulded End`,
                      inline: true,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    text: "For more details: https://www.cloudflarestatus.com",
                  },
                };
                webhook.send({
                  content: `<@&${process.env.DISCORD_ROLE}>`, embeds: [embed],
                });
              } else if (
                emailData.email === "noreply@notify.cloudflare.com" &&
                emailData.title.includes("Incident") &&
                emailData.title.includes("Cloudflare")
              ) {
                let incidentName, incidentStatus, impactedService;

                try {
                  incidentName = emailData.body.match(/Incident Name: (.+)/)[1];
                } catch (error) {
                  incidentName = null;
                }

                try {
                  incidentStatus = emailData.body.match(
                    /Incident Status: (.+)/,
                  )[1];
                } catch (error) {
                  incidentStatus = null;
                }

                try {
                  impactedService = emailData.body.match(
                    /This Incident Impacts:\n\s*-\s*(.+)/,
                  )[1];
                } catch (error) {
                  impactedService = null;
                }

                const embed = {
                  color: 0xffa500, // Orange (you can choose a different color if desired)
                  title: "Incident Information",
                  fields: [
                    {
                      name: "Incident Name",
                      value: incidentName ? incidentName : `Unknown Name`,
                      inline: true,
                    },
                    {
                      name: "Incident Status",
                      value: incidentStatus
                        ? incidentStatus
                        : `Unknown Incident Status`,
                      inline: true,
                    },
                    {
                      name: "Impacted Service(s)",
                      value: impactedService
                        ? impactedService
                        : `Unknown Impacted Service(s)`,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    text: "For more details: https://www.cloudflarestatus.com",
                  },
                };
                webhook.send({
                  content: `<@&${process.env.DISCORD_ROLE}>`, embeds: [embed],
                });
              }
            });
          });
          msg.once('attributes', (attrs) => {
            console.log(attrs);
          });
        });
      });
    });
  });
  imap.connect();
};

const cron = require("node-cron");
cron.schedule("*/30 * * * * *", fetchMail);

/**
 * Prime 1 Realty: website leads -> Google Sheet
 *
 * Setup (about 5 minutes):
 * 1. Create a Google Sheet (e.g. "Prime 1 Website Leads") in the office Google account.
 * 2. Extensions > Apps Script. Delete the sample code and paste this whole file.
 * 3. Project Settings (gear icon) > Script properties > Add property:
 *      SECRET = <any long random string; use the same value for LEAD_WEBHOOK_SECRET in Vercel>
 *    Optional: NOTIFY_EMAIL = admin@prime1realty.net  (sends an email alert for every lead)
 * 4. Deploy > New deployment > type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, approve the permissions, copy the Web app URL (ends in /exec).
 * 5. In Vercel > prime1realty > Settings > Environment Variables add:
 *      GOOGLE_SHEETS_WEBHOOK_URL = <the /exec URL>
 *      LEAD_WEBHOOK_SECRET       = <same SECRET as step 3>
 *    Then redeploy.
 *
 * If you edit this script later: Deploy > Manage deployments > edit > Version: New version.
 * (A brand-new deployment would change the URL.)
 *
 * Agent applications (/join) go to a second tab, "Agent Applications". When Resend is not set up,
 * this script also sends the two recruiting emails with MailApp from this Google account:
 *   - to admin@prime1realty.net (Antony cc'd) with every detail (reply goes to the agent), and
 *   - to the agent, with the 10-PDF onboarding packet attached (fetched from the website's signed links).
 * Run `testAgentEmail` once from the editor to approve the email + fetch permissions.
 * MailApp quota: 100 recipients/day on a free Gmail account, 1,500 on Google Workspace.
 */

var SHEET_NAME = "Leads";
var HEADERS = [
  "Submitted", "Status", "Lead type", "Name", "Phone", "Email", "Message", "Answers",
  "Call consent", "Page", "Source", "Medium", "Campaign", "Content", "Term", "fbclid", "gclid", "Event ID",
  "Landing service", "Landing page", "Device", "Referrer", "AI source",
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var props = PropertiesService.getScriptProperties();
    var data = JSON.parse(e.postData.contents);
    if (!props.getProperty("SECRET") || data.secret !== props.getProperty("SECRET")) {
      return json({ ok: false, error: "unauthorized" });
    }

    if (data.kind === "agent_application") return json(handleAgent(data));

    var sheet = getSheet();
    var utm = data.utm || {};
    var answers = data.answers || {};
    var answerText = Object.keys(answers).map(function (k) { return k + ": " + answers[k]; }).join("\n");

    sheet.appendRow([
      new Date(data.submittedAt || Date.now()),
      "New",
      data.label || data.leadType || "",
      data.name || "",
      "'" + (data.phone || ""), // keep the number as text
      data.email || "",
      data.message || "",
      answerText,
      data.smsConsent ? "Yes" : "No",
      data.pageUrl || "",
      utm.utm_source || "",
      utm.utm_medium || "",
      utm.utm_campaign || "",
      utm.utm_content || "",
      utm.utm_term || "",
      utm.fbclid || "",
      utm.gclid || "",
      data.eventId || "",
      utm.landing_service || "",
      utm.landing_page || "",
      utm.device || "",
      utm.referrer || "",
      utm.ai_source || "",
    ]);

    var notify = props.getProperty("NOTIFY_EMAIL");
    if (notify) {
      MailApp.sendEmail({
        to: notify,
        replyTo: data.email || undefined,
        subject: "New lead: " + (data.label || data.leadType) + " - " + data.name,
        body:
          (data.label || "") + "\n\nName: " + data.name + "\nPhone: " + data.phone + "\nEmail: " + (data.email || "-") +
          (answerText ? "\n\n" + answerText : "") + (data.message ? "\n\nMessage: " + data.message : "") +
          "\n\nPage: " + (data.pageUrl || "") + "\nSource: " + (utm.utm_source || "direct") +
          "\n\nCall within 5 minutes for the best chance to connect.\nSheet: " + SpreadsheetApp.getActive().getUrl(),
      });
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

var AGENT_SHEET = "Agent Applications";
var AGENT_HEADERS = [
  "Submitted", "Status", "Name", "Email", "Phone", "License status", "License type", "License #",
  "Current brokerage", "Years licensed", "Closings (12 mo)", "Focus", "Market", "Association / MLS",
  "Next step", "Heard from", "Message", "Packet emailed", "Source", "Campaign", "gclid", "fbclid", "Page",
];

function handleAgent(data) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(AGENT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(AGENT_SHEET);
    sheet.appendRow(AGENT_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, AGENT_HEADERS.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
    sheet.getRange("A:A").setNumberFormat("yyyy-mm-dd h:mm am/pm");
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Contacted", "Call booked", "Agreement sent", "Onboarding", "Joined", "Not a fit"], true)
      .build();
    sheet.getRange("B2:B").setDataValidation(rule);
  }

  var agentEmailed = false;
  var errors = [];
  if (data.sendEmails && data.emails) {
    var antony = data.emails.toAntony;
    try {
      MailApp.sendEmail({ to: antony.to, cc: antony.cc || "", replyTo: antony.replyTo, subject: antony.subject, htmlBody: antony.html, body: antony.text, name: "Prime 1 Website" });
    } catch (err) {
      errors.push("antony: " + err);
    }
    var agent = data.emails.toAgent;
    var files = [];
    (data.docs || []).forEach(function (d) {
      try {
        var r = UrlFetchApp.fetch(d.url, { muteHttpExceptions: true });
        if (r.getResponseCode() === 200) files.push(r.getBlob().setName("Prime 1 Realty - " + d.title.replace(/&/g, "and") + ".pdf"));
      } catch (err) {
        errors.push("doc " + d.title + ": " + err);
      }
    });
    try {
      MailApp.sendEmail({ to: agent.to, replyTo: agent.replyTo, subject: agent.subject, htmlBody: agent.html, body: agent.text, name: "Prime 1 Realty", attachments: files });
      agentEmailed = true;
    } catch (err) {
      errors.push("agent: " + err);
      try {
        // Attachments too large or blocked: send the email with the download links only.
        MailApp.sendEmail({ to: agent.to, replyTo: agent.replyTo, subject: agent.subject, htmlBody: agent.html, body: agent.text, name: "Prime 1 Realty" });
        agentEmailed = true;
      } catch (err2) {
        errors.push("agent retry: " + err2);
      }
    }
  }

  var utm = data.utm || {};
  sheet.appendRow([
    new Date(data.submittedAt || Date.now()), "New", data.name || "", data.email || "", "'" + (data.phone || ""),
    data.licenseStatus || "", data.licenseType || "", (data.licenseNumber || "").toUpperCase(), data.currentBrokerage || "",
    data.yearsLicensed || "", data.transactions || "", data.focus || "", data.market || "", data.association || "",
    data.nextStep === "call" ? "Call with Antony first" : "Ready to join", data.heardFrom || "", data.message || "",
    data.sendEmails ? (agentEmailed ? "Yes" : "FAILED: " + errors.join("; ")) : "Sent by website (Resend)",
    utm.utm_source || "", utm.utm_campaign || "", utm.gclid || "", utm.fbclid || "", data.pageUrl || "",
  ]);
  return { ok: true, agentEmailed: agentEmailed, errors: errors };
}

/** Run once from the editor (select it, click Run) to grant email + fetch permissions and send yourself a test. */
function testAgentEmail() {
  var me = Session.getActiveUser().getEmail();
  MailApp.sendEmail(me, "Prime 1: agent email test", "MailApp is authorized. Remaining daily quota: " + MailApp.getRemainingDailyQuota());
  UrlFetchApp.fetch("https://www.google.com", { muteHttpExceptions: true });
}

function getSheet() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(SHEET_NAME);
  // Older sheets: add any new column headers (e.g. Landing service, Device) without touching existing data.
  if (sheet && sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  }
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
    sheet.getRange("A:A").setNumberFormat("yyyy-mm-dd h:mm am/pm");
    // Status dropdown so the team can track each lead through the pipeline
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Contacted", "Appointment set", "Client", "Not a fit", "No answer"], true)
      .build();
    sheet.getRange("B2:B").setDataValidation(rule);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

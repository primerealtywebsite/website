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
 * APPLICANTS (current workflow, Nov 2026): every /join status change posts kind "applicant_status".
 * upsertApplicant keeps ONE row per applicant ID in the "Applicants" tab: status, next action and the
 * person responsible, plus a dated history. Run installTriggers() once to email the office a daily
 * list of incomplete files older than 24 hours and payments that failed (Northern Lights follow-up).
 *
 * LEGACY: agent applications from the old workflow went to the "Agent Applications" tab. When Resend is not set up,
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

    if (data.kind === "applicant_status") return json(upsertApplicant(data));
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


// ---------- Applicants: one record per applicant (status, next action, responsible) ----------

var APPLICANT_SHEET = "Applicants";
var APPLICANT_HEADERS = [
  "Applicant ID", "Name", "Email", "Phone", "Status", "Next action", "Responsible", "Last update",
  "Track", "License #", "License status (self)", "DBPR (broker)", "Current brokerage", "Closings 12 mo", "Commercial exp.",
  "Markets", "Affiliation date", "Flags", "Fit", "Heard from", "Referred by", "Source", "Campaign",
  "Speak request", "Info request", "Info response", "Signed at", "Payment", "Paid at", "Affiliated at", "Production (YTD)", "History",
];
var APPLICANT_KEYS = {
  phone: "Phone", track: "Track", license: "License #", licenseStatus: "License status (self)", dbpr: "DBPR (broker)",
  brokerage: "Current brokerage", closings: "Closings 12 mo", commercial: "Commercial exp.", markets: "Markets",
  affiliationDate: "Affiliation date", flags: "Flags", fit: "Fit", heardFrom: "Heard from", referredBy: "Referred by",
  source: "Source", campaign: "Campaign", speakRequest: "Speak request", infoRequest: "Info request", infoResponse: "Info response",
  signedAt: "Signed at", payment: "Payment", paidAt: "Paid at", affiliatedAt: "Affiliated at",
};

function applicantSheet() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(APPLICANT_SHEET);
  if (!sh) {
    sh = ss.insertSheet(APPLICANT_SHEET, 0);
    sh.appendRow(APPLICANT_HEADERS);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(2);
    sh.getRange(1, 1, 1, APPLICANT_HEADERS.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  }
  return sh;
}

/** Same applicant ID -> same row (a returning applicant never creates a duplicate record). */
function upsertApplicant(d) {
  var sh = applicantSheet();
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var col = function (name) { return head.indexOf(name) + 1; };
  var ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  var idx = ids.indexOf(d.id);
  var row = idx >= 0 ? idx + 2 : sh.getLastRow() + 1;
  var isNew = idx < 0;
  // Never move a record backwards from a later status because of a late "Incomplete" ping.
  var current = isNew ? "" : sh.getRange(row, col("Status")).getValue();
  var keepStatus = d.status === "Incomplete" && current && current !== "Incomplete";
  var set = function (name, v) { if (v !== undefined && v !== null && v !== "") sh.getRange(row, col(name)).setValue(v); };
  set("Applicant ID", d.id);
  set("Name", d.name);
  set("Email", d.email);
  if (!keepStatus) {
    set("Status", d.status);
    set("Next action", d.nextAction);
    set("Responsible", d.owner);
  }
  set("Last update", new Date(d.at || Date.now()));
  Object.keys(APPLICANT_KEYS).forEach(function (k) { if (d[k] !== undefined) set(APPLICANT_KEYS[k], k === "phone" ? "'" + d[k] : d[k]); });
  var hist = isNew ? "" : String(sh.getRange(row, col("History")).getValue() || "");
  sh.getRange(row, col("History")).setValue((hist ? hist + "\n" : "") + Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd HH:mm") + " " + d.status);
  return { ok: true, row: row, created: isNew };
}

/** Run once from the editor: daily 8 AM ET digest of files that need administrative follow-up. */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "dailyApplicantDigest") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("dailyApplicantDigest").timeBased().atHour(8).everyDays(1).inTimezone("America/New_York").create();
}

function dailyApplicantDigest() {
  var to = PropertiesService.getScriptProperties().getProperty("OFFICE_EMAIL") || "admin@prime1realty.net";
  var sh = applicantSheet();
  if (sh.getLastRow() < 2) return;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, APPLICANT_HEADERS.length).getValues();
  var dayAgo = Date.now() - 24 * 3600 * 1000;
  var items = rows.filter(function (r) {
    var status = r[4], updated = new Date(r[7]).getTime();
    return (status === "Incomplete" && updated < dayAgo) || status === "Payment failed" || (status === "More information requested" && updated < Date.now() - 3 * 24 * 3600 * 1000);
  });
  if (!items.length) return;
  MailApp.sendEmail({
    to: to,
    subject: "Applicant follow-up: " + items.length + " file(s) need administrative action",
    body: items.map(function (r) { return r[0] + "  " + r[1] + " <" + r[2] + ">  " + r[4] + "\n  Next: " + r[5] + " (" + r[6] + ")"; }).join("\n\n") +
      "\n\nAdministrative follow-up only (Northern Lights). Affiliation decisions, compensation and agreement questions go to the broker.\nSheet: " + SpreadsheetApp.getActive().getUrl(),
  });
}

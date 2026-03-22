import { Resend } from 'resend';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const MILESTONE_LABELS = {
  profile_complete:     'Profile completed',
  first_task_done:      'First task completed',
  sat_registered:       'SAT registration locked in',
  college_list_final:   'College list finalized',
  essays_started:       'Essays started',
  applications_open:    'Applications opened',
  first_app_submitted:  'First application submitted',
  all_apps_submitted:   'All applications submitted',
  financial_aid_filed:  'Financial aid filed',
  decision_made:        'College decision made',
};

function milestoneLabel(key) {
  return MILESTONE_LABELS[key] || key.replace(/_/g, ' ');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function buildDigestHTML({ parentName, studentName, tasksCompleted, milestonesReached, upcomingDeadlines, completionPercent, unsubscribeUrl }) {
  const taskRows = tasksCompleted.length > 0
    ? tasksCompleted.map(t => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #374151;">
            <span style="color: #16a34a; margin-right: 8px;">✓</span>${t.title}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; white-space: nowrap; text-align: right;">${formatDate(t.completedAt)}</td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding: 8px 0; font-size: 14px; color: #9ca3af;">No tasks completed this week — that's okay, keep going!</td></tr>`;

  const milestoneSection = milestonesReached.length > 0 ? `
    <h3 style="font-size: 12px; font-weight: 700; color: #1e3a5f; margin: 28px 0 12px; text-transform: uppercase; letter-spacing: 0.08em;">
      🏆 Milestones Reached
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      ${milestonesReached.map(m => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #374151;">
            <span style="color: #d97706; margin-right: 8px;">★</span>${milestoneLabel(m.milestoneKey)}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; white-space: nowrap; text-align: right;">${formatDate(m.reachedAt)}</td>
        </tr>`).join('')}
    </table>` : '';

  const deadlineRows = upcomingDeadlines.length > 0
    ? upcomingDeadlines.map(t => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #374151;">${t.title}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; white-space: nowrap; text-align: right;">${formatDate(t.dueDate)}</td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding: 8px 0; font-size: 14px; color: #9ca3af;">No upcoming deadlines</td></tr>`;

  const barWidth = Math.min(100, Math.max(0, completionPercent));

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 32px 28px;border-radius:12px 12px 0 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.6);text-transform:uppercase;">Stairway U</p>
          <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">Weekly Progress Digest</h1>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">${studentName}'s College Journey</p>
        </td></tr>

        <!-- Progress bar -->
        <tr><td style="background:#1e3a5f;padding:0 32px 24px;">
          <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.65);">Overall progress</p>
          <div style="background:rgba(255,255,255,0.15);border-radius:99px;height:8px;overflow:hidden;">
            <div style="width:${barWidth}%;background:linear-gradient(90deg,#60a5fa,#a78bfa);height:8px;border-radius:99px;"></div>
          </div>
          <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#fff;">${completionPercent}% complete</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
          <p style="font-size:16px;margin:0 0 20px;color:#111827;">Hi ${parentName},</p>
          <p style="font-size:14px;line-height:1.7;margin:0 0 24px;color:#6b7280;">
            Here's a quick look at what <strong style="color:#111827;">${studentName}</strong> has been up to this week.
          </p>

          <h3 style="font-size:12px;font-weight:700;color:#1e3a5f;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">
            ✅ Tasks Completed This Week
          </h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${taskRows}
          </table>

          ${milestoneSection}

          <h3 style="font-size:12px;font-weight:700;color:#1e3a5f;margin:28px 0 12px;text-transform:uppercase;letter-spacing:0.08em;">
            📅 Upcoming Deadlines
          </h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${deadlineRows}
          </table>

          <div style="margin-top:32px;text-align:center;">
            <a href="https://stairwayu.com"
               style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.02em;">
              View Full Dashboard →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:20px 0;font-size:11px;color:#9ca3af;line-height:1.8;">
          <p style="margin:0;">Stairway U — Guiding students on the path to college.</p>
          <p style="margin:4px 0 0;">You're receiving this because your account is linked to ${studentName}'s Stairway U profile.</p>
          <p style="margin:8px 0 0;"><a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe from weekly digest</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWeeklyDigest({ parentId, parentEmail, parentName, studentName, tasksCompleted, milestonesReached, upcomingDeadlines, completionPercent }) {
  if (!resend) {
    console.log('[digest] RESEND_API_KEY not configured, skipping email to', parentEmail);
    return { skipped: true };
  }

  const unsubscribeUrl = `https://stairwayu.com/api/cron/unsubscribe/${parentId}`;
  const html = buildDigestHTML({ parentName, studentName, tasksCompleted, milestonesReached, upcomingDeadlines, completionPercent, unsubscribeUrl });

  const { data, error } = await resend.emails.send({
    from: 'Stairway U <digest@stairwayu.com>',
    to: parentEmail,
    subject: `Weekly Update: ${studentName}'s College Journey`,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (error) throw error;
  return data;
}

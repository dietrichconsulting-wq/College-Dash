import { Resend } from 'resend';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function buildDigestHTML({ parentName, studentName, tasksCompleted, milestonesReached, upcomingDeadlines, completionPercent }) {
  const taskRows = tasksCompleted.length > 0
    ? tasksCompleted.map(t => `<li>${t.title} — completed ${formatDate(t.completedAt)}</li>`).join('')
    : '<li style="color:#888;">No tasks completed this week</li>';

  const milestoneRows = milestonesReached.length > 0
    ? milestonesReached.map(m => `<li>${m.milestoneKey.replace(/_/g, ' ')} — ${formatDate(m.reachedAt)}</li>`).join('')
    : '';

  const deadlineRows = upcomingDeadlines.length > 0
    ? upcomingDeadlines.map(t => `<li>${t.title} — due ${formatDate(t.dueDate)}</li>`).join('')
    : '<li style="color:#888;">No upcoming deadlines</li>';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
  <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 28px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 22px;">Stairway U</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Weekly Progress Digest</p>
  </div>

  <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin: 0 0 16px;">Hi ${parentName},</p>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6;">
      Here's what <strong>${studentName}</strong> has been up to this week.
      They're <strong>${completionPercent}%</strong> through their college journey.
    </p>

    <h3 style="font-size: 14px; color: #1e3a5f; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">
      Tasks Completed This Week
    </h3>
    <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
      ${taskRows}
    </ul>

    ${milestonesReached.length > 0 ? `
    <h3 style="font-size: 14px; color: #1e3a5f; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">
      Milestones Reached
    </h3>
    <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
      ${milestoneRows}
    </ul>
    ` : ''}

    <h3 style="font-size: 14px; color: #1e3a5f; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">
      Upcoming Deadlines
    </h3>
    <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
      ${deadlineRows}
    </ul>

    <div style="margin-top: 28px; text-align: center;">
      <a href="https://stairwayu.com" style="display: inline-block; background: #1e3a5f; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View Full Dashboard
      </a>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #9ca3af;">
    <p>Stairway U — Guiding students on the path to college.</p>
    <p>You're receiving this because your account is linked to ${studentName}'s Stairway U profile.</p>
  </div>
</body>
</html>`;
}

export async function sendWeeklyDigest({ parentEmail, parentName, studentName, tasksCompleted, milestonesReached, upcomingDeadlines, completionPercent }) {
  if (!resend) {
    console.log('[digest] RESEND_API_KEY not configured, skipping email to', parentEmail);
    return { skipped: true };
  }

  const html = buildDigestHTML({ parentName, studentName, tasksCompleted, milestonesReached, upcomingDeadlines, completionPercent });

  const { data, error } = await resend.emails.send({
    from: 'Stairway U <digest@stairwayu.com>',
    to: parentEmail,
    subject: `Weekly Update: ${studentName}'s College Journey`,
    html,
  });

  if (error) throw error;
  return data;
}

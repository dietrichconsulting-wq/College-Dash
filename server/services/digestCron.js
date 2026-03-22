import {
  getAllParentLinksWithEmails,
  getTasksCompletedSince,
  getMilestonesSince,
  getUpcomingDeadlines,
  getProgress,
  wasDigestSent,
  logDigestSent,
} from './supabase.js';
import { sendWeeklyDigest } from './email.js';

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // ISO week number
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export async function runWeeklyDigest() {
  const weekKey = getWeekKey();
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 7);

  console.log(`[digest] Running weekly digest for ${weekKey}`);

  const links = await getAllParentLinksWithEmails();
  let sent = 0;
  let skipped = 0;

  for (const link of links) {
    if (!link.parentEmail) {
      skipped++;
      continue;
    }

    // Check if already sent this week
    const alreadySent = await wasDigestSent(link.parentId, link.studentId, weekKey);
    if (alreadySent) {
      skipped++;
      continue;
    }

    try {
      const [tasksCompleted, milestonesReached, upcomingDeadlines, allMilestones] = await Promise.all([
        getTasksCompletedSince(link.studentId, sinceDate),
        getMilestonesSince(link.studentId, sinceDate),
        getUpcomingDeadlines(link.studentId, 5),
        getProgress(link.studentId),
      ]);

      const completionPercent = Math.round((allMilestones.length / 10) * 100);

      await sendWeeklyDigest({
        parentEmail: link.parentEmail,
        parentName: link.parentName,
        studentName: link.studentName,
        tasksCompleted,
        milestonesReached,
        upcomingDeadlines,
        completionPercent,
      });

      await logDigestSent(link.parentId, link.studentId, weekKey);
      sent++;
    } catch (err) {
      console.error(`[digest] Failed to send to ${link.parentEmail}:`, err.message);
    }
  }

  console.log(`[digest] Done: ${sent} sent, ${skipped} skipped`);
  return { sent, skipped, weekKey };
}

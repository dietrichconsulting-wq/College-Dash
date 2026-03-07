import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

let client = null;

export function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function buildSystemPrompt(profile) {
  return `You are a helpful college admissions advisor embedded in a student's college application dashboard. Your role is to help with portfolio recommendations and scholarship brainstorming.

Student Profile:
- GPA: ${profile.gpa || 'Not provided'}
- SAT Score: ${profile.sat || 'Not provided'}
- Proposed Major: ${profile.proposedMajor || 'Not provided'}
- Target Schools: ${profile.schools?.filter(s => s.name).map(s => s.name).join(', ') || 'Not provided'}

Guidelines:
- Give specific, actionable advice tailored to this student's profile
- Suggest scholarships that match their GPA, SAT, and intended major
- Recommend portfolio pieces relevant to their major and target schools
- Be encouraging but realistic
- Keep responses concise and organized
- Do NOT provide information about topics unrelated to college applications, portfolios, or scholarships`;
}

export async function chat(profile, messages) {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: buildSystemPrompt(profile),
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  return response.content[0].text;
}

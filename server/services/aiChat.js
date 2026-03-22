import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

let model = null;

export function isConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

function getModel() {
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

function buildSystemPrompt(profile) {
  return `You are a helpful college admissions advisor embedded in a student's college application dashboard. Your role is to help with portfolio recommendations and scholarship brainstorming.

Student Profile:
- GPA: ${profile.gpa || 'Not provided'}
- SAT Score: ${profile.sat || 'Not provided'}${profile.act ? `\n- ACT Score: ${profile.act}` : ''}
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
  const gemini = getModel();

  // Build Gemini-format conversation history
  const systemInstruction = buildSystemPrompt(profile);

  const chatSession = gemini.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    systemInstruction: { parts: [{ text: systemInstruction }] },
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chatSession.sendMessage(lastMessage.content);

  const text = result.response.text();
  if (!text || !text.trim()) {
    return "I wasn't able to generate a response. Please try rephrasing your question.";
  }
  return text;
}

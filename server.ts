/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const app = express();
app.use(express.json({ limit: '256kb' }));

function requireGemini(_req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!ai) {
    res.status(503).json({
      error: 'Gemini API not configured. Set GEMINI_API_KEY in .env.local.',
    });
    return;
  }
  next();
}

async function generateJson<T>(prompt: string): Promise<T> {
  if (!ai) throw new Error('Gemini not configured');

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text) as T;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    gemini: Boolean(ai),
    app: 'CyberCypher',
    version: '2.4.1',
  });
});

app.post('/api/generate-palette', requireGemini, async (req, res) => {
  try {
    const { mood = 'cyberpunk neon', exclude = [] } = req.body as {
      mood?: string;
      exclude?: string[];
    };

    const excludeNote =
      exclude.length > 0 ? ` Avoid these hex colors: ${exclude.join(', ')}.` : '';

    const result = await generateJson<{
      name: string;
      primary: string;
      secondary: string;
      accent: string;
      mood: string;
    }>(`You are a cyberpunk UI color designer. Create a cohesive neon palette for mood: "${mood}".${excludeNote}
Return JSON only with keys: name (UPPER_SNAKE theme name), primary, secondary, accent (all #RRGGBB hex), mood (one sentence).`);

    res.json(result);
  } catch (err) {
    console.error('generate-palette error:', err);
    res.status(500).json({ error: 'Failed to generate palette.' });
  }
});

app.post('/api/enhance-code', requireGemini, async (req, res) => {
  try {
    const { html, css, js, assetTitle, assetCategory } = req.body as {
      html: string;
      css: string;
      js: string;
      assetTitle?: string;
      assetCategory?: string;
    };

    const result = await generateJson<{
      html: string;
      css: string;
      js: string;
      summary: string;
      tips: string[];
    }>(`You are a senior frontend engineer specializing in cyberpunk UI components.
Enhance this ${assetCategory ?? 'component'} "${assetTitle ?? 'asset'}" export:
- Add concise, helpful comments (not excessive)
- Preserve all existing behavior and class names
- Suggest minor polish only where it improves readability

HTML:
${html}

CSS:
${css}

JS:
${js}

Return JSON with keys: html, css, js (enhanced code strings), summary (one sentence), tips (array of 2-3 short actionable suggestions).`);

    res.json(result);
  } catch (err) {
    console.error('enhance-code error:', err);
    res.status(500).json({ error: 'Failed to enhance code.' });
  }
});

app.post('/api/suggest-params', requireGemini, async (req, res) => {
  try {
    const { assetTitle, assetDescription, controls, currentParams, paletteName } = req.body as {
      assetTitle: string;
      assetDescription: string;
      controls: { id: string; label: string; type: string }[];
      currentParams: Record<string, unknown>;
      paletteName?: string;
    };

    const result = await generateJson<{
      suggestions: Record<string, string | number>;
      rationale: string;
    }>(`Suggest creative sandbox parameter values for a cyberpunk UI component.
Asset: "${assetTitle}" — ${assetDescription}
Active palette: ${paletteName ?? 'Synthwave'}
Controls: ${JSON.stringify(controls)}
Current values: ${JSON.stringify(currentParams)}

Return JSON with keys:
- suggestions: object mapping control id to suggested value (same types as current)
- rationale: one sentence explaining the creative direction`);

    res.json(result);
  } catch (err) {
    console.error('suggest-params error:', err);
    res.status(500).json({ error: 'Failed to generate suggestions.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CyberCypher server listening on http://0.0.0.0:${PORT}`);
  console.log(`Gemini API: ${ai ? 'configured' : 'NOT configured'}`);
});

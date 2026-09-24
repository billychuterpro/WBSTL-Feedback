import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '30mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extract Executive PDF Monthly Report using Gemini
app.post('/api/extract-report-pdf', async (req, res) => {
  try {
    const { base64Data, rawText, mimeType = 'application/pdf', monthHint } = req.body;

    if (!base64Data && !rawText) {
      return res.status(400).json({ error: 'Missing base64Data or rawText in request payload' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on server.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetMonth = monthHint || 'current month';
    const textContextSection = rawText && rawText.trim().length > 0
      ? `\n\nEXTRACTED DOCUMENT TEXT STREAM FOR REFERENCE:\n"""\n${rawText.slice(0, 15000)}\n"""\n`
      : '';

    const prompt = `You are an expert data extractor for catering, visitor operations, and mystery shopping executive reports.
Analyze this report document slide (PDF or image).
TARGET REPORT MONTH: ${targetMonth}.
${textContextSection}
Accurately extract all exact metrics, feedback volume numbers, staff sentiment totals, mystery shopping scores, venue satisfaction percentages, staff ratings, catering VFM, key comments, agreed operational actions, and historical YoY trend into clean structured JSON.

CRITICAL EXTRACTION RULES:
1. "monthYear" MUST be set to "${targetMonth}" unless the document header clearly indicates a different active report month. Do NOT confuse historical comparison text (e.g. "vs July", "July LY", "vs 32 LY") with the active report month.
2. FEEDBACK VOLUME: Look at the top summary metric cards. The volume card is titled 'Volume', 'Feedback Volume', or 'Total Volume' (e.g. 78, subtext 'vs 32 LY' or 'vs 35 LY'). Extract this integer into "feedbackVolume" and its comparison text into "feedbackVolumeVsLY".
3. STAFF SENTIMENT: Extract:
   - Staff Complaints (e.g. 2, "3 received LY" or "-33% vs LY")
   - Staff Compliments (e.g. 14, "9 received LY" or "+55% vs LY")
   - Staff Thank Yous (e.g. 41, "292% increase in staff positive sentiment VS LY" or "+292% vs LY")
   along with their exact comparison strings.
4. MYSTERY SHOPPING: Extract:
   - Visit 1 score (e.g. 86) and "mysteryShopVisit1VsLY" (e.g. "-10% vs LY")
   - Visit 2 score (e.g. 95) and "mysteryShopVisit2VsLY" (e.g. "+7 vs LY" or "+7% vs LY")
   - Monthly Avg score (e.g. 91) and "mysteryShopMonthlyAvgVsLY" (e.g. "-1% vs LY")
5. VENUE SATISFACTION: Extract satisfaction score percentages and comparisons for all venues listed on the document (Food Hall, Chocolate Frog, Dragon RC, Backlot Cafe, Butterbeer Bar, The Hogwarts Table, Afternoon Tea, etc.). Scores must be integers 0-100.
6. RATINGS & VALUE FOR MONEY: Extract Staff Rating (e.g. 90, "+4% vs LY") and Catering VFM (e.g. 43, "-2% vs LY").
7. KEY COMMENTS & ACTIONS: Extract ALL bullet points or paragraphs under "Key Comments", "Feedback Themes", or "Visitor Comments" into "keyComments" (array of strings), and all items under "Agreed Operational Actions", "Operational Actions", or "Actions" into "actions" (array of strings).
8. YOY TREND: If a month-by-month historical comparison chart/table is shown (Jan through Dec for 2025 vs 2026), extract each month's scores into "yoyTrend".

Return ONLY a valid JSON object matching this schema:
{
  "monthYear": "${targetMonth}",
  "feedbackVolume": number,
  "feedbackVolumeVsLY": "string (e.g. vs 32 LY)",
  "staffComplaints": number,
  "staffComplaintsVsLY": "string (e.g. 3 received LY)",
  "staffCompliments": number,
  "staffComplimentsVsLY": "string (e.g. 9 received LY)",
  "staffThankYous": number,
  "staffThankYousVsLY": "string (e.g. 292% increase in staff positive sentiment VS LY)",
  "mysteryShopVisit1": number,
  "mysteryShopVisit1VsLY": "string (e.g. -10% vs LY)",
  "mysteryShopVisit2": number,
  "mysteryShopVisit2VsLY": "string (e.g. +7 vs LY)",
  "mysteryShopMonthlyAvg": number,
  "mysteryShopMonthlyAvgVsLY": "string (e.g. -1% vs LY)",
  "venueSatisfaction": [
    { "venue": "Food Hall", "score": 86, "vsLY": "+5% vs LY" },
    { "venue": "Chocolate Frog", "score": 85, "vsLY": "+7% vs LY" },
    { "venue": "Dragon RC", "score": 78, "vsLY": "-1% vs LY" },
    { "venue": "Backlot Cafe", "score": 79, "vsLY": "+2% vs LY" },
    { "venue": "Butterbeer Bar", "score": 84, "vsLY": "+6% vs LY" },
    { "venue": "The Hogwarts Table", "score": 91, "vsLY": "n/a vs LY" }
  ],
  "staffRating": number,
  "staffRatingVsLY": "string (e.g. +4% vs LY)",
  "cateringVFM": number,
  "cateringVFMVsLY": "string (e.g. -2% vs LY)",
  "keyComments": [
    "exact text of comment 1...",
    "exact text of comment 2..."
  ],
  "actions": [
    "exact text of action 1...",
    "exact text of action 2..."
  ],
  "yoyTrend": [
    { "month": "Jan", "score2025": 89, "score2026": 92 },
    { "month": "Feb", "score2025": 88, "score2026": 91 },
    { "month": "March", "score2025": 93, "score2026": 94 },
    { "month": "April", "score2025": 92, "score2026": 93 },
    { "month": "May", "score2025": 93, "score2026": 91 },
    { "month": "June", "score2025": 94, "score2026": 92 },
    { "month": "July", "score2025": 92, "score2026": 91 },
    { "month": "August", "score2025": 91, "score2026": 93 }
  ]
}

Ensure all score numbers are pure integers without '%' symbols.`;

    const cleanBase64 = base64Data ? base64Data.replace(/^data:[^;]+;base64,/, '') : '';
    
    // Determine effective MIME type
    let effectiveMimeType = mimeType;
    if (cleanBase64.startsWith('JVBERi0') || (mimeType && mimeType.includes('pdf'))) {
      effectiveMimeType = 'application/pdf';
    } else if (mimeType && mimeType.includes('jpeg')) {
      effectiveMimeType = 'image/jpeg';
    } else if (mimeType && mimeType.includes('webp')) {
      effectiveMimeType = 'image/webp';
    } else {
      effectiveMimeType = 'image/png';
    }

    const parts: any[] = [];
    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType: effectiveMimeType,
          data: cleanBase64,
        },
      });
    }
    parts.push({
      text: prompt,
    });

    // Standard resilient models in priority order per gemini-api guidelines
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
    ];
    let response: any = null;
    let successfulModel = '';

    for (const model of candidateModels) {
      // Retry per model with exponential backoff if 503 (high demand) or 429 occurs
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts,
              },
            ],
            config: {
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) {
            successfulModel = model;
            break;
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isHighDemandOrThrottled =
            errMsg.includes('503') ||
            errMsg.includes('429') ||
            errMsg.includes('high demand') ||
            errMsg.includes('overloaded') ||
            errMsg.includes('Resource has been exhausted');

          console.warn(`Extraction attempt ${attempt} with model ${model} notice:`, errMsg);
          
          if (attempt < 3 && isHighDemandOrThrottled) {
            // Exponential backoff with jitter
            const delay = Math.min(2500, Math.pow(2, attempt) * 400 + Math.floor(Math.random() * 200));
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else if (!isHighDemandOrThrottled) {
            // If it's a non-retryable error (e.g. model not found), switch to next model immediately
            break;
          }
        }
      }
      if (response && response.text) {
        break;
      }
    }

    if (!response || !response.text) {
      return res.json({
        success: false,
        unavailable: true,
        message: 'AI service temporarily in high demand. Client document parser will extract all report data.',
      });
    }

    const text = (response.text || '').trim();
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(text);
    } catch (parseErr) {
      // Strip markdown backticks if present
      const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (secondErr) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          parsedData = JSON.parse(match[0]);
        } else {
          return res.json({
            success: false,
            unavailable: true,
            message: 'Model response could not be structured into JSON, falling back to document parser.',
          });
        }
      }
    }

    // Normalization & Fallbacks for Volume & Card Figures
    if (parsedData.feedbackVolume === undefined || parsedData.feedbackVolume === null || Number(parsedData.feedbackVolume) === 0) {
      const altVol = parsedData.volume ?? parsedData.totalVolume ?? parsedData.feedback_volume ?? parsedData.volumeOfFeedback ?? parsedData.totalFeedback;
      if (altVol !== undefined && altVol !== null && !isNaN(Number(altVol)) && Number(altVol) > 0) {
        parsedData.feedbackVolume = Number(altVol);
      }
    } else {
      parsedData.feedbackVolume = Number(parsedData.feedbackVolume);
    }

    if (!parsedData.feedbackVolumeVsLY) {
      parsedData.feedbackVolumeVsLY = parsedData.volumeVsLY || parsedData.feedback_volume_vs_ly || '';
    }

    if (!parsedData.monthYear) {
      parsedData.monthYear = monthHint || 'August 2026';
    }
    parsedData.id = parsedData.monthYear;

    return res.json({
      success: true,
      extractedWith: successfulModel,
      report: parsedData,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      unavailable: true,
      message: error?.message || 'Document processing fallback activated.',
    });
  }
});

// Vite middleware in development vs Static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();

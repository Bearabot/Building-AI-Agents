import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini AI Insights
  app.post('/api/ai-insights', async (req, res) => {
    try {
      const { prompt, symbol } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          text: `[AI Insights Mode] Analyzing market data for ${symbol || 'selected market'}. Technical indicators show solid support levels. (Tip: Configure GEMINI_API_KEY in secrets for live AI model analysis)`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are an expert Wall Street financial analyst and quantitative strategist. Provide concise, clear, data-driven market insights and technical analysis in clear bullet points.`;

      const userPrompt = symbol
        ? `Provide technical analysis and market commentary for ticker symbol ${symbol}. Prompt: ${prompt}`
        : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({
        text: 'Unable to process AI analysis at this moment. Please check network connection or try again later.'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite Dev Server / Static Production Server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

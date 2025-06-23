import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

const headers = {
  Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
};

async function analyzeText(text: string) {
  try {
    console.log("🤖 Starting Hugging Face API calls...");
    
    // 1. Summarize
    console.log("📝 Calling BART summarization model...");
    const summaryPromise = axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text,
        parameters: {
            max_length: 150,
            min_length: 30,
            do_sample: false,
        }
      },
      { headers }
    );

    // 2. Named Entity Recognition (NER) for Medicines
    console.log("💊 Calling biomedical NER model...");
    const nerPromise = axios.post(
      'https://api-inference.huggingface.co/models/d4data/biomedical-ner-all',
      { inputs: text },
      { headers }
    );

    const [summaryRes, nerRes] = await Promise.all([summaryPromise, nerPromise]);
    
    console.log("📊 Summary response:", summaryRes.data);
    console.log("💊 NER response:", nerRes.data);
    
    // Extract medicines from NER output
    const meds = nerRes.data
      .flat() // The model can return an array of arrays
      .filter((item: any) => item.entity_group === 'DRUG' || item.entity_group === 'CHEMICAL')
      .map((item: any) => item.word.replace(/##/g, ''));

    console.log("💊 Extracted medicines:", meds);

    const uniqueMeds = [...new Set(meds)];

    const result = {
      summary: summaryRes.data[0].summary_text,
      medicines: uniqueMeds,
      warningCount: (text.match(/warning|danger|urgent|alert|low|high|abnormal/gi) || []).length,
      charCount: text.length,
    };
    
    console.log("✅ Final result:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Hugging Face API Error:", error.response ? error.response.data : error.message);
    throw new Error('Failed to analyze text with Hugging Face API.');
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 API Route: /api/analyzeReport called");
    
    const { text } = await req.json();
    console.log("📝 TEXT received:", text ? text.substring(0, 100) + "..." : "NO TEXT");
    
    if (!text) {
      console.log("❌ No text provided");
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    }

    console.log("🔍 Starting analysis with Hugging Face...");
    const result = await analyzeText(text);
    console.log("✅ Analysis result:", result);
    
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ API Route Error:", err.message);
    return NextResponse.json({ error: 'Failed to analyze medical report.' }, { status: 500 });
  }
} 
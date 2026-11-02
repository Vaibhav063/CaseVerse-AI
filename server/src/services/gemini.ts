import { GoogleGenAI } from '@google/genai';
import { GeneratedMystery, validateMystery } from '@caseverse/shared';
import { env } from '../config/env';

const prompt = (input:any,repairNote='') => `Create a complete, fair-play fictional mystery from this scenario: ${input.scenario}\nPreferences: genre=${input.genre}, difficulty=${input.difficulty}, length=${input.caseLength}. Return ONLY JSON matching the supplied structure. Create 3-6 suspects, exactly one culprit, a coherent timeline, at least two meaningful clues, an explainable red herring, exactly 3 progressive hints. Evidence count: short 4-6, standard 5-10, extended 8-12. Include valid stable IDs and evidence-linked solution reasoning. Entirely fictional. Do not disclose culprit in public fields. Format evidence content by kind: chat uses participants/messages; document body; witness_statement witnessName/statement; cctv_log cameraId/entries; photo visualDescription; timeline events; other body. Include title, genre, difficulty, setting, synopsis, incident(summary/occurredAt/location), objective, suspects(id/name/role/relationshipToIncident/description/motive/statement/alibi), evidence(id/type/title/summary/source/relevantTime/content/relatedSuspectIds/importance), timeline(id/timestamp/description/relatedEvidenceIds/relatedSuspectIds), hints(order/text), solution(culpritSuspectId/motive/method/opportunity/summary/reasoningSteps/redHerringExplanation). ${repairNote?`Repair the prior response to address these validation errors: ${repairNote}`:''}`;
export async function generateMystery(input:any):Promise<GeneratedMystery>{
 if(!env.GEMINI_API_KEY) throw new Error('GENERATION_NOT_CONFIGURED');
 const ai=new GoogleGenAI({apiKey:env.GEMINI_API_KEY});
 let repairNote='';
 for(let attempt=0;attempt<2;attempt++){
  const response=await ai.models.generateContent({model:env.GEMINI_MODEL,contents:prompt(input,repairNote),config:{responseMimeType:'application/json',temperature:0.75,maxOutputTokens:9000}});
  try { const raw=JSON.parse(response.text || '{}'); const mystery=validateMystery(raw,input.caseLength); if(mystery.genre!==input.genre && input.genre!=='other') throw new Error('Generated genre does not match request'); return mystery; }
  catch(err){ if(attempt===1) throw new Error('INVALID_GENERATED_CASE'); repairNote=err instanceof Error?err.message:'Invalid structured output'; }
 }
 throw new Error('INVALID_GENERATED_CASE');
}

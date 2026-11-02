import { z } from 'zod';

export const genres = ['murder','theft','disappearance','espionage','sabotage','other'] as const;
export const difficulties = ['easy','medium','hard'] as const;
export const caseLengths = ['short','standard','extended'] as const;
export const evidenceTypes = ['chat','document','witness_statement','cctv_log','photo','timeline','other'] as const;
export const scenarioSchema = z.object({ scenario: z.string().trim().min(50).max(2000), genre: z.enum(genres).default('other'), difficulty: z.enum(difficulties).default('medium'), caseLength: z.enum(caseLengths).default('standard') });

const suspectSchema = z.object({ id:z.string(), name:z.string(), role:z.string(), relationshipToIncident:z.string(), description:z.string(), motive:z.string(), statement:z.string(), alibi:z.string() });
const evidenceContentSchema = z.discriminatedUnion('kind',[
  z.object({kind:z.literal('chat'),participants:z.array(z.string()),messages:z.array(z.object({sender:z.string(),message:z.string(),timestamp:z.string()}))}),
  z.object({kind:z.literal('document'),body:z.string(),documentDate:z.string().optional()}),
  z.object({kind:z.literal('witness_statement'),witnessName:z.string(),statement:z.string(),recordedAt:z.string().optional()}),
  z.object({kind:z.literal('cctv_log'),cameraId:z.string(),entries:z.array(z.object({timestamp:z.string(),description:z.string()}))}),
  z.object({kind:z.literal('photo'),visualDescription:z.string(),capturedAt:z.string().optional(),location:z.string().optional()}),
  z.object({kind:z.literal('timeline'),events:z.array(z.object({timestamp:z.string(),description:z.string()}))}),
  z.object({kind:z.literal('other'),body:z.string()})
]);
const evidenceSchema = z.object({ id:z.string(), type:z.enum(evidenceTypes), title:z.string(), summary:z.string(), source:z.string(), createdAt:z.string().optional(), relevantTime:z.string().optional(), content:evidenceContentSchema, relatedSuspectIds:z.array(z.string()), importance:z.enum(['key','supporting','red_herring']) });
const timelineSchema = z.object({ id:z.string(), timestamp:z.string(), description:z.string(), relatedEvidenceIds:z.array(z.string()), relatedSuspectIds:z.array(z.string()) });
const solutionSchema = z.object({ culpritSuspectId:z.string(), motive:z.string(), method:z.string(), opportunity:z.string(), summary:z.string(), reasoningSteps:z.array(z.object({ explanation:z.string(), supportingEvidenceIds:z.array(z.string()), eliminatesSuspectIds:z.array(z.string()).optional() })).min(1), redHerringExplanation:z.string() });
export const generatedMysterySchema = z.object({ title:z.string(), genre:z.enum(genres), difficulty:z.enum(difficulties), setting:z.string(), synopsis:z.string(), incident:z.object({summary:z.string(),occurredAt:z.string(),location:z.string()}), objective:z.string(), suspects:z.array(suspectSchema).min(3).max(6), evidence:z.array(evidenceSchema).min(4).max(12), timeline:z.array(timelineSchema).min(1), hints:z.array(z.object({order:z.union([z.literal(1),z.literal(2),z.literal(3)]),text:z.string()})).length(3), solution:solutionSchema });
export type GeneratedMystery = z.infer<typeof generatedMysterySchema>;
export type PublicMystery = Omit<GeneratedMystery,'solution'> & { id:string; status:string; createdAt:string; solution?:GeneratedMystery['solution']; outcome?:string; accusedSuspectId?:string };

export function validateMystery(value: unknown, requestedLength: typeof caseLengths[number]): GeneratedMystery {
  const parsed = generatedMysterySchema.parse(value);
  const suspectIds = parsed.suspects.map(s => s.id), evidenceIds = parsed.evidence.map(e => e.id);
  if (new Set(suspectIds).size !== suspectIds.length || new Set(evidenceIds).size !== evidenceIds.length) throw new Error('Duplicate suspect or evidence IDs');
  if (!suspectIds.includes(parsed.solution.culpritSuspectId)) throw new Error('Culprit must reference a suspect');
  if (parsed.hints.map(h => h.order).sort().join(',') !== '1,2,3') throw new Error('Hints must be ordered 1 through 3');
  if (parsed.suspects.some(s => !s.id || !s.name.trim())) throw new Error('Suspects need stable IDs and names');
  for (const evidence of parsed.evidence) {
    if (evidence.relatedSuspectIds.some(id => !suspectIds.includes(id))) throw new Error('Evidence references an unknown suspect');
    if (evidence.content.kind !== evidence.type) throw new Error('Evidence type must match its content kind');
  }
  if (parsed.evidence.filter(e => e.importance === 'key').length < 2) throw new Error('At least two meaningful key clues are required');
  if (!parsed.evidence.some(e => e.importance === 'red_herring')) throw new Error('An explainable red herring is required');
  const allowed = requestedLength === 'short' ? [4,6] : requestedLength === 'extended' ? [8,12] : [5,10];
  if (parsed.evidence.length < allowed[0] || parsed.evidence.length > allowed[1]) throw new Error('Evidence count does not match case length');
  for (const step of parsed.solution.reasoningSteps) if (step.supportingEvidenceIds.some(id => !evidenceIds.includes(id))) throw new Error('Solution references unknown evidence');
  for (const event of parsed.timeline) if (event.relatedEvidenceIds.some(id => !evidenceIds.includes(id)) || event.relatedSuspectIds.some(id => !suspectIds.includes(id))) throw new Error('Timeline references unknown case item');
  return parsed;
}

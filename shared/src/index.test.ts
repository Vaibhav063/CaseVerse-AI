import { describe, expect, it } from 'vitest';
import { scenarioSchema, validateMystery } from './index';

const mystery = {
  title:'The Last Bell',genre:'theft',difficulty:'medium',setting:'A fictional clock museum',synopsis:'A rare bell vanished during a private viewing.',
  incident:{summary:'The bell disappeared during a blackout.',occurredAt:'9:00 PM',location:'The bell gallery'},objective:'Identify who took the bell.',
  suspects:[1,2,3].map(n=>({id:`suspect_0${n}`,name:`Suspect ${n}`,role:'Guest',relationshipToIncident:'Visitor',description:'A visitor to the museum.',motive:'Wanted the artifact.',statement:'I was elsewhere.',alibi:'A guest saw me.'})),
  evidence:[1,2,3,4,5].map(n=>({id:`evidence_0${n}`,type:'document',title:`Record ${n}`,summary:'A museum record.',source:'Museum archive',content:{kind:'document',body:'A fictional record.'},relatedSuspectIds:['suspect_01'],importance:n<3?'key':n===5?'red_herring':'supporting'})),
  timeline:[{id:'event_01',timestamp:'8:00 PM',description:'The viewing began.',relatedEvidenceIds:['evidence_01'],relatedSuspectIds:['suspect_01']}],
  hints:[{order:1,text:'Look at the records.'},{order:2,text:'Compare the records.'},{order:3,text:'Check the time stamps.'}],
  solution:{culpritSuspectId:'suspect_01',motive:'Wanted the bell.',method:'Removed it in a case.',opportunity:'Was alone nearby.',summary:'The records reveal the theft.',reasoningSteps:[{explanation:'The record conflicts with the statement.',supportingEvidenceIds:['evidence_01']}],redHerringExplanation:'The visitor record was old.'}
};

describe('CaseVerse shared validation',()=>{
  it('accepts scenario prompts within the specified character range',()=>{
    expect(scenarioSchema.safeParse({scenario:'A'.repeat(50)}).success).toBe(true);
    expect(scenarioSchema.safeParse({scenario:'A'.repeat(49)}).success).toBe(false);
  });
  it('accepts a coherent standard mystery shape',()=>{
    expect(validateMystery(mystery,'standard').solution.culpritSuspectId).toBe('suspect_01');
  });
  it('rejects a culprit ID that is not one of the suspects',()=>{
    expect(()=>validateMystery({...mystery,solution:{...mystery.solution,culpritSuspectId:'suspect_99'}},'standard')).toThrow('Culprit must reference a suspect');
  });
  it('rejects evidence counts outside the requested case length',()=>{
    expect(()=>validateMystery({...mystery,evidence:mystery.evidence.slice(0,4)},'standard')).toThrow('Evidence count does not match case length');
  });
});

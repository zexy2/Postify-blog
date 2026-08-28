import { describe, expect, it } from 'vitest';
import { getPublishReadiness } from './publishReadiness';
const evidence={outcome:'A concrete useful outcome',testedAt:'2026-08-28',environment:'Node 22',verificationSteps:'Run the check and confirm output'};
describe('getPublishReadiness', () => {
 it('requires a concrete outcome for publish readiness',()=>{expect(getPublishReadiness({title:'Useful title',body:'x'.repeat(200)}).ready).toBe(false)});
 it('recognizes structured evidence and rich structure',()=>{const r=getPublishReadiness({title:'Practical guide',body:'x'.repeat(200),bodyHtml:'<h2>Steps</h2>',...evidence});expect(r.ready).toBe(true);expect(r.score).toBe(100)});
 it('keeps environment and verification visible as evidence checks',()=>{const r=getPublishReadiness({title:'Practical guide',body:'x'.repeat(200),outcome:evidence.outcome});expect(r.checks.find(x=>x.id==='environment').passed).toBe(false);expect(r.checks.find(x=>x.id==='verification').passed).toBe(false)});
});

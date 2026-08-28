import { describe,it,expect } from 'vitest';
import { getDomainCredibility } from './domainCredibility';
describe('domain credibility',()=>{
 it('refuses to invent a score from sparse data',()=>expect(getDomainCredibility([{category:'React',evidence_status:'author-tested'}])[0].score).toBeNull());
 it('returns a bounded score only after evidence thresholds',()=>{const posts=Array.from({length:3},(_,i)=>({category:'React',evidence_status:'author-tested',summary:{confirmation_count:i===0?5:0,worked_count:i===0?4:0}}));const result=getDomainCredibility(posts)[0];expect(result.enoughEvidence).toBe(true);expect(result.score).toBeGreaterThan(0);expect(result.score).toBeLessThanOrEqual(100);});
});

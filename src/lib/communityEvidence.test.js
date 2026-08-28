import { describe,it,expect } from 'vitest';
import { summarizeCommunityEvidence } from './communityEvidence';
describe('community evidence',()=>{
 it('does not show a percentage for tiny samples',()=>expect(summarizeCommunityEvidence({confirmation_count:2,worked_count:2}).successRate).toBeNull());
 it('shows an integer rate from three independent confirmations',()=>expect(summarizeCommunityEvidence({confirmation_count:4,worked_count:3,failed_count:1}).successRate).toBe(75));
});

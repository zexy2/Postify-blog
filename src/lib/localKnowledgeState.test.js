import { describe,it,expect } from 'vitest';
import { addKnowledgeGap,getLocalFeedback,getShelfState,setLocalFeedback,setShelfState } from './localKnowledgeState';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
describe('local knowledge state',()=>{
 it('stores device-local feedback without aggregate claims',()=>{const s=memory();setLocalFeedback(s,'p1',{result:'worked',environment:'Node 22'});expect(getLocalFeedback(s,'p1').result).toBe('worked')});
 it('stores an action shelf state',()=>{const s=memory();setShelfState(s,'p1','try');expect(getShelfState(s,'p1')).toBe('try')});
 it('deduplicates local knowledge gaps',()=>{const s=memory();addKnowledgeGap(s,'React cache');expect(addKnowledgeGap(s,'react cache')).toHaveLength(1)});
});

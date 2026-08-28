import { describe,it,expect } from 'vitest';
import {
  addKnowledgeGap,
  clearRunbookProgress,
  getLocalFeedback,
  getRunbookProgress,
  getShelfState,
  setLocalFeedback,
  setRunbookProgress,
  setShelfState,
} from './localKnowledgeState';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
describe('local knowledge state',()=>{
 it('stores device-local feedback without aggregate claims',()=>{const s=memory();setLocalFeedback(s,'p1',{result:'worked',environment:'Node 22'});expect(getLocalFeedback(s,'p1').result).toBe('worked')});
 it('stores an action shelf state',()=>{const s=memory();setShelfState(s,'p1','try');expect(getShelfState(s,'p1')).toBe('try')});
 it('deduplicates local knowledge gaps',()=>{const s=memory();addKnowledgeGap(s,'React cache');expect(addKnowledgeGap(s,'react cache')).toHaveLength(1)});
 it('stores runbook progress for the current evidence version',()=>{const s=memory();setRunbookProgress(s,'p1',2,[1,0,1]);expect(getRunbookProgress(s,'p1',2).completed).toEqual([0,1])});
 it('does not carry completed checks into a new evidence version',()=>{const s=memory();setRunbookProgress(s,'p1',1,[0,1]);expect(getRunbookProgress(s,'p1',2)).toMatchObject({version:2,completed:[]})});
 it('can clear local runbook progress',()=>{const s=memory();setRunbookProgress(s,'p1',1,[0]);clearRunbookProgress(s,'p1');expect(getRunbookProgress(s,'p1',1).completed).toEqual([])});
});

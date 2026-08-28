import {describe,it,expect} from 'vitest';import{sortKnowledge}from'./knowledgeRanking';
const now=new Date('2026-08-28');
describe('knowledge ranking',()=>{it('puts current tested evidence before newer unverified content',()=>{const ranked=sortKnowledge([{id:'new',publishedAt:'2026-08-28',evidence:{}},{id:'tested',publishedAt:'2026-01-01',evidence:{level:'author-tested',testedAt:'2026-08-20'}}],{now});expect(ranked[0].id).toBe('tested')});});

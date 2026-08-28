import { getKnowledgeEvidence } from './knowledgeEvidence';
import { summarizeCommunityEvidence } from './communityEvidence';

const levelWeight={ 'postify-verified':4, 'author-tested':2, unverified:0 };
const freshnessWeight={ current:3, aging:1, stale:-3, unknown:-1 };
export function getKnowledgeRank(post, now=new Date()){
  const evidence=getKnowledgeEvidence(post,now);
  const community=summarizeCommunityEvidence(post.evidenceSummary||{});
  return (levelWeight[evidence.level]||0)*10 + (freshnessWeight[evidence.freshness]||0)*5 + Math.min(10,community.worked) - Math.min(10,community.failed*2) + Math.min(5,community.environments);
}
export function sortKnowledge(posts,{mode='evidence',now=new Date()}={}){
  const copy=[...posts];
  if(mode==='latest') return copy.sort((a,b)=>new Date(b.publishedAt||b.createdAt||0)-new Date(a.publishedAt||a.createdAt||0));
  return copy.sort((a,b)=>getKnowledgeRank(b,now)-getKnowledgeRank(a,now) || new Date(b.publishedAt||0)-new Date(a.publishedAt||0));
}

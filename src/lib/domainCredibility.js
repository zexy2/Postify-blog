import { summarizeCommunityEvidence } from './communityEvidence';
export function getDomainCredibility(posts = []) {
  const grouped = new Map();
  for (const post of posts) {
    const domain = post.category || 'General';
    const current = grouped.get(domain) || { domain, posts: 0, authorTested: 0, confirmations: 0, worked: 0 };
    current.posts += 1;
    if (post.evidence_status === 'author-tested' || post.evidence_status === 'postify-verified') current.authorTested += 1;
    const summary = summarizeCommunityEvidence(post.summary || {});
    current.confirmations += summary.total;
    current.worked += summary.worked;
    grouped.set(domain, current);
  }
  return [...grouped.values()].map((item) => {
    const enough = item.authorTested >= 3 && item.confirmations >= 5;
    const success = item.confirmations ? item.worked / item.confirmations : 0;
    const score = enough ? Math.min(100, Math.round(45 + Math.min(25, item.authorTested * 4) + Math.min(30, success * 30))) : null;
    return { ...item, score, enoughEvidence: enough };
  }).sort((a,b)=>(b.score ?? -1)-(a.score ?? -1));
}

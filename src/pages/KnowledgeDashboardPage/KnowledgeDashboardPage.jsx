import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiCheckCircle, FiEdit3, FiRefreshCw } from 'react-icons/fi';
import { useAuthorDashboard, useReverifyPost } from '../../hooks/useKnowledge';
import { getKnowledgeEvidence } from '../../lib/knowledgeEvidence';
import { summarizeCommunityEvidence } from '../../lib/communityEvidence';
import { getDomainCredibility } from '../../lib/domainCredibility';
import styles from './KnowledgeDashboardPage.module.css';

const asPost=(row)=>({evidence:{level:row.evidence_status,testedAt:row.tested_at,staleAfterDays:row.stale_after_days,environment:row.environment||[],verificationSteps:row.verification_steps||[]}});
export default function KnowledgeDashboardPage(){
 const {i18n}=useTranslation();const en=i18n.language?.startsWith('en');
 const dashboard=useAuthorDashboard();const reverify=useReverifyPost();const data=dashboard.data||{posts:[],gaps:[]};
 const credibility=getDomainCredibility(data.posts);
 if(dashboard.isLoading)return <div className={`container ${styles.status}`}>{en?'Loading knowledge health…':'Bilgi sağlığı yükleniyor…'}</div>;
 return <div className={`container ${styles.page}`}>
  <header className={styles.header}><span>{en?'Author knowledge health':'Yazar bilgi sağlığı'}</span><h1>{en?'Keep useful knowledge current.':'İşe yarayan bilgiyi güncel tut.'}</h1><p>{en?'Re-verify old guidance, inspect real-world evidence, and write where readers are asking for help.':'Eski rehberleri yeniden doğrula, gerçek kullanım kanıtını izle ve okuyucuların çözüm aradığı yerlere yaz.'}</p></header>
  <section className={styles.section}><div className={styles.sectionTitle}><h2>{en?'Re-verification queue':'Yeniden doğrulama kuyruğu'}</h2><span>{data.posts.length}</span></div><div className={styles.queue}>{data.posts.length===0?<p>{en?'No authored knowledge yet.':'Henüz yazdığın bilgi yok.'}</p>:data.posts.map((post)=>{const evidence=getKnowledgeEvidence(asPost(post));const summary=summarizeCommunityEvidence(post.summary||{});return <article key={post.id} data-freshness={evidence.freshness} className={styles.queueItem}><div><span className={styles.state}>{evidence.freshness==='stale'?<FiAlertTriangle/>:<FiCheckCircle/>}{evidence.freshness}</span><h3><Link to={`/posts/${post.slug||post.id}`}>{post.title}</Link></h3><p>{post.environment?.join(' · ')|| (en?'No test environment':'Test ortamı yok')}</p><small>{summary.total?`${summary.total} ${en?'community confirmations':'topluluk doğrulaması'}`:(en?'No community confirmations':'Topluluk doğrulaması yok')}</small></div><div className={styles.actions}><Link to={`/posts/${post.id}/edit`}><FiEdit3/>{en?'Edit evidence':'Kanıtı düzenle'}</Link><button type="button" disabled={reverify.isPending||!post.environment?.length||!post.verification_steps?.length} onClick={()=>reverify.mutate({postId:post.id,reason:'Author re-verified current environment and checks'})}><FiRefreshCw/>{en?'Re-verify now':'Şimdi yeniden doğrula'}</button></div></article>})}</div></section>
  <section className={styles.section}><div className={styles.sectionTitle}><h2>{en?'Domain credibility':'Alan güvenilirliği'}</h2></div><div className={styles.credibility}>{credibility.length===0?<p>—</p>:credibility.map((item)=><div key={item.domain}><strong>{item.domain}</strong>{item.score===null?<span>{en?'Not enough evidence yet':'Henüz yeterli kanıt yok'}</span>:<b>{item.score}/100</b>}<small>{item.authorTested} {en?'tested posts':'test edilmiş içerik'} · {item.confirmations} {en?'confirmations':'doğrulama'}</small></div>)}</div></section>
  <section className={styles.section}><div className={styles.sectionTitle}><h2>{en?'Knowledge gaps':'Bilgi boşlukları'}</h2><span>{data.gaps.length}</span></div><div className={styles.gaps}>{data.gaps.map((gap)=><div key={gap.id}><strong>{gap.display_query}</strong><span>{gap.request_count} {en?'people need this':'kişi bunu arıyor'}</span></div>)}</div></section>
 </div>;
}

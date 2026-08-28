import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalFeedback, getShelfState, setLocalFeedback, setShelfState } from '../lib/localKnowledgeState';

export default function LocalEvidenceActions({ post }) {
 const { i18n }=useTranslation(); const en=i18n.language?.startsWith('en');
 const storage=typeof window==='undefined'?null:window.localStorage;
 const [feedback,setFeedback]=useState(()=>storage?getLocalFeedback(storage,post.id):null);
 const [shelf,setShelf]=useState(()=>storage?getShelfState(storage,post.id):null);
 const record=(result)=>{const environment=window.prompt(en?'Optional: what environment/version did you use?':'İsteğe bağlı: hangi ortam/sürümde denedin?','')||'';setFeedback(setLocalFeedback(storage,post.id,{result,environment}));};
 return <section className="local-evidence-actions" aria-label={en?'Your local evidence':'Yerel kanıtın'}>
   <div><span>{en?'Did this work for you?':'Sende çalıştı mı?'}</span><small>{en?'Stored only on this device in V1. It is not a community count.':'V1’de yalnızca bu cihazda saklanır; topluluk sayısı değildir.'}</small></div>
   <div className="local-evidence-actions__buttons"><button type="button" data-active={feedback?.result==='worked'} onClick={()=>record('worked')}>{en?'Worked':'Çalıştı'}</button><button type="button" data-active={feedback?.result==='failed'} onClick={()=>record('failed')}>{en?"Didn't work":'Çalışmadı'}</button></div>
   {feedback?.environment && <p>{en?'Your environment':'Senin ortamın'}: {feedback.environment}</p>}
   <div className="local-evidence-actions__shelf"><span>{en?'Keep it as':'Nasıl saklansın?'}</span>{[['try',en?'Try later':'Sonra dene'],['using',en?'Using':'Kullanıyorum'],['reference',en?'Reference':'Referans']].map(([id,label])=><button type="button" key={id} data-active={shelf===id} onClick={()=>{const next=shelf===id?null:id;setShelf(setShelfState(storage,post.id,next));}}>{label}</button>)}</div>
 </section>;
}

import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
const url=process.env.VITE_SUPABASE_URL?.trim();
const key=process.env.VITE_SUPABASE_ANON_KEY?.trim();
if(!url||!key) throw new Error('Supabase public deploy credentials are required for knowledge export');
const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const postFields='id,slug,title,excerpt,body,category,content_type,outcome,evidence_status,tested_at,stale_after_days,environment,prerequisites,verification_steps,caveats,sources,evidence_version,author_id,published_at,updated_at';
const [{data:posts,error:postsError},{data:summaries,error:summaryError}]=await Promise.all([
  supabase.from('posts').select(postFields).eq('is_published',true).order('published_at',{ascending:false}),
  supabase.from('post_evidence_summary').select('*'),
]);
if(postsError) throw postsError;if(summaryError) throw summaryError;
const ids=(posts||[]).map((p)=>String(p.id));
const [{data:translations,error:translationError},{data:profiles,error:profilesError}]=await Promise.all([
  ids.length?supabase.from('post_translations').select('post_id,locale,title,excerpt,body').in('post_id',ids):Promise.resolve({data:[],error:null}),
  supabase.from('profiles').select('id,full_name,username'),
]);
if(translationError)throw translationError;if(profilesError)throw profilesError;
const summaryById=new Map((summaries||[]).map((x)=>[String(x.post_id),x]));
const profileById=new Map((profiles||[]).map((x)=>[String(x.id),x]));
const translationsByPost=new Map();
for(const t of translations||[]){const key=String(t.post_id);if(!translationsByPost.has(key))translationsByPost.set(key,[]);translationsByPost.get(key).push(t)}
await mkdir('docs/knowledge',{recursive:true});
let count=0;
for(const post of posts||[]){
  const variants=translationsByPost.get(String(post.id))||[{locale:'tr',title:post.title,excerpt:post.excerpt,body:post.body}];
  for(const tr of variants){
    const author=profileById.get(String(post.author_id));
    const artifact={schemaVersion:1,id:post.id,slug:post.slug,locale:tr.locale,title:tr.title||post.title,outcome:post.outcome||tr.excerpt||post.excerpt,body:tr.body||post.body,contentType:post.content_type,category:post.category,publishedAt:post.published_at,updatedAt:post.updated_at,author:author?{name:author.full_name||author.username,username:author.username}:null,evidence:{level:post.evidence_status,testedAt:post.tested_at,staleAfterDays:post.stale_after_days,environment:post.environment||[],prerequisites:post.prerequisites||[],verificationSteps:post.verification_steps||[],caveats:post.caveats||[],sources:post.sources||[],version:post.evidence_version,community:summaryById.get(String(post.id))||null},canonicalUrl:`https://postify.zekiakgul.dev/posts/${post.slug}`};
    await writeFile(`docs/knowledge/${post.slug}.${tr.locale}.json`,JSON.stringify(artifact,null,2)+'\n');count++;
  }
}
console.log(`Supabase knowledge export PASS: ${count} artifact(s)`);

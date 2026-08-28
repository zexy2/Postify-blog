import { requireSupabase } from '../lib/supabase';

const cleanEnvironment = (value='') => String(value).trim().slice(0,500);
const cleanNote = (value='') => String(value).trim().slice(0,2000);

export const knowledgeService = {
  getSummary: async (postId) => {
    const client=requireSupabase();
    const {data,error}=await client.from('post_evidence_summary').select('*').eq('post_id',postId).maybeSingle();
    if(error) throw error;
    return data || {post_id:postId,confirmation_count:0,worked_count:0,failed_count:0,environment_count:0,last_community_check_at:null};
  },
  getMyConfirmation: async (postId) => {
    const client=requireSupabase();
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError) throw authError;
    if(!user) return null;
    const {data,error}=await client.from('post_confirmations').select('id,post_id,user_id,result,environment,note,created_at,updated_at').eq('post_id',postId).eq('user_id',user.id).maybeSingle();
    if(error) throw error;
    return data;
  },
  setConfirmation: async (postId,{result,environment='',note=''}) => {
    if(!['worked','failed'].includes(result)) throw new Error('Invalid confirmation result');
    const client=requireSupabase();
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError) throw authError;
    if(!user) throw new Error('Authentication required');
    const {data,error}=await client.from('post_confirmations').upsert({post_id:postId,user_id:user.id,result,environment:cleanEnvironment(environment),note:cleanNote(note),updated_at:new Date().toISOString()},{onConflict:'post_id,user_id'}).select().single();
    if(error) throw error;
    return data;
  },
  getFailures: async (postId,{limit=20}={}) => {
    const client=requireSupabase();
    const {data,error}=await client.from('post_failure_reports').select('post_id,failure_count,last_failure_at').eq('post_id',postId).limit(Math.min(limit,1));
    if(error) throw error;
    return data || [];
  },
  getRevisions: async (postId) => {
    const client=requireSupabase();
    const {data,error}=await client.from('post_revision_history').select('id,revision_number,reason,created_at').eq('post_id',postId).order('revision_number',{ascending:false});
    if(error) throw error;
    return data || [];
  },
  captureRevision: async (postId,reason='') => {
    const client=requireSupabase();
    const {data,error}=await client.rpc('capture_post_revision',{target_post_id:postId,revision_reason:String(reason).slice(0,1000)});
    if(error) throw error;
    return data;
  },
  requestGap: async (query) => {
    const client=requireSupabase();
    const {data,error}=await client.rpc('request_knowledge_gap',{query_text:String(query).trim().slice(0,200)});
    if(error) throw error;
    return data;
  },
  getAuthorDashboard: async () => {
    const client=requireSupabase();
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError) throw authError;
    if(!user) return {posts:[],gaps:[]};
    const {data:posts,error}=await client.from('posts').select('id,slug,title,category,content_type,outcome,evidence_status,tested_at,stale_after_days,environment,verification_steps,evidence_version,updated_at,is_published').eq('author_id',user.id).order('tested_at',{ascending:true,nullsFirst:true});
    if(error) throw error;
    const ids=(posts||[]).map((post)=>post.id);
    let summaries=[];
    if(ids.length){const result=await client.from('post_evidence_summary').select('*').in('post_id',ids);if(result.error) throw result.error;summaries=result.data||[];}
    const byId=new Map(summaries.map((item)=>[String(item.post_id),item]));
    const {data:gaps,error:gapsError}=await client.from('knowledge_gaps').select('id,display_query,request_count,last_requested_at').order('request_count',{ascending:false}).order('last_requested_at',{ascending:false}).limit(12);
    if(gapsError) throw gapsError;
    return {posts:(posts||[]).map((post)=>({...post,summary:byId.get(String(post.id))||null})),gaps:gaps||[]};
  },
  reverifyPost: async (postId,reason='Author re-verified evidence') => {
    const client=requireSupabase();
    const {data,error}=await client.rpc('reverify_post',{target_post_id:postId,reverify_reason:String(reason).slice(0,1000)});
    if(error) throw error;
    return data;
  },
  getTopGaps: async ({limit=20}={}) => {
    const client=requireSupabase();
    const {data,error}=await client.from('knowledge_gaps').select('id,display_query,request_count,last_requested_at').order('request_count',{ascending:false}).order('last_requested_at',{ascending:false}).limit(limit);
    if(error) throw error;
    return data || [];
  },
  getShelf: async () => {
    const client=requireSupabase();
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError) throw authError;
    if(!user) return [];
    const {data,error}=await client.from('user_knowledge_shelf').select('post_id,state,updated_at').eq('user_id',user.id);
    if(error) throw error;
    return data || [];
  },
  setShelf: async (postId,state) => {
    const client=requireSupabase();
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError) throw authError;
    if(!user) throw new Error('Authentication required');
    if(!state){ const {error}=await client.from('user_knowledge_shelf').delete().eq('user_id',user.id).eq('post_id',postId); if(error) throw error; return null; }
    if(!['saved','try','using','reference'].includes(state)) throw new Error('Invalid shelf state');
    const {data,error}=await client.from('user_knowledge_shelf').upsert({user_id:user.id,post_id:postId,state,updated_at:new Date().toISOString()},{onConflict:'user_id,post_id'}).select().single();
    if(error) throw error;
    return data;
  },
};
export default knowledgeService;

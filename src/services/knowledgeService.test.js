import { beforeEach,describe,expect,it,vi } from 'vitest';
const chain={};
for(const name of ['select','eq','order','limit','upsert','delete']) chain[name]=vi.fn(()=>chain);
chain.maybeSingle=vi.fn(async()=>({data:null,error:null}));
chain.single=vi.fn(async()=>({data:{result:'worked'},error:null}));
const client={from:vi.fn(()=>chain),rpc:vi.fn(async()=>({data:{id:'g1'},error:null})),auth:{getUser:vi.fn(async()=>({data:{user:{id:'u1'}},error:null}))}};
vi.mock('../lib/supabase',()=>({requireSupabase:()=>client}));
const {default:service}=await import('./knowledgeService');
describe('knowledgeService',()=>{
 beforeEach(()=>{vi.clearAllMocks()});
 it('returns an honest zero summary when none exists',async()=>{expect((await service.getSummary('p1')).confirmation_count).toBe(0)});
 it('rejects invalid confirmation results before a write',async()=>{await expect(service.setConfirmation('p1',{result:'maybe'})).rejects.toThrow('Invalid')});
 it('records an authenticated knowledge gap through the atomic rpc',async()=>{await service.requestGap('React cache');expect(client.rpc).toHaveBeenCalledWith('request_knowledge_gap',{query_text:'React cache'})});
});

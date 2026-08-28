import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import knowledgeService from '../services/knowledgeService';

export const knowledgeKeys={
 all:['knowledge'], summary:(id)=>['knowledge','summary',id], mine:(id)=>['knowledge','mine',id], failures:(id)=>['knowledge','failures',id], revisions:(id)=>['knowledge','revisions',id], shelf:['knowledge','shelf'], gaps:['knowledge','gaps'], dashboard:['knowledge','dashboard'],
};
export function useEvidenceSummary(postId,{enabled=true}={}){return useQuery({queryKey:knowledgeKeys.summary(postId),queryFn:()=>knowledgeService.getSummary(postId),enabled:Boolean(postId)&&enabled,staleTime:60_000,retry:0});}
export function useMyConfirmation(postId,{enabled=true}={}){return useQuery({queryKey:knowledgeKeys.mine(postId),queryFn:()=>knowledgeService.getMyConfirmation(postId),enabled:Boolean(postId)&&enabled,staleTime:30_000,retry:0});}
export function useFailures(postId,{enabled=true}={}){return useQuery({queryKey:knowledgeKeys.failures(postId),queryFn:()=>knowledgeService.getFailures(postId),enabled:Boolean(postId)&&enabled,staleTime:60_000,retry:0});}
export function useRevisions(postId,{enabled=true}={}){return useQuery({queryKey:knowledgeKeys.revisions(postId),queryFn:()=>knowledgeService.getRevisions(postId),enabled:Boolean(postId)&&enabled,staleTime:60_000,retry:0});}
export function useSetConfirmation(postId){const qc=useQueryClient();return useMutation({mutationFn:(payload)=>knowledgeService.setConfirmation(postId,payload),onSuccess:()=>{qc.invalidateQueries({queryKey:knowledgeKeys.mine(postId)});qc.invalidateQueries({queryKey:knowledgeKeys.summary(postId)});qc.invalidateQueries({queryKey:knowledgeKeys.failures(postId)});}})}
export function useShelf({enabled=true}={}){return useQuery({queryKey:knowledgeKeys.shelf,queryFn:knowledgeService.getShelf,enabled,staleTime:30_000,retry:0});}
export function useSetShelf(){const qc=useQueryClient();return useMutation({mutationFn:({postId,state})=>knowledgeService.setShelf(postId,state),onSuccess:()=>qc.invalidateQueries({queryKey:knowledgeKeys.shelf})});}
export function useRequestGap(){const qc=useQueryClient();return useMutation({mutationFn:knowledgeService.requestGap,onSuccess:()=>qc.invalidateQueries({queryKey:knowledgeKeys.gaps})});}
export function useTopGaps({enabled=true}={}){return useQuery({queryKey:knowledgeKeys.gaps,queryFn:()=>knowledgeService.getTopGaps(),enabled,staleTime:60_000,retry:0});}

export function useAuthorDashboard({enabled=true}={}){return useQuery({queryKey:knowledgeKeys.dashboard,queryFn:knowledgeService.getAuthorDashboard,enabled,staleTime:30_000,retry:0});}
export function useReverifyPost(){const qc=useQueryClient();return useMutation({mutationFn:({postId,reason})=>knowledgeService.reverifyPost(postId,reason),onSuccess:()=>{qc.invalidateQueries({queryKey:knowledgeKeys.dashboard});qc.invalidateQueries({queryKey:['posts']});}});}

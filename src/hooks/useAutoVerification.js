import { useQuery } from '@tanstack/react-query';
export function useVerificationRuns({enabled=true}={}){return useQuery({queryKey:['verification-runs'],queryFn:async()=>{const response=await fetch('/verification-runs.json',{cache:'no-cache'});if(!response.ok)throw new Error('Verification artifact unavailable');return response.json();},enabled,staleTime:60_000,retry:0});}
export function useAutoVerification(id){const query=useVerificationRuns({enabled:Boolean(id)});return { ...query, run:id?query.data?.runs?.[id]||null:null };}

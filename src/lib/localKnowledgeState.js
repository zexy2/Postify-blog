const read = (storage, key, fallback) => { try { return JSON.parse(storage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (storage, key, value) => { storage.setItem(key, JSON.stringify(value)); return value; };
const keyFor = (kind) => `postify:${kind}:v1`;

export const getLocalFeedback = (storage, postId) => read(storage, keyFor('feedback'), {})[postId] || null;
export const setLocalFeedback = (storage, postId, value) => { const all=read(storage,keyFor('feedback'),{}); all[postId]={...value,updatedAt:new Date().toISOString()}; return write(storage,keyFor('feedback'),all)[postId]; };
export const getShelfState = (storage, postId) => read(storage,keyFor('shelf'),{})[postId] || null;
export const setShelfState = (storage, postId, state) => { const all=read(storage,keyFor('shelf'),{}); if(state) all[postId]=state; else delete all[postId]; write(storage,keyFor('shelf'),all); return state; };
export const addKnowledgeGap = (storage, query) => { const clean=query.trim(); const all=read(storage,keyFor('gaps'),[]); if(!clean) return all; if(!all.some(x=>x.query.toLowerCase()===clean.toLowerCase())) all.unshift({query:clean,createdAt:new Date().toISOString()}); return write(storage,keyFor('gaps'),all); };

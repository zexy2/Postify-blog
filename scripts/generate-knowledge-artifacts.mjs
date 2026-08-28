import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { getFallbackPosts } from '../src/content/fallbackPosts.js';
let verification={runs:{}};
try{verification=JSON.parse(await readFile('public/verification-runs.json','utf8'));}catch{}
await mkdir('public/knowledge',{recursive:true});
for(const locale of ['tr','en']){
  for(const post of getFallbackPosts(locale)){
    const auto=post.autoVerificationId ? verification.runs?.[post.autoVerificationId] || null : null;
    const artifact={schemaVersion:1,id:post.id,slug:post.slug,locale,title:post.title,outcome:post.outcome||post.excerpt,contentType:post.contentType||null,category:post.category,publishedAt:post.publishedAt,updatedAt:post.updatedAt,evidence:{...post.evidence,automaticVerification:auto},body:post.body,canonicalUrl:`https://postify.zekiakgul.dev/posts/${post.slug}`};
    await writeFile(`public/knowledge/${post.slug}.${locale}.json`,JSON.stringify(artifact,null,2)+'\n');
  }
}
console.log(`Knowledge artifacts generated: ${getFallbackPosts('tr').length*2}`);

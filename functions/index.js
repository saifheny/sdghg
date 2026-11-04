/* وصلة: تحويل النصوص والصور لأرقام (embeddings) وتخزينها في Firestore + بحث دلالي.
   محتاجة خطة Blaze ومفتاح Gemini:  firebase functions:secrets:set GEMINI_API_KEY
   ملحوظة: الكود ده لسه ما اتجربش على مشروعك. راجع أسماء الموديلات من توثيق Gemini قبل النشر. */
const {onDocumentWritten}=require('firebase-functions/v2/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
initializeApp();const db=getFirestore();
const KEY=defineSecret('GEMINI_API_KEY');
const API='https://generativelanguage.googleapis.com/v1beta',EMB='gemini-embedding-001',DIM=768,VISION='gemini-2.5-flash';
const CATS=['النقل والشحن','الصيانة والحرفيون','التعليم','البيع والشراء','الشركات والخدمات','التجارة والجملة'];

async function embed(text,key,task){
  const r=await fetch(`${API}/models/${EMB}:embedContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({content:{parts:[{text}]},taskType:task,outputDimensionality:DIM})});
  if(!r.ok)throw new Error('embed '+r.status);return (await r.json()).embedding.values;
}
async function caption(url,key){
  const img=await fetch(url);if(!img.ok)return '';const buf=Buffer.from(await img.arrayBuffer());
  const r=await fetch(`${API}/models/${VISION}:generateContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:'اوصف بالعربية في جملتين الخدمة أو المنتج أو المشكلة اللي في الصورة.'},{inlineData:{mimeType:'image/jpeg',data:buf.toString('base64')}}]}]})});
  if(!r.ok)return '';const j=await r.json();return j.candidates?.[0]?.content?.parts?.[0]?.text||'';
}
async function index(ref,d,text,key,sig){
  if(d.embedSig===sig)return; // مفيش تغيير، نمنع التكرار
  const v=await embed(text,key,'RETRIEVAL_DOCUMENT');
  await ref.update({embedding:FieldValue.vector(v),embedSig:sig,aiText:text});
}
exports.indexRequest=onDocumentWritten({document:'requests/{id}',secrets:[KEY]},async ev=>{
  const a=ev.data.after;if(!a.exists)return;const d=a.data(),key=KEY.value();
  const sig=[d.title,d.description,d.sub,(d.imgs||[]).join()].join('|');if(d.embedSig===sig)return;
  const caps=[];for(const u of (d.imgs||[]).slice(0,3))caps.push(await caption(u,key));
  await index(a.ref,d,[d.title,d.description,d.sub,CATS[d.category|0],d.locText,...caps].filter(Boolean).join('. '),key,sig);
});
exports.indexProvider=onDocumentWritten({document:'providers/{id}',secrets:[KEY]},async ev=>{
  const a=ev.data.after;if(!a.exists)return;const d=a.data(),sig=[d.name,d.category,d.city].join('|');
  await index(a.ref,d,[d.name,CATS[d.category|0],d.city,d.gov].filter(Boolean).join('. '),KEY.value(),sig);
});
exports.semanticSearch=onCall({secrets:[KEY]},async req=>{
  const q=String(req.data?.q||'').trim().slice(0,200);if(!q)throw new HttpsError('invalid-argument','q');
  const v=await embed(q,KEY.value(),'RETRIEVAL_QUERY');
  const run=c=>db.collection(c).findNearest({vectorField:'embedding',queryVector:v,limit:8,distanceMeasure:'COSINE',distanceThreshold:0.55}).get();
  const [r,p]=await Promise.all([run('requests'),run('providers')]);
  return{q,reqs:r.docs.map(x=>x.id),provs:p.docs.map(x=>x.id)};
});

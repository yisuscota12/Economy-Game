// v1.7j: mide (v1.7l: incluye textos cortos, ver «loose») los textos en español del código que no tienen traducción (B6 parte 2: narrativa).
// Requiere acorn: cd herramientas/i18n && npm i --no-save acorn acorn-walk && node narr_medir.js ../.. > /tmp/narr.json && python3 narr_resumen.py /tmp/narr.json
const fs=require('fs'),path=require('path'),acorn=require('acorn'),walk=require('acorn-walk');
const SRC=process.argv[2];
const vm=require('vm');const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(SRC,'src/data_i18n.js'),'utf8').replace(/^const (\w+)=/gm,'this.$1='),ctx);
if(ctx.i18Load){ctx.atob=atob;ctx.TextDecoder=TextDecoder;vm.runInContext("i18Load('en')",ctx);} // v1.7p: diccionarios comprimidos
// v1.7k: las plantillas de B6 parte 2 (b6p2/*_es.tsv) no cuentan como «ya traducidas»: así el extractor siempre las vuelve a listar
// y sus ids (SHA-1 del español) no cambian. El diccionario por hash (I18X) tampoco se consulta aquí.
const P2=new Set();try{for(const f of fs.readdirSync(path.join(SRC,'herramientas/i18n/b6p2')).filter(f=>/_es\.tsv$/.test(f)))for(const l of fs.readFileSync(path.join(SRC,'herramientas/i18n/b6p2',f),'utf8').split('\n')){const p=l.split('\t');if(p.length===3)P2.add(p[2].replace(/\\n/g,'\n'));}}catch(e){}
const D=ctx.I18N.en, TP=ctx.I18T.en.map(x=>x[0]).filter(t=>!P2.has(t));
const b6=new Set(fs.readFileSync(path.join(SRC,'herramientas/i18n/b6/b6_es.tsv'),'utf8').split('\n').filter(Boolean).map(l=>l.slice(7).replace(/\\n/g,'\n')));
const tpRx=TP.map(k=>new RegExp('^'+k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{\d\}/g,'(.+?)')+'$'));
const has=s=>{s=s.trim();if(D[s]!=null||b6.has(s))return 1;const l=s[0]&&s[0].toLowerCase()+s.slice(1);if(D[l]!=null)return 1;return 0;};
const SP=/[áéíóúñ¿¡]|\b(el|la|los|las|de|del|que|en|un|una|tu|tus|con|por|para|se|su|sus|al|y|es|no)\b/i;
const out=[];
for(const f of fs.readdirSync(path.join(SRC,'src')).filter(f=>f.endsWith('.js')&&!/^(data_i18n|ui_i18n)\.js$/.test(f))){
  const code=fs.readFileSync(path.join(SRC,'src',f),'utf8');let ast;
  try{ast=acorn.parse(code,{ecmaVersion:'latest',locations:true});}catch(e){console.error('PARSE',f,e.message);continue;}
  const anc=[];
  walk.fullAncestor(ast,(node,st,ancestors)=>{
    let txt=null,kind=null,nx=0;
    if(node.type==='Literal'&&typeof node.value==='string'){txt=node.value;kind='lit';}
    else if(node.type==='TemplateLiteral'){txt=node.quasis.map((q,i)=>q.value.cooked+(i<node.expressions.length?'{'+i+'}':'')).join('');kind='tpl';nx=node.expressions.length;}
    else return;
    if(ancestors.some(a=>a.type==='TaggedTemplateExpression'))return;
    const plain=txt.replace(/<[^>]+>/g,' ').replace(/\{\d+\}/g,' ').replace(/\s+/g,' ').trim();
    if(!/[a-záéíóúñ]{3}/i.test(plain))return;
    // v1.7l: también textos cortos sin palabras funcionales («Correr», «Quedarte callado», «Cena especial ({0})»): empiezan con mayúscula
    // (o ¡¿), tienen minúsculas y no son nombres propios en mayúscula inicial («Deccan Bank») ni códigos. Antes quedaban fuera de la medición.
    const loose=!(SP.test(plain)&&plain.split(' ').length>=2)?1:0;
    const lw=plain.split(' ').filter(w=>/[A-Za-záéíóúñÁÉÍÓÚÑ]/.test(w));
    const inicio=/^[¡¿]?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(plain)||kind==='tpl'&&/^\{\d+\}/.test(txt.trim())&&lw.length>=2; // «{0} parece buena persona.»
    // v1.7m: tablas de nombres propios (arreglos de 6+ cadenas de una sola palabra: nombres y apellidos de engine.js)
    const par=ancestors[ancestors.length-2];
    const tabla=par&&par.type==='ArrayExpression'&&par.elements.length>=6&&par.elements.every(e=>e&&e.type==='Literal'&&typeof e.value==='string');
    const nombre=v=>!/\s/.test(v.trim())||/^[A-ZÁÉÍÓÚÑ]/.test(v)&&v.split(' ').every(w=>/^[A-ZÁÉÍÓÚÑ]|^(de|da|del|van|von|al|el|bin)$/.test(w));
    if(loose&&tabla&&par.elements.every(e=>nombre(e.value)))return;
    if(loose&&(!inicio||lw.length>1&&lw.every(w=>!/^[a-záéíóúñ]/.test(w))))return;
    // contexto: función llamada más cercana y clave de propiedad
    let call='',key='';
    for(let i=ancestors.length-2;i>=0;i--){const a=ancestors[i];
      if(!key&&a.type==='Property'&&a.key)key=a.key.name||a.key.value||'';
      if(a.type==='CallExpression'){const c=a.callee;call=c.type==='Identifier'?c.name:c.type==='MemberExpression'&&c.property?c.property.name:'';if(call)break;}}
    const tr=kind==='lit'?has(txt):(tpRx.some(r=>r.test(txt.replace(/\{(\d+)\}/g,'X$1X')))?1:0);
    const ex=kind==='tpl'?node.expressions.map(e=>code.slice(e.start,e.end).slice(0,80)):[];
    out.push({loose,f,line:node.loc.start.line,kind,nx,ex,call,key,tr,len:plain.length,words:plain.split(' ').length,t:txt.slice(0,300)});
  });
}
process.stdout.write(JSON.stringify(out));

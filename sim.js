// Simulaciones automáticas del motor: vidas completas con decisiones al azar.
const fs = require('fs'), vm = require('vm');
const MAP = JSON.parse(fs.readFileSync(__dirname + '/raw/map2.json'));
const WORLD = JSON.parse(fs.readFileSync(__dirname + '/raw/world.json'));
const src = fs.readFileSync(__dirname + '/src/engine.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v04.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/events_v05.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/events_v06.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v07.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v08.js', 'utf8') + '\n' + (fs.existsSync(__dirname + '/src/events_v08.js') ? fs.readFileSync(__dirname + '/src/events_v08.js', 'utf8') : '') + '\n' + fs.readFileSync(__dirname + '/src/engine_v09.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v10.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v11.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v12.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v12b.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/data_v13.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v13.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/data_v14.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v14.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/data_v15.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v15.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/data_v15b.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v15b.js', 'utf8') + '\n' + fs.readFileSync(__dirname + '/src/engine_v16.js', 'utf8');
const TERR = JSON.parse(fs.readFileSync(__dirname + '/raw/terr.json'));
const SPLIT = JSON.parse(fs.readFileSync(__dirname + '/raw/split.json'));
const ctx = { MAP, WORLD, TERR, SPLIT, console, Math, JSON, Object, Array, Set, Map, String, Number, isFinite };
vm.createContext(ctx);
vm.runInContext(src + '\n;this.api={invest,build,canBuild,bldCost,interactions,allPeople,BLD,BIZT,sellInv,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v},newWorld,newPlayer,packG,unpackG,migrateSplit,ageUp,resolveEvent,personalActions,careerOptions,natActions,financeOptions,continueAsHeir,heir,natOf,U,grossIncome,netIncome,taxOf,livingCost,mortQ,regionsOf,fix,die,isReal,invalidate,useAct:null,warsOf,N0,RG,fmt,annex,congressVote,monthTick,syncMando,mandoActive,hasCommand,acceptOffer,rejectOffer,answerCall,dipActions,declareWar,neighborsOf,canDeclare};', ctx);
const A = ctx.api;
const args = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')));
const mode = args.mode || 'rapido', N = +(args.n || 30), years = +(args.years || 300), country = args.c || null, policy = args.policy || 'random';
const pick = a => a[Math.floor(Math.random() * a.length)];
const stats = { lives: 0, ages: [], deathAges: [], rulers: 0, wars: [], warsStart: 0, errors: 0, nan: 0, maxRegions: [], extinct: [], money: [], causes: {}, cond: 0, prison: 0, bankrupt: 0, nationsAlive: [] };
const t0 = Date.now();
for (let s = 0; s < N; s++) {
  try {
    A.G = A.newWorld(mode);
    const regs = Object.keys(A.G.regions).filter(r => !country || A.G.regions[r].o === country);
    let r = pick(regs);
    A.P = A.newPlayer({ first: 'Test', surname: 'Sim', sex: Math.random() < .5 ? 'M' : 'F', r, age: 0 });
    let warsSeen = new Set();
    const startYear = A.G.year;
    while (A.G.year - startYear < years) {
      const p = A.P;
      if (!p.alive) {
        stats.lives++; stats.deathAges.push(p.age);
        const last = p.log.filter(l => /^Mueres/.test(l.t)).pop(); const c = last ? last.t.replace(/ a los.*/, '') : '?'; stats.causes[c] = (stats.causes[c] || 0) + 1;
        if (args.newborn) { A.P = A.newPlayer({ first: 'Bebé', surname: 'Sim', sex: Math.random()<.5?'M':'F', r: pick(regs), age: 0 }); continue; }
        if (!A.continueAsHeir()) { A.P = A.newPlayer({ first: 'Nuevo', surname: 'Sim', sex: 'M', r: pick(Object.keys(A.G.regions)), age: 18 }); }
        continue;
      }
      // decisiones
      if (p.event) { (stats.ev=stats.ev||{})[p.event.id]=(stats.ev[p.event.id]||0)+1; let i=Math.floor(Math.random() * p.event.opts.length); if(p.event.id==='diagnostico') i=args.treat==='priv'?0:args.treat==='none'?2:1; A.resolveEvent(i); continue; }
      const acts = policy==='passive'?[]:A.personalActions().filter(a => a.can);
      for (let i = 0; i < 3 && acts.length; i++) { const a = policy === 'power' ? (acts.find(x => /contactos|campaña/.test(x.t)) || pick(acts)) : pick(acts); if (p.actions > 0) { p.actions--; a.fn(); A.fix(p); } }
      if (policy==='worker' && !p.job && !p.career.track && p.age>=18) { const co=A.careerOptions().filter(c=>c.can&&c.sec==='Empleos'); if(co.length){ co[co.length-1].fn(); } }
      else if (policy!=='passive' && policy!=='worker' && Math.random() < .5) { const co = A.careerOptions().filter(c => c.can && !(policy==='power' && /Renunciar|Abandonar|Jubilarte/.test(c.t))); if (co.length) { const c = policy === 'power' ? (co.find(x => /política|golpe|Saltar/.test(x.t)) || pick(co)) : pick(co); c.fn(); A.fix(p); } }
      if (policy!=='passive' && policy!=='worker' && A.isReal() && Math.random() < .3) { const fo = A.financeOptions().filter(c => c.can); if (fo.length) { pick(fo).fn(); } }
      if (args.warlike && p.ruler && !A.warsOf(A.natOf(p).id).length && Math.random()<.25) { const nb=A.neighborsOf(A.natOf(p).id).filter(x=>A.G.nations[x].alive); if(nb.length) A.declareWar(A.natOf(p).id, pick(nb)); }
      if (p.ruler && args.dip && Math.random()<.5) { const ts=Object.keys(A.G.nations).filter(x=>A.G.nations[x].alive&&x!==A.natOf(p).id); const da=A.dipActions(pick(ts)).filter(x=>x.can); if(da.length){ p.dip--; pick(da).fn(); } }
      if (p.ruler) { stats.rulers++; const na = A.natActions(); for (let i = 0; i < 2; i++) pick(na).fn(); }
      if (policy!=='passive' && p.age>=18 && Math.random()<.3 && p.dinero>0) { const rs=Object.keys(A.G.regions); A.invest(p, pick(rs), Math.random()<.5?'neg':'inm', p.dinero*.2); }
      if (policy!=='passive' && p.inv.length && Math.random()<.1) A.sellInv(p,0);
      if (policy!=='passive' && p.age>=18 && !p.biz && Math.random()<.1) p.biz={t:Math.floor(Math.random()*4),lvl:0,r:p.r,luck:1,y:A.G.year};
      if (p.biz && p.biz.lvl<3 && Math.random()<.1) p.biz.lvl++;
      if (policy!=='passive') { const pe=A.allPeople(p); if(pe.length){ const it=pick(pe); const ac=A.interactions(p,it).filter(a=>a.can); if(ac.length) pick(ac).fn(); } }
      if (p.ruler) { const n=A.natOf(p); n.treas=(n.treas||0); const rs=A.regionsOf(n.id); for(let k=0;k<3;k++){ const r=pick(rs), b=pick(Object.keys(A.BLD)); if(A.canBuild(r,b)&&n.treas>=A.bldCost(r,b)){ n.treas-=A.bldCost(r,b); A.build(r,b); p.built=(p.built||0)+1; } } }
      if (p.prison) stats.prison++;
      if (p.bankrupt === 7) stats.bankrupt++; if(p.event&&p.event.id==='bancarrota')stats.bkev=(stats.bkev||0)+1; if(p.age===50){(stats.m50=stats.m50||[]).push(p.dinero/A.U(p));}
      if (p.s.salud <= 0) { A.die('x'); continue; }
      A.syncMando(); if (A.mandoActive()) { stats.mandoYears=(stats.mandoYears||0)+1; for (let m=0;m<12&&A.mandoActive()&&A.P.alive;m++){ A.monthTick(true); if (A.G.offer){ Math.random()<.5?A.acceptOffer():A.rejectOffer(); } if (A.G.calls&&A.G.calls.length) A.answerCall(0, Math.random()<.5); } if(!A.P.alive) continue; }
      A.ageUp();
      A.G.wars.forEach(w => warsSeen.add(w.a + w.b + Math.floor(A.G.year)));
      if (!isFinite(p.dinero) || Object.values(p.s).some(v => !isFinite(v))) { stats.nan++; break; }
      if (Object.values(A.G.nations).some(n => !isFinite(n.gdp) || !isFinite(n.army) || !isFinite(n.stab))) { stats.nan++; const bad=Object.values(A.G.nations).find(n => !isFinite(n.gdp) || !isFinite(n.army) || !isFinite(n.stab)); console.log('NaN nación', bad.id, bad.alive, bad.gdp, bad.army, bad.stab, bad.ideo, A.regionsOf(bad.id).length); break; }
    }
    const nat = Object.values(A.G.nations);
    stats.nationsAlive.push(nat.filter(n => n.alive).length); const rr=Object.values(A.G.regions); (stats.moved=stats.moved||[]).push(rr.filter(r=>r.o!==r.w0).length/rr.length*100);
    stats.maxRegions.push(Math.max(...nat.map(n => A.regionsOf(n.id).length)));
    stats.wars.push(new Set([...warsSeen].map(x => x.slice(0, 6))).size);
    stats.money.push(A.P.dinero); (stats.ach=stats.ach||{}); A.P.ach.forEach(a=>stats.ach[a]=(stats.ach[a]||0)+1); stats.late=(stats.late||0);
  } catch (e) { stats.errors++; console.log('ERROR', e.stack.split('\n').slice(0, 4).join(' | ')); }
}
const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length) : 0;
const med = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
console.log(JSON.stringify({ mode, N, years, country, secs: ((Date.now() - t0) / 1000).toFixed(1), errors: stats.errors, nan: stats.nan, vidas: stats.lives,
  edadMuerteProm: avg(stats.deathAges).toFixed(1), edadMuerteMed: med(stats.deathAges), mueren_antes_5: stats.deathAges.filter(a => a < 5).length,
  añosGobernando: stats.rulers, guerrasDistintas_prom: avg(stats.wars).toFixed(1), provinciasCambiaronDeDueño_pct: avg(stats.moved||[]).toFixed(1), nacionesVivasAlFinal: avg(stats.nationsAlive).toFixed(1), maxRegionesUnaNacion: med(stats.maxRegions),
  eventosDistintos: Object.keys(stats.ev||{}).length, evs: stats.ev, logros: stats.ach, prisión: stats.prison, añosMando: stats.mandoYears||0, eventosBancarrota: stats.bkev||0, dineroA50_enSalariosMedios: stats.m50&&med(stats.m50).toFixed(1), bancarrotas: stats.bankrupt, causas: stats.causes }, null, 0));

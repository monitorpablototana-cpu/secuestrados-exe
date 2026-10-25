/* SECUESTRADOS.EXE — motor offline de interfaz / online para vídeos (GitHub Pages).
   Las claves son educativas y visibles en la fuente HTML/JS. No hay backend.
   Se almacena el progreso localmente en cada navegador; no hay coordinación real
   entre dispositivos (las rutas se distribuyen mediante una semilla compartida).
*/
(() => {
  'use strict';
  const cfg = window.JUEGO;
  const KEY = 'SECUESTRADOS_FINAL_v2';
  const app = document.getElementById('app');
  const timer = document.getElementById('timer');
  const reset = document.getElementById('reset');
  const stationIds = cfg.pruebas.map(p => p.id);
  let state = load();
  let videoEnded = false;
  const byId = id => document.getElementById(id);
  const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const two = n => String(n).padStart(2, '0');

  // PRNG determinista: exactamente el mismo orden para los seis teléfonos.
  function seedNumber(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function permutation(seed) {
    let s = seedNumber(seed) || 1;
    const next = () => {s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296;};
    const a = stationIds.slice();
    for (let i = a.length-1; i > 0; i--) { const j = Math.floor(next() * (i+1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function buildRoute(n, startPosition) {
    const order = permutation(cfg.semillaSesionRutas);
    return Array.from({length:n}, (_,i) => order[(startPosition-1+i)%order.length]);
  }
  function parseCode(raw) {
    const code = String(raw).trim();
    if (!/^\d{4}$/.test(code)) return null;
    const [duration, count, start, check] = [...code].map(Number);
    if (![1,2].includes(duration) || count < 2 || count > 6 || start < 1 || start > 6 || (duration+count+start)%10 !== check) return null;
    return {durationMinutes:duration*60, count, start, code};
  }
  function dateClassEnd(now, durationMinutes) {
    const d = new Date(now);
    const override = String(cfg.horaFinClase || '').trim();
    if (override) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(override);
      if (m && Number(m[1]) < 24 && Number(m[2]) < 60) {d.setHours(Number(m[1]), Number(m[2]), 0, 0);return d.getTime();}
    }
    d.setMinutes(0,0,0);
    d.setHours(d.getHours()+durationMinutes/60);
    return d.getTime();
  }
  function load() {
    try {
      const obj = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!obj || obj.version !== 2 || !['transmission','travel','challenge','final'].includes(obj.phase) || !Array.isArray(obj.route) || !Number.isFinite(obj.startedAt) || !Number.isFinite(obj.endAt)) return null;
      if (!Number.isInteger(obj.index) || obj.index < 0 || obj.index > obj.route.length) return null;
      return obj;
    } catch {return null;}
  }
  function save() { try {if (state) localStorage.setItem(KEY, JSON.stringify(state)); else localStorage.removeItem(KEY);} catch {/* navegadores privados: solo dura la sesión */} }
  const station = () => cfg.pruebas.find(p => p.id === state.route[state.index]);
  const done = () => state.solved+state.skipped;
  const remaining = () => state ? Math.max(0,Math.ceil((state.endAt-Date.now())/1000)) : 0;
  function heading(overline,title,lead) {return `<p class="eyebrow">${html(overline)}</p><h1 class="title">${html(title)}</h1><p class="lead">${html(lead)}</p>`;}
  function progress() {return `<div class="progress" role="progressbar" aria-label="Progreso" aria-valuenow="${done()}" aria-valuemin="0" aria-valuemax="${state.route.length}">${state.route.map((_,i) => `<div class="piece ${i<done()?'passed':''}"></div>`).join('')}</div>`;}
  function sectionVideo(filename, desc, fallback) {
    return `<div class="video-wrap"><video id="root-video" controls playsinline preload="metadata" aria-label="${html(desc)}" src="videos/${encodeURIComponent(filename)}"></video><div id="video-error" class="video-fallback" hidden><strong>TRANSMISIÓN NO DISPONIBLE</strong><p>${html(fallback)}</p></div></div>`;
  }
  function episodeId() {return cfg.episodiosPorCantidad[state.route.length][state.index];}
  function segments() {
    const st = station();
    return [
      {name:'MENSAJE DE ROOT', filename:cfg.videos.historias[episodeId()], fallback:'El mensaje no se ha podido reproducir. Continuad con la señal.'},
      {name:'INTERFERENCIA DE SEÑAL', filename:cfg.videos.glitch, fallback:'La señal ha sufrido una interferencia.'},
      {name:'DESTINO INTERCEPTADO', filename:cfg.videos.destinos[st.id-1], fallback:`La indicación se ha perdido. Dirigíos a: ${st.lugar}`}
    ];
  }
  function bindVideo(onFinished) {
    const vid = byId('root-video');
    if (!vid) return;
    videoEnded = false;
    vid.addEventListener('ended', () => {videoEnded = true;onFinished();});
    vid.addEventListener('error', () => {vid.hidden = true; const f = byId('video-error'); if (f) f.hidden = false;});
    if (vid.error) {vid.hidden=true;const f=byId('video-error');if(f)f.hidden=false;}
  }
  function renderTransmission() {
    if (state.mediaSegment < 0 || state.mediaSegment > 2) state.mediaSegment=0;
    const all = segments();
    const part = all[state.mediaSegment];
    app.innerHTML = heading('TRANSMISIÓN INTERCEPTADA',state.index===0?'ROOT HA TOMADO EL CONTROL':'ROOT SIGUE VIGILANDO','Escuchad el mensaje. La ubicación se revela en la última parte de la transmisión.')
      +progress()+`<div class="panel"><p class="eyebrow">PARTE ${state.mediaSegment+1} DE 3 · ${html(part.name)}</p>${sectionVideo(part.filename,part.name,part.fallback)}<p class="small">Si el vídeo no comienza solo, pulsad ▶ en el reproductor. También podéis usar el botón para continuar.</p><button type="button" class="btn" id="next-segment">${state.mediaSegment<2?'CONTINUAR TRANSMISIÓN →':'YA SABEMOS ADÓNDE IR →'}</button></div>`;
    byId('next-segment').onclick=advanceSegment;
    bindVideo(advanceSegment);
    // Nunca confiamos únicamente en autoplay; la pulsación sobre ▶ funciona en iPhone/Android.
  }
  function advanceSegment() {
    if (!state || state.phase!=='transmission')return;
    if (state.mediaSegment < 2) {state.mediaSegment++;save();render();}
    else {setPhase('travel');}
  }
  function renderTravel() {
    app.innerHTML=heading(`MISIÓN ${state.index+1} / ${state.route.length}`,'LOCALIZAD LA ESTACIÓN','Seguid las instrucciones que ROOT acaba de daros. No hay que escanear ningún otro QR.')+progress()
      +`<div class="panel"><p>Cuando estéis físicamente ante los materiales, pulsad el botón para comenzar. <strong>Las pistas empezarán a contar desde ese momento.</strong></p><button class="btn" id="arrived">YA ESTAMOS EN LA ESTACIÓN →</button><button class="btn ghost" id="replay">REPETIR VÍDEO DE DESTINO</button></div>`;
    byId('arrived').onclick=() => {if (!mayStartNext()) {finish('tiempo');return;}state.stageStartedAt=Date.now();state.failures=0;state.lockedUntil=0;setPhase('challenge');};
    byId('replay').onclick=() => {state.mediaSegment=2;setPhase('transmission');};
  }
  function clockSecondsToChange() {
    const timestamp=Date.now() + cfg.desfaseRelojSegundos*1000;
    return Math.ceil((60000 - ((timestamp%60000)+60000)%60000)/1000);
  }
  function renderChallenge() {
    const st = station();
    app.innerHTML=heading(`PROTOCOLO ${state.index+1} / ${state.route.length}`,st.titulo,'Resuelve la prueba que tienes delante.')+progress()
      +`<div class="panel"><p>${html(st.instrucciones)}</p>${st.tipo==='reloj'?'<div class="clock-info">La contraseña cambia dentro de <strong id="clock-remaining">--</strong> s</div>':''}<form id="answer-form"><label class="field-label" for="answer">Contraseña</label><input class="field mono" id="answer" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15" placeholder="CLAVE" required><button class="btn" id="verify" type="submit">VERIFICAR CLAVE →</button></form><div id="answer-error" role="status" aria-live="polite"></div><div id="lock-status" role="status" aria-live="polite"></div></div><div id="hint-container" class="hints"></div><div id="skip-container"></div>`;
    byId('answer-form').addEventListener('submit',e=>{e.preventDefault();submitAnswer();});
    updateChallenge();
  }
  function normalize(s) {return String(s).trim().toUpperCase().replace(/\s+/g,'');}
  function verifyClock(input) {
    const ms = Date.now() + cfg.desfaseRelojSegundos*1000;
    const margin = Math.max(0,Number(cfg.margenRelojSegundos)||0)*1000;
    const opts=[ms,ms-margin,ms+margin].map(n=>two(new Date(n).getMinutes()));
    return /^\d{2}$/.test(input) && opts.includes(input);
  }
  function submitAnswer() {
    if (!state || state.phase!=='challenge')return;
    if (Date.now() < state.lockedUntil) {updateChallenge();return;}
    if (Date.now() >= state.endAt) {finish('tiempo');return;}
    const st = station();
    const input = normalize(byId('answer').value);
    if (!input) return;
    const ok = st.tipo==='reloj' ? verifyClock(input) : input===normalize(st.respuesta);
    if (ok) {nextStation(false);return;}
    state.failures++;
    const seconds=cfg.segundosBloqueoFallos[Math.min(state.failures-1,cfg.segundosBloqueoFallos.length-1)];
    state.lockedUntil=Date.now()+seconds*1000;
    save();
    byId('answer-error').innerHTML='<p class="error">ACCESO DENEGADO. ¿Pretendíais adivinar la contraseña por fuerza bruta? Qué adorable…</p>';
    updateChallenge();
  }
  function updateChallenge() {
    if (!state || state.phase!=='challenge')return;
    const sec = Math.max(0,Math.floor((Date.now() - state.stageStartedAt)/1000));
    if (station().tipo==='reloj' && byId('clock-remaining'))byId('clock-remaining').textContent=clockSecondsToChange();
    const wait = Math.max(0,Math.ceil((state.lockedUntil-Date.now())/1000));
    const verify=byId('verify');
    if (verify) {verify.disabled=wait>0;verify.textContent=wait>0?`ESPERA ${wait} s PARA REINTENTAR`:'VERIFICAR CLAVE →';}
    const lock=byId('lock-status');
    if (lock)lock.textContent=wait>0?`ROOT ha bloqueado nuevos intentos durante ${wait} segundos.`:'';
    // Durante la penalización no desaparecen las pistas ni se detiene su reloj.
    const hints=byId('hint-container');
    if (hints)hints.innerHTML=`<div class="panel"><p class="hint-title">PISTAS AUTOMÁTICAS · ${Math.floor(sec/60)} min ${two(sec%60)} s en esta estación</p>${station().pistas.map((h,i)=>{
      const unlock=Number(cfg.segundosPistas[i]);return `<div class="hint ${sec>=unlock?'unlocked':''}">${sec>=unlock?`<strong>PISTA ${i+1}</strong><p>${html(h)}</p>`:`🔒 Pista ${i+1}: en ${Math.max(1,unlock-sec)} segundos`}</div>`;}).join('')}</div>`;
    const skip=byId('skip-container');
    if (skip) {
      const allowed=sec>=cfg.segundosHastaPermitirSalto;
      skip.innerHTML=`<button type="button" id="skip" class="btn ghost" ${allowed?'':'disabled'}>${allowed?'NO PODEMOS RESOLVERLA: PASAR →':`PASAR SIN RESOLVER: EN ${cfg.segundosHastaPermitirSalto-sec} s`}</button>`;
      if (allowed)byId('skip').onclick=()=>{if (confirm('¿Queréis omitir esta prueba? Constará como no resuelta.'))nextStation(true);};
    }
  }
  function requiredTimeForNext() {
    const durations=state.stageDurations || [];
    const avg=durations.length?durations.reduce((a,b)=>a+b,0)/durations.length:360;
    const estimated=avg+cfg.segundosDesplazamientoEstimados+cfg.segundosVideoFinalEstimados;
    return Math.max(cfg.segundosMinimosParaIniciarOtraPrueba, Math.ceil(estimated));
  }
  function mayStartNext() {return remaining()>=requiredTimeForNext();}
  function nextStation(skipped) {
    if (!state || state.phase!=='challenge')return;
    (state.stageDurations ||= []).push(Math.round((Date.now()-state.stageStartedAt)/1000));
    if (skipped)state.skipped++;else state.solved++;
    state.index++;
    state.stageStartedAt=0;
    state.failures=0;
    state.lockedUntil=0;
    if (state.index>=state.route.length) {finish('completo');return;}
    if (!mayStartNext()) {finish('tiempo');return;}
    state.mediaSegment=0;
    setPhase('transmission');
  }
  function finish(reason) {
    if (!state || state.phase==='final')return;
    state.finalReason=reason;
    state.phase='final';state.lockedUntil=0;save();render();
  }
  function setPhase(p) {if (!state)return;state.phase=p;save();render();}
  function renderFinal() {
    const msg=state.finalReason==='tiempo'?'La hora de cierre se acerca. ROOT ha puesto fin al recorrido para que podáis regresar a clase.':'Habéis completado vuestro recorrido. Es hora de conocer el verdadero plan de ROOT.';
    app.innerHTML=heading('TRANSMISIÓN FINAL', 'PROTOCOLO TERMINADO',msg)+progress()
      +`<div class="panel"><p class="result">${state.solved} resuelta(s) · ${state.skipped} omitida(s)</p>${sectionVideo(cfg.videos.final,'La revelación de ROOT','Todo era una simulación: ROOT nunca tuvo acceso al móvil. No obedecáis automáticamente las órdenes de una pantalla.')}<p class="small">ROOT revela que nunca intervino el teléfono. Escuchad el mensaje final antes de regresar con el profesor.</p><button type="button" class="btn alt" id="new-game">TERMINAR Y PREPARAR OTRA PARTIDA</button></div>`;
    bindVideo(()=>{});
    byId('new-game').onclick=()=>clearState();
  }
  function renderStart() {
    app.innerHTML=heading('SIMULACIÓN DE INCIDENTE','TU DISPOSITIVO HA SIDO INTERVENIDO','ROOT ha tomado el control… ¿Podréis recuperar las claves?')
      +`<div class="panel"><h2>Identificación del equipo</h2><p class="small">Introducid el código de cuatro cifras que os ha entregado vuestro profesor. No hace falta instalar ninguna aplicación.</p><form id="start-form"><label class="field-label" for="startCode">Código de inicio</label><input class="field mono" id="startCode" type="text" inputmode="numeric" autocomplete="off" maxlength="4" pattern="[0-9]{4}" placeholder="0000" required><button class="btn" type="submit">INICIAR PARTIDA →</button></form><div id="start-error" role="alert"></div></div><p class="small">Esta es una simulación educativa. Esta web no bloquea ni modifica el dispositivo.</p>`;
    byId('start-form').onsubmit=e=>{e.preventDefault();startGame();};
  }
  function startGame() {
    const x=parseCode(byId('startCode').value);
    if (!x) {byId('start-error').innerHTML='<p class="error">Código incorrecto. Comprobad las cuatro cifras con el profesor.</p>';return;}
    const now=Date.now();
    const classEnd=dateClassEnd(now,x.durationMinutes);
    const endAt=Math.min(now+x.durationMinutes*60000,classEnd-cfg.minutosAntesDeClaseParaCerrar*60000);
    // La duración de 1/2 h nunca anula el límite escolar de cinco minutos.
    if (endAt-now < cfg.segundosMinimosParaIniciarOtraPrueba*1000) {
      byId('start-error').innerHTML='<p class="error">Queda demasiado poco tiempo para iniciar una partida nueva antes del fin de clase. Consultad al profesor.</p>';return;
    }
    state={version:2,code:x.code,phase:'transmission',route:buildRoute(x.count,x.start),index:0,solved:0,skipped:0,
      startedAt:now,endAt,classEndAt:classEnd,durationMinutes:x.durationMinutes,mediaSegment:0,stageStartedAt:0,
      failures:0,lockedUntil:0,stageDurations:[],finalReason:''};
    save();render();
  }
  function clearState() {
    if (state && Date.now()<state.lockedUntil) {
      alert('ROOT no permite reiniciar durante la penalización. Esperad a que termine.');return;
    }
    if (!state || confirm('¿Reiniciar esta partida en este dispositivo? Se perderá todo el progreso.')) {state=null;save();render();}
  }
  function updateTimer() {
    if (!state) {timer.textContent='--:--';timer.classList.remove('expired');return;}
    if (state.phase!=='final' && Date.now()>=state.endAt) {finish('tiempo');return;}
    if (state.phase==='travel' && !mayStartNext()) {finish('tiempo');return;}
    const sec=remaining();
    timer.textContent=state.phase==='final'?'FINAL':`${Math.floor(sec/3600)?`${Math.floor(sec/3600)}:`:''}${two(Math.floor((sec%3600)/60))}:${two(sec%60)}`;
    timer.classList.toggle('expired',sec===0);
    if (state.phase==='challenge')updateChallenge();
    if (state.phase==='transmission' && state.mediaSegment===0 && state.index>0 && !mayStartNext()) finish('tiempo');
  }
  function render() {
    reset.hidden=!state;
    reset.disabled=!!state && Date.now()<state.lockedUntil;
    if (!state)renderStart();
    else if(state.phase==='transmission')renderTransmission();
    else if(state.phase==='travel')renderTravel();
    else if(state.phase==='challenge')renderChallenge();
    else renderFinal();
    updateTimer();
  }
  reset.addEventListener('click',clearState);
  render();
  setInterval(() => {updateTimer();if(state)reset.disabled=Date.now()<state.lockedUntil;},1000);
  window.addEventListener('pageshow',updateTimer);
  document.addEventListener('visibilitychange',()=>{if (!document.hidden)updateTimer();});
  // Solo para las comprobaciones automatizadas antes de publicar; no se muestra al alumnado.
  window.__secuestradosDiagnostics = {parseCode, buildRoute, dateClassEnd, verifyClock, currentState:()=>state, setTime:()=>updateTimer()};
})();

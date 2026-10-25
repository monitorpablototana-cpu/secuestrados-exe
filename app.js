/* SECUESTRADOS.EXE — motor V3
 * Rutas deterministas por semilla, 2..6 fases y vídeo modular sin fullscreen nativo.
 * Las pistas/contraseñas internas NUNCA se muestran en pantalla por adelantado.
 * Solo usa datos locales del navegador y MP4 estáticos publicados en GitHub Pages.
 */
(() => {
  'use strict';
  const cfg = window.JUEGO;
  const KEY = 'SECUESTRADOS_V3';
  const app = document.getElementById('app');
  const timer = document.getElementById('timer');
  const reset = document.getElementById('reset');
  const modalRoot = document.getElementById('modal-root');
  const stationIds = cfg.pruebas.map(s => s.id);
  const byId = id => document.getElementById(id);
  const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const two = x => String(x).padStart(2,'0');
  let state = load();
  let mainPlayer = null;
  let replayPlayer = null;

  function hashSeed(seed) {
    let hash = 2166136261;
    for (const ch of seed) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return hash >>> 0;
  }
  function permutation(seed) {
    let x = hashSeed(seed) || 1;
    const rng = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
    const a = stationIds.slice();
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function route(count, position) {
    const a = permutation(cfg.semillaSesionRutas);
    return Array.from({length:count}, (_,i) => a[(position-1+i)%a.length]);
  }
  function parseCode(raw) {
    const code = String(raw).trim();
    if(!/^\d{4}$/.test(code)) return null;
    const [duration,n,start,check] = code.split('').map(Number);
    if (![1,2].includes(duration)||n<2||n>6||start<1||start>6||(duration+n+start)%10!==check) return null;
    return {code, durationMinutes:duration*60, n, start};
  }
  function classClosingMs(now) {
    const raw = String(cfg.horaFinClase || '').trim();
    const match = /^(\d{1,2}):(\d{2})$/.exec(raw);
    if (!match) return null;
    const hh=Number(match[1]), mm=Number(match[2]);
    if (hh>23||mm>59) return null;
    const t = new Date(now);
    t.setHours(hh,mm,0,0);
    // Una hora pasada NUNCA puede causar el falso bloqueo que aparecía en V2.
    if (t.getTime()<=now) return null;
    return t.getTime() - cfg.minutosAntesDeClaseParaCerrar*60000;
  }
  function endOfGame(now, minutes) {
    const standard = now + minutes*60000;
    const school = classClosingMs(now);
    return school === null ? standard : Math.min(standard, Math.max(now,school));
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved || saved.version!==3 || !Array.isArray(saved.route) ||
          !['transmission','travel','challenge','final'].includes(saved.phase) ||
          !Number.isFinite(saved.startedAt) || !Number.isFinite(saved.endAt) ||
          !Number.isInteger(saved.index) || saved.index<0 || saved.index>saved.route.length ||
          saved.route.length<2 || saved.route.length>6 ||
          !saved.route.every(id => stationIds.includes(id))) return null;
      return saved;
    } catch { return null; }
  }
  function save() {
    try { if (state) localStorage.setItem(KEY, JSON.stringify(state)); else localStorage.removeItem(KEY); }
    catch { /* Puede estar bloqueado: la partida sigue mientras esté abierta. */ }
  }
  function currentStation() {return cfg.pruebas.find(p=>p.id===state.route[state.index]);}
  function secsRemaining() {return state? Math.max(0,Math.ceil((state.endAt-Date.now())/1000)):0;}
  function title(kicker,headline,subtitle='') {
    return `<p class="eyebrow">${esc(kicker)}</p><h1 class="title">${esc(headline)}</h1>` +
           (subtitle?`<p class="lead">${esc(subtitle)}</p>`:'');
  }
  function videoFile(s) {return `videos/${encodeURIComponent(s)}`;}
  function cleanupPlayer(player) {
    if (player) player.dispose();
    document.body.classList.remove('cinema-active');
  }
  function closeReplay() {
    cleanupPlayer(replayPlayer); replayPlayer=null;
    modalRoot.replaceChildren();
    document.body.classList.remove('replay-active');
  }
  function cleanupBeforeRender() {
    cleanupPlayer(mainPlayer);mainPlayer=null;
    closeReplay();
  }

  /* Vídeo sin controles nativos: evita el fullscreen Android que reencuadraba
     algunas exportaciones. El modo cine es un overlay CSS object-fit:contain.
     La MISMA etiqueta <video> reproduce historia→glitch→destino sin pantallas
     ni botones intermedios. Si el navegador bloquea el encadenamiento con
     sonido, el botón reproducir queda disponible para retomarlo manualmente. */
  function playerMarkup() {
    return `<div class="media-frame">
      <div class="media-stage">
        <video playsinline webkit-playsinline preload="metadata" disablepictureinpicture disableremoteplayback aria-label="Transmisión de ROOT"></video>
        <div class="cinema-toolbar" role="group" aria-label="Controles del modo cine">
          <button type="button" class="cinema-toggle" aria-label="Reproducir o pausar">▶ REPRODUCIR</button>
          <button type="button" class="cinema-close" aria-label="Salir del modo cine">✕ SALIR</button>
        </div>
      </div>
      <div class="media-actions">
        <button type="button" class="btn media-play">▶ REPRODUCIR</button>
        <button type="button" class="btn alt media-cinema">⛶ MODO CINE</button>
      </div>
      <p class="media-status" role="status" aria-live="polite">Pulsa REPRODUCIR para recibir la transmisión.</p>
      <div class="media-error" hidden></div>
    </div>`;
  }
  function createPlayer(container, files, options) {
    const frame=container.querySelector('.media-stage');
    const video=frame.querySelector('video');
    const playBtn=container.querySelector('.media-play');
    const cinemaBtn=container.querySelector('.media-cinema');
    const closeBtn=container.querySelector('.cinema-close');
    const cinemaToggle=container.querySelector('.cinema-toggle');
    const message=container.querySelector('.media-status');
    const errorPanel=container.querySelector('.media-error');
    let disposed=false;
    let i=Math.max(0,Math.min(files.length-1,Number(options.startIndex)||0));
    let failed=false;
    let hudTimer=null;
    function hideHudTimer() {if(hudTimer!==null){clearTimeout(hudTimer);hudTimer=null;}}
    function showHud(autoHide=true) {
      if(disposed || !frame.classList.contains('cinema'))return;
      hideHudTimer();
      frame.classList.add('hud-visible');
      if(autoHide && !video.paused && !video.ended) {
        hudTimer=setTimeout(()=>{hudTimer=null;if(!disposed && !video.paused && !video.ended)frame.classList.remove('hud-visible');},2600);
      }
    }
    function syncHud() {if(video.paused || video.ended)showHud(false);else showHud(true);}
    function label(text) {message.textContent=text;}
    function showError() {
      failed=true;
      const isDestination = options.kind==='replay' || (options.kind==='sequence' && i===files.length-1);
      const location = isDestination && options.location ?
        `<p class="media-fallback"><strong>INDICACIÓN DE EMERGENCIA:</strong> ${esc(options.location)}</p>` : '';
      const finalFallback = options.kind==='final' ?
        '<p class="media-fallback">ROOT nunca tomó el control del móvil. Toda la presión venía de sus mensajes: decidisteis si obedecerlos. Desconfiad de instrucciones sospechosas aunque parezcan urgentes o autorizadas.</p>' : '';
      const lastAction = options.kind==='replay' ? 'REGRESAR A LA FASE' :
                         options.kind==='final' ? 'CERRAR AVISO' : 'CONTINUAR SIN VÍDEO';
      errorPanel.hidden=false;
      errorPanel.innerHTML=`<strong>SEÑAL PERDIDA</strong><p>No se puede cargar este fragmento. Comprobad la conexión.</p>${location}${finalFallback}<button type="button" class="btn alt media-error-advance">${i<files.length-1?'CONTINUAR TRANSMISIÓN SIN ESTE FRAGMENTO':lastAction}</button>`;
      errorPanel.querySelector('.media-error-advance').onclick=() => {
        errorPanel.hidden=true;failed=false;
        if (i<files.length-1) advance(true); else finishPlayer();
      };
      label('El vídeo no se ha podido reproducir.');
    }
    function source() {
      if(disposed)return;
      failed=false;errorPanel.hidden=true;errorPanel.textContent='';
      frame.style.aspectRatio='16 / 9';
      video.src=videoFile(files[i]);
      video.load();
      playBtn.textContent='▶ REPRODUCIR';
      cinemaToggle.textContent='▶ REPRODUCIR';
      syncHud();
      label('Pulsa REPRODUCIR para continuar.');
    }
    function cinema(on) {
      frame.classList.toggle('cinema',on);
      document.body.classList.toggle('cinema-active',on);
      cinemaBtn.textContent=on?'↙ VISTA NORMAL':'⛶ MODO CINE';
      hideHudTimer();
      frame.classList.toggle('hud-visible',on);
      if(on)syncHud();
    }
    function refreshPlayButton() {
      const txt=video.paused?'▶ REPRODUCIR':'Ⅱ PAUSAR';
      playBtn.textContent=txt;cinemaToggle.textContent=txt;cinemaToggle.setAttribute('aria-label',video.paused?'Reproducir vídeo':'Pausar vídeo');
    }
    async function playback() {
      if (disposed||failed)return;
      try {
        const promise=video.play();
        if (promise && typeof promise.then==='function') await promise;
        if (!disposed) {refreshPlayButton();syncHud();label('Señal recibida.');}
      } catch {
        if(!disposed) {refreshPlayButton();syncHud();label('Toca REPRODUCIR para continuar la transmisión.');}
      }
    }
    function toggle() {
      if(disposed)return;
      if (failed) {source();playback();return;}
      if(video.paused||video.ended) {if(video.ended)video.currentTime=0;playback();}
      else {video.pause();refreshPlayButton();syncHud();label('Transmisión en pausa.');}
    }
    function finishPlayer() {
      if(disposed)return;
      if(options.onFinish)options.onFinish();
      if(options.kind!=='sequence')label('Fin de la transmisión.');
    }
    function advance(fromError=false) {
      if(disposed)return;
      if(i<files.length-1) {
        ++i;
        if(options.onSegment) options.onSegment(i);
        source();
        // Tras un gesto inicial intentamos mantener la reproducción sin cortes.
        // Sin permiso de autoplay, el botón sigue accesible.
        if(!fromError)playback();
      } else finishPlayer();
    }
    playBtn.addEventListener('click',toggle);
    cinemaToggle.addEventListener('click',e=>{e.stopPropagation();toggle();});
    // En modo cine tocar la imagen solo revela los controles EN LA PARTE SUPERIOR.
    // No pausamos de golpe al intentar localizar el botón de salir.
    video.addEventListener('click',()=>{
      if(frame.classList.contains('cinema'))showHud(!video.paused);
      else toggle();
    });
    frame.addEventListener('click',e=>{if(e.target===frame && frame.classList.contains('cinema'))showHud(!video.paused);});
    frame.addEventListener('mousemove',()=>{if(frame.classList.contains('cinema'))showHud(!video.paused);});
    cinemaBtn.addEventListener('click',()=>cinema(!frame.classList.contains('cinema')));
    closeBtn.addEventListener('click',e=>{e.stopPropagation();cinema(false);});
    video.addEventListener('loadedmetadata',()=>{
      if(disposed || !video.videoWidth || !video.videoHeight)return;
      // Adaptamos el marco al formato REAL del MP4 sin aplicar zoom.
      frame.style.aspectRatio=`${video.videoWidth} / ${video.videoHeight}`;
    });
    video.addEventListener('ended',()=>{
      refreshPlayButton();
      if(options.kind==='sequence')advance();else {syncHud();label('Fin del mensaje. Puedes repetirlo o volver a la fase.');if(options.onFinish)options.onFinish();}
    });
    video.addEventListener('error',()=>{if(!disposed)showError();});
    video.addEventListener('waiting',()=>{if(!disposed && !video.paused)label('Recuperando señal…');});
    video.addEventListener('playing',()=>{if(!disposed){refreshPlayButton();syncHud();label('Señal recibida.');}});
    video.addEventListener('pause',()=>{if(!disposed){refreshPlayButton();syncHud();}});
    source();
    return {
      start(){return playback();},
      dispose(){hideHudTimer();disposed=true;video.pause();video.removeAttribute('src');video.load();cinema(false);},
      skipForTest(){advance();}
    };
  }

  function storyParts() {
    const id=currentStation().id;
    const narrative=(cfg.episodiosPorCantidad[state.route.length] || cfg.episodiosPorCantidad[6])[state.index];
    return [cfg.videos.historias[narrative],cfg.videos.glitch,cfg.videos.destinos[id-1]];
  }
  function renderTransmission() {
    const stage=`FASE ${state.index+1}`;
    app.innerHTML=title('SEÑAL INTERCEPTADA',stage,'ROOT tiene un nuevo mensaje para vosotros.')+
      `<div class="panel"><p class="eyebrow">TRANSMISIÓN ENTRANTE</p>${playerMarkup()}</div>`;
    const wrap=app.querySelector('.media-frame');
    mainPlayer=createPlayer(wrap,storyParts(),{
      kind:'sequence',startIndex:state.mediaSegment || 0,
      location:currentStation().lugar,
      onSegment:i=>{if(state&&state.phase==='transmission'){state.mediaSegment=i;save();}},
      onFinish:()=>{if(state&&state.phase==='transmission'){setPhase('travel');}}
    });
  }
  function renderTravel() {
    app.innerHTML=title('PUNTO DE ACCESO',`FASE ${state.index+1}`,'Dirigíos al lugar indicado por ROOT.')+
      `<div class="panel"><p>Cuando estéis delante de los materiales, activad el acceso.</p>
         <button type="button" class="btn" id="arrived">ESTAMOS EN EL PUNTO DE ACCESO →</button>
         <button type="button" class="btn ghost" id="replay-destination">REPETIR ÚLTIMA TRANSMISIÓN</button></div>`;
    byId('arrived').onclick=()=>{
      if(!mayStartAnother()) {finish('tiempo');return;}
      state.stageStartedAt=Date.now();state.failures=0;state.lockedUntil=0;setPhase('challenge');
    };
    byId('replay-destination').onclick=openReplay;
  }
  function renderChallenge() {
    const st=currentStation();
    const fragment=st.claveParcial?`<div class="key-fragment" aria-label="Clave parcial ${esc(st.claveParcial)}">${esc(st.claveParcial)}</div>`:'';
    app.innerHTML=title('PROTOCOLO DE ACCESO',`FASE ${state.index+1}`,'Introduce la clave para recuperar el acceso.')+
      `<div class="panel">${fragment}<form id="answer-form">
         <label for="answer" class="field-label">${st.claveParcial?'CARÁCTER QUE FALTA':'CONTRASEÑA'}</label>
         <input class="field mono" id="answer" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="${st.claveParcial?1:15}" placeholder="${st.claveParcial?'_':'CLAVE'}" required>
         <button class="btn" id="verify" type="submit">VERIFICAR CLAVE →</button>
       </form><div id="answer-error" role="status" aria-live="polite"></div><div id="lock-status" role="status" aria-live="polite"></div>
       <button class="btn ghost" type="button" id="replay-destination">▶ REPETIR ÚLTIMA TRANSMISIÓN</button></div>
       <div class="hints" id="hint-container"></div><div id="skip-container"></div>`;
    byId('answer-form').addEventListener('submit',e=>{e.preventDefault();verifyAnswer();});
    byId('replay-destination').onclick=openReplay;
    updateChallenge();
  }
  function openReplay() {
    if(!state || !['travel','challenge'].includes(state.phase))return;
    closeReplay();
    modalRoot.innerHTML=`<div class="replay-overlay" role="dialog" aria-modal="true" aria-label="Última transmisión de ROOT">
       <div class="replay-dialog"><div class="replay-header"><h2>ÚLTIMA TRANSMISIÓN</h2><button type="button" class="replay-close">✕ VOLVER A LA FASE</button></div>
       ${playerMarkup()}<button type="button" class="btn ghost" id="replay-again">↻ REPRODUCIR DESDE EL PRINCIPIO</button></div></div>`;
    document.body.classList.add('replay-active');
    const dialog=modalRoot.querySelector('.replay-dialog');
    const filename=cfg.videos.destinos[currentStation().id-1];
    const make=()=>{
      cleanupPlayer(replayPlayer);
      dialog.querySelector('.media-frame').outerHTML=playerMarkup();
      replayPlayer=createPlayer(dialog.querySelector('.media-frame'),[filename],{kind:'replay',location:currentStation().lugar,onFinish:closeReplay});
    };
    replayPlayer=createPlayer(dialog.querySelector('.media-frame'),[filename],{kind:'replay',location:currentStation().lugar,onFinish:closeReplay});
    dialog.querySelector('.replay-close').onclick=closeReplay;
    byId('replay-again').onclick=make;
  }
  function normalize(s) {return String(s).trim().toUpperCase().replace(/\s+/g,'');}
  function verifyClock(s) {
    if(!/^\d{2}$/.test(s))return false;
    const now=Date.now()+cfg.desfaseRelojSegundos*1000;
    const margin=Math.max(0,Number(cfg.margenRelojSegundos)||0)*1000;
    return [now,now-margin,now+margin].some(t=>two(new Date(t).getMinutes())===s);
  }
  function verifyAnswer() {
    if(!state || state.phase!=='challenge')return;
    if(Date.now()<state.lockedUntil){updateChallenge();return;}
    if(Date.now()>=state.endAt){finish('tiempo');return;}
    const text=normalize(byId('answer').value);
    if(!text)return;
    const st=currentStation();
    const ok=st.tipo==='reloj'?verifyClock(text):text===normalize(st.respuesta);
    if(ok){advanceAfterChallenge(false);return;}
    state.failures++;
    const durations=cfg.segundosBloqueoFallos;
    state.lockedUntil=Date.now()+durations[Math.min(state.failures-1,durations.length-1)]*1000;
    save();
    byId('answer-error').innerHTML='<p class="error">ACCESO DENEGADO. ROOT HA LIMITADO LOS INTENTOS.</p>';
    updateChallenge();
  }
  function updateChallenge() {
    if(!state || state.phase!=='challenge')return;
    const sec=Math.max(0,Math.floor((Date.now()-state.stageStartedAt)/1000));
    const locked=Math.max(0,Math.ceil((state.lockedUntil-Date.now())/1000));
    const verify=byId('verify');
    if(verify){verify.disabled=locked>0;verify.textContent=locked?`BLOQUEADO · ${locked} s`:'VERIFICAR CLAVE →';}
    const lock=byId('lock-status');
    if(lock)lock.textContent=locked?`Nuevo intento disponible en ${locked} segundos.`:'';
    const hints=byId('hint-container');
    if(hints)hints.innerHTML=`<div class="panel game-hint"><p class="hint-title">ARCHIVOS CIFRADOS</p>`+
      currentStation().pistas.map((p,i)=>{
        const unlocked=sec>=cfg.segundosPistas[i];
        return `<div class="hint ${unlocked?'unlocked':''}">${unlocked?`<strong>ARCHIVO ${i+1} DESCIFRADO</strong><p>${esc(p)}</p>`:`🔒 ARCHIVO ${i+1} · ${cfg.segundosPistas[i]-sec} s`}</div>`;
      }).join('')+`</div>`;
    const skip=byId('skip-container');
    if(skip){
      const allowed=sec>=cfg.segundosHastaPermitirSalto;
      skip.innerHTML=`<button type="button" id="skip" class="btn ghost" ${allowed?'':'disabled'}>${allowed?'FORZAR SALIDA DE LA FASE →':`FORZAR SALIDA · DISPONIBLE EN ${cfg.segundosHastaPermitirSalto-sec} s`}</button>`;
      if(allowed)byId('skip').onclick=()=>{if(confirm('¿Abandonar esta fase sin recuperar su clave?'))advanceAfterChallenge(true);};
    }
  }
  function timeForAnother() {
    const times=state.stageDurations;
    const average=times.length? times.reduce((a,b)=>a+b,0)/times.length:360;
    return Math.max(cfg.segundosMinimosParaIniciarOtraPrueba,
                    Math.ceil(average+cfg.segundosDesplazamientoEstimados+cfg.segundosVideoFinalEstimados));
  }
  function mayStartAnother() {return secsRemaining()>=timeForAnother();}
  function advanceAfterChallenge(skipped) {
    if(!state || state.phase!=='challenge')return;
    state.stageDurations.push(Math.max(0,Math.round((Date.now()-state.stageStartedAt)/1000)));
    if(skipped)state.skipped++;else state.solved++;
    state.index++;
    state.stageStartedAt=0;
    state.failures=0;state.lockedUntil=0;
    if(state.index>=state.route.length){finish('completo');return;}
    if(!mayStartAnother()){finish('tiempo');return;}
    state.mediaSegment=0;
    setPhase('transmission');
  }
  function finish(reason) {
    if(!state || state.phase==='final')return;
    state.phase='final';state.finalReason=reason;
    state.lockedUntil=0;save();render();
  }
  function renderFinal() {
    app.innerHTML=title('SEÑAL FINAL','ÚLTIMO MENSAJE','ROOT quiere que escuchéis una última cosa.')+
      `<div class="panel"><p class="eyebrow">TRANSMISIÓN FINAL</p>${playerMarkup()}
       <button type="button" class="btn ghost" id="new-game">REINICIAR PARA OTRO EQUIPO</button></div>`;
    mainPlayer=createPlayer(app.querySelector('.media-frame'),[cfg.videos.final],{kind:'final',onFinish:()=>{}});
    byId('new-game').onclick=clearState;
  }
  function renderStart() {
    app.innerHTML=title('CONEXIÓN ESTABLECIDA','ROOT ESTÁ ESPERANDO','Introduce el código de acceso.')+
      `<div class="panel"><form id="start-form">
        <label class="field-label" for="startCode">CÓDIGO DE EQUIPO</label>
        <input class="field mono" id="startCode" type="text" inputmode="numeric" autocomplete="off" maxlength="4" pattern="[0-9]{4}" placeholder="••••" required>
        <button class="btn" type="submit">CONECTAR →</button></form><div id="start-error" role="alert"></div></div>`;
    byId('start-form').addEventListener('submit',e=>{e.preventDefault();startGame();});
  }
  function startGame() {
    const parsed=parseCode(byId('startCode').value);
    if(!parsed){byId('start-error').innerHTML='<p class="error">CÓDIGO RECHAZADO. Comprobad las cifras.</p>';return;}
    const now=Date.now();
    state={version:3,code:parsed.code,phase:'transmission',route:route(parsed.n,parsed.start),
      index:0,solved:0,skipped:0,startedAt:now,endAt:endOfGame(now,parsed.durationMinutes),
      durationMinutes:parsed.durationMinutes,mediaSegment:0,stageStartedAt:0,failures:0,lockedUntil:0,
      stageDurations:[],finalReason:''};
    save();render();
  }
  function clearState() {
    if(state && Date.now()<state.lockedUntil){alert('ROOT ha bloqueado temporalmente los intentos. Espera a que termine la penalización.');return;}
    if(!state || confirm('¿Reiniciar el recorrido? Se perderá el avance de este equipo.')) {
      state=null;save();render();
    }
  }
  function setPhase(phase) {if(!state)return;state.phase=phase;save();render();}
  function updateTimer() {
    if(!state){timer.textContent='--:--';return;}
    if(state.phase!=='final'&&Date.now()>=state.endAt){finish('tiempo');return;}
    // Si ya no es viable empezar la siguiente fase, lanzamos el desenlace.
    if((state.phase==='travel'||(state.phase==='transmission'&&state.index>0))&&!mayStartAnother()){
      finish('tiempo');return;
    }
    if(state.phase==='challenge')updateChallenge();
    if(state.phase==='final'){timer.textContent='FINAL';timer.classList.remove('expired');return;}
    const secs=secsRemaining();
    timer.textContent=`${secs>=3600?Math.floor(secs/3600)+':':''}${two(Math.floor(secs%3600/60))}:${two(secs%60)}`;
    timer.classList.toggle('expired',secs===0);
  }
  function render() {
    cleanupBeforeRender();
    reset.hidden=!state;reset.disabled=!!state && Date.now()<state.lockedUntil;
    if(!state)renderStart();
    else if(state.phase==='transmission')renderTransmission();
    else if(state.phase==='travel')renderTravel();
    else if(state.phase==='challenge')renderChallenge();
    else renderFinal();
    updateTimer();
  }
  reset.addEventListener('click',clearState);
  render();
  setInterval(()=>{
    updateTimer();if(state)reset.disabled=Date.now()<state.lockedUntil;
  },1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateTimer();});
  window.addEventListener('pageshow',updateTimer);
  // Pruebas locales de calidad; no añade ninguna función visible al alumnado.
  window.__secuestroTests={parseCode,route,permutation,classClosingMs,endOfGame,verifyClock,state:()=>state,updateTimer};
})();

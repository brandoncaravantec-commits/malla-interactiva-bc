// Interfaz y almacenamiento. Abre index.html para usar la aplicación.
const CARRERA = CARRERAS.find(c=>c.id===new URLSearchParams(location.search).get('carrera')) || CARRERAS[0];
const CURSOS = CARRERA.courses;
// Conserva el almacenamiento anterior de Administración Pública.
const STORAGE_KEY = CARRERA.id === 'uc-administracion-publica' ? 'malla-adp-planificador-v2' : 'malla-bc-' + CARRERA.id;
document.title = CARRERA.name + ' · malla interactiva bc';
const $ = id => document.getElementById(id);
const find = id => CURSOS.find(c => c.id === id);
const COLORS = {base:'#b7a4c8',prof:'#d6a0b8',minor:'#8ebcae',fg:'#a5b9d7'};
const LABELS = {approved:'✓ Aprobado',current:'◉ En curso',pending:'○ Disponible',locked:'◇ Bloqueado'};
let state = Malla.initial(CARRERA.semesters);
let selected = null;
let draggedId = null;

function announce(message) { $('feedback').textContent = message; }
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    announce('El navegador no permite guardar. Descarga un respaldo antes de cerrar.');
    return false;
  }
}
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    state = Malla.validate(JSON.parse(stored), CURSOS, CARRERA.semesters);
    if (Malla.reconcile(state, CURSOS).length) announce('Se ajustaron estados incompatibles con los prerrequisitos.');
  }
} catch { announce('No se pudo leer el avance guardado. Puedes cargar un respaldo de esta versión.'); }

const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function node(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

function render() {
  const approved = CURSOS.filter(c => Malla.status(state,c) === 'approved');
  const credits = approved.reduce((sum,c) => sum+c.credits,0);
  const total = CURSOS.reduce((sum,c) => sum+c.credits,0);
  $('credits').textContent = `${credits} / ${total}`;
  $('percent').textContent = `${Math.round(credits/total*100)}%`;
  $('progress').style.width = `${credits/total*100}%`;
  $('count').textContent = `${approved.length} / ${CURSOS.length}`;
  $('addSemester').disabled = state.semesters >= Malla.MAX_SEMESTRES;
  const board = $('board');
  const scroll = board.scrollLeft;
  $('semesterNav').replaceChildren();
  for(let n=1;n<=state.semesters;n++) {
    const jump=node('button','',String(n).padStart(2,'0'));
    jump.setAttribute('aria-label','Ir al semestre '+n);
    jump.onclick=()=>{const target=document.getElementById('semester-'+n);board.scrollTo({left:target.offsetLeft-board.offsetLeft,behavior:'smooth'});};
    $('semesterNav').append(jump);
  }
  board.replaceChildren();

  for (let sem=1; sem<=state.semesters; sem++) {
    const column = node('section','semester');
    column.id='semester-'+sem;
    column.setAttribute('aria-label', `Semestre ${sem}`);
    const list = CURSOS.filter(c => Malla.semester(state,c) === sem);
    column.append(node('h2','',`SEMESTRE ${sem}`));
    column.append(node('p','sub',`${list.length} ramos · ${list.reduce((sum,c)=>sum+c.credits,0)} créditos planificados`));
    // HTML Drag and Drop para escritorio. En móvil o con teclado usa Detalles.
    column.addEventListener('dragover', e => {
      if (!draggedId) return;
      e.preventDefault(); e.dataTransfer.dropEffect='move'; column.classList.add('over');
    });
    column.addEventListener('dragleave', e => {
      if (!column.contains(e.relatedTarget)) column.classList.remove('over');
    });
    column.addEventListener('drop', e => {
      e.preventDefault(); column.classList.remove('over');
      const course = find(draggedId);
      draggedId=null;
      if (!course) return;
      Malla.move(state,course,sem);
      if(save()) announce(`${Malla.name(state,course)} movido al semestre ${sem}.`);
      render();
    });

    const visible = list.filter(c => {
      const text = `${Malla.name(state,c)} ${c.name} ${c.code}`;
      return normalize(text).includes(normalize($('search').value)) &&
        ($('filter').value === 'all' || $('filter').value === Malla.status(state,c));
    });
    visible.forEach(c => column.append(card(c)));
    if (!visible.length) column.append(node('p','empty',list.length?'Sin coincidencias con el filtro':'Arrastra un ramo aquí'));
    board.append(column);
  }
  board.scrollLeft = scroll;
}

function card(c) {
  const status = Malla.status(state,c);
  const card = node('article',`course ${status} ${status==='pending'?'available':''}`);
  card.style.setProperty('--cat', COLORS[c.cat]);
  card.draggable = true;
  card.addEventListener('dragstart', e => {
    draggedId=c.id; e.dataTransfer.setData('text/plain',c.id); e.dataTransfer.effectAllowed='move';
  });
  card.addEventListener('dragend', () => {
    draggedId=null;
    document.querySelectorAll('.over').forEach(n=>n.classList.remove('over'));
  });
  card.append(node('h3','',Malla.name(state,c)));
  if (Malla.entry(state,c.id).name) card.append(node('div','slot',c.name));
  card.append(node('div','meta',`${c.code||'Electivo'} · ${c.credits} cr. · Origen: S${c.sem}`));
  card.append(node('div','state',LABELS[status]));
  if (Malla.conflicts(state,c,CURSOS).length) card.append(node('p','conflict','⚠ Revisa el orden: hay prerrequisitos pendientes en este semestre o después.'));
  const actions=node('div','row');
  const approve=node('button','',status==='approved'?'Desmarcar':'Aprobar');
  approve.disabled = status==='locked';
  approve.setAttribute('aria-label',`${status==='approved'?'Desmarcar':'Aprobar'} ${Malla.name(state,c)}`);
  approve.onclick=()=>updateStatus(c,status==='approved'?'pending':'approved');
  const details=node('button','','Detalles');
  details.setAttribute('aria-label',`Detalles de ${Malla.name(state,c)}`);
  details.onclick=()=>openDetail(c);
  actions.append(approve,details); card.append(actions);
  return card;
}

function applyStatus(next,c,value) {
  const changed=Malla.setStatus(next,c,value,CURSOS);
  if (changed.length && !confirm(`Este cambio dejará pendientes ${changed.length} ramos dependientes: ${changed.map(id=>Malla.name(next,find(id))).join(', ')}. ¿Continuar?`)) return false;
  return true;
}
function updateStatus(c,value) {
  const next=structuredClone(state);
  try {
    if(!applyStatus(next,c,value)) return;
    state=next;
    if(save()) announce('Avance guardado. Se actualizaron los ramos habilitados.');
    render();
  } catch(e) { announce(e.message); }
}

function openDetail(c) {
  selected=c;
  $('title').textContent=Malla.name(state,c);
  $('description').textContent=`${c.name} · ${c.code||'Electivo'} · ${c.credits} créditos`;
  $('dependencies').replaceChildren();
  const requires=c.requires.map(id=>`${Malla.entry(state,id).status==='approved'?'✓':'○'} ${Malla.name(state,find(id))}`);
  const unlocks=CURSOS.filter(r=>r.requires.includes(c.id)).map(r=>Malla.name(state,r));
  $('dependencies').append(node('p','',`Requiere aprobar: ${requires.join(' + ')||'Sin prerrequisitos registrados'}.`));
  $('dependencies').append(node('p','',`Es prerrequisito de: ${unlocks.join(', ')||'Ningún ramo registrado'}.`));
  $('nameField').hidden=!c.editable;
  $('customName').value=Malla.entry(state,c.id).name||'';
  $('semesterSelect').replaceChildren();
  for(let sem=1;sem<=state.semesters;sem++) {
    const option=node('option','',`Semestre ${sem}`); option.value=sem; $('semesterSelect').append(option);
  }
  $('semesterSelect').value=Malla.semester(state,c);
  $('statusSelect').value=Malla.entry(state,c.id).status||'pending';
  const blocked=Malla.missing(state,c).length>0;
  [...$('statusSelect').options].forEach(o=>o.disabled=blocked&&o.value!=='pending');
  $('warning').textContent=blocked?'Puedes mover este ramo, pero para cursarlo o aprobarlo necesitas completar sus prerrequisitos.':'';
  $('detail').showModal();
}
$('close').onclick=()=>$('detail').close();
$('saveDetail').onclick=()=>{
  const next=structuredClone(state);
  try {
    Malla.move(next,selected,Number($('semesterSelect').value));
    if(selected.editable) next.courses[selected.id].name=$('customName').value.trim();
    if(!applyStatus(next,selected,$('statusSelect').value)) return;
    state=next;
    if(save()) announce('Cambios guardados.');
    render(); $('detail').close();
  } catch(e) { $('warning').textContent=e.message; }
};
$('search').oninput=render;
$('filter').onchange=render;
$('addSemester').onclick=()=>{
  if(state.semesters>=Malla.MAX_SEMESTRES) return;
  state.semesters++;
  if(save()) announce(`Se agregó el semestre ${state.semesters}.`);
  render(); $('board').scrollLeft=$('board').scrollWidth;
};
$('resetPlan').onclick=()=>{
  if(!confirm('¿Volver a los '+CARRERA.semesters+' semestres originales? Se conservarán tus aprobaciones y los nombres personalizados.')) return;
  state.semesters=CARRERA.semesters;
  Object.values(state.courses).forEach(v=>delete v.semester);
  if(save()) announce('Distribución original restaurada.');
  render();
};
$('export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({...state,careerId:CARRERA.id},null,2)],{type:'application/json'}));
  const a=node('a'); a.href=url; a.download='malla-bc-'+CARRERA.id+'.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('import').onclick=()=>$('file').click();
$('file').onchange=async()=>{
  const file=$('file').files[0]; if(!file) return;
  try {
    if(file.size>1000000) throw Error('El archivo es demasiado grande.');
    const raw=JSON.parse(await file.text());
    if(raw.careerId ? raw.careerId!==CARRERA.id : CARRERA.id!=='uc-administracion-publica') throw Error('Este respaldo corresponde a otra carrera.');
    const next=Malla.validate(raw,CURSOS,CARRERA.semesters);
    const adjusted=Malla.reconcile(next,CURSOS);
    if(!confirm(`¿Reemplazar tu plan con este respaldo?${adjusted.length?' Los estados incompatibles con los prerrequisitos se cambiarán a pendiente.':''}`)) return;
    state=next;
    if(save()) announce('Respaldo cargado.');
    render();
  } catch(e) { announce('No se cargó el respaldo: '+e.message); }
  finally { $('file').value=''; }
};
// Identidad y selector del catálogo. Por ahora solo se ofrece la carrera cargada.
$('careerTitle').textContent=CARRERA.name;
$('university').textContent=CARRERA.university;
$('duration').textContent=CARRERA.semesters+' semestres';
$('totalCredits').textContent=CURSOS.reduce((sum,c)=>sum+c.credits,0)+' créditos';
for(const career of CARRERAS) {
  const option=node('option','',career.name); option.value=career.id; $('careerSelect').append(option);
}
$('careerSelect').value=CARRERA.id;
$('careerSelect').onchange=()=>{
  if(!save()) { $('careerSelect').value=CARRERA.id; return; }
  const url=new URL(location.href);url.searchParams.set('carrera',$('careerSelect').value);location.href=url.href;
};
$('previousColumns').onclick=()=>$('board').scrollBy({left:-500,behavior:'smooth'});
$('nextColumns').onclick=()=>$('board').scrollBy({left:500,behavior:'smooth'});
render();


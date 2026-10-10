// Interfaz y almacenamiento. Abre index.html para usar la aplicación.
const CARRERA = CARRERAS.find(c=>c.id===new URLSearchParams(location.search).get('carrera')) || CARRERAS[0];
let CURSOS = [...CARRERA.courses];
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
    state = Malla.validate(JSON.parse(stored), CARRERA.courses, CARRERA.semesters);
    CURSOS = [...CARRERA.courses,...state.customCourses];
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
  CURSOS = [...CARRERA.courses,...state.customCourses];
  const approved = CURSOS.filter(c => Malla.status(state,c) === 'approved');
  const credits = approved.reduce((sum,c) => sum+c.credits,0);
  const total = CURSOS.reduce((sum,c) => sum+c.credits,0);
  $('totalCredits').textContent=total+' créditos en tu plan';
  $('credits').textContent = `${credits} / ${total}`;
  $('percent').textContent = `${(total ? Math.round(credits/total*100) : 0)}%`;
  $('progress').style.width = `${total ? credits/total*100 : 0}%`;
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
    const list = Malla.ordered(state,CURSOS,sem);
    column.append(node('h2','',`SEMESTRE ${sem}`));
    column.append(node('p','sub',`${list.length} ramos · ${list.reduce((sum,c)=>sum+c.credits,0)} créditos planificados`));
    // HTML Drag and Drop para escritorio. En móvil o con teclado usa Detalles.
    column.addEventListener('dragover', e => {
      if (!draggedId) return;
      e.preventDefault(); e.dataTransfer.dropEffect='move'; column.classList.add('over');
      document.querySelectorAll('.drop-before,.drop-after').forEach(n=>n.classList.remove('drop-before','drop-after'));
      const hit=e.target.closest('.course');
      if(hit&&hit.dataset.courseId!==draggedId) hit.classList.add(e.clientY < hit.getBoundingClientRect().top+hit.getBoundingClientRect().height/2?'drop-before':'drop-after');
    });
    column.addEventListener('dragleave', e => {
      if (!column.contains(e.relatedTarget)) column.classList.remove('over');
    });
    column.addEventListener('drop', e => {
      e.preventDefault(); column.classList.remove('over');
      const course = find(draggedId);
      draggedId=null;
      if (!course) return;
      const target=Malla.ordered(state,CURSOS,sem).filter(c=>c.id!==course.id);
      const hit=e.target.closest('.course');
      let index=target.length;
      if(hit) {
        if(hit.dataset.courseId===course.id) { render(); return; }
        const found=target.findIndex(c=>c.id===hit.dataset.courseId);
        if(found>=0) index=found+(e.clientY >= hit.getBoundingClientRect().top+hit.getBoundingClientRect().height/2?1:0);
      }
      Malla.moveAt(state,course,sem,index,CURSOS);
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
  card.dataset.courseId=c.id;
  card.addEventListener('dragstart', e => {
    draggedId=c.id; e.dataTransfer.setData('text/plain',c.id); e.dataTransfer.effectAllowed='move';
  });
  card.addEventListener('dragend', () => {
    draggedId=null;
    document.querySelectorAll('.over,.drop-before,.drop-after').forEach(n=>n.classList.remove('over','drop-before','drop-after'));
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
  const orderActions=node('div','order-actions');
  const siblings=Malla.ordered(state,CURSOS,Malla.semester(state,c));
  const currentIndex=siblings.findIndex(r=>r.id===c.id);
  for(const [label,delta] of [['↑',-1],['↓',1]]) {
    const button=node('button','',label);button.type='button';
    button.setAttribute('aria-label',(delta<0?'Subir ':'Bajar ')+Malla.name(state,c));
    button.disabled=currentIndex+delta<0||currentIndex+delta>=siblings.length;
    button.onclick=()=>{Malla.moveAt(state,c,Malla.semester(state,c),currentIndex+delta,CURSOS);if(save()) announce('Orden guardado.');render();const refreshed=document.querySelector('[data-course-id="'+c.id+'"]');refreshed?.querySelector('.order-actions button:nth-child('+(delta<0?1:2)+')')?.focus({preventScroll:true});};
    orderActions.append(button);
  }
  orderActions.prepend(node('span','', 'Ordenar'));card.append(orderActions);
  return card;
}

async function applyStatus(next,c,value) {
  const changed=Malla.setStatus(next,c,value,CURSOS);
  if (changed.length && !await askConfirmation(`Este cambio dejará pendientes ${changed.length} ramos dependientes: ${changed.map(id=>Malla.name(next,find(id))).join(', ')}. ¿Continuar?`)) return false;
  return true;
}
async function updateStatus(c,value) {
  const next=clonePlan(state);
  try {
    if(!await applyStatus(next,c,value)) return;
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
  fillPositions();
  $('statusSelect').value=Malla.entry(state,c.id).status||'pending';
  const blocked=Malla.missing(state,c).length>0;
  [...$('statusSelect').options].forEach(o=>o.disabled=blocked&&o.value!=='pending');
  $('warning').textContent=blocked?'Puedes mover este ramo, pero para cursarlo o aprobarlo necesitas completar sus prerrequisitos.':'';
  openPanel($('detail'));
}
$('close').onclick=()=>closePanel($('detail'));
$('saveDetail').onclick=async()=>{
  const next=clonePlan(state);
  try {
    Malla.moveAt(next,selected,Number($('semesterSelect').value),Number($('positionSelect').value),CURSOS);
    if(selected.editable) next.courses[selected.id].name=$('customName').value.trim();
    if(!await applyStatus(next,selected,$('statusSelect').value)) return;
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
$('resetPlan').onclick=async()=>{
  if(!await askConfirmation('¿Volver a los '+CARRERA.semesters+' semestres originales? Se conservarán tus aprobaciones, los nombres y los ramos agregados en su semestre de creación.')) return;
  state.semesters=Math.max(CARRERA.semesters,...state.customCourses.map(c=>c.sem));
  Object.values(state.courses).forEach(v=>{delete v.semester;delete v.order;});
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
    const next=Malla.validate(raw,CARRERA.courses,CARRERA.semesters);
    const adjusted=Malla.reconcile(next,[...CARRERA.courses,...next.customCourses]);
    if(!await askConfirmation(`¿Reemplazar tu plan con este respaldo?${adjusted.length?' Los estados incompatibles con los prerrequisitos se cambiarán a pendiente.':''}`)) return;
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
// El reinicio afecta exclusivamente a la carrera activa, no a otras carreras.
$('resetAll').onclick=async()=>{
  if(!await askConfirmation('¿Reiniciar toda la malla de '+CARRERA.name+'? Se borrarán aprobaciones, ramos en curso, nombres personalizados, movimientos, semestres extra y ramos agregados. Puedes cancelar y guardar un respaldo primero.')) return;
  state=Malla.initial(CARRERA.semesters);
  selected=null; draggedId=null;
  $('search').value=''; $('filter').value='all';
  if(save()) announce('Tu malla volvió a su estado inicial.');
  render(); $('board').scrollLeft=0;
};
$('addCourse').onclick=()=>{
  $('newCourseForm').reset(); $('newCourseError').textContent='';
  $('newSemester').replaceChildren();
  for(let sem=1;sem<=state.semesters;sem++) {
    const option=node('option','','Semestre '+sem);option.value=sem;$('newSemester').append(option);
  }
  $('newRequirements').replaceChildren();
  for(const c of CURSOS) {
    const label=node('label'); const input=node('input');input.type='checkbox';input.value=c.id;
    label.append(input,document.createTextNode(' '+Malla.name(state,c)+(c.code?' ('+c.code+')':'')));
    $('newRequirements').append(label);
  }
  openPanel($('newCourse')); $('newName').focus();
};
$('closeNewCourse').onclick=()=>closePanel($('newCourse'));
$('newCourseForm').onsubmit=e=>{
  e.preventDefault();
  try {
    const next=clonePlan(state);
    const id='custom-'+(globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    next.customCourses.push({id,name:$('newName').value.trim(),code:$('newCode').value.trim(),credits:Number($('newCredits').value),sem:Number($('newSemester').value),cat:$('newCategory').value,requires:[...$('newRequirements').querySelectorAll('input:checked')].map(n=>n.value),editable:true});
    state=Malla.validate(next,CARRERA.courses,CARRERA.semesters);
    const all=[...CARRERA.courses,...state.customCourses],added=all.find(c=>c.id===id);
    Malla.moveAt(state,added,added.sem,Malla.ordered(state,all,added.sem).filter(c=>c.id!==id).length,all);
    $('search').value=''; $('filter').value='all';
    if(save()) announce('Ramo agregado a tu plan. También se incluirá en tus respaldos.');
    render(); $('newCourse').close();
    const target=$('semester-'+Malla.semester(state,find(id)));
    $('board').scrollTo({left:target.offsetLeft-$('board').offsetLeft,behavior:'smooth'});
  } catch(e) { $('newCourseError').textContent=e.message; }
};

function fillPositions() {
  const sem=Number($('semesterSelect').value);
  const all=Malla.ordered(state,CURSOS,sem);
  const peers=all.filter(c=>c.id!==selected.id);
  const oldIndex=all.findIndex(c=>c.id===selected.id);
  $('positionSelect').replaceChildren();
  for(let i=0;i<=peers.length;i++) {
    const text=i===peers.length?'Al final':i===0?'Al principio':'Antes de '+Malla.name(state,peers[i]);
    const option=node('option','',(i+1)+'. '+text);option.value=i;$('positionSelect').append(option);
  }
  $('positionSelect').value=oldIndex<0?peers.length:oldIndex;
}
$('semesterSelect').onchange=fillPositions;
const THEME_KEY='malla-bc-theme';
let theme='pink';
try {const savedTheme=localStorage.getItem(THEME_KEY);if(['pink','uc','dark'].includes(savedTheme)) theme=savedTheme;}catch{}
function applyTheme(value) {document.documentElement.dataset.theme=value;$('themeSelect').value=value;}
applyTheme(theme);
$('themeSelect').onchange=()=>{applyTheme($('themeSelect').value);try{localStorage.setItem(THEME_KEY,$('themeSelect').value);}catch{announce('Tema aplicado durante esta sesión.');}};
render();

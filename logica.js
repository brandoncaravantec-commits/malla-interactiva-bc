// Funciones puras: no dependen del navegador y se pueden probar con Node.
const Malla = (() => {
  const MAX_SEMESTRES = 30;
  const initial = (semesters=10) => ({version:2, semesters, courses:{}, customCourses:[]});
  const entry = (state,id) => state.courses[id] || {};
  const semester = (state,c) => entry(state,c.id).semester || c.sem;
  const name = (state,c) => entry(state,c.id).name || c.name;
  const credits = (state,c) => entry(state,c.id).credits ?? c.credits;
  function setCredits(state,c,value) {
    if(!Number.isInteger(value)||value<0||value>100) throw Error('Ingresa créditos enteros entre 0 y 100.');
    state.courses[c.id]={...entry(state,c.id),credits:value};
  }
  const missing = (state,c) => c.requires.filter(id => entry(state,id).status !== 'approved');
  const status = (state,c) => entry(state,c.id).status === 'approved' ? 'approved'
    : missing(state,c).length ? 'locked'
    : entry(state,c.id).status === 'current' ? 'current' : 'pending';

  function move(state,c,sem) {
    if (!Number.isInteger(sem) || sem < 1 || sem > state.semesters) throw Error('Semestre inválido.');
    state.courses[c.id] = {...entry(state,c.id), semester:sem};
  }

  function ordered(state,courses,sem) {
    return courses.map((c,index)=>({c,index})).filter(({c})=>semester(state,c)===sem)
      .sort((a,b)=>(entry(state,a.c.id).order ?? a.index)-(entry(state,b.c.id).order ?? b.index)||a.index-b.index).map(({c})=>c);
  }
  // Posición desde cero, calculada sin incluir el ramo que se está moviendo.
  function moveAt(state,c,sem,index,courses) {
    const source=semester(state,c);
    const target=ordered(state,courses,sem).filter(r=>r.id!==c.id);
    if(!Number.isInteger(index)||index<0||index>target.length) throw Error('Posición inválida.');
    move(state,c,sem);
    target.splice(index,0,c);
    target.forEach((r,i)=>state.courses[r.id]={...entry(state,r.id),order:i});
    if(source!==sem) ordered(state,courses,source).forEach((r,i)=>state.courses[r.id]={...entry(state,r.id),order:i});
  }

  // Si se desmarca un prerrequisito, sus dependientes vuelven a pendiente.
  // Repetimos hasta cubrir la cadena completa, sin depender del orden de los ramos.
  function reconcile(state,courses) {
    const changed=[];
    let again;
    do {
      again=false;
      for (const c of courses) {
        const s=entry(state,c.id).status;
        if ((s==='approved'||s==='current') && missing(state,c).length) {
          state.courses[c.id]={...entry(state,c.id),status:'pending'};
          changed.push(c.id); again=true;
        }
      }
    } while(again);
    return changed;
  }

  function setStatus(state,c,value,courses) {
    if (!['pending','current','approved'].includes(value)) throw Error('Estado inválido.');
    if (value!=='pending' && missing(state,c).length) throw Error('Primero aprueba todos los prerrequisitos.');
    state.courses[c.id]={...entry(state,c.id),status:value};
    return reconcile(state,courses);
  }

  // Mover un ramo nunca lo aprueba: la planificación y la aprobación son independientes.
  function conflicts(state,c,courses) {
    return c.requires.filter(id => {
      const prerequisite=courses.find(r=>r.id===id);
      return entry(state,id).status!=='approved' && semester(state,prerequisite)>=semester(state,c);
    });
  }

  function validate(raw,courses,baseSemesters=10) {
    if (!raw || raw.version!==2 || !Number.isInteger(raw.semesters) || raw.semesters<baseSemesters || raw.semesters>MAX_SEMESTRES || !raw.courses || typeof raw.courses!=='object' || Array.isArray(raw.courses)) throw Error('Respaldo incompatible. Se requiere un respaldo de esta versión.');
    const clean=initial(); clean.semesters=raw.semesters;
    const custom=raw.customCourses ?? [];
    if(!Array.isArray(custom)||custom.length>200) throw Error('Lista de ramos personalizados inválida (máximo 200).');
    const ids=new Set(courses.map(c=>c.id));
    for(const c of custom) {
      if(!c || typeof c.id!=='string' || !/^custom-[a-zA-Z0-9-]+$/.test(c.id) || ids.has(c.id)) throw Error('Identificador de ramo personalizado inválido o repetido.');
      if(typeof c.name!=='string'||!c.name.trim()||c.name.length>120||typeof c.code!=='string'||c.code.length>30) throw Error('Nombre o sigla inválidos.');
      if(!Number.isInteger(c.credits)||c.credits<0||c.credits>100||!Number.isInteger(c.sem)||c.sem<1||c.sem>raw.semesters) throw Error('Créditos o semestre inválidos.');
      if(!['base','prof','fg','minor'].includes(c.cat)||!Array.isArray(c.requires)||c.requires.some(id=>typeof id!=='string')) throw Error('Categoría o prerrequisitos inválidos.');
      ids.add(c.id);
      clean.customCourses.push({id:c.id,name:c.name.trim(),code:c.code.trim(),credits:c.credits,sem:c.sem,cat:c.cat,requires:[...new Set(c.requires)],editable:true});
    }
    courses=[...courses,...clean.customCourses];
    const visiting=new Set(),visited=new Set();
    function visit(c) {
      if(visiting.has(c.id)) throw Error('Los prerrequisitos forman un ciclo.');
      if(visited.has(c.id)) return;
      visiting.add(c.id);
      for(const id of c.requires) {
        const r=courses.find(r=>r.id===id);
        if(!r) throw Error('Prerrequisito inexistente.');
        visit(r);
      }
      visiting.delete(c.id); visited.add(c.id);
    }
    courses.forEach(visit);
    for(const [id,value] of Object.entries(raw.courses)) {
      const c=courses.find(r=>r.id===id);
      if(!c || !value || typeof value!=='object' || Array.isArray(value)) throw Error('Ramo inválido en respaldo.');
      const v={};
      if(value.credits!==undefined) {
        if(!Number.isInteger(value.credits)||value.credits<0||value.credits>100) throw Error('Créditos inválidos en respaldo.');
        v.credits=value.credits;
      }
      if(value.order!==undefined) {
        if(!Number.isInteger(value.order)||value.order<0||value.order>courses.length) throw Error('Posición inválida en respaldo.');
        v.order=value.order;
      }
      if(value.semester!==undefined) {
        if(!Number.isInteger(value.semester)||value.semester<1||value.semester>raw.semesters) throw Error('Semestre inválido en respaldo.');
        v.semester=value.semester;
      }
      if(value.status!==undefined) {
        if(!['pending','current','approved'].includes(value.status)) throw Error('Estado inválido en respaldo.');
        v.status=value.status;
      }
      if(value.name!==undefined) {
        if(!c.editable || typeof value.name!=='string'||value.name.length>120) throw Error('Nombre inválido en respaldo.');
        v.name=value.name.trim();
      }
      clean.courses[id]=v;
    }
    return clean;
  }
  return {MAX_SEMESTRES,initial,entry,semester,name,credits,setCredits,missing,status,move,moveAt,ordered,reconcile,setStatus,conflicts,validate};
})();
if(typeof module!=='undefined') module.exports=Malla;

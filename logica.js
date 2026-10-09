// Funciones puras: no dependen del navegador y se pueden probar con Node.
const Malla = (() => {
  const MAX_SEMESTRES = 30;
  const initial = (semesters=10) => ({version:2, semesters, courses:{}});
  const entry = (state,id) => state.courses[id] || {};
  const semester = (state,c) => entry(state,c.id).semester || c.sem;
  const name = (state,c) => entry(state,c.id).name || c.name;
  const missing = (state,c) => c.requires.filter(id => entry(state,id).status !== 'approved');
  const status = (state,c) => entry(state,c.id).status === 'approved' ? 'approved'
    : missing(state,c).length ? 'locked'
    : entry(state,c.id).status === 'current' ? 'current' : 'pending';

  function move(state,c,sem) {
    if (!Number.isInteger(sem) || sem < 1 || sem > state.semesters) throw Error('Semestre inválido.');
    state.courses[c.id] = {...entry(state,c.id), semester:sem};
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
    for(const [id,value] of Object.entries(raw.courses)) {
      const c=courses.find(r=>r.id===id);
      if(!c || !value || typeof value!=='object' || Array.isArray(value)) throw Error('Ramo inválido en respaldo.');
      const v={};
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
  return {MAX_SEMESTRES,initial,entry,semester,name,missing,status,move,reconcile,setStatus,conflicts,validate};
})();
if(typeof module!=='undefined') module.exports=Malla;

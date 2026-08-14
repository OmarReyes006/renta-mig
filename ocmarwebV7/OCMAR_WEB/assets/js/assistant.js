(()=>{
  const K=window.OCMAR_KNOWLEDGE||{};
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const log=$('#chatlog'), text=$('#chatText'), send=$('#sendBtn'), file=$('#partImages'), strip=$('#previewStrip'), stage=$('#imageStage');
  let images=[]; let lastResult=null; let conversation=[];

  if($('#kbComponents')) $('#kbComponents').textContent=(K.components?.length||0)+'+';
  if($('#knowledgeTicker')&&K.components) $('#knowledgeTicker').textContent=K.components.map(x=>x.name).join(' · ');

  const normalize=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const matchCount=(s,keys=[])=>keys.reduce((n,k)=>n+(s.includes(normalize(k))?1:0),0);
  const add=(role,msg)=>{
    const d=document.createElement('div'); d.className='msg '+role;
    if(role==='bot'){const label=document.createElement('span');label.className='bot-label';label.textContent='OCMAR';d.appendChild(label)}
    d.appendChild(document.createTextNode(msg)); log.appendChild(d); log.scrollTop=log.scrollHeight;
    conversation.push({role,msg});
  };
  const fillList=(sel,items,empty)=>{
    const ul=$(sel); if(!ul)return; ul.textContent='';
    (items?.length?items:[empty]).forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.appendChild(li)});
  };

  const chooseBest=(s,list,threshold=1)=>{
    let best=null,score=0;
    (list||[]).forEach(item=>{const sc=matchCount(s,item.keys);if(sc>score){score=sc;best=item}});
    return score>=threshold?{item:best,score}:null;
  };
  const getIndustryHints=s=>{
    const out=[];
    Object.entries(K.industries||{}).forEach(([key,vals])=>{if(s.includes(normalize(key))) out.push(...vals)});
    return [...new Set(out)];
  };
  const inferIntent=s=>{
    if(/^(hola|buenas|buen dia|buenos dias|que tal|hey)\b/.test(s)) return 'greeting';
    if(/que servicios|servicios ofrecen|que hacen|que puede hacer ocmar|a que se dedican/.test(s)) return 'services';
    if(/cotiz|precio|cuanto cuesta|costo/.test(s)) return 'quote';
    if(/fabric|hacer nuev|copiar pieza|reproduc/.test(s)) return 'manufacture';
    if(/repar|recuper|arregl|componer/.test(s)) return 'repair';
    if(/material|acero|aluminio|bronce|inox|4140|1045|1018|nylon|delrin/.test(s)) return 'material';
    if(/torno|tornear|fres|sold|rectific|tratamiento|temple/.test(s)) return 'process';
    if(/no se como se llama|no se que pieza|que pieza es|identificar/.test(s)) return 'identify';
    return 'general';
  };

  const analyzeText=desc=>{
    const s=normalize(desc);
    const comp=chooseBest(s,K.components);
    const failures=(K.failures||[]).filter(x=>matchCount(s,x.keys)>0);
    const materials=(K.materials||[]).filter(x=>matchCount(s,x.keys)>0);
    const processes=(K.processes||[]).filter(x=>matchCount(s,x.keys)>0);
    const industryHints=getIndustryHints(s);
    const intent=inferIntent(s);
    let confidence='BAJO';
    if(comp?.score>=2) confidence='ALTO'; else if(comp) confidence='MEDIO';
    const item=comp?.item||null;

    let observed=[];
    if(item) observed.push(`${item.name}: ${item.fn}`);
    if(failures.length) observed.push(`Falla descrita: ${failures.map(x=>x.label).join(', ')}.`);
    if(materials.length) observed.push(`Material mencionado: ${materials.map(x=>x.name).join(', ')}.`);
    if(industryHints.length) observed.push(`Por la aplicación conviene confirmar: ${industryHints.slice(0,4).join(', ')}.`);
    if(!observed.length) observed.push('Todavía no hay suficiente información para identificar el componente; el caso puede avanzar por función, falla y aplicación.');

    const damage=[...(item?.damage||[])]; failures.forEach(f=>damage.push(...f.notes));
    const causes=[...(item?.causes||[])];
    const options=[...(item?.options||[])];
    const measurements=[...(item?.measurements||[])];
    const questions=[...(item?.questions||[])];

    if(intent==='manufacture'){
      options.unshift('Para fabricar desde muestra conviene documentar geometría, medidas funcionales, material si se conoce y aplicación.');
      measurements.push('muestra física o plano/croquis','cantidad requerida','tolerancias o ajustes críticos si se conocen');
    }
    if(intent==='repair') options.unshift('Antes de reparar conviene definir si el daño es localizado y si el material base conserva suficiente sección sana.');
    if(processes.length) processes.forEach(p=>options.push(`${p.name}: ${p.note}`));
    if(materials.length) materials.forEach(m=>options.push(`${m.name}: ${m.note}`));
    if(industryHints.length) measurements.push(...industryHints);
    if(!questions.length) questions.push(...(K.genericQuestions||[]).slice(0,4));
    if(!measurements.length) measurements.push('dimensiones generales','fotografía general y detalle','aplicación/máquina','material si se conoce');
    if(!options.length) options.push('Identificar primero la función del componente y la zona dañada.','Con muestra, medidas o fotografías adicionales se puede preparar mejor la solicitud de revisión.');
    if(!damage.length) damage.push('zona exacta del problema','juego, deformación, fractura, desgaste o ruido','condición de la pieza compañera');
    if(!causes.length) causes.push('desgaste por operación','desalineación o juego','lubricación/contaminación','sobrecarga o condición de montaje');

    return {item,intent,confidence,observed:[...new Set(observed)],damage:[...new Set(damage)].slice(0,8),causes:[...new Set(causes)].slice(0,7),options:[...new Set(options)].slice(0,8),measurements:[...new Set(measurements)].slice(0,9),questions:[...new Set(questions)].slice(0,6),failures,materials,processes,desc};
  };

  const render=result=>{
    lastResult=result;
    $('#compName').textContent=result.item?.name || (result.intent==='identify'?'Componente por identificar':'Caso industrial por definir');
    $('#observed').textContent=result.observed.join(' ');
    fillList('#damage',result.damage,'Sin datos.'); fillList('#causes',result.causes,'Sin datos.'); fillList('#options',result.options,'Sin datos.'); fillList('#measurements',result.measurements,'Sin datos.'); fillList('#questions',result.questions,'Sin datos.');
    $('#confidence').textContent=result.confidence;
    $('#confidence').title='Confianza basada en la descripción escrita; no es confianza de visión artificial.';
    const store={component:result.item?.name||'',description:result.desc,observed:result.observed,damage:result.damage,causes:result.causes,options:result.options,measurements:result.measurements,questions:result.questions};
    sessionStorage.setItem('ocmar_last_diagnosis',JSON.stringify(store));
  };

  const buildReply=result=>{
    if(result.intent==='greeting') return 'Hola. Cuéntame qué pieza o problema tienes. Si no sabes cómo se llama, dime en qué máquina trabaja, qué movimiento hace y qué falla notas.';
    if(result.intent==='services') return 'OCMAR está enfocado en maquinado, fresado, soldadura, fabricación de piezas, reparación/recuperación de componentes y mantenimiento industrial. Si me dices qué pieza o problema tienes, puedo llevarlo a un caso concreto y decirte qué información conviene reunir.';
    if(result.intent==='quote'&&!result.item) return 'Puedo ayudarte a preparar la cotización, pero primero conviene definir la pieza o el trabajo. Dime qué necesitas fabricar/reparar, en qué equipo se usa y qué información tienes: medidas, fotos, muestra o plano.';
    if(result.item){
      const f=result.failures[0]?.label;
      let msg=`Por la descripción, el componente probable es: ${result.item.name}. ${result.item.fn}`;
      if(f) msg+=` También mencionas una condición compatible con ${f.toLowerCase()}.`;
      msg+=`\n\nRuta preliminar: ${result.options.slice(0,2).join(' ')}`;
      msg+=`\n\nPara avanzar, lo más útil sería confirmar: ${result.measurements.slice(0,5).join(', ')}.`;
      if(result.questions[0]) msg+=`\n\nPrimera pregunta: ${result.questions[0]}`;
      return msg;
    }
    if(result.materials.length) return `Sí puedo orientarte sobre el material mencionado. ${result.materials.map(x=>`${x.name}: ${x.note}`).join(' ')} Para elegir material correctamente necesito saber qué pieza es, qué carga recibe, si hay desgaste/corrosión y si existe contacto con alimentos o temperatura.`;
    if(result.processes.length) return `${result.processes.map(x=>`${x.name}: ${x.note}`).join(' ')} Dime qué geometría o reparación buscas y puedo decirte qué datos hacen falta para preparar el trabajo.`;
    if(result.intent==='identify') return 'Aunque no sepas cómo se llama, podemos acercarnos por función. Dime: ¿la pieza gira, se desliza, soporta otra pieza, transmite con cadena/banda/engranes, sella, corta o guía? También ayuda saber la máquina donde va y subir varias vistas.';
    return `Todavía no puedo ponerle un nombre confiable, pero sí puedo organizar el caso. Por lo que escribiste conviene revisar: ${result.damage.slice(0,3).join(', ')}. Para ubicar mejor la solución dime en qué máquina trabaja, qué función realiza y qué parte exacta está dañada.`;
  };

  const submit=()=>{
    const v=text.value.trim(); if(!v&&images.length===0)return;
    if(v){add('user',v);text.value='';const result=analyzeText(v);render(result);setTimeout(()=>add('bot',buildReply(result)),160)}
    else {add('user',`Adjunté ${images.length} fotografía(s) de la pieza.`);setTimeout(()=>add('bot','Ya revisé la calidad básica de las imágenes. Para reconocer visualmente la pieza y sus daños de forma real se necesita activar el backend multimodal. Mientras tanto, dime qué pieza crees que es, dónde trabaja o qué daño notas y puedo razonar con la base industrial local.'),120)}
  };

  const analyzePhotoQuality=async f=>{
    return new Promise(resolve=>{
      const img=new Image(); const url=URL.createObjectURL(f);
      img.onload=()=>{
        try{
          const canvas=document.createElement('canvas'); const size=90; canvas.width=size;canvas.height=size; const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,size,size);const data=ctx.getImageData(0,0,size,size).data;
          let sum=0,sum2=0,n=0;for(let i=0;i<data.length;i+=16){const y=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];sum+=y;sum2+=y*y;n++}const mean=sum/n,sd=Math.sqrt(Math.max(0,sum2/n-mean*mean));
          let q='Buena'; const tips=[]; if(img.naturalWidth<800||img.naturalHeight<600){q='Mejorable';tips.push('resolución baja')} if(mean<55){q='Mejorable';tips.push('imagen oscura')} if(mean>225){q='Mejorable';tips.push('imagen muy clara')} if(sd<28){q='Mejorable';tips.push('poco contraste')}
          resolve({width:img.naturalWidth,height:img.naturalHeight,quality:q,tips});
        }catch{resolve({width:img.naturalWidth,height:img.naturalHeight,quality:'Disponible',tips:[]})}finally{URL.revokeObjectURL(url)}
      }; img.onerror=()=>resolve(null); img.src=url;
    })
  };

  const refreshImages=async()=>{
    strip.textContent='';
    images.forEach((f,i)=>{
      const wrap=document.createElement('div');wrap.className='thumb-wrap';const im=document.createElement('img');im.className='thumb';im.alt=`Vista ${i+1}`;const url=URL.createObjectURL(f);im.src=url;const rm=document.createElement('button');rm.className='thumb-remove';rm.type='button';rm.textContent='×';rm.addEventListener('click',()=>{images.splice(i,1);refreshImages()});wrap.append(im,rm);strip.appendChild(wrap);
    });
    if(images.length){const url=URL.createObjectURL(images[0]);stage.textContent='';const im=document.createElement('img');im.src=url;im.alt='Pieza cargada por el usuario';stage.appendChild(im);const q=await analyzePhotoQuality(images[0]);if(q){$('#photoQuality').classList.remove('hidden');$('#photoQuality').innerHTML=`<b>Calidad de evidencia: ${q.quality}</b><span>${q.width}×${q.height}px${q.tips.length?' · '+q.tips.join(', '):' · iluminación/contraste adecuados para revisión'}</span>`}}
    else {$('#photoQuality').classList.add('hidden');stage.innerHTML='<div><img src="assets/logo/favicon.svg" alt=""><span>Adjunta una fotografía</span><small>La versión Go Live revisa calidad de imagen y contexto textual. La identificación visual real queda preparada para un backend multimodal seguro.</small></div>'}
  };


  const qp=new URLSearchParams(location.search); const initialIntent=qp.get('intent');
  if(initialIntent==='identify') setTimeout(()=>add('bot','Perfecto. No necesitas saber el nombre de la pieza. Dime en qué máquina va, qué movimiento realiza y qué falla presenta. Si puedes, agrega vistas frontal, lateral y del área dañada.'),120);
  if(initialIntent==='repair') setTimeout(()=>add('bot','Vamos a revisar una posible reparación. Dime qué componente es, qué daño presenta, si la falla fue repentina o progresiva y si tienes alguna medida o fotografía.'),120);

  send?.addEventListener('click',submit); text?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit()}});
  $$('.quick button').forEach(b=>b.addEventListener('click',()=>{text.value=b.dataset.q;text.focus()}));
  file?.addEventListener('change',()=>{images=[...file.files].slice(0,5);refreshImages()});
  $('#clearChat')?.addEventListener('click',()=>{conversation=[];images=[];strip.textContent='';lastResult=null;sessionStorage.removeItem('ocmar_last_diagnosis');log.innerHTML='<div class="msg bot"><span class="bot-label">OCMAR</span>Caso limpio. Cuéntame qué pieza o problema quieres revisar.</div>';$('#compName').textContent='Esperando información';$('#observed').textContent='Describe la pieza, su función o el problema para comenzar.';['#damage','#causes','#options','#measurements','#questions'].forEach(x=>fillList(x,[],'Sin datos todavía.'));$('#confidence').textContent='SIN DATOS';refreshImages()});
  $('#quoteFromAssistant')?.addEventListener('click',()=>location.href='cotizar.html?from=assistant');
  $('#copyDiagnosis')?.addEventListener('click',async()=>{if(!lastResult){add('bot','Primero necesito una descripción para generar una evaluación que pueda copiarse.');return}const txt=`EVALUACIÓN PRELIMINAR OCMAR\nComponente: ${lastResult.item?.name||'Por identificar'}\nObservado/contexto: ${lastResult.observed.join(' ')}\nDaños a revisar: ${lastResult.damage.join('; ')}\nPosibles causas: ${lastResult.causes.join('; ')}\nAlternativas: ${lastResult.options.join('; ')}\nInformación necesaria: ${lastResult.measurements.join('; ')}`;try{await navigator.clipboard.writeText(txt);add('bot','Evaluación copiada al portapapeles.')}catch{add('bot','No fue posible copiar automáticamente; puedes seleccionar la información del panel.') }});
})();

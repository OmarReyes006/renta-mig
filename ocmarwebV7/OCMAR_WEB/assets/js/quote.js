(()=>{
  'use strict';
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)], cfg=window.OCMAR_CONFIG||{};
  let photoFiles=[],planFile=null,current=1,lastPdf=null,lastPdfUrl=null,caseId=null,previewUrls=[],reviewUrls=[];
  const panels=$$('.wizard-panel'),steps=$$('.wizard-step');
  const ids=['name','company','phone','email','address','state','municipality','postalCode','contactMethod','service','requestType','partName','quantity','machine','application','material','urgency','deadline','problem','dimensions','operating','reference','sample','drawing','physicalReview','siteCompany','siteContact','sitePhone','siteSchedule','siteAddress','siteState','siteMunicipality','siteMaps','siteAccess'];
  const val=id=>$('#'+id)?.value?.trim?.()??$('#'+id)?.value??'';
  const setStatus=(text,type='info')=>{const el=$('#formStatus');if(!el)return;el.textContent=text;el.dataset.type=type};
  const makeCaseId=()=>caseId||(caseId='OCM-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.random().toString(36).slice(2,6).toUpperCase());
  const onlyDigits=s=>String(s||'').replace(/\D/g,'');
  const emailOk=s=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(s||'').trim());
  const phoneOk=s=>{const d=onlyDigits(s);return d.length>=10&&d.length<=15};
  const fullLocation=d=>[d.address,d.municipality,d.state,d.postalCode?`CP ${d.postalCode}`:''].filter(Boolean).join(', ');

  const toggleBtn=(el,enabled)=>{if(!el)return;el.disabled=!enabled;el.classList.toggle('disabled',!enabled)};
  const clearPdfPreview=()=>{
    if(lastPdfUrl){URL.revokeObjectURL(lastPdfUrl);lastPdfUrl=null}
    const frame=$('#pdfPreviewFrame');if(frame)frame.removeAttribute('src');
    $('#pdfPreviewPanel')?.setAttribute('hidden','');
    const pc=$('#previewConfirm');if(pc)pc.checked=false;
    toggleBtn($('#sharePdf'),false);toggleBtn($('#whatsappQuote'),false);toggleBtn($('#emailQuote'),false);
  };
  const invalidatePdf=()=>{
    if(!lastPdf&&!lastPdfUrl)return;
    lastPdf=null;clearPdfPreview();
    setStatus('Hiciste cambios en el expediente. Genera una nueva vista previa antes de compartirlo.','info');
  };

  const markField=(id,good)=>{
    const el=$('#'+id);if(!el)return;
    el.classList.toggle('invalid',!good);
    el.setAttribute('aria-invalid',good?'false':'true');
  };

  const validateStep=n=>{
    let ok=true, message='';
    if(n===1){
      const required=['name','phone','email','address','state','municipality'];
      required.forEach(id=>{const good=!!val(id);markField(id,good);if(!good)ok=false});
      if(val('name')&&val('name').length<5){markField('name',false);ok=false;message='Escribe el nombre completo del solicitante.'}
      if(val('phone')&&!phoneOk(val('phone'))){markField('phone',false);ok=false;message='Revisa el número de teléfono. Debe contener al menos 10 dígitos.'}
      if(val('email')&&!emailOk(val('email'))){markField('email',false);ok=false;message='Escribe un correo electrónico válido.'}
      if(val('address')&&val('address').length<8){markField('address',false);ok=false;message='Escribe una dirección más completa para identificar la ubicación.'}
      if(!ok&&!message)message='Completa nombre, teléfono, correo, dirección, estado y municipio para continuar.';
    }
    if(n===2){
      const required=['urgency','problem'];
      required.forEach(id=>{const good=!!val(id);markField(id,good);if(!good)ok=false});
      const needsDate=val('urgency')==='Fecha límite específica';
      const dateGood=!needsDate||!!val('deadline');markField('deadline',dateGood);if(!dateGood){ok=false;message='Seleccionaste una fecha límite específica. Indica la fecha deseada.'}
      if(!val('problem'))message=message||'Describe el problema o necesidad para continuar.';
    }
    if(n===3&&val('physicalReview')==='Sí, solicito revisión física en sitio'){
      const required=['siteCompany','siteContact','sitePhone','siteAddress','siteState','siteMunicipality'];
      required.forEach(id=>{const good=!!val(id);markField(id,good);if(!good)ok=false});
      if(val('sitePhone')&&!phoneOk(val('sitePhone'))){markField('sitePhone',false);ok=false;message='Revisa el teléfono de contacto en sitio. Debe contener al menos 10 dígitos.'}
      if(val('siteAddress')&&val('siteAddress').length<8){markField('siteAddress',false);ok=false;message='Agrega una ubicación física más completa para la revisión.'}
      if(!ok&&!message)message='Para solicitar revisión física completa empresa/planta, contacto, teléfono, ubicación exacta, estado y municipio.';
    }
    if(!ok)setStatus(message||'Completa los campos marcados como obligatorios para continuar.','error');
    return ok;
  };

  const showStep=n=>{
    current=Number(n);panels.forEach(p=>p.classList.toggle('active',Number(p.dataset.panel)===current));
    steps.forEach(s=>{const sn=Number(s.dataset.step);s.classList.toggle('active',sn===current);s.classList.toggle('done',sn<current)});
    scrollTo({top:Math.max(0,$('.quote-workspace').offsetTop-80),behavior:'smooth'});if(current===4)renderReview();
  };
  $$('.next-step').forEach(b=>b.addEventListener('click',()=>{if(validateStep(current))showStep(b.dataset.next)}));
  $$('.prev-step').forEach(b=>b.addEventListener('click',()=>showStep(b.dataset.prev)));
  steps.forEach(b=>b.addEventListener('click',()=>{const target=Number(b.dataset.step);if(target<=current){showStep(target);return}if(target===current+1){if(validateStep(current))showStep(target);return}setStatus('Avanza paso por paso para validar correctamente el expediente.','info')}));

  const fromAssistant=sessionStorage.getItem('ocmar_last_diagnosis');
  if(fromAssistant){try{const d=JSON.parse(fromAssistant);$('#service').value='Reparación de componente';$('#requestType').value='Reparar / recuperar';$('#partName').value=d.component||'';$('#problem').value=d.description||'';$('#dimensions').value=(d.measurements||[]).join(', ');$('#operating').value=`Evaluación preliminar OCMAR:\n${(d.observed||[]).join(' ')}\n\nPosibles causas a revisar: ${(d.causes||[]).join('; ')}\nAlternativas preliminares: ${(d.options||[]).join('; ')}`;}catch{}}
  const qp=new URLSearchParams(location.search),intent=qp.get('intent');
  if(intent==='manufacture'){ $('#service').value='Fabricación de pieza nueva';$('#requestType').value='Fabricar nuevo'}
  if(intent==='maintenance'){$('#service').value='Mantenimiento industrial';$('#requestType').value='Revisar / diagnosticar'}

  const deadline=$('#deadline');if(deadline)deadline.min=new Date().toISOString().slice(0,10);
  const urgency=$('#urgency');
  const syncDeadline=()=>{if(!urgency||!deadline)return;const required=urgency.value==='Fecha límite específica';deadline.required=required;deadline.closest('.field')?.classList.toggle('deadline-required',required)};
  urgency?.addEventListener('change',syncDeadline);syncDeadline();

  const physicalReview=$('#physicalReview'),physicalFields=$('#physicalReviewFields');
  const syncPhysicalReview=()=>{
    if(!physicalReview||!physicalFields)return;
    const active=physicalReview.value==='Sí, solicito revisión física en sitio';
    physicalFields.hidden=!active;physicalFields.classList.toggle('active',active);
    ['siteCompany','siteContact','sitePhone','siteAddress','siteState','siteMunicipality'].forEach(id=>{const el=$('#'+id);if(el)el.required=active});
    if($('#sumPhysical'))$('#sumPhysical').textContent=active?'Solicitada':physicalReview.value.startsWith('No estoy')?'Por determinar':'No solicitada';
  };
  physicalReview?.addEventListener('change',()=>{syncPhysicalReview();invalidatePdf();updateSummary()});syncPhysicalReview();

  const cleanupPreviewUrls=()=>{previewUrls.forEach(URL.revokeObjectURL);previewUrls=[]};
  const setPreview=()=>{
    const box=$('#evidencePreview');if(!box)return;cleanupPreviewUrls();box.textContent='';
    const files=[...photoFiles,...(planFile?[planFile]:[])];
    if(!files.length){box.innerHTML='<span class="evidence-empty">Los archivos seleccionados aparecerán aquí con una vista previa.</span>';return}
    files.forEach(f=>{
      const card=document.createElement('div');card.className='evidence-file-card';
      const visual=document.createElement('div');visual.className='evidence-file-visual';
      if(f.type.startsWith('image/')){const url=URL.createObjectURL(f);previewUrls.push(url);const img=document.createElement('img');img.src=url;img.alt='Vista previa de '+f.name;visual.appendChild(img)}else{visual.innerHTML='<span>PDF</span>'}
      const meta=document.createElement('div');meta.className='evidence-file-meta';const name=document.createElement('b');name.textContent=f.name;const small=document.createElement('small');small.textContent=f.type==='application/pdf'?'Plano / documento PDF':`${Math.max(.1,f.size/1024/1024).toFixed(1)} MB · imagen`;
      const rm=document.createElement('button');rm.type='button';rm.setAttribute('aria-label','Eliminar '+f.name);rm.textContent='×';rm.addEventListener('click',()=>{if(planFile===f)planFile=null;else photoFiles=photoFiles.filter(x=>x!==f);invalidatePdf();setPreview();updateSummary()});
      meta.append(name,small);card.append(visual,meta,rm);box.appendChild(card);
    });
  };
  const assignPhotos=files=>{const valid=[...files].filter(f=>/^image\/(jpeg|png|webp)$/.test(f.type)).slice(0,5);photoFiles=valid;invalidatePdf();setPreview();updateSummary()};
  const assignPlan=files=>{const f=[...files].find(x=>x.type==='application/pdf'||/^image\/(jpeg|png|webp)$/.test(x.type));planFile=f||null;invalidatePdf();setPreview();updateSummary()};
  $('#photos')?.addEventListener('change',e=>assignPhotos(e.target.files));
  $('#plan')?.addEventListener('change',e=>assignPlan(e.target.files));
  $$('.dropzone').forEach(z=>{
    ['dragenter','dragover'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.add('drag')}));
    ['dragleave','drop'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.remove('drag')}));
    z.addEventListener('drop',e=>z.id==='photoDrop'?assignPhotos(e.dataTransfer.files):assignPlan(e.dataTransfer.files));
  });

  const data=()=>Object.fromEntries(ids.map(id=>[id,val(id)]));
  const updateSummary=()=>{
    const d=data();
    $('#sumContact').textContent=d.name||'Pendiente';$('#sumService').textContent=d.service||'Sin definir';$('#sumPart').textContent=d.partName||'Sin definir';
    if($('#sumLocation'))$('#sumLocation').textContent=d.municipality&&d.state?`${d.municipality}, ${d.state}`:'Pendiente';
    if($('#sumPriority'))$('#sumPriority').textContent=d.urgency||'Pendiente';
    $('#sumEvidence').textContent=(photoFiles.length||planFile)?`${photoFiles.length} foto(s)${planFile?' + plano':''}`:'Sin archivos';
    if($('#sumPhysical'))$('#sumPhysical').textContent=d.physicalReview==='Sí, solicito revisión física en sitio'?'Solicitada':d.physicalReview?.startsWith('No estoy')?'Por determinar':'No solicitada';
    const siteChecks=d.physicalReview==='Sí, solicito revisión física en sitio'?[d.siteCompany,d.siteContact,phoneOk(d.sitePhone),d.siteAddress,d.siteState,d.siteMunicipality]:[];
    const checks=[d.name,phoneOk(d.phone),emailOk(d.email),d.address,d.state,d.municipality,d.service,d.requestType,d.problem,d.urgency,d.partName,d.machine,d.dimensions,photoFiles.length||planFile,...siteChecks];
    const pct=Math.round(checks.filter(Boolean).length/checks.length*100);$('#summaryCompleteness').textContent=pct+'%';$('#summaryMeter').style.width=pct+'%';
  };
  ids.forEach(id=>$('#'+id)?.addEventListener('input',()=>{markField(id,true);invalidatePdf();updateSummary()}));
  ids.forEach(id=>$('#'+id)?.addEventListener('change',()=>{markField(id,true);invalidatePdf();updateSummary()}));

  const build=()=>{
    const d=data(),folio=makeCaseId();
    return `SOLICITUD DE COTIZACIÓN OCMAR\nFolio: ${folio}\n\nDATOS DEL SOLICITANTE\nNombre: ${d.name||'-'}\nEmpresa: ${d.company||'-'}\nTeléfono: ${d.phone||'-'}\nCorreo: ${d.email||'-'}\nDirección: ${d.address||'-'}\nEstado: ${d.state||'-'}\nMunicipio / alcaldía: ${d.municipality||'-'}\nCódigo postal: ${d.postalCode||'-'}\nContacto preferido: ${d.contactMethod||'-'}\n\nPIEZA / SERVICIO\nServicio: ${d.service||'-'}\nNecesidad: ${d.requestType||'-'}\nPieza: ${d.partName||'-'}\nCantidad: ${d.quantity||'-'}\nMáquina/equipo: ${d.machine||'-'}\nAplicación: ${d.application||'-'}\nMaterial: ${d.material||'Por confirmar'}\nPrioridad solicitada: ${d.urgency||'-'}\nFecha límite deseada: ${d.deadline||'No indicada'}\n\nPROBLEMA / NECESIDAD\n${d.problem||'-'}\n\nMEDIDAS / REFERENCIAS\n${d.dimensions||'-'}\n\nCONDICIONES DE OPERACIÓN\n${d.operating||'-'}\n\nEVIDENCIA\nFotografías: ${photoFiles.length}\nPlano/croquis: ${planFile?planFile.name:'No adjunto'}\nMuestra física: ${d.sample||'-'}\nEstado del plano: ${d.drawing||'-'}\nNotas: ${d.reference||'-'}\n\nREVISIÓN FÍSICA / VISITA\nSolicitud: ${d.physicalReview||'No por el momento'}\nEmpresa / planta: ${d.siteCompany||'-'}\nContacto en sitio: ${d.siteContact||'-'}\nTeléfono en sitio: ${d.sitePhone||'-'}\nUbicación exacta: ${d.siteAddress||'-'}\nEstado / municipio: ${[d.siteMunicipality,d.siteState].filter(Boolean).join(', ')||'-'}\nHorario: ${d.siteSchedule||'-'}\nLiga / referencia: ${d.siteMaps||'-'}\nAcceso / seguridad: ${d.siteAccess||'-'}\n\nNOTA DE ATENCIÓN\nLa prioridad seleccionada expresa la necesidad del cliente. El tiempo de revisión y cotización puede variar según complejidad, información disponible, inspección requerida, procesos y carga de trabajo. Una solicitud de revisión física no confirma visita ni fecha hasta que OCMAR revise alcance, ubicación y disponibilidad.`;
  };

  const renderReview=()=>{
    const d=data(),box=$('#quoteReview');if(!box)return;box.textContent='';
    const cards=[
      ['Solicitante',`${d.name||'Sin nombre'}\n${d.phone||'Sin teléfono'}\n${d.email||'Sin correo'}`],
      ['Ubicación',fullLocation(d)||'Sin ubicación'],
      ['Pieza / servicio',`${d.service||'-'} · ${d.requestType||'-'}\n${d.partName||'Pieza por definir'} · Cant. ${d.quantity||'1'}`],
      ['Máquina / aplicación',`${d.machine||'Sin dato'}\n${d.application||'Sin dato'}`],
      ['Material / prioridad',`${d.material||'Por confirmar'}\n${d.urgency||'Sin prioridad'}${d.deadline?'\nFecha deseada: '+d.deadline:''}`],
      ['Problema',d.problem||'Sin descripción'],
      ['Medidas / condiciones',`${d.dimensions||'Sin medidas'}\n${d.operating||''}`],
      ['Evidencia',`${photoFiles.length} fotografía(s) · ${planFile?'Plano: '+planFile.name:'Sin plano'}\nMuestra: ${d.sample||'-'}`],
      ['Revisión física / visita',d.physicalReview==='Sí, solicito revisión física en sitio'?`${d.siteCompany||'Empresa por confirmar'}\n${[d.siteAddress,d.siteMunicipality,d.siteState].filter(Boolean).join(', ')}\nContacto: ${d.siteContact||'-'} · ${d.sitePhone||'-'}${d.siteSchedule?'\nHorario: '+d.siteSchedule:''}${d.siteAccess?'\nAcceso: '+d.siteAccess:''}`:(d.physicalReview||'No por el momento')]
    ];
    cards.forEach(([title,txt],i)=>{const c=document.createElement('div');c.className='review-card'+(i>=5?' full':'');const s=document.createElement('small');s.textContent=title;const p=document.createElement('p');p.textContent=txt;c.append(s,p);box.appendChild(c)});renderReviewEvidence();updateSummary();
  };

  const renderReviewEvidence=()=>{
    const box=$('#reviewEvidence');if(!box)return;reviewUrls.forEach(URL.revokeObjectURL);reviewUrls=[];box.textContent='';
    const entries=[...photoFiles.map((file,i)=>({file,label:`Foto ${i+1}`})),...(planFile?[{file:planFile,label:'Plano / croquis'}]:[])];
    if(!entries.length){const empty=document.createElement('span');empty.className='review-evidence-empty';empty.textContent='Sin evidencia adjunta. Puedes volver al paso 03 para agregar fotografías o plano.';box.appendChild(empty);return}
    entries.forEach(({file,label})=>{const card=document.createElement('div');card.className='review-evidence-card';const visual=document.createElement('div');visual.className='review-evidence-visual';if(file.type.startsWith('image/')){const url=URL.createObjectURL(file);reviewUrls.push(url);const img=document.createElement('img');img.src=url;img.alt=label;visual.appendChild(img)}else{visual.textContent='PDF'}const meta=document.createElement('div');const b=document.createElement('b');b.textContent=label;const small=document.createElement('small');small.textContent=file.name;meta.append(b,small);card.append(visual,meta);box.appendChild(card)});
  };

  const downloadPdf=pdf=>{const url=URL.createObjectURL(pdf.blob),a=document.createElement('a');a.href=url;a.download=pdf.fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4500)};
  const syncDeliveryButtons=()=>{
    const approved=!!$('#previewConfirm')?.checked&&!!lastPdf;
    toggleBtn($('#sharePdf'),approved);toggleBtn($('#whatsappQuote'),approved&&!!cfg.whatsapp);toggleBtn($('#emailQuote'),approved&&!!cfg.email);
  };
  const renderPdfResult=pdf=>{
    const panel=$('#pdfPreviewPanel');if(!panel)return;
    if(lastPdfUrl)URL.revokeObjectURL(lastPdfUrl);lastPdfUrl=URL.createObjectURL(pdf.blob);
    panel.hidden=false;$('#pdfPreviewFrame').src=lastPdfUrl;$('#pdfFileName').textContent=pdf.fileName;$('#pdfFolio').textContent=pdf.folio;$('#pdfPages').textContent=`${pdf.pages} página${pdf.pages===1?'':'s'}`;
    const dest=$('#emailDestinationText');if(dest)dest.textContent=cfg.email?`Destino configurado: ${cfg.email}`:'Agrega el correo de OCMAR en assets/js/config.js para activar este envío.';
    const pc=$('#previewConfirm');if(pc)pc.checked=false;syncDeliveryButtons();
    setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),120);
  };
  const ensurePdf=async({download=false}={})=>{
    const step1Ok=validateStep(1),step2Ok=validateStep(2),step3Ok=validateStep(3);
    if(!step1Ok||!step2Ok||!step3Ok){showStep(!step1Ok?1:!step2Ok?2:3);return null}
    if(!$('#consent')?.checked){setStatus('Marca la confirmación de la información para generar el PDF.','error');return null}
    if(!$('#privacyConsent')?.checked){setStatus('Autoriza el uso de los datos para dar seguimiento a esta solicitud.','error');return null}
    if(lastPdf){if(download)downloadPdf(lastPdf);return lastPdf}
    if(!window.OCMAR_PDF?.createQuotePDF){setStatus('El generador PDF no se cargó correctamente. Recarga la página e intenta de nuevo.','error');return null}
    const btn=$('#generatePdf');btn?.classList.add('loading');if(btn)btn.disabled=true;setStatus('Generando expediente PDF con los datos y fotografías...','working');
    try{
      lastPdf=await window.OCMAR_PDF.createQuotePDF({data:data(),photoFiles,planFile,folio:makeCaseId()});renderPdfResult(lastPdf);if(download)downloadPdf(lastPdf);
      setStatus(`Vista previa lista: ${lastPdf.fileName}. Revísala y confirma el expediente para habilitar el envío.`,'success');return lastPdf;
    }catch(err){console.error(err);setStatus('No se pudo generar el PDF. Revisa los archivos seleccionados e intenta nuevamente.','error');return null}
    finally{btn?.classList.remove('loading');if(btn)btn.disabled=false}
  };

  $('#copyQuote')?.addEventListener('click',async()=>{if(!validateStep(1)||!validateStep(2)||!validateStep(3)){setStatus('Completa primero los datos obligatorios antes de copiar el expediente.','error');return}try{await navigator.clipboard.writeText(build());setStatus('Resumen copiado al portapapeles.','success')}catch{setStatus('No se pudo copiar automáticamente.','error')}});
  $('#downloadPdf')?.addEventListener('click',()=>{if(lastPdf)downloadPdf(lastPdf)});
  $('#previewConfirm')?.addEventListener('change',()=>{syncDeliveryButtons();if($('#previewConfirm')?.checked)setStatus('Expediente confirmado. Ya puedes compartir el PDF con OCMAR.','success')});

  const shareFile=()=>lastPdf?new File([lastPdf.blob],lastPdf.fileName,{type:'application/pdf'}):null;
  const shareText=()=>`Solicitud de cotización OCMAR · Folio ${lastPdf?.folio||'-'}\nCliente: ${val('name')||'-'}\nPieza: ${val('partName')||'Por identificar'}\nServicio: ${val('service')||'-'}\nPrioridad: ${val('urgency')||'-'}`;
  const nativeShare=async extra=>{
    const file=shareFile();if(!file)return false;
    if(navigator.share&&navigator.canShare?.({files:[file]})){
      try{await navigator.share({title:`Solicitud OCMAR ${lastPdf.folio}`,text:`${shareText()}${extra?'\n'+extra:''}`,files:[file]});return true}catch(err){if(err?.name==='AbortError')setStatus('Compartir cancelado. El PDF sigue listo.','info');return false}
    }
    return false;
  };

  $('#sharePdf')?.addEventListener('click',async()=>{
    if(!$('#previewConfirm')?.checked||!lastPdf){setStatus('Confirma primero que revisaste la vista previa del PDF.','error');return}
    if(await nativeShare('Selecciona WhatsApp, correo u otra aplicación segura para compartir el expediente.')){setStatus('Se abrió el menú de compartir con el PDF adjunto.','success');return}
    downloadPdf(lastPdf);setStatus('Tu navegador no permite compartir archivos directamente. Se descargó el PDF para que lo adjuntes manualmente.','info');
  });

  $('#whatsappQuote')?.addEventListener('click',async()=>{
    if(!$('#previewConfirm')?.checked||!lastPdf){setStatus('Confirma primero que revisaste la vista previa del PDF.','error');return}
    if(!cfg.whatsapp){setStatus('WhatsApp de OCMAR no está configurado todavía.','error');return}
    if(await nativeShare('Selecciona WhatsApp y envía el archivo al contacto OCMAR.')){setStatus('El PDF está listo en el menú de compartir. Selecciona WhatsApp y OCMAR.','success');return}
    downloadPdf(lastPdf);
    const msg=`Hola OCMAR. Preparé la solicitud ${lastPdf.folio} desde la página web. Ya descargué el PDF y lo adjuntaré en este chat.\n\nCliente: ${val('name')||'-'}\nPieza: ${val('partName')||'Por identificar'}\nServicio: ${val('service')||'-'}\nPrioridad: ${val('urgency')||'-'}`;
    window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
    setStatus('PDF descargado y chat de WhatsApp OCMAR abierto. Adjunta el expediente descargado.','success');
  });

  $('#emailQuote')?.addEventListener('click',async()=>{
    if(!$('#previewConfirm')?.checked||!lastPdf){setStatus('Confirma primero que revisaste la vista previa del PDF.','error');return}
    if(!cfg.email){setStatus('El correo de cotizaciones OCMAR aún no está configurado en assets/js/config.js.','error');return}
    try{await navigator.clipboard?.writeText?.(cfg.email)}catch{}
    if(await nativeShare(`Destino de correo OCMAR: ${cfg.email}`)){setStatus(`PDF listo para compartir. Si eliges correo, envíalo a ${cfg.email}.`,'success');return}
    downloadPdf(lastPdf);
    const subject=`Solicitud de cotización OCMAR ${lastPdf.folio}`;
    const body=`Hola OCMAR,%0D%0A%0D%0AAdjunto la solicitud ${lastPdf.folio}.%0D%0ACliente: ${encodeURIComponent(val('name')||'-')}%0D%0APieza: ${encodeURIComponent(val('partName')||'Por identificar')}%0D%0APrioridad: ${encodeURIComponent(val('urgency')||'-')}%0D%0A%0D%0AEl PDF fue generado desde la página de OCMAR y se descargó para adjuntarlo a este correo.`;
    location.href=`mailto:${encodeURIComponent(cfg.email)}?subject=${encodeURIComponent(subject)}&body=${body}`;
    setStatus('PDF descargado y correo preparado. Adjunta el expediente antes de enviar.','success');
  });

  $('#quoteForm')?.addEventListener('submit',async e=>{e.preventDefault();const pdf=await ensurePdf({download:false});if(pdf)renderReview()});

  // V7: aviso informativo previo a la cotización.
  // No carga archivos; las fotos y planos permanecen en el paso 03 del formulario.
  const preQuoteNotice=$('#preQuoteNotice'),acceptPreQuote=$('#acceptPreQuote');
  if(preQuoteNotice){
    document.body.classList.add('prequote-open');
    requestAnimationFrame(()=>acceptPreQuote?.focus({preventScroll:true}));
    acceptPreQuote?.addEventListener('click',()=>{
      preQuoteNotice.classList.add('closing');
      document.body.classList.remove('prequote-open');
      setTimeout(()=>{preQuoteNotice.hidden=true;preQuoteNotice.classList.remove('closing');$('#name')?.focus({preventScroll:true})},320);
    });
  }

  setPreview();updateSummary();
})();

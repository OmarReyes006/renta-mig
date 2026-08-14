(()=>{
  'use strict';

  const PAGE_W=595.28, PAGE_H=841.89, M=42;
  const COLORS={
    navy:[0.027,0.102,0.184], navy2:[0.055,0.180,0.320], ink:[0.055,0.070,0.086],
    steel:[0.43,0.48,0.53], light:[0.945,0.955,0.965], line:[0.84,0.86,0.88], white:[1,1,1]
  };
  const CP1252=new Map([
    ['€',0x80],['‚',0x82],['ƒ',0x83],['„',0x84],['…',0x85],['†',0x86],['‡',0x87],['ˆ',0x88],['‰',0x89],['Š',0x8A],['‹',0x8B],['Œ',0x8C],['Ž',0x8E],
    ['‘',0x91],['’',0x92],['“',0x93],['”',0x94],['•',0x95],['–',0x96],['—',0x97],['˜',0x98],['™',0x99],['š',0x9A],['›',0x9B],['œ',0x9C],['ž',0x9E],['Ÿ',0x9F]
  ]);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rgb=c=>c.map(v=>Number(v).toFixed(3)).join(' ');
  const ascii=s=>new TextEncoder().encode(s);
  const concat=parts=>{const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out};
  const byteForChar=ch=>{const cp=ch.codePointAt(0);if(cp<=255)return cp;if(CP1252.has(ch))return CP1252.get(ch);return 0x3F};
  const pdfStr=s=>'('+Array.from(String(s??'')).map(ch=>{const b=byteForChar(ch);if(b===0x28)return '\\(';if(b===0x29)return '\\)';if(b===0x5C)return '\\\\';if(b<32||b>126)return '\\'+b.toString(8).padStart(3,'0');return String.fromCharCode(b)}).join('')+')';
  const sanitize=s=>String(s||'CLIENTE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,38)||'CLIENTE';
  const wrapText=(text,maxWidth,fontSize)=>{
    const maxChars=Math.max(12,Math.floor(maxWidth/(fontSize*.51))), out=[];
    String(text??'').replace(/\r/g,'').split('\n').forEach(par=>{
      if(!par.trim()){out.push('');return}
      const words=par.trim().split(/\s+/);let line='';
      for(let word of words){
        if(word.length>maxChars){if(line){out.push(line);line=''}while(word.length>maxChars){out.push(word.slice(0,maxChars));word=word.slice(maxChars)}}
        const test=line?line+' '+word:word;
        if(test.length>maxChars){if(line)out.push(line);line=word}else line=test;
      }
      if(line)out.push(line);
    });
    return out.length?out:['-'];
  };

  class PDFBuilder{
    constructor(){this.objects=[]}
    reserve(){this.objects.push(null);return this.objects.length}
    set(id,content){this.objects[id-1]=Array.isArray(content)?content:[typeof content==='string'?ascii(content):content]}
    add(content){const id=this.reserve();this.set(id,content);return id}
    stream(dict,bytes){return [ascii(`<< ${dict} /Length ${bytes.length} >>\nstream\n`),bytes,ascii('\nendstream')]}
    build(rootId){
      const head=new Uint8Array([0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34,0x0A,0x25,0xE2,0xE3,0xCF,0xD3,0x0A]);
      const chunks=[head], offsets=[0];let offset=head.length;
      this.objects.forEach((parts,i)=>{if(!parts)throw new Error('Objeto PDF sin contenido: '+(i+1));const pre=ascii(`${i+1} 0 obj\n`),post=ascii('\nendobj\n');offsets[i+1]=offset;chunks.push(pre,...parts,post);offset+=pre.length+post.length+parts.reduce((n,p)=>n+p.length,0)});
      const xrefOffset=offset;let xref=`xref\n0 ${this.objects.length+1}\n0000000000 65535 f \n`;
      for(let i=1;i<=this.objects.length;i++)xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
      xref+=`trailer\n<< /Size ${this.objects.length+1} /Root ${rootId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
      chunks.push(ascii(xref));return concat(chunks);
    }
  }

  const textCmd=(txt,x,top,size=9,bold=false,color=COLORS.ink)=>`${rgb(color)} rg BT /${bold?'F2':'F1'} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${(PAGE_H-top-size).toFixed(2)} Tm ${pdfStr(txt)} Tj ET\n`;
  const rectCmd=(x,top,w,h,fill,stroke=null,lineW=.7)=>{
    const y=PAGE_H-top-h;let s='q\n';if(fill)s+=`${rgb(fill)} rg\n`;if(stroke)s+=`${rgb(stroke)} RG ${lineW} w\n`;s+=`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill&&stroke?'B':fill?'f':'S'}\nQ\n`;return s;
  };
  const lineCmd=(x1,t1,x2,t2,color=COLORS.line,w=.7)=>`q ${rgb(color)} RG ${w} w ${x1.toFixed(2)} ${(PAGE_H-t1).toFixed(2)} m ${x2.toFixed(2)} ${(PAGE_H-t2).toFixed(2)} l S Q\n`;

  async function fileToJpeg(file,maxW=1600,maxH=1600,quality=.82){
    let source,srcW,srcH,cleanup=()=>{};
    if(typeof createImageBitmap==='function'){
      source=await createImageBitmap(file);srcW=source.width;srcH=source.height;cleanup=()=>source.close?.();
    }else{
      const url=URL.createObjectURL(file);source=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=url});srcW=source.naturalWidth;srcH=source.naturalHeight;cleanup=()=>URL.revokeObjectURL(url);
    }
    const scale=Math.min(1,maxW/srcW,maxH/srcH),w=Math.max(1,Math.round(srcW*scale)),h=Math.max(1,Math.round(srcH*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(source,0,0,w,h);cleanup();
    const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('No se pudo convertir la imagen.')),'image/jpeg',quality));
    return {bytes:new Uint8Array(await blob.arrayBuffer()),width:w,height:h};
  }

  async function createQuotePDF({data={},photoFiles=[],planFile=null,folio=null}={}){
    const now=new Date();
    folio=folio||`OCM-${now.toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const builder=new PDFBuilder();
    const catalogId=builder.reserve(),pagesId=builder.reserve(),fontRegularId=builder.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),fontBoldId=builder.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const pages=[];
    let page=null,cursor=0;

    const makePage=(continued=false)=>{
      page={cmd:'',xobjects:[],continued};pages.push(page);cursor=132;
      page.cmd+=rectCmd(0,0,PAGE_W,103,COLORS.navy);
      page.cmd+=rectCmd(M,32,8,38,COLORS.navy2);
      page.cmd+=textCmd('OCMAR',M+22,25,27,true,COLORS.white);
      page.cmd+=textCmd('MAQUINADOS INDUSTRIALES',M+22,57,9,true,[.73,.79,.84]);
      page.cmd+=textCmd(continued?'EXPEDIENTE TECNICO - CONTINUACION':'SOLICITUD TECNICA DE COTIZACION',PAGE_W-M-225,30,10,true,COLORS.white);
      page.cmd+=textCmd(`Folio: ${folio}`,PAGE_W-M-225,49,8,false,[.73,.79,.84]);
      page.cmd+=textCmd(now.toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}),PAGE_W-M-225,65,7.5,false,[.64,.71,.77]);
      page.cmd+=lineCmd(M,116,PAGE_W-M,116,COLORS.line,.7);
      return page;
    };
    const ensure=h=>{if(!page)makePage();if(cursor+h>PAGE_H-55){makePage(true)}};
    const sectionTitle=title=>{ensure(31);page.cmd+=textCmd(title.toUpperCase(),M,cursor,9,true,COLORS.navy2);page.cmd+=lineCmd(M+150,cursor+5,PAGE_W-M,cursor+5,COLORS.line,.6);cursor+=24};
    const field=(label,value,{full=true}={})=>{
      const safe=String(value??'').trim()||'-',lines=wrapText(safe,PAGE_W-2*M-18,9.2),h=19+lines.length*12;
      ensure(h+4);page.cmd+=rectCmd(M,cursor,PAGE_W-2*M,h,COLORS.light,null);page.cmd+=textCmd(label.toUpperCase(),M+10,cursor+7,6.6,true,COLORS.steel);let t=cursor+19;for(const ln of lines){page.cmd+=textCmd(ln,M+10,t,9.2,false,COLORS.ink);t+=12}cursor+=h+7;
    };
    const pairRow=(leftLabel,leftValue,rightLabel,rightValue)=>{
      const gap=10,w=(PAGE_W-2*M-gap)/2;const ll=wrapText(String(leftValue||'-'),w-18,8.8),rr=wrapText(String(rightValue||'-'),w-18,8.8),h=21+Math.max(ll.length,rr.length)*11.5;ensure(h+7);
      [[M,leftLabel,ll],[M+w+gap,rightLabel,rr]].forEach(([x,label,lines])=>{page.cmd+=rectCmd(x,cursor,w,h,COLORS.light,null);page.cmd+=textCmd(String(label).toUpperCase(),x+10,cursor+7,6.4,true,COLORS.steel);let t=cursor+20;for(const ln of lines){page.cmd+=textCmd(ln,x+10,t,8.8,false,COLORS.ink);t+=11.5}});cursor+=h+7;
    };

    makePage(false);
    page.cmd+=rectCmd(M,126,PAGE_W-2*M,50,[.972,.977,.982],COLORS.line,.6);
    page.cmd+=textCmd('SOLICITUD RECIBIDA PARA EVALUACION PRELIMINAR',M+12,137,8,true,COLORS.navy2);
    page.cmd+=textCmd('Este documento organiza la informacion proporcionada por el cliente. No constituye una cotizacion final.',M+12,154,8,false,COLORS.steel);
    cursor=192;

    sectionTitle('Contacto del solicitante');
    pairRow('Nombre',data.name,'Empresa / negocio',data.company||'No indicado');
    pairRow('Telefono',data.phone,'Correo electronico',data.email||'No indicado');
    field('Direccion completa',data.address||'No indicada');
    pairRow('Estado',data.state||'No indicado','Municipio / alcaldia',data.municipality||'No indicado');
    pairRow('Codigo postal',data.postalCode||'No indicado','Contacto preferido',data.contactMethod||'No indicado');

    sectionTitle('Pieza y servicio requerido');
    pairRow('Servicio',data.service,'Necesidad',data.requestType);
    pairRow('Pieza / componente',data.partName||'Por identificar','Cantidad',data.quantity||'1');
    pairRow('Maquina / equipo',data.machine||'No indicado','Aplicacion / funcion',data.application||'No indicada');
    pairRow('Material',data.material||'Por confirmar','Prioridad solicitada',data.urgency||'No indicada');
    pairRow('Fecha limite deseada',data.deadline||'No indicada','Nota de prioridad','La prioridad expresa la necesidad del cliente; OCMAR confirmara tiempos.');

    sectionTitle('Problema y requerimientos');
    field('Problema / necesidad',data.problem);
    field('Medidas / referencias',data.dimensions||'No proporcionadas');
    field('Condiciones de operacion',data.operating||'No indicadas');

    sectionTitle('Evidencia proporcionada');
    pairRow('Fotografias',`${photoFiles.length} archivo(s)`,'Plano / croquis',planFile?planFile.name:'No adjunto');
    pairRow('Muestra fisica',data.sample||'No indicado','Estado del plano',data.drawing||'No indicado');
    field('Notas sobre evidencia',data.reference||'Sin notas adicionales');

    sectionTitle('Revision fisica / visita');
    field('Solicitud de revision fisica',data.physicalReview||'No por el momento');
    if(data.physicalReview==='Sí, solicito revisión física en sitio'){
      pairRow('Empresa / planta',data.siteCompany||'No indicada','Contacto en sitio',data.siteContact||'No indicado');
      pairRow('Telefono en sitio',data.sitePhone||'No indicado','Horario disponible',data.siteSchedule||'Por coordinar');
      field('Ubicacion exacta del equipo',data.siteAddress||'No indicada');
      pairRow('Estado',data.siteState||'No indicado','Municipio / alcaldia',data.siteMunicipality||'No indicado');
      field('Liga / referencia de ubicacion',data.siteMaps||'No proporcionada');
      field('Indicaciones de acceso y seguridad',data.siteAccess||'Sin indicaciones adicionales');
    }else{
      field('Estado de visita',data.physicalReview?.startsWith('No estoy')?'OCMAR determinara si una revision fisica resulta necesaria durante la evaluacion.':'No solicitada por el momento.');
    }

    ensure(82);page.cmd+=rectCmd(M,cursor,PAGE_W-2*M,69,[.935,.956,.976],null);page.cmd+=textCmd('TIEMPO DE REVISION Y COTIZACION',M+12,cursor+9,7,true,COLORS.navy2);page.cmd+=textCmd('El tiempo puede variar segun complejidad, informacion disponible, inspeccion requerida, procesos y carga de trabajo.',M+12,cursor+25,8.1,false,COLORS.ink);page.cmd+=textCmd('Urgencia o revision fisica solicitan prioridad/evaluacion, pero no constituyen confirmacion de visita, respuesta inmediata o entrega.',M+12,cursor+41,8.1,false,COLORS.ink);cursor+=82;
    ensure(35);page.cmd+=lineCmd(M,cursor,PAGE_W-M,cursor,COLORS.line,.7);page.cmd+=textCmd('PRECISION  ·  INGENIERIA  ·  SOLUCIONES',M,cursor+12,7.2,true,COLORS.steel);

    const imageEntries=[];
    for(let i=0;i<photoFiles.length;i++){
      try{imageEntries.push({label:`FOTOGRAFIA ${i+1} - ${photoFiles[i].name}`,image:await fileToJpeg(photoFiles[i]),kind:'photo'})}catch(e){imageEntries.push({label:`FOTOGRAFIA ${i+1} - ${photoFiles[i].name} (no se pudo incrustar)`,image:null,kind:'photo'})}
    }
    if(planFile&&planFile.type!=='application/pdf'){
      try{imageEntries.push({label:`PLANO / CROQUIS - ${planFile.name}`,image:await fileToJpeg(planFile),kind:'plan'})}catch(e){imageEntries.push({label:`PLANO / CROQUIS - ${planFile.name} (no se pudo incrustar)`,image:null,kind:'plan'})}
    }
    for(const entry of imageEntries){
      const p=makePage(true);p.cmd+=textCmd(entry.kind==='plan'?'PLANO / CROQUIS':'EVIDENCIA FOTOGRAFICA',M,130,11,true,COLORS.navy2);p.cmd+=textCmd(entry.label,M,151,8,false,COLORS.steel);
      if(entry.image){
        const im=entry.image,boxX=M,boxTop=178,boxW=PAGE_W-2*M,boxH=560,scale=Math.min(boxW/im.width,boxH/im.height),drawW=im.width*scale,drawH=im.height*scale,x=boxX+(boxW-drawW)/2,top=boxTop+(boxH-drawH)/2;
        p.pendingImage={bytes:im.bytes,width:im.width,height:im.height,name:'Im1'};
        p.cmd+=rectCmd(boxX,boxTop,boxW,boxH,[.965,.970,.976],COLORS.line,.7);
        p.cmd+=`q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${(PAGE_H-top-drawH).toFixed(2)} cm /Im1 Do Q\n`;
      }else{
        p.cmd+=rectCmd(M,195,PAGE_W-2*M,180,COLORS.light,COLORS.line,.7);p.cmd+=textCmd('No fue posible incrustar esta imagen en el PDF.',M+18,225,11,true,COLORS.ink);p.cmd+=textCmd('El nombre del archivo queda registrado en el expediente.',M+18,250,9,false,COLORS.steel);
      }
      p.cmd+=textCmd('Nota: la evaluacion visual es preliminar y debe confirmarse con medicion o inspeccion fisica cuando corresponda.',M,764,7.5,false,COLORS.steel);
    }
    if(planFile&&planFile.type==='application/pdf'){
      const p=makePage(true);p.cmd+=textCmd('PLANO / DOCUMENTO PDF',M,130,11,true,COLORS.navy2);p.cmd+=rectCmd(M,170,PAGE_W-2*M,170,COLORS.light,COLORS.line,.7);p.cmd+=textCmd('Archivo de plano seleccionado:',M+18,198,8,true,COLORS.steel);p.cmd+=textCmd(planFile.name,M+18,222,13,true,COLORS.ink);p.cmd+=textCmd('Por seguridad y compatibilidad, esta version local no fusiona otro PDF dentro del expediente.',M+18,258,9,false,COLORS.steel);p.cmd+=textCmd('Conserva y envia el archivo de plano original junto con esta solicitud cuando sea necesario.',M+18,278,9,false,COLORS.steel);
    }

    const pageIds=[];
    for(const p of pages){
      let xobj='';
      if(p.pendingImage){const im=p.pendingImage;const imId=builder.add(builder.stream(`/Type /XObject /Subtype /Image /Width ${im.width} /Height ${im.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,im.bytes));xobj=` /XObject << /Im1 ${imId} 0 R >>`}
      const contentBytes=ascii(p.cmd),contentId=builder.add(builder.stream('',contentBytes)),pageId=builder.reserve();
      builder.set(pageId,`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >>${xobj} >> /Contents ${contentId} 0 R >>`);pageIds.push(pageId);
    }
    builder.set(pagesId,`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] >>`);
    builder.set(catalogId,`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    const bytes=builder.build(catalogId),fileName=`OCMAR_SOLICITUD_${folio}_${sanitize(data.name)}.pdf`,blob=new Blob([bytes],{type:'application/pdf'});
    return {blob,fileName,folio,pages:pageIds.length,bytes};
  }

  window.OCMAR_PDF={createQuotePDF};
})();

(()=>{
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const loader=$('.loader');
  if(loader){
    const seen=sessionStorage.getItem('ocmar_seen');
    if(seen){loader.remove()}else{
      sessionStorage.setItem('ocmar_seen','1'); let pct=0; const pctEl=$('#loaderPct');
      const t=setInterval(()=>{pct=Math.min(99,pct+Math.floor(Math.random()*8)+3);if(pctEl)pctEl.textContent=pct+'%'},130);
      setTimeout(()=>{clearInterval(t);if(pctEl)pctEl.textContent='100%';loader.classList.add('hide');setTimeout(()=>loader.remove(),800)},2800)
    }
  }
  const header=$('.header'); const progress=$('.scroll-progress span');
  const onScroll=()=>{header?.classList.toggle('scrolled',scrollY>18);if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%'}};onScroll();addEventListener('scroll',onScroll,{passive:true});
  const menu=$('.menu-btn'),nav=$('.navlinks');menu?.addEventListener('click',()=>{const open=nav?.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false')});$$('.navlinks a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
  const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.1}):null;$$('.reveal').forEach(e=>io?io.observe(e):e.classList.add('show'));
  $$('[data-route]').forEach(btn=>btn.addEventListener('click',()=>{const route=btn.dataset.route;if(route==='identify')location.href='asistente.html?intent=identify';else if(route==='repair')location.href='asistente.html?intent=repair';else location.href=`cotizar.html?intent=${encodeURIComponent(route)}`}));
  const tilt=$('[data-tilt]'); if(tilt&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){tilt.addEventListener('pointermove',e=>{const r=tilt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.transform=`perspective(900px) rotateX(${-y*3.5}deg) rotateY(${x*4.5}deg) translateY(-2px)`});tilt.addEventListener('pointerleave',()=>tilt.style.transform='')}
  const hero=$('.hero');if(hero&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-.5)*16,y=((e.clientY-r.top)/r.height-.5)*10;hero.style.setProperty('--hero-x',`${x.toFixed(1)}px`);hero.style.setProperty('--hero-y',`${y.toFixed(1)}px`)});hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--hero-x','0px');hero.style.setProperty('--hero-y','0px')})}
  const materialData={
    carbon:{code:'MATERIAL / 01',name:'ACERO AL CARBONO',headline:'Una familia muy común para componentes mecanizados y estructuras.',description:'Dependiendo del grado y la condición de trabajo, puede emplearse en ejes, pasadores, placas, bases, soportes, bridas y piezas mecanizadas de uso general.',examples:['Ejes','Pasadores','Placas','Soportes','Bridas'],check1:'Carga y función real',text1:'La misma geometría puede requerir un material distinto si trabaja con impacto, desgaste o carga elevada.',check2:'Grado, acabado y ambiente',text2:'La corrosión, soldabilidad, dureza y tratamiento necesario no deben asumirse únicamente por una fotografía.'},
    alloy:{code:'MATERIAL / 02',name:'ACERO ALEADO',headline:'Cuando la exigencia mecánica puede requerir mayor desempeño.',description:'Según el grado y tratamiento, puede considerarse para ejes, engranes, pernos, componentes de transmisión y piezas sometidas a carga, impacto o desgaste.',examples:['Engranes','Ejes','Pernos','Transmisión','Componentes cargados'],check1:'Tratamiento y dureza',text1:'En piezas de transmisión puede ser tan importante el tratamiento térmico como la geometría final.',check2:'Mecanizado y reparación',text2:'Antes de soldar o recuperar conviene confirmar material y condición para evitar una reparación inadecuada.'},
    stainless:{code:'MATERIAL / 03',name:'ACERO INOXIDABLE',headline:'Útil cuando el ambiente, la limpieza o la corrosión importan.',description:'Puede encontrarse en ejes, tornillería especial, soportes, componentes de proceso, piezas expuestas a humedad y aplicaciones donde se requiere resistencia a corrosión.',examples:['Ejes','Soportes','Proceso','Ambientes húmedos','Componentes especiales'],check1:'Ambiente de servicio',text1:'Contacto con humedad, químicos o alimentos cambia la selección del tipo de inoxidable y acabado.',check2:'Acabado y contaminación',text2:'El requisito superficial y la compatibilidad con el proceso deben definirse antes de fabricar.'},
    aluminum:{code:'MATERIAL / 04',name:'ALUMINIO',headline:'Menor peso y buena maquinabilidad para muchas aplicaciones.',description:'Puede utilizarse en placas, soportes, carcasas, adaptadores, bases, dispositivos y componentes donde reducir masa sea importante.',examples:['Placas','Carcasas','Bases','Adaptadores','Dispositivos'],check1:'Rigidez y carga',text1:'Menor peso no significa que cualquier geometría pueda sustituirse directamente desde acero.',check2:'Aleación y superficie',text2:'La aleación, corrosión, desgaste y posible anodizado deben evaluarse según la aplicación.'},
    bronze:{code:'MATERIAL / 05',name:'BRONCE',headline:'Frecuente en superficies de deslizamiento y componentes de desgaste.',description:'Según la aleación puede emplearse en bujes, casquillos, placas de desgaste, componentes deslizantes y algunas coronas o piezas de transmisión.',examples:['Bujes','Casquillos','Deslizamiento','Desgaste','Coronas'],check1:'Par de materiales',text1:'En un buje importa tanto el bronce como el material y acabado del eje con el que trabaja.',check2:'Lubricación y ajuste',text2:'Juego, lubricación, temperatura y velocidad influyen en la solución y dimensiones finales.'},
    polymer:{code:'MATERIAL / 06',name:'POLÍMEROS DE INGENIERÍA',headline:'Alternativas para guías, aislamiento, bajo peso o superficies de contacto.',description:'Dependiendo del polímero pueden emplearse en guías, rodillos, bujes, separadores, placas de desgaste y componentes donde se busca bajo ruido o menor fricción.',examples:['Guías','Rodillos','Bujes','Separadores','Desgaste'],check1:'Temperatura y carga',text1:'Cada polímero responde distinto a temperatura, humedad, presión y velocidad.',check2:'Compatibilidad',text2:'En aplicaciones alimenticias o químicas debe confirmarse el grado adecuado y sus requisitos específicos.'}
  };
  const renderMaterial=key=>{
    const d=materialData[key];if(!d)return;
    const set=(id,v)=>{const el=$('#'+id);if(el)el.textContent=v};
    set('materialCode',d.code);set('materialName',d.name);set('materialHeadline',d.headline);set('materialDescription',d.description);set('materialCheck1',d.check1);set('materialCheckText1',d.text1);set('materialCheck2',d.check2);set('materialCheckText2',d.text2);
    const ex=$('#materialExamples');if(ex){ex.innerHTML='';d.examples.forEach(x=>{const span=document.createElement('span');span.textContent=x;ex.appendChild(span)})}
    $$('.material-tab').forEach(btn=>{const active=btn.dataset.material===key;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',active?'true':'false')});
    const display=$('.material-display');if(display){display.classList.remove('material-pulse');void display.offsetWidth;display.classList.add('material-pulse')}
  };
  $$('.material-tab').forEach(btn=>btn.addEventListener('click',()=>renderMaterial(btn.dataset.material)));

  $$('.btn-motion').forEach(btn=>{
    if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.055,y=(e.clientY-r.top-r.height/2)*.055;btn.style.transform=`translate(${x}px,${y}px) translateY(-2px)`});
    btn.addEventListener('pointerleave',()=>btn.style.transform='');
  });

  $$('[data-year]').forEach(y=>y.textContent=new Date().getFullYear());
})();

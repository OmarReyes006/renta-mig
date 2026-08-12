
(function(){
 "use strict";
 const cfg=window.REYGUE_CONFIG||{}, DEFAULT_WA="5210000000000";
 const map={"index.html":"inicio","":"inicio","empresa.html":"empresa","capacidades.html":"capacidades","maquinado.html":"capacidades","soldadura.html":"capacidades","estructuras.html":"capacidades","mantenimiento.html":"capacidades","proyectos.html":"proyectos","proyecto.html":"proyectos","renta.html":"renta","formacion.html":"formacion","contacto.html":"contacto"};
 const file=location.pathname.split("/").pop()||"index.html", current=map[file]||"";
 const nav=[["inicio","Inicio","index.html"],["empresa","Empresa","empresa.html"],["capacidades","Capacidades","capacidades.html"],["proyectos","Proyectos","proyectos.html"],["renta","Renta","renta.html"],["formacion","Formación","formacion.html"],["contacto","Contacto","contacto.html"]];

 function header(){
  return `<a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header" data-site-header-root><div class="header-inner">
   <a class="brand-lockup transition-link" href="index.html" aria-label="Grupo REYGUE Industrial - Inicio">
    <img src="assets/images/logo-reygue.webp" alt=""><span><strong>GRUPO REYGUE</strong><small>INDUSTRIAL</small></span></a>
   <nav class="desktop-nav" aria-label="Navegación principal">${nav.map(([k,l,h])=>`<a class="${current===k?"is-active":""} transition-link" href="${h}">${l}</a>`).join("")}</nav>
   <div class="header-actions"><a class="header-quote transition-link" href="contacto.html#cotizar">Cotizar</a>
    <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button></div>
  </div>
  <div class="mobile-menu" data-mobile-menu><nav aria-label="Navegación móvil">${nav.map(([k,l,h])=>`<a class="${current===k?"is-active":""} transition-link" href="${h}">${l}<span>→</span></a>`).join("")}</nav>
  <a class="btn btn-primary transition-link" href="contacto.html#cotizar">Cotizar proyecto</a></div></header>`;
 }
 function footer(){
  return `<footer class="site-footer"><div class="footer-grid">
   <div class="footer-brand"><img src="assets/images/logo-reygue.webp" alt="Grupo REYGUE Industrial" loading="lazy"><p>Ingeniería, maquinado, soldadura, fabricación y soluciones industriales a la medida.</p></div>
   <div><h2>Capacidades</h2><a class="transition-link" href="maquinado.html">Maquinado</a><a class="transition-link" href="soldadura.html">Soldadura</a><a class="transition-link" href="estructuras.html">Estructuras</a><a class="transition-link" href="mantenimiento.html">Mantenimiento</a></div>
   <div><h2>REYGUE</h2><a class="transition-link" href="empresa.html">Empresa</a><a class="transition-link" href="proyectos.html">Proyectos</a><a class="transition-link" href="renta.html">Renta de equipo</a><a class="transition-link" href="formacion.html">Formación</a></div>
   <div><h2>Contacto</h2><span data-config="phone">${cfg.phone||"[AGREGAR TELÉFONO]"}</span><span data-config="email">${cfg.email||"[AGREGAR EMAIL]"}</span><span data-config="city">${cfg.city||"[AGREGAR CIUDAD]"}</span><button class="footer-share" type="button" data-share-site>Compartir REYGUE</button></div>
  </div><div class="footer-bottom"><span>© <span data-current-year></span> GRUPO REYGUE INDUSTRIAL</span><span>Ingeniería para construir el futuro.</span></div></footer>
  <button class="back-to-top" type="button" aria-label="Volver arriba" data-back-to-top>↑</button>
  <button class="whatsapp-float" type="button" aria-label="Abrir WhatsApp" data-whatsapp data-message="Hola, quiero información sobre los servicios de Grupo REYGUE Industrial."><span>WA</span><small>WhatsApp</small></button>
  <div class="page-transition" aria-hidden="true"></div><div class="toast" role="status" aria-live="polite" data-toast></div>
  <div class="lightbox" data-lightbox-root aria-hidden="true" role="dialog" aria-modal="true" aria-label="Vista ampliada de imagen"><button class="lightbox-close" type="button" data-lightbox-close aria-label="Cerrar">×</button><button class="lightbox-nav lightbox-prev" type="button" data-lightbox-prev aria-label="Imagen anterior">‹</button><figure><img data-lightbox-img src="" alt=""><figcaption data-lightbox-caption></figcaption></figure><button class="lightbox-nav lightbox-next" type="button" data-lightbox-next aria-label="Imagen siguiente">›</button></div>`;
 }
 document.querySelectorAll("[data-site-header]").forEach(e=>e.innerHTML=header());
 document.querySelectorAll("[data-site-footer]").forEach(e=>e.innerHTML=footer());
 document.querySelectorAll("[data-current-year]").forEach(e=>e.textContent=new Date().getFullYear());
 document.querySelectorAll("[data-config]").forEach(e=>{const k=e.dataset.config;if(cfg[k]!==undefined&&cfg[k]!=="")e.textContent=cfg[k];});

 const toggle=document.querySelector("[data-menu-toggle]"), mobile=document.querySelector("[data-mobile-menu]");
 if(toggle&&mobile)toggle.addEventListener("click",()=>{const open=document.body.classList.toggle("menu-open");toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú");});
 const hdr=document.querySelector("[data-site-header-root]"); const syncHdr=()=>hdr&&hdr.classList.toggle("is-scrolled",scrollY>16); syncHdr(); addEventListener("scroll",syncHdr,{passive:true});

 const toast=document.querySelector("[data-toast]"); let timer;
 function showToast(msg){if(!toast)return;toast.textContent=msg;toast.classList.add("is-visible");clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove("is-visible"),3000);}
 function openWA(message){
  if(!cfg.whatsappConfigured||!cfg.whatsappNumber||cfg.whatsappNumber===DEFAULT_WA){showToast("Primero configura tu número en assets/js/config.js");return false;}
  window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer"); return true;
 }
 document.addEventListener("click",e=>{const wa=e.target.closest("[data-whatsapp]");if(wa){e.preventDefault();openWA(wa.dataset.message||"Hola, quiero información sobre Grupo REYGUE Industrial.");}});

 const form=document.querySelector("[data-quote-form]");
 if(form)form.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(form);const msg=[
  "SOLICITUD DE COTIZACIÓN REYGUE","",`Nombre: ${d.get("nombre")||"-"}`,`Empresa: ${d.get("empresa")||"-"}`,`Teléfono: ${d.get("telefono")||"-"}`,`Correo: ${d.get("correo")||"-"}`,`Servicio: ${d.get("servicio")||"-"}`,"","Descripción:",d.get("descripcion")||"-"
 ].join("\n"); const opened=openWA(msg); if(!opened&&navigator.clipboard)navigator.clipboard.writeText(msg).then(()=>showToast("Solicitud copiada. Configura WhatsApp para enviarla automáticamente."));});

 document.querySelectorAll("[data-send-plan]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openWA("Hola, quiero consultar un proyecto con Grupo REYGUE Industrial. Tengo un plano, croquis, fotografía o muestra para compartir.");}));
 document.querySelectorAll("[data-share-site]").forEach(b=>b.addEventListener("click",async()=>{try{if(navigator.share)await navigator.share({title:"Grupo REYGUE Industrial",text:"Ingeniería, precisión y fabricación.",url:location.href});else{await navigator.clipboard.writeText(location.href);showToast("Enlace copiado.");}}catch(_){}}));


 // Lightbox ligero para proyectos y galerías
 const lb=document.querySelector("[data-lightbox-root]"), lbImg=document.querySelector("[data-lightbox-img]"), lbCap=document.querySelector("[data-lightbox-caption]");
 let lbItems=[], lbIndex=0, lbLastFocus=null;
 function collectLightbox(){lbItems=[...document.querySelectorAll("[data-lightbox]")];}
 function showLightbox(i){
  collectLightbox(); if(!lb||!lbItems.length)return; lbIndex=(i+lbItems.length)%lbItems.length;
  const item=lbItems[lbIndex], src=item.dataset.lightbox, alt=item.dataset.lightboxAlt||item.querySelector("img")?.alt||"Proyecto REYGUE";
  lbImg.src=src; lbImg.alt=alt; lbCap.textContent=alt; lb.classList.add("is-open"); lb.setAttribute("aria-hidden","false"); document.body.classList.add("lightbox-open");
 }
 function closeLightbox(){if(!lb)return;lb.classList.remove("is-open");lb.setAttribute("aria-hidden","true");document.body.classList.remove("lightbox-open");lbImg.src=""; if(lbLastFocus)lbLastFocus.focus();}
 document.addEventListener("click",e=>{
  const item=e.target.closest("[data-lightbox]"); if(item){e.preventDefault();collectLightbox();lbLastFocus=item;showLightbox(lbItems.indexOf(item));return;}
  if(e.target.closest("[data-lightbox-close]")){closeLightbox();return;}
  if(e.target.closest("[data-lightbox-prev]")){showLightbox(lbIndex-1);return;}
  if(e.target.closest("[data-lightbox-next]")){showLightbox(lbIndex+1);return;}
  if(lb&&e.target===lb)closeLightbox();
 });
 document.addEventListener("keydown",e=>{if(!lb?.classList.contains("is-open"))return;if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")showLightbox(lbIndex-1);if(e.key==="ArrowRight")showLightbox(lbIndex+1);});

 const back=document.querySelector("[data-back-to-top]"); if(back){const sync=()=>back.classList.toggle("is-visible",scrollY>650);addEventListener("scroll",sync,{passive:true});sync();back.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));}
 document.querySelectorAll(".faq-question").forEach(b=>b.addEventListener("click",()=>{const item=b.closest(".faq-item"),open=item.classList.toggle("is-open");b.setAttribute("aria-expanded",String(open));}));

 function reveal(){
  const t=document.querySelectorAll(".reveal:not([data-reveal-ready])");t.forEach(x=>x.dataset.revealReady="true");
  if(!("IntersectionObserver"in window)){t.forEach(x=>x.classList.add("is-visible"));return;}
  const o=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("is-visible");o.unobserve(en.target);}}),{threshold:.12});t.forEach(x=>o.observe(x));
 }
 reveal(); document.addEventListener("reygue:content-updated",reveal);

 const par=document.querySelector("[data-parallax]");
 if(par&&!matchMedia("(prefers-reduced-motion: reduce)").matches)addEventListener("scroll",()=>{par.style.transform=`translate3d(0, ${Math.min(scrollY*.08,48)}px, 0) scale(1.03)`;},{passive:true});

 function transitions(){document.querySelectorAll("a.transition-link:not([data-transition-ready])").forEach(a=>{a.dataset.transitionReady="true";a.addEventListener("click",e=>{const h=a.getAttribute("href");if(!h||h.startsWith("#")||a.target==="_blank"||/^(https?:|mailto:|tel:)/i.test(h))return;const u=new URL(h,location.href);if(u.origin!==location.origin)return;e.preventDefault();document.body.classList.add("is-leaving");setTimeout(()=>location.href=h,330);});});}
 transitions();document.addEventListener("reygue:content-updated",transitions);

 const spies=document.querySelectorAll("[data-spy-link]");
 if(spies.length&&"IntersectionObserver"in window){const sections=[...spies].map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const o=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!v)return;spies.forEach(a=>a.classList.toggle("is-active",a.getAttribute("href")===`#${v.target.id}`));},{rootMargin:"-25% 0px -60% 0px",threshold:[.1,.3,.6]});sections.forEach(s=>o.observe(s));}
})();

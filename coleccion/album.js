(function(){'use strict';
var D=window.GALOIS_CAMPINA,A=window.GaloisColeccion;if(!D||!A)return;
var $=function(id){return document.getElementById(id)}, esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var CATS=D.categorias,RAR=D.rarezas,cats=Object.keys(CATS),src={
'1':'https://www.andalucia.org/listing/fuentes-de-andaluc%C3%ADa/20016102/',
'2':'https://en.andalucia.org/listing/roman-towns-of-baetica-seville/21417101/',
'3':'https://www.andalucia.org/listing/ruta-de-las-once-torres-de-%C3%89cija/21482102/',
'4':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'5':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'6':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'7':'https://visitasevilla.es/semana-santa-en-los-barrios/',
'8':'https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/',
'9':'https://en.andalucia.org/listing/roman-towns-of-baetica-seville/21417101/',
'10':'https://visitasevilla.es/basilica-y-murallas-de-la-macarena/'};
var patterns={
devocion:'<circle cx="80" cy="50" r="37" fill="none" stroke="#f9dc89" stroke-width="5" stroke-dasharray="5 6"/><path d="M26 174 50 93 109 93 135 174Z" fill="#ece0f5" stroke="#ebc774" stroke-width="5"/><path d="M43 167 59 93 100 93 120 167Z" fill="#6b549b"/><ellipse cx="80" cy="82" rx="21" ry="28" fill="#e7ad84"/><path d="M60 72Q80 39 100 72L99 53H61Z" fill="#583e38"/><path d="m54 51 5-21 13 9 8-19 8 19 13-9 5 21Z" fill="#fbd476" stroke="#99692f" stroke-width="3"/><circle cx="73" cy="82" r="2" fill="#372334"/><circle cx="88" cy="82" r="2" fill="#372334"/><path d="M72 98Q80 104 88 98" fill="none" stroke="#904f52" stroke-width="2"/>',
futbol:'<ellipse cx="80" cy="174" rx="59" ry="13" fill="#15101d" opacity=".35"/><path d="M43 108 65 97 95 97 117 108 131 172H29Z" fill="#faf7eb" stroke="#261f33" stroke-width="5"/><path d="M62 104V168H74V102M85 102V168H98V104" stroke="#cc435d" stroke-width="10" fill="none"/><path d="M52 66Q50 34 80 31Q114 33 109 70L104 92Q79 120 56 94Z" fill="#e1a273" stroke="#342535" stroke-width="5"/><path d="M51 63Q47 30 83 27Q106 27 110 51Q86 38 67 58Z" fill="#392d2d"/><path d="M35 128 15 151M124 129 142 150" stroke="#e2a57c" stroke-width="12"/><circle cx="122" cy="147" r="18" fill="#eee7d8" stroke="#24212f" stroke-width="4"/><path d="m122 134 11 8-4 12-14 2-7-11Z" fill="#32283c"/>',
patrimonio:'<path d="M10 178V100L23 100V75H40V100H58V57H72V35H89V57H104V100H119V78H139V100H151V178Z" fill="#ddbb85" stroke="#5d3a4f" stroke-width="5"/><path d="M23 97V75h17v22M119 100V78h19v22" fill="#ae866e" stroke="#533d4c" stroke-width="3"/><rect x="72" y="57" width="17" height="33" fill="#73506d"/><path d="M61 178v-35q19-29 38 0v35Z" fill="#513c51"/><rect x="22" y="123" width="14" height="20" fill="#51435c"/><rect x="123" y="123" width="14" height="20" fill="#51435c"/><path d="M0 177H160" stroke="#927351" stroke-width="8"/>',
historia:'<path d="M48 35H121V163H45V36Q41 22 54 23H117Q131 24 126 40" fill="#f8dfa2" stroke="#865c42" stroke-width="6"/><path d="M61 64H108M61 83H106M61 102H99M61 120H110M61 140H94" stroke="#a1795a" stroke-width="5"/><path d="M28 148 94 52" stroke="#f4c269" stroke-width="10"/><circle cx="96" cy="51" r="9" fill="#f6e49c" stroke="#916d36" stroke-width="4"/>',
tradicion:'<path d="M80 153 19 88Q80 13 141 88Z" fill="#f5db9b" stroke="#713f70" stroke-width="5"/><path d="M80 153 39 66M80 153 59 45M80 153 80 36M80 153 101 45M80 153 121 66" stroke="#a34e77" stroke-width="5"/><circle cx="80" cy="153" r="9" fill="#ffe5ae" stroke="#683f5f" stroke-width="4"/><path d="M12 180H148V195H12Z" fill="#c9a6cf"/>',
campina:'<path d="M0 118 35 91 70 111 118 83 160 98V196H0Z" fill="#a7aa66"/><path d="M0 143 34 125 73 142 119 113 160 129V196H0Z" fill="#718752"/><path d="M68 156 75 101H86L94 156Z" fill="#795342"/><circle cx="81" cy="77" r="32" fill="#386847"/><circle cx="57" cy="97" r="25" fill="#518758"/><circle cx="102" cy="94" r="27" fill="#47734b"/><circle cx="60" cy="89" r="5" fill="#b4ca66"/><circle cx="94" cy="79" r="5" fill="#b4ca66"/><path d="M20 180V144M16 151L20 144 24 151M137 180V145M132 152L137 145 142 152" stroke="#e9c477" stroke-width="5"/>'
};
function artSVG(c){
 var cc=c.color||'#9e78b6',ground=patterns[c.categoria]||patterns.patrimonio;
 if(c.categoria==='futbol'&&/Joaquín|Gordillo/.test(c.nombre))ground=ground.replace('#cc435d','#258d64');
 var stars=c.rareza==='legendaria'?'★ ★ ★':c.rareza==='epica'?'★ ★':'★';
 var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 210" shape-rendering="crispEdges" role="img"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#282048"/><stop offset=".8" stop-color="'+cc+'"/><stop offset="1" stop-color="#edbf85"/></linearGradient></defs><rect width="160" height="210" fill="url(#sky)"/><path d="M0 35h160M0 72h160M0 109h160M0 145h160" stroke="#fff" opacity=".07" stroke-width="2"/><circle cx="125" cy="38" r="18" fill="#fff3c2" opacity=".56"/>'+ground+'<rect x="5" y="5" width="150" height="200" rx="4" fill="none" stroke="#f7d98d" stroke-width="5"/><rect x="43" y="179" width="74" height="25" fill="#241930" stroke="#e6b963" stroke-width="2"/><text x="80" y="195" text-anchor="middle" font-family="serif" font-size="13" fill="#ffe6a5">'+stars+'</text></svg>';
 return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}
function datosPerfil(){var db=A.leer();return db.perfiles[A.activo()]||{retos:{},cartas:[]}}
function guardadas(){var p=datosPerfil();return Array.isArray(p.cartas)?p.cartas:[]}
function actualizar(){
 var p=datosPerfil(),ids=guardadas(),worlds=D.mundos.filter(w=>D.cartas.filter(c=>c.mundo===w.id).every(c=>ids.includes(c.id))).length;
 $('nCards').textContent=ids.length+' / '+D.cartas.length;$('nWorlds').textContent=worlds+' de '+D.mundos.length+' reinos completos';$('progress').value=ids.length;
 var fW=$('fWorld').value,fC=$('fCat').value,fS=$('fState').value;
 var shown=D.cartas.filter(c=>(!fW||String(c.mundo)===fW)&&(!fC||c.categoria===fC)&&(!fS||(fS==='owned'?ids.includes(c.id):!ids.includes(c.id))));
 $('album').innerHTML=shown.map(function(c){var own=ids.includes(c.id),wc=D.mundos[c.mundo-1];var classN='card '+(own?'owned':'locked')+(own&&c.rareza==='rara'?' rare':'')+(own&&c.rareza==='epica'?' epic':'')+(own&&c.rareza==='legendaria'?' legend':'');return '<article class="'+classN+'"><button type="button" data-id="'+c.id+'" aria-label="'+(own?'Ver carta ':'Carta por descubrir: ')+esc(c.nombre)+'"><div class="art"><img loading="lazy" src="'+artSVG(c)+'" alt="'+esc('Ilustración simbólica de '+c.nombre)+'">'+(own?'':'<span class="lock" aria-hidden="true">?</span>')+'</div><div class="tag">'+(own?RAR[c.rareza]:'SIN DESCUBRIR')+'</div><h3>'+(own?esc(c.nombre):'Carta '+c.etapa+' · ???')+'</h3><span class="world">Mundo '+c.mundo+' · '+esc(wc.lugar)+'</span><p>'+(own?esc(CATS[c.categoria]):'Supera retos para encontrarla')+'</p></button></article>'}).join('');
 $('feedback').textContent=shown.length+' cartas en esta vista · perfil: '+A.activo()}
function mostrar(id){var c=D.cartas.find(x=>x.id===id);if(!c)return;var ok=guardadas().includes(id),w=D.mundos[c.mundo-1];
 $('dialogContent').innerHTML='<div class="art"><img src="'+artSVG(c)+'" alt="'+esc('Ilustración simbólica de '+c.nombre)+'"></div><h2>'+(ok?esc(c.nombre):'Carta por descubrir')+'</h2><p class="fact">'+(ok?esc(c.descripcion):'Desbloquéala completando un reto matemático distinto en '+esc(w.lugar)+'.')+'</p><small>'+esc(w.nombre)+' · '+(ok?esc(CATS[c.categoria])+' · '+esc(RAR[c.rareza]):'Mundo '+w.id)+'</small>'+(ok?'<p><a href="'+src[String(w.id)]+'" target="_blank" rel="noopener noreferrer">Conocer el patrimonio del lugar ↗</a></p>':'');
 $('detalle').showModal()}
function exportar(){var data=datosPerfil();var out={app:'galoisLegacyColeccion',version:1,perfil:A.activo(),cartas:guardadas(),retos:data.retos||{}};var blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='galois-cartas-'+A.activo().replace(/[^a-z0-9-]/gi,'-')+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},300)}
function importar(file){if(!file)return;var r=new FileReader();r.onload=function(){try{var obj=JSON.parse(String(r.result)),known=new Set(D.cartas.map(x=>x.id));if(obj.app!=='galoisLegacyColeccion'||!Array.isArray(obj.cartas))throw Error('Formato incorrecto');var db=A.leer(),key=A.activo(),p=db.perfiles[key]||{retos:{},cartas:[]};p.cartas=[...new Set((p.cartas||[]).concat(obj.cartas.filter(x=>known.has(x))))];if(obj.retos&&typeof obj.retos==='object'){Object.entries(obj.retos).forEach(function(pair){if(!/^(10|[1-9])$/.test(pair[0])||!pair[1]||typeof pair[1]!=='object')return;var existing=p.retos[pair[0]]||{};Object.keys(pair[1]).filter(k=>k.length<=70).forEach(k=>{if(pair[1][k]===true)existing[k]=true});p.retos[pair[0]]=existing})}db.perfiles[key]=p;localStorage.setItem('galoisLegacy.coleccion.v1',JSON.stringify(db));actualizar();$('feedback').textContent='Progreso importado a '+key+' correctamente.'}catch(e){$('feedback').textContent='No se pudo importar: '+e.message}};r.readAsText(file)}
$('alias').value=A.activo();$('saveAlias').onclick=function(){A.seleccionar($('alias').value);$('alias').value=A.activo();actualizar()};
$('fWorld').innerHTML+=[...D.mundos].map(w=>'<option value="'+w.id+'">'+w.id+' · '+esc(w.lugar)+'</option>').join('');
$('fCat').innerHTML+=cats.map(k=>'<option value="'+k+'">'+esc(CATS[k])+'</option>').join('');
['fWorld','fCat','fState'].forEach(k=>$(k).addEventListener('change',actualizar));
$('album').addEventListener('click',function(e){var b=e.target.closest('[data-id]');if(b)mostrar(b.dataset.id)});
$('close').onclick=function(){$('detalle').close()};
$('export').onclick=exportar;$('importFile').addEventListener('change',function(e){importar(e.target.files[0]);e.target.value=''});actualizar();
})();

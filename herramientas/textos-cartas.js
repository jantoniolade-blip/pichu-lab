/* Textos culturales revisados de las 60 cartas (noviembre de 2026).
   Uso: node herramientas/textos-cartas.js  → reescribe las descripciones en coleccion/datos.js.
   Criterio: dos frases breves, datos generales y contrastables; cuando un detalle
   local no está confirmado, se describe de forma general en lugar de inventarlo. */
const fs = require('fs'), path = require('path');
const T = {
  'campina-1-1': 'Fortaleza de origen medieval situada en el término de Fuentes de Andalucía, en plena campiña. Sus muros recuerdan siglos de frontera y vigilancia de los caminos.',
  'campina-1-2': 'Advocación mariana presente en la tradición religiosa andaluza, cuya festividad se celebra el 5 de agosto. Aparece aquí como parte del patrimonio artístico y cultural del pueblo.',
  'campina-1-3': 'Familia de alarifes (maestros de obras) de Fuentes de Andalucía que trabajó en el barroco del siglo XVIII. El instituto de la localidad, punto de partida de esta aventura, lleva su nombre.',
  'campina-1-4': 'La campiña sevillana es tierra de secano, de suelos fértiles y suaves lomas. El trigo, la cebada y el girasol se alternan con el olivar según la estación.',
  'campina-1-5': 'Templo del patrimonio religioso de Fuentes de Andalucía. Como otras iglesias de la villa, muestra la arquitectura andaluza de la Edad Moderna, con ladrillo, cal y torre.',
  'campina-1-6': 'Casa señorial de Fuentes de Andalucía. Las portadas, rejas y patios de este tipo de casas reflejan la riqueza de la arquitectura civil de la villa.',
  'campina-2-1': 'Puerta fortificada de origen romano, reformada en época islámica y cristiana. Es uno de los símbolos de Carmona y la entrada histórica desde el camino de Sevilla.',
  'campina-2-2': 'Recinto defensivo que protegió la ciudad desde la Antigüedad. Se conservan tramos de muralla y varias puertas monumentales.',
  'campina-2-3': 'Puerta de origen romano, reformada en la Edad Moderna con aspecto clásico. Se abría al camino que llevaba hacia Córdoba.',
  'campina-2-4': 'Cementerio de época romana con tumbas excavadas en la roca, como la Tumba de Servilia o la del Elefante. Es uno de los conjuntos arqueológicos más importantes de Andalucía.',
  'campina-2-5': 'Futbolista nacido en Camas en 1986 que debutó en el Sevilla FC. Fue campeón del mundo con la selección española en 2010.',
  'campina-2-6': 'Fortaleza levantada sobre la Puerta de Sevilla de Carmona. Desde su torre se domina la vega y los caminos que llegaban a la ciudad.',
  'campina-3-1': 'Campanario barroco del siglo XVIII, decorado con azulejos de colores. Es una de las torres más admiradas del horizonte de Écija.',
  'campina-3-2': 'Torre de la iglesia de Santa Cruz, parte de la ruta de las torres ecijanas. Sus campanas y remates forman parte del perfil barroco de la ciudad.',
  'campina-3-3': 'Plaza mayor de Écija, conocida popularmente como «el Salón». Es el centro de la vida de la ciudad y bajo ella se han hallado restos de su pasado.',
  'campina-3-4': 'En época romana Écija se llamaba Astigi y fue una ciudad muy importante de la Bética. Muchos de sus mosaicos se exponen en el museo histórico de la ciudad.',
  'campina-3-5': 'Futbolista nacido en Utrera en 1983 que debutó muy joven en el Sevilla FC y jugó en clubes como el Arsenal. Ganó varias competiciones europeas con el Sevilla; falleció en 2019.',
  'campina-3-6': 'Itinerario por los campanarios barrocos que dan a Écija el nombre de «ciudad de las torres». Recorrerlo es mirar la ciudad hacia arriba.',
  'campina-4-1': 'Puerta de la antigua muralla de Marchena, también conocida como Arco de la Rosa. Da paso al casco histórico de la villa.',
  'campina-4-2': 'Restos del recinto amurallado medieval que protegía Marchena. Sus tramos y puertas recuerdan la importancia de la villa en la campiña.',
  'campina-4-3': 'El olivar ocupa buena parte de la campiña sevillana. De la aceituna se obtienen aceite y aceituna de mesa, de la que la provincia de Sevilla es gran productora.',
  'campina-4-4': 'En la almazara se lava, muele y prensa la aceituna para obtener el aceite de oliva. Antes se usaban molinos de piedra y prensas de viga; hoy, máquinas modernas.',
  'campina-4-5': 'Pieza inventada para el juego, inspirada en los azulejos andaluces. Representa la cosecha repartida en partes iguales, como una fracción.',
  'campina-4-6': 'Carta legendaria inventada para el juego. Simboliza el trabajo compartido en el campo: un todo que se reparte en partes.',
  'campina-5-1': 'Torre del castillo medieval de Estepa, en lo alto del Cerro de San Cristóbal. Desde allí se domina un amplio paisaje de campiña y sierra.',
  'campina-5-2': 'Cerro sobre el que se asentó la Estepa histórica, con su castillo y su iglesia. Por sus vistas, a Estepa la llaman «el Balcón de Andalucía».',
  'campina-5-3': 'Dulce navideño de manteca, harina y azúcar, famoso en toda España. Su elaboración es una tradición artesanal e industrial muy importante en Estepa.',
  'campina-5-4': 'Dulce de la misma familia que el mantecado, con almendra y forma ovalada, que se deshace al morderlo. Se envuelve tradicionalmente en papel de seda.',
  'campina-5-5': 'Los olivares rodean Estepa y forman terrazas en sus lomas. El aceite de la comarca tiene fama por su calidad.',
  'campina-5-6': 'Plano inventado para el juego. Sirve para practicar escalas: cada centímetro del papel representa una distancia real.',
  'campina-6-1': 'Universidad fundada en el siglo XVI por el conde de Ureña. Su edificio, con torres en las esquinas y patio central, domina Osuna desde lo alto.',
  'campina-6-2': 'Gran templo renacentista del siglo XVI, junto a la antigua universidad. Guarda obras de arte y el panteón de los duques de Osuna.',
  'campina-6-3': 'Calle de Osuna famosa por sus palacios y portadas barrocas. Pasear por ella es recorrer la arquitectura señorial de la villa.',
  'campina-6-4': 'Antiguas canteras de piedra explotadas desde época romana. Sus paredes talladas forman hoy un paisaje singular junto a la localidad.',
  'campina-6-5': 'Osuna fue sede del ducado del mismo nombre, uno de los más poderosos de España. Sus palacios e iglesias recuerdan aquella época.',
  'campina-6-6': 'Objeto inventado para el juego. Esconde expresiones algebraicas: letras que guardan números desconocidos.',
  'campina-7-1': 'Inaugurado en 1852, fue el primer puente fijo de hierro sobre el Guadalquivir en Sevilla. Une el barrio de Triana con el centro de la ciudad.',
  'campina-7-2': 'Advocación mariana de la Hermandad de la Esperanza de Triana, muy vinculada a los marineros del barrio. Procesiona en la Madrugada del Viernes Santo.',
  'campina-7-3': 'Advocación de la Hermandad de la Estrella, del barrio de Triana. Procesiona el Domingo de Ramos y es muy querida en el barrio.',
  'campina-7-4': 'Triana es desde hace siglos un gran centro alfarero. Sus talleres han dado azulejos, platos y piezas de cerámica que decoran toda Sevilla.',
  'campina-7-5': 'Futbolista nacido en El Puerto de Santa María en 1981, símbolo del Real Betis Balompié. Se retiró en 2023, con más de 40 años.',
  'campina-7-6': 'Futbolista nacido en Almendralejo en 1957, referente histórico del Real Betis Balompié. También jugó en el Real Madrid y en la selección española.',
  'campina-8-1': 'Castillo de origen almohade, uno de los mayores recintos fortificados de la provincia. Se alza sobre el río Guadaíra.',
  'campina-8-2': 'Durante siglos, decenas de molinos harineros aprovecharon la corriente del Guadaíra. Molían el trigo con el que se hacía el famoso pan de Alcalá.',
  'campina-8-3': 'Afluente del Guadalquivir que atraviesa Alcalá de Guadaíra. Sus orillas, con pinares y molinos, forman un paisaje muy valioso.',
  'campina-8-4': 'Puente moderno de Alcalá de Guadaíra cuya estructura, recubierta de cerámica, recuerda a un dragón. Es uno de los iconos contemporáneos de la ciudad.',
  'campina-8-5': 'A Alcalá se la conoció como «Alcalá de los Panaderos» porque abastecía de pan a Sevilla. La tradición panadera sigue viva en el pueblo.',
  'campina-8-6': 'Rueda inspirada en los molinos hidráulicos. El agua mueve la rueda y la rueda mueve la piedra que muele el grano.',
  'campina-9-1': 'Uno de los mayores anfiteatros del Imperio romano, con capacidad para unos 25 000 espectadores. Se usaba para espectáculos de gladiadores.',
  'campina-9-2': 'Los suelos de las casas de Itálica se decoraban con mosaicos de teselas: figuras geométricas, aves y escenas mitológicas.',
  'campina-9-3': 'Teatro romano de Itálica, donde se representaban obras para el público de la ciudad. Sus gradas siguen en pie en el actual Santiponce.',
  'campina-9-4': 'Marco Ulpio Trajano nació en Itálica en el año 53 y fue el primer emperador romano nacido fuera de Italia. Bajo su gobierno el Imperio alcanzó su mayor extensión.',
  'campina-9-5': 'Emperador romano muy ligado a Itálica, de donde procedía su familia. Embelleció la ciudad con nuevos barrios y edificios.',
  'campina-9-6': 'Localidad sevillana junto a la que se conservan las ruinas de Itálica. También alberga el monasterio de San Isidoro del Campo.',
  'campina-10-1': 'Advocación mariana de la Hermandad de la Macarena, cuya basílica está junto a las murallas de Sevilla. Procesiona en la Madrugada del Viernes Santo.',
  'campina-10-2': 'Patrona de Sevilla y de su archidiócesis, venerada en la Catedral. Su procesión del 15 de agosto es una de las tradiciones más antiguas de la ciudad.',
  'campina-10-3': 'Antiguo alminar almohade del siglo XII, al que en el siglo XVI se añadió el campanario renacentista. Mide unos 100 metros y la corona el Giraldillo.',
  'campina-10-4': 'Conjunto de palacios y jardines usado por los reyes durante siglos, con arte mudéjar. Es Patrimonio de la Humanidad junto con la Catedral y el Archivo de Indias.',
  'campina-10-5': 'Futbolista nacido en Los Palacios y Villafranca en 1985, capitán y leyenda del Sevilla FC. Fue campeón del mundo con la selección española en 2010.',
  'campina-10-6': 'Obra del arquitecto Aníbal González para la Exposición Iberoamericana de 1929. Sus bancos de azulejos representan las provincias de España.'
};
const f = path.join(__dirname, '../coleccion/datos.js');
global.window = {}; require(f);
const D = window.GALOIS_CAMPINA; let n = 0;
D.cartas.forEach(c => { if (T[c.id]) { c.descripcion = T[c.id]; n++; } });
D.version = 2;
fs.writeFileSync(f, '/* Galois Legacy · 10 mundos, 50 aventuras detalladas, 60 cartas culturales. */\nwindow.GALOIS_CAMPINA=' + JSON.stringify(D, null, 2) + ';\n');
console.log('Descripciones actualizadas:', n);

/* SECUESTRADOS.EXE — CONFIGURACIÓN DEL PROFESOR
   Puedes editarla en GitHub (archivo config.js > lápiz > Commit changes).
   No se guardan datos personales en el servidor: no existe servidor de juego.
*/
window.JUEGO = {
  titulo: 'SECUESTRADOS.EXE',
  atacante: 'ROOT',

  // CAMBIAR PARA CADA TANDA si quieres un orden diferente de estaciones.
  // IMPORTANTE: la misma semilla debe valer para los SEIS móviles de una tanda.
  semillaSesionRutas: 'HALLOWEEN-2026-SESION-1',

  // HORARIO: por defecto una partida de 1 h termina a la siguiente hora en punto,
  // y una de 2 h, dos horas en punto después del comienzo de la hora actual.
  // Ejemplo: inicio 10:12 + código de 1 h => fin de clase 11:00;
  // el juego pasa al desenlace a las 10:55.
  // Si la clase NO acaba a la hora en punto, escribe '11:50' (formato HH:MM).
  // IMPORTANTE: dejar '' para el horario automático habitual.
  horaFinClase: '',
  minutosAntesDeClaseParaCerrar: 5,
  segundosMinimosParaIniciarOtraPrueba: 10 * 60,
  segundosDesplazamientoEstimados: 120,
  segundosVideoFinalEstimados: 120,

  // RELOJ DE RECEPCIÓN: +1 minuto 40 segundos = 100 segundos ADELANTADO.
  // Si luego cambia, edita solamente este número (negativo si va atrasado).
  desfaseRelojSegundos: 100,
  margenRelojSegundos: 10,

  // PISTAS, SALTO y protección contra probar contraseñas al azar.
  segundosPistas: [90, 180, 300],
  segundosHastaPermitirSalto: 360,
  segundosBloqueoFallos: [10, 20, 30],

  // ARCHIVOS MP4 con subtítulos quemados. NO necesitan .srt ni .vtt.
  videos: {
    historias: [
      'historia_00_SUB_GITHUB.mp4',
      'historia_01_SUB_GITHUB.mp4',
      'historia_02_SUB_GITHUB.mp4',
      'historia_03_SUB_GITHUB.mp4',
      'historia_04_SUB_GITHUB.mp4',
      'historia_05_SUB_GITHUB.mp4'
    ],
    destinos: [
      'destino_01_SUB_GITHUB.mp4',
      'destino_02_SUB_GITHUB.mp4',
      'destino_03_SUB_GITHUB.mp4',
      'destino_04_SUB_GITHUB.mp4',
      'destino_05_SUB_GITHUB.mp4',
      'destino_06_SUB_GITHUB.mp4'
    ],
    glitch: 'glitch_transicion_01.mp4',
    final: 'final_SUB_GITHUB.mp4'
  },

  // Para 2-5 estaciones se seleccionan episodios que recorren la historia.
  episodiosPorCantidad: {
    2: [0, 5],
    3: [0, 3, 5],
    4: [0, 2, 4, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5]
  },

  pruebas: [
    {
      id: 1, titulo: 'El correo infiltrado',
      lugar: 'Puerta marrón situada más al sur del instituto.',
      instrucciones: 'Localizad los quince correos. Uno intenta engañaros para que entreguéis vuestra contraseña. Introducid el código de registro que figura en ese correo.',
      respuesta: '7316', tipo: 'codigo',
      pistas: [
        'No todos los mensajes son lo que parecen. Fijaos en quién los envía y qué os están pidiendo.',
        'Un correo puede parecer oficial sin serlo. Comparad las direcciones de los remitentes, los enlaces y las solicitudes que aparecen en los mensajes.',
        'Buscad un mensaje que os presione para actuar rápidamente y os pida introducir vuestras credenciales. Cuando lo encontréis, fijaos en su número de registro.'
      ]
    },
    {
      id: 2, titulo: 'Copias de seguridad corruptas',
      lugar: 'Puerta del estudio de radio, antiguo horno, junto a la cafetería.',
      instrucciones: 'Tenéis seis versiones dañadas del mismo texto. Comparad las copias y recuperad el mensaje original. Introducid el número que describe.',
      respuesta: '67', tipo: 'codigo',
      pistas: [
        'Parece que ninguna copia contiene toda la información. Pero quizá lo que falta en una se encuentre en otra.',
        'Todas las copias pertenecen al mismo documento. Comparad las palabras que ocupan las mismas posiciones y utilizadlas para completar los espacios censurados.',
        'No necesitáis reconstruir absolutamente todo para reconocer de qué habla el texto. Buscad las referencias a una canción, al baloncesto y a un gesto con las manos. La contraseña son dos números muy conocidos.'
      ]
    },
    {
      id: 3, titulo: 'La contraseña imposible',
      lugar: 'Reloj físico de recepción.',
      instrucciones: 'Introducid ÚNICAMENTE los dos dígitos del minuto que marca el reloj físico de recepción, no el teléfono. La clave cambia cuando cambia ese minuto.',
      respuesta: '', tipo: 'reloj',
      pistas: [
        'Mi contraseña cambia cada minuto. ¿Qué objeto de vuestro entorno os permite observar ese cambio?',
        'No perdáis el tiempo mirando la hora de vuestro teléfono. Hay otro reloj mucho más interesante delante de vosotros.',
        'La contraseña son únicamente los dos dígitos de los minutos que marca el reloj físico. No importa que esté desajustado.'
      ]
    },
    {
      id: 4, titulo: 'La frontera de hierro',
      lugar: 'Frontera de hierro gris del ESTE del instituto, junto al centro vecino.',
      instrucciones: 'ROOT os ha pedido escuchar junto a la frontera de hierro. Observad con atención el entorno. No crucéis, trepéis ni os apoyéis en el metal.',
      respuesta: 'NF', tipo: 'codigo',
      pistas: [
        'Os he pedido que escuchéis, pero ¿estáis seguros de que la información que buscáis es un sonido?',
        'A veces buscamos respuestas demasiado lejos cuando las tenemos delante de nuestras propias narices.',
        'Dejad de escuchar y empezad a observar. Buscad las letras escritas sobre el muro. La respuesta está en el grafiti.'
      ]
    },
    {
      id: 5, titulo: 'Los bits perdidos',
      lugar: 'Una portería de fútbol; la tabla de conversión está en el muro más próximo a las pistas deportivas.',
      instrucciones: 'Encontrad las cuatro tiras numeradas de bombillas y la tabla binario-decimal. Blanco = encendida; negro = apagada. Traducid las secuencias y formad la clave respetando el orden de las tiras.',
      respuesta: '5937', tipo: 'codigo',
      pistas: [
        'Los ordenadores no necesitan palabras para comunicarse. Dos estados son suficientes para representar información.',
        'Una bombilla encendida puede representar un 1 y una apagada, un 0. Traducid los cuatro círculos de cada fragmento a una secuencia binaria.',
        'Las bombillas blancas representan unos y las negras, ceros. Leed cada grupo de izquierda a derecha, buscad su equivalencia en la tabla y ordenad los cuatro resultados según el número de cada fragmento.'
      ]
    },
    {
      id: 6, titulo: 'Los documentos alterados',
      lugar: 'Puerta del aula 206 (Tecnología Aplicada), presentada como habitación 206 de un hotel.',
      instrucciones: 'Comprobad el dígito de control de los seis personajes. Descartad los documentos alterados y unid los fragmentos de los documentos válidos EN EL ORDEN EN QUE APARECEN EN EL TABLERO.',
      respuesta: '5173', tipo: 'codigo',
      pistas: [
        'Un documento puede parecer correcto a simple vista y contener información alterada. Comprobad los números, no las caras.',
        'Cada identificador tiene cuatro cifras. Sumadlas y comparad la última cifra del resultado con el dígito de control que aparece en el documento.',
        'Los documentos cuyo dígito de control no coincida están alterados y no deben utilizarse. Conservad únicamente los fragmentos de los documentos válidos y leedlos en el orden establecido en el tablero.'
      ]
    }
  ]
};

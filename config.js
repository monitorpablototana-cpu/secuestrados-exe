/* CONFIGURACIÓN DEL PROFESOR — SECUESTRADOS.EXE
   Las descripciones internas de las pruebas JAMÁS se muestran al alumno.
   Videos: tus MP4 actuales de GitHub, sin cambiarlos ni reexportarlos.
*/
window.JUEGO = {
  titulo: 'SECUESTRADOS.EXE',
  atacante: 'ROOT',

  // Cada tanda necesita UNA semilla compartida entre todos los equipos.
  // Cambia este texto entre tandas, nunca durante una tanda en marcha.
  semillaSesionRutas: 'HALLOWEEN-2026-SESION-1',

  // PRIMER DÍGITO DEL CÓDIGO: 1 = 60 min / 2 = 120 min, DESDE QUE PULSAN INICIAR.
  // No se supone a qué hora terminan las clases.
  // Si quieres añadir un cierre escolar real, pon la hora: '11:50'.
  // Dejar vacío para que SOLO rija la duración del código.
  horaFinClase: '',
  minutosAntesDeClaseParaCerrar: 5,
  segundosMinimosParaIniciarOtraPrueba: 600,
  segundosDesplazamientoEstimados: 120,
  segundosVideoFinalEstimados: 120,

  // Reloj de recepción adelantado 1 minuto y 40 segundos.
  desfaseRelojSegundos: 100,
  margenRelojSegundos: 10,

  // La prueba puede omitirse después de 6 min; la web no cuenta esos minutos de vídeo.
  segundosPistas: [90, 180, 300],
  segundosHastaPermitirSalto: 360,
  segundosBloqueoFallos: [10, 20, 30],

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

  // Saltos narrativos cuando hay menos de seis fases.
  episodiosPorCantidad: {
    2: [0, 5],
    3: [0, 3, 5],
    4: [0, 2, 4, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5]
  },

  // Datos secretos del juego: sólo los usa el motor y la documentación del profesor.
  // Ningún título, localización, explicación o respuesta aparece junto al campo de clave.
  pruebas: [
    {
      id: 1, titulo: 'Phishing', lugar: 'Puerta marrón del extremo sur del instituto', tipo: 'codigo', respuesta: '7316',
      pistas: [
        'No todos los remitentes son quienes afirman ser. Buscad incongruencias.',
        'Prestad atención a las direcciones y a los mensajes que os obligan a reaccionar con urgencia.',
        'El correo sospechoso intenta que entreguéis las credenciales. Introducid el número de registro de ESE mensaje.'
      ]
    },
    {
      id: 2, titulo: 'Copias de seguridad', lugar: 'Estudio de radio, antes horno, junto a cafetería', tipo: 'codigo', respuesta: '67',
      pistas: [
        'Una sola copia no basta para reconstruirlo todo.',
        'Los huecos no coinciden entre los seis documentos: reunid los fragmentos complementarios.',
        'El texto recuperado menciona una canción, baloncesto y dos números seguidos pronunciados en inglés.'
      ]
    },
    {
      id: 3, titulo: 'Reloj de recepción', lugar: 'Reloj físico de recepción', tipo: 'reloj', respuesta: '',
      pistas: [
        'La clave no es fija: cambia incluso cuando nadie toca nada.',
        'No os fiéis de la hora que os enseña el móvil. Observad aquello a lo que ROOT os ha llevado.',
        'Fijaos en los minutos que marca el reloj de recepción. Introducid solamente esas dos cifras.'
      ]
    },
    {
      id: 4, titulo: 'Frontera de hierro gris', lugar: 'Muro gris de hierro del este, junto al otro centro', tipo: 'codigo', respuesta: 'F',
      claveParcial: 'N_',
      pistas: [
        'ROOT insiste en escuchar. ¿Y si estuvierais utilizando el sentido equivocado?',
        'La respuesta está a simple vista, sobre la propia frontera.',
        'Entre los caracteres del grafiti se puede leer NF. Ya tenéis la N: escribid solo la letra que falta.'
      ]
    },
    {
      id: 5, titulo: 'Binario', lugar: 'Portería de fútbol con hoja de conversiones en muro cercano a las pistas', tipo: 'codigo', respuesta: '5937',
      pistas: [
        'Dos estados bastan para representar información: encendido y apagado.',
        'Los círculos blancos representan bombillas encendidas y los negros apagadas. Traducidlos a 1 y 0.',
        'Leed cada grupo de cuatro bits de izquierda a derecha y convertidlo con la tabla del muro. Unid los cuatro resultados en el orden de las tiras.'
      ]
    },
    {
      id: 6, titulo: 'Integridad', lugar: 'Puerta del aula 206 (habitación 206 del hotel)', tipo: 'codigo', respuesta: '5173',
      pistas: [
        'La apariencia de los documentos no garantiza que sus cifras sean correctas.',
        'Sumad las cuatro cifras del identificador. Su última cifra debe coincidir con el dígito de control.',
        'Descartad los documentos que no superen esa comprobación. Tomad los fragmentos de los válidos EN EL ORDEN DEL TABLERO.'
      ]
    }
  ]
};

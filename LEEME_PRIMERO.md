# SECUESTRADOS.EXE — WEB DEFINITIVA

**Fecha prevista:** viernes 30 de octubre de 2026.

Esta versión funciona como sitio **estático** en GitHub Pages. No necesita servidor, base de datos, inicio de sesión ni ninguna app instalada en los móviles.

## 1. LO QUE FALTA EN ESTE ZIP (OBLIGATORIO)

No se han incluido los vídeos porque están en tu PC y no los has subido al chat.

1. Descomprime este ZIP en Windows (no lo subas comprimido).
2. Entra en la carpeta `SECUESTRADOS_GITHUB_FINAL`.
3. Dentro hay una carpeta `videos`. Copia allí **los 14 MP4** desde:

   `C:\Users\Pablo\Desktop\monitor\Materiales\Escape ciber\videos_github`

4. Respeta todos los nombres, incluidas las mayúsculas de `SUB_GITHUB`.
5. Si ves `videos/COLOCA_AQUI_LOS_14_MP4.txt`, puedes dejarlo; no afecta.

## 2. SUBIR LA WEB A GITHUB PAGES

1. Entra en https://github.com e inicia sesión (o crea una cuenta).
2. Pulsa **New repository** / **Nuevo repositorio**.
3. Nombre recomendado: `secuestrados-exe`.
4. Visibilidad: **Public** (GitHub Pages funciona en repos públicos con cuenta gratuita).
5. Crea el repositorio (puede estar vacío).
6. En la página del repositorio pulsa **Add file → Upload files**.
7. Arrastra al área de subida **el CONTENIDO de la carpeta descomprimida**: los archivos `index.html`, `styles.css`, `config.js`, `app.js`, `.nojekyll`, `LEEME_PRIMERO.md`, `CODIGOS_EQUIPOS.txt` y **la carpeta `videos` con los MP4**.
   - Muy importante: `index.html` debe quedar en la **raíz**, no dentro de otra carpeta.
   - Si la subida por carpetas no conserva `videos`, ábrela en GitHub y sube ahí los 14 MP4.
8. Confirma la subida con **Commit changes**.
9. Abre **Settings → Pages** (menú lateral).
10. En **Build and deployment → Source**, elige **Deploy from a branch**.
11. En **Branch**, selecciona `main` y `/(root)` y pulsa **Save**.
12. Cuando se publique, en `Settings → Pages` aparecerá el enlace. Para el nombre de repo propuesto será:

   `https://TU_USUARIO.github.io/secuestrados-exe/`

13. Visítalo desde el móvil con datos / wifi real del instituto.

La publicación no es instantánea; suele tardar unos minutos tras confirmar los archivos. En GitHub, **Actions** y **Settings → Pages** permiten ver si se completó.

### Si algún MP4 pesa demasiado

- Por navegador, GitHub solo permite **25 MiB por archivo**. Si un MP4 pesa más, comprímelo/exporta más ligero (H.264, 720p) o súbelo usando GitHub Desktop / Git, que permite hasta 100 MiB por archivo.
- GitHub Pages tiene un límite de **1 GB para el sitio publicado**, contando todos los vídeos y archivos.
- Recomendamos evitar Git LFS para los MP4 que deba servir GitHub Pages: tiene un proceso distinto de entrega.

## 3. CÓDIGOS PARA EL PROFESOR

Consulta `CODIGOS_EQUIPOS.txt`.

Cada código tiene 4 cifras:

- Primera: `1` = 60 min / `2` = 120 min.
- Segunda: `2`, `3`, `4`, `5`, `6` = máximo de estaciones.
- Tercera: `1`–`6` = posición inicial en la ruta aleatoria compartida.
- Cuarta: cifra de control = última cifra de (primera + segunda + tercera).

Ejemplo: 1618 = 1 hora, 6 pruebas, equipo posición 1, control 8.

**Para evitar coincidencias iniciales:** entrega a los seis equipos códigos con distinta tercera cifra (1, 2, 3, 4, 5, 6). Pueden realizar un número diferente de pruebas, pero deben usar la misma semilla de sesión.

## 4. CIERRE DE CLASE (MUY IMPORTANTE)

En `config.js` puedes cambiar:

- `horaFinClase: ''` — modo automático (por defecto). Una partida de **1 hora** termina en la siguiente hora en punto respecto a la hora de inicio; una de **2 horas**, dos horas en punto después del comienzo de la hora de inicio.
- `horaFinClase: '11:50'` — modo manual si tu clase termina a una hora distinta de `:00`.
- `minutosAntesDeClaseParaCerrar: 5` — el juego muestra el final 5 minutos antes de la hora de clase.

**Ejemplo:** alumnos empiezan a las 10:10 con código `1618`: se supone fin de clase a las 11:00, y el juego pasa al final a las **10:55**.

Se impide iniciar otra prueba cuando el tiempo restante no cubre una estimación de desplazamiento, resolución y vídeo final, con un mínimo de 10 minutos. Se tiene en cuenta el tiempo que el equipo ha tardado en las pruebas ya realizadas. No se garantiza completar un mínimo de dos pruebas si la sesión empieza demasiado tarde o el grupo se atasca.

**No se puede garantizar físicamente que los alumnos regresen a clase**: la web solo controla lo que muestra.

## 5. EL RELOJ DE RECEPCIÓN

Por defecto `desfaseRelojSegundos: 100` (+1 min 40 s de adelanto). Para cambiarlo tras publicar:

1. Abre el repositorio en GitHub.
2. Haz clic en `config.js` → icono del lápiz (**Edit this file**).
3. Busca `desfaseRelojSegundos: 100` y modifica **solo el número** (ejemplo `-35` para reloj 35 segundos atrasado).
4. Pulsa **Commit changes**. Se publicará de nuevo sin tocar los vídeos.
5. En los móviles que ya estaban jugando, recarga tras la publicación si necesitas que adopten el cambio.

El reloj se valida mediante la hora local del teléfono + desfase, con tolerancia de 10 segundos cerca de cambios de minuto. **COMPROBAR EL DESFASE FÍSICO EL VIERNES**.

## 6. ALEATORIEDAD COORDINADA (SIN SERVIDOR)

En `config.js`:

`semillaSesionRutas: 'HALLOWEEN-2026-SESION-1'`

Todos los equipos de la misma tanda usan ese valor, así comparten el mismo orden pseudoaleatorio de estaciones y comienzan en posiciones diferentes. Si quieres cambiar el orden para otra tanda, modifica la semilla (ej. `HALLOWEEN-2026-SESION-2`) **antes de repartir los códigos** y vuelve a publicar.

**Limitación:** esto garantiza distintas estaciones iniciales y diferentes estaciones en cada ronda si todos avanzan al mismo ritmo. No evita choques si un equipo tarda mucho más que otro; no hay seguimiento en tiempo real entre móviles.

**No cambies la semilla mientras hay una tanda jugando**: los equipos que recarguen podrían recuperar una ruta diferente si aún no habían comenzado; los ya iniciados conservan su ruta guardada en el móvil.

## 7. VIDEOS Y SUBTÍTULOS

- Los 14 MP4 deben estar en `/videos/`, con sus nombres exactos.
- Cada misión reproduce **historia → glitch → destino**. En móviles puede hacer falta pulsar Play en cada fragmento: es una restricción normal del navegador.
- Hay un botón **CONTINUAR TRANSMISIÓN** para seguir manualmente aunque falle la reproducción automática.
- Si un MP4 falta, aparece una alternativa escrita, con la ubicación cuando se trata del destino.
- No se usan subtítulos aparte: los tuyos ya vienen quemados en la imagen.
- Con 2 a 5 pruebas se seleccionan narrativas repartidas por la historia para no dejar a ROOT siempre en la introducción.

## 8. PRUEBAS / CLAVES (HOJA DEL PROFESOR)

1. Phishing → `7316` (puerta marrón al sur).
2. Copias de seguridad → `67` (estudio de radio / antiguo horno / cafetería).
3. Reloj → **minutos del reloj físico de recepción**, ajustados con +100 s respecto al móvil.
4. Frontera de hierro del este → `NF`.
5. Binario → `5937` (blanco encendido = 1; negro apagado = 0).
6. Integridad → `5173` (documentos válidos, en el orden del tablero; aula 206).

Las pistas aparecen a los 90, 180 y 300 segundos de pulsar **YA ESTAMOS EN LA ESTACIÓN**. Se puede omitir a partir de 360 s.

Errores: bloqueo 10, 20 y 30 s a partir del primer, segundo y tercer fallo consecutivos. El bloqueo persiste al recargar. Tras superar / saltar la prueba se reinicia.

## 9. ENSAYO ANTES DEL VIERNES

**Comprueba estos diez casos** en un móvil conectado a la red que se usará realmente:

- [ ] La web abre por HTTPS con el QR.
- [ ] Los seis equipos reciben una primera ubicación distinta.
- [ ] Los 14 vídeos se pueden reproducir (incluido `final_SUB_GITHUB.mp4`).
- [ ] Los botones para continuar vídeo funcionan si el navegador no reproduce automáticamente.
- [ ] Los acertijos llevan a las estaciones correctas y los materiales están visibles.
- [ ] Contraseña correcta para cada estación, especialmente `67` y `5173`.
- [ ] Minuto de recepción: comparar reloj físico y móvil y ajustar el desfase.
- [ ] Fallos consecutivos 10 / 20 / 30 s, y la penalización continúa tras recargar.
- [ ] Pistas a los 90 / 180 / 300 s y salto a los 360 s.
- [ ] Al faltar poco tiempo la web no asigna nuevas estaciones y muestra el desenlace.

**Cómo ensayar de forma rápida:** puedes reducir temporalmente los segundos de pistas y salto en `config.js`; recuerda volver a `[90,180,300]` y `360` antes del evento.

## 10. PROBLEMAS TÍPICOS

- **La página da 404:** comprueba que `index.html` esté en la raíz, que `main` y `/(root)` estén seleccionados y que el despliegue haya terminado.
- **El vídeo no aparece:** revisa el nombre exacto (GitHub distingue mayúsculas/minúsculas), su ubicación `videos/` y la carga de la página. Hay texto alternativo si falta.
- **Los cambios no se ven:** vuelve a abrir o recarga la web (en ocasiones el navegador conserva una versión anterior); también puedes añadir `?v=2` al final de la dirección para renovar la caché.
- **Aparece partida anterior:** pulsa **Reiniciar** y confirma; cada navegador conserva su propia partida.
- **No caben los vídeos en GitHub:** intenta comprimir a 720p H.264; todos los archivos publicados deben caber en el límite de GitHub Pages.
- **Dos equipos coinciden:** no es un error de rutas si uno ha avanzado más rápido que otro. Evita asignar la misma tercera cifra a dos equipos de la misma tanda.

## 11. PRIVACIDAD Y LIMITACIONES

- Es una simulación de un secuestro digital, no un bloqueo del teléfono.
- La web guarda estado en `localStorage` del dispositivo. No recopila nombres ni solicita credenciales reales.
- Las claves del juego están en JavaScript y se pueden inspeccionar; no es una protección criptográfica.
- GitHub Pages y los vídeos son públicos si se aloja en un repositorio público. No incluyas datos personales o fotos de alumnado.
- Los límites de tiempo dependen de que la hora del móvil esté ajustada automáticamente.
- La partida se puede reanudar al cerrar el navegador si el almacenamiento local sigue disponible.

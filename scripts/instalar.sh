#!/usr/bin/env bash
# Atajo · instalador para Mac y Linux (también corre en Git Bash de Windows)
#
# Uso (un comando):
#   curl -fsSL https://raw.githubusercontent.com/davidricardobc/atajo/main/scripts/instalar.sh | bash
#
# Opciones por variables de entorno (todas opcionales):
#   ATAJO_ORIGEN          repo a clonar (por defecto https://github.com/davidricardobc/atajo.git)
#   ATAJO_RAMA            rama (por defecto main)
#   ATAJO_DESTINO         carpeta de instalación (por defecto ~/atajo)
#   ATAJO_SIN_PREGUNTAS=1 usa los valores por defecto sin preguntar
#   ATAJO_ACTUALIZAR=s|n  respuesta a "¿actualizar?" si ya está instalado
#   ATAJO_ZIP             zip del kit a usar cuando no hay git (URL o ruta local; por defecto
#                         el zip de la rama en GitHub)
#
# Qué hace: clona el kit con git (o, sin git, baja el zip), o lo actualiza y crea tus archivos de datos desde
# plantillas/datos/ sin pisar los que ya existen. Tus datos están fuera de git: una actualización
# nunca los toca. No usa sudo ni instala nada global sin preguntar.
# Atajo · © 2026 David Bajonero · MIT

set -u

atajo_principal() {
  local origen="${ATAJO_ORIGEN:-https://github.com/davidricardobc/atajo.git}"
  local rama="${ATAJO_RAMA:-main}"
  local por_defecto="$HOME/atajo"
  local sin_preguntas="${ATAJO_SIN_PREGUNTAS:-0}"

  if [ -t 1 ]; then
    verde=$'\033[32m'; amarillo=$'\033[33m'; rojo=$'\033[31m'; cian=$'\033[36m'; normal=$'\033[0m'
  else
    verde=''; amarillo=''; rojo=''; cian=''; normal=''
  fi

  decir() { printf '%s\n' "$*"; }
  ok() { printf '%s[ok]%s %s\n' "$verde" "$normal" "$*"; }
  aviso() { printf '%s[aviso]%s %s\n' "$amarillo" "$normal" "$*"; }
  error() { printf '%s%s%s\n' "$rojo" "$*" "$normal"; }
  tiene() { command -v "$1" >/dev/null 2>&1; }

  # Lee la respuesta desde la terminal (con curl | bash la entrada es el script).
  preguntar() {
    local texto="$1" defecto="$2" r=""
    if [ "$sin_preguntas" = "1" ] || ! { : </dev/tty; } 2>/dev/null; then
      printf '%s\n' "$defecto"; return
    fi
    printf '%s ' "$texto" >/dev/tty
    IFS= read -r r </dev/tty || r=""
    if [ -z "$r" ]; then printf '%s\n' "$defecto"; else printf '%s\n' "$r"; fi
  }

  siguientes() {
    local carpeta="$1" ya_tenia_datos="$2" skill="/arranque"
    if [ "$ya_tenia_datos" = "1" ]; then skill="/retomar"; fi
    decir ""
    decir "${cian}Siguientes pasos:${normal}"
    decir "  1. cd \"$carpeta\""
    decir "  2. claude"
    if [ "$ya_tenia_datos" = "1" ]; then
      decir "  3. Dentro de Claude Code escribe: $skill"
    else
      decir "  3. Dentro de Claude Code escribe: $skill   (4 preguntas, unos 3 minutos)"
    fi
    if [ "$ya_tenia_datos" = "1" ]; then
      decir "     (ya tienes datos: /retomar sigue donde ibas; /arranque solo si quieres refrescar tu perfil)"
    else
      decir "  4. Al terminar escribe: /red   (tu sistema como una red de neuronas)"
      decir ""
      decir "  La primera vez, Claude Code pregunta si confías en la carpeta: di que sí."
    fi
    decir ""
    decir "  Guía de los primeros 7 días: docs/primera-semana.md"
    decir "  Si algo falla, dentro de Claude Code escribe: ayúdame a arreglar Atajo"
    decir ""
  }

  # Baja el zip del kit y copia su contenido encima de la carpeta. Solo trae archivos del kit:
  # tus datos no vienen en el zip, así que nunca se pisan.
  descargar_zip() {
    local carpeta="$1" url="${ATAJO_ZIP:-https://github.com/davidricardobc/atajo/archive/refs/heads/$rama.zip}" tmp fuente
    tmp="$(mktemp -d)" || return 1
    if [ -f "$url" ]; then
      cp "$url" "$tmp/atajo.zip" || { rm -rf "$tmp"; return 1; }
    elif tiene curl; then
      curl -fsSL -o "$tmp/atajo.zip" "$url" || { rm -rf "$tmp"; return 1; }
    else
      wget -q -O "$tmp/atajo.zip" "$url" || { rm -rf "$tmp"; return 1; }
    fi
    unzip -q "$tmp/atajo.zip" -d "$tmp/x" || { rm -rf "$tmp"; return 1; }
    fuente="$(find "$tmp/x" -mindepth 1 -maxdepth 1 -type d | head -1)"
    if [ -z "$fuente" ] || [ ! -f "$fuente/kit.json" ]; then rm -rf "$tmp"; return 1; fi
    mkdir -p "$carpeta" && cp -R "$fuente"/. "$carpeta"/ || { rm -rf "$tmp"; return 1; }
    rm -rf "$tmp"
  }

  # Copia plantillas/datos/* a la raíz del kit sin pisar nada. Imprime cuántos archivos creó.
  crear_datos() {
    local carpeta="$1" origen_datos="$1/plantillas/datos" creados=0 archivo relativa destino
    [ -d "$origen_datos" ] || { printf '0\n'; return; }
    for sub in perfil bitacora bitacora/diario decisiones entrevistas revisiones clientes conocimiento proyectos archivo; do
      mkdir -p "$carpeta/$sub"
    done
    while IFS= read -r archivo; do
      relativa="${archivo#"$origen_datos"/}"
      destino="$carpeta/$relativa"
      if [ ! -e "$destino" ]; then
        mkdir -p "$(dirname "$destino")"
        cp "$archivo" "$destino"
        creados=$((creados + 1))
      fi
    done < <(find "$origen_datos" -type f)
    printf '%s\n' "$creados"
  }

  decir ""
  decir "${cian}Atajo: tu sistema operativo personal en español para Claude Code${normal}"
  decir "${cian}----------------------------------------------------------------${normal}"

  decir "Antes de empezar: para usar Atajo necesitas Claude Code con un plan pago de Claude"
  decir "(Pro o superior). git y Node son opcionales: sin git bajo el zip; sin Node todo funciona"
  decir "en modo manual. No pido permisos de administrador ni instalo nada fuera de la carpeta de Atajo."
  decir ""

  # 1. Requisitos
  local hay_git=0
  if tiene git; then
    hay_git=1
    ok "git: $(git --version)"
  else
    aviso "No encontré git. Instalo desde el zip; para actualizar, corre otra vez este comando."
    case "$(uname -s)" in
      Darwin) decir "  Si quieres git (recomendado): corre  xcode-select --install  y acepta la ventana." ;;
      *) decir "  Si quieres git (recomendado): instálalo con el gestor de paquetes de tu sistema." ;;
    esac
    if ! tiene unzip || { ! tiene curl && ! tiene wget; }; then
      error "Sin git necesito unzip y curl (o wget), y no los encontré."
      decir "  Instala git o unzip con el gestor de paquetes de tu sistema y vuelve a correr el comando."
      decir "  O descarga el zip a mano desde la página del repositorio (botón Code, Download ZIP)."
      return 1
    fi
  fi

  local hay_node=0
  if tiene node; then
    hay_node=1
    ok "Node: $(node --version)"
  else
    aviso "No encontré Node.js. Atajo funciona igual, pero en modo manual:"
    decir "  - no se carga solo tu punto de retorno al abrir (usa /retomar)"
    decir "  - no hay recordatorio automático al cerrar ni guardia automática antes de publicar"
    decir "  - el índice de notas no se regenera solo"
    decir "  Cuando quieras activarlo: instala Node LTS desde https://nodejs.org y borra .claude/settings.local.json"
  fi

  if tiene claude; then
    ok "Claude Code encontrado."
  else
    aviso "No encontré el comando claude en esta terminal."
    decir "  Si usas Claude Code dentro de VS Code o la app de escritorio, abre allí la carpeta de Atajo."
    decir "  Para tenerlo en la terminal: curl -fsSL https://claude.ai/install.sh | bash"
    decir "  Necesitas un plan Pro, Max, Ultra, Team o Enterprise de Claude (el plan gratis no incluye Claude Code)."
  fi

  # 2. Carpeta destino
  local destino="${ATAJO_DESTINO:-}"
  if [ -z "$destino" ]; then
    destino="$(preguntar "¿Dónde instalo Atajo? (Enter para $por_defecto)" "$por_defecto")"
  fi
  case "$destino" in
    "~") destino="$HOME" ;;
    "~/"*) destino="$HOME/${destino#\~/}" ;;
  esac

  # 3. ¿Ya existe?
  if [ -e "$destino" ]; then
    local es_atajo=0
    if [ -f "$destino/kit.json" ] || [ -f "$destino/.claude-plugin/marketplace.json" ]; then es_atajo=1; fi
    if [ "$es_atajo" = "0" ] && [ -n "$(ls -A "$destino" 2>/dev/null)" ]; then
      error "La carpeta $destino ya existe y no parece una instalación de Atajo."
      decir "  No toco nada. Corre de nuevo el comando y escoge otra carpeta."
      return 1
    fi
    if [ "$es_atajo" = "1" ]; then
      local ya_tenia_datos=0
      if [ -f "$destino/perfil/quien-soy.md" ] && ! grep -q "plantilla: sin llenar" "$destino/perfil/quien-soy.md"; then ya_tenia_datos=1; fi
      aviso "Atajo ya está instalado en $destino."
      local resp="${ATAJO_ACTUALIZAR:-}"
      if [ -z "$resp" ]; then resp="$(preguntar "¿Actualizo el kit con la versión nueva? Tus datos no se tocan. (s/N)" "n")"; fi
      case "$resp" in
        s*|S*|y*|Y*) ;;
        *) decir "No cambié nada."; siguientes "$destino" "$ya_tenia_datos"; return 0 ;;
      esac
      if [ ! -d "$destino/.git" ] || [ "$hay_git" = "0" ]; then
        decir "Actualizo desde el zip (esta instalación no usa git)..."
        if ! descargar_zip "$destino"; then
          error "No pude bajar la versión nueva. Revisa tu conexión y vuelve a intentarlo. No cambié nada."
          return 1
        fi
        local nuevos_zip
        nuevos_zip="$(crear_datos "$destino")"
        ok "Kit actualizado desde el zip. Tus datos no vienen en el zip, así que no se tocaron."
        if [ "$nuevos_zip" != "0" ]; then ok "$nuevos_zip archivo(s) de datos nuevos creados desde plantillas/datos."; fi
        siguientes "$destino" "$ya_tenia_datos"
        return 0
      fi
      local pendientes
      pendientes="$(git -C "$destino" status --porcelain)"
      if [ -n "$pendientes" ]; then
        aviso "Hay cambios sin guardar en archivos del kit (tus datos no cuentan: están fuera de git):"
        printf '%s\n' "$pendientes" | head -8 | sed 's/^/    /'
        decir "  Si los quieres conservar: cd \"$destino\" && git stash   (y luego git stash pop)."
        decir "  Si fueron cambios del agente que ya no necesitas, pídele a Claude: \"ayúdame a actualizar Atajo\"."
        return 1
      fi
      # Si git no sabe quién eres, la unión usa una identidad local solo para este paso.
      local identidad=()
      if [ -z "$(git -C "$destino" config user.email)" ]; then
        identidad=(-c user.name=Atajo -c user.email=atajo@localhost)
      fi
      if ! git -C "$destino" ${identidad[@]+"${identidad[@]}"} pull --quiet --no-rebase --no-edit origin "$rama"; then
        git -C "$destino" merge --abort >/dev/null 2>&1
        error "La actualización no pudo completarse. Dejé todo como estaba."
        decir "  Pídele a Claude dentro de la carpeta: \"ayúdame a actualizar Atajo\"."
        return 1
      fi
      local nuevos
      nuevos="$(crear_datos "$destino")"
      ok "Kit actualizado. Tus datos (perfil, bitácora, decisiones, clientes) están fuera de git y no se tocaron."
      if [ "$nuevos" != "0" ]; then ok "$nuevos archivo(s) de datos nuevos creados desde plantillas/datos (los tuyos no se pisaron)."; fi
      siguientes "$destino" "$ya_tenia_datos"
      return 0
    fi
  fi

  # 4. Clonar
  decir "Descargando Atajo en $destino ..."
  if [ "$hay_git" = "1" ]; then
    if ! GIT_TERMINAL_PROMPT=0 git clone --quiet --branch "$rama" "$origen" "$destino"; then
      error "No pude descargar Atajo. Revisa tu conexión y vuelve a intentarlo."
      decir "  Origen: $origen"
      decir "  Si git dice 'not found' o pide usuario, el enlace está mal o el repositorio todavía no es público."
      return 1
    fi
  elif ! descargar_zip "$destino"; then
    error "No pude bajar el zip de Atajo. Revisa tu conexión y vuelve a intentarlo."
    decir "  Si sigue fallando, descárgalo a mano desde la página del repositorio (botón Code, Download ZIP)."
    return 1
  fi

  # 5. Tus datos: se crean desde plantillas/datos (fuera de git)
  local creados
  creados="$(crear_datos "$destino")"
  ok "$creados archivos de datos creados (perfil, bitácora, decisiones...). Son tuyos y quedan fuera de git."

  # 6. Sin Node: apagar hooks para que no muestren errores (archivo local, fuera de git)
  if [ "$hay_node" = "0" ] && [ ! -f "$destino/.claude/settings.local.json" ]; then
    mkdir -p "$destino/.claude"
    printf '{\n  "disableAllHooks": true\n}\n' > "$destino/.claude/settings.local.json"
    ok "Sin Node, lo automático queda apagado. Al abrir Claude Code escribe /retomar."
  fi

  decir ""
  ok "Atajo quedó instalado."
  siguientes "$destino" 0
  return 0
}

# Todo va dentro de una función: si la descarga se corta, no se ejecuta un script a medias.
atajo_principal "$@"

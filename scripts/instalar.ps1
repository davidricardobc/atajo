# Atajo - instalador para Windows (PowerShell 5.1 o superior)
#
# Uso (un comando):
#   irm https://raw.githubusercontent.com/davidricardobc/atajo/main/scripts/instalar.ps1 | iex
#
# Opciones por variables de entorno (todas opcionales):
#   $env:ATAJO_ORIGEN     repo a clonar (por defecto https://github.com/davidricardobc/atajo.git)
#   $env:ATAJO_RAMA       rama (por defecto main)
#   $env:ATAJO_DESTINO    carpeta de instalacion (por defecto ~\atajo)
#   $env:ATAJO_SIN_PREGUNTAS = "1"   usa los valores por defecto sin preguntar
#   $env:ATAJO_ACTUALIZAR = "s" o "n" respuesta a "actualizar?" si ya esta instalado
#   $env:ATAJO_ZIP        zip del kit cuando no hay git (URL o ruta local; por defecto el zip de
#                         la rama en GitHub)
#
# Que hace: clona el kit con git (o, sin git, baja el zip), o lo actualiza y crea tus archivos de datos desde
# plantillas/datos/ sin pisar los que ya existen. Tus datos estan fuera de git: una actualizacion
# nunca los toca. No usa permisos de administrador ni instala nada global sin preguntar.
#
# Este archivo es ASCII a proposito: PowerShell 5.1 lee mal los acentos de un .ps1 sin BOM,
# y un BOM rompe "irm | iex". Las letras con tilde se arman con las variables de abajo.
# Atajo (c) 2026 David Bajonero - MIT

function Install-Atajo {
    # Letras con tilde: ${a} = a con tilde, ${n} = enie, ${q} = signo de pregunta de apertura.
    $a = [char]0x00E1; $e = [char]0x00E9; $i = [char]0x00ED; $o = [char]0x00F3; $u = [char]0x00FA
    $n = [char]0x00F1; $q = [char]0x00BF

    $origen = if ($env:ATAJO_ORIGEN) { $env:ATAJO_ORIGEN } else { 'https://github.com/davidricardobc/atajo.git' }
    $rama = if ($env:ATAJO_RAMA) { $env:ATAJO_RAMA } else { 'main' }
    $porDefecto = Join-Path $HOME 'atajo'
    $sinPreguntas = ($env:ATAJO_SIN_PREGUNTAS -eq '1')

    function Decir([string]$texto, [string]$color = 'Gray') { Write-Host $texto -ForegroundColor $color }
    function Preguntar([string]$texto, [string]$valorSiNoHayRespuesta) {
        if ($sinPreguntas) { return $valorSiNoHayRespuesta }
        try { $r = Read-Host $texto } catch { return $valorSiNoHayRespuesta }
        if ([string]::IsNullOrWhiteSpace($r)) { return $valorSiNoHayRespuesta }
        return $r.Trim()
    }
    function Tiene([string]$comando) { return [bool](Get-Command $comando -ErrorAction SilentlyContinue) }
    function Siguientes([string]$carpeta, [bool]$yaTeniaDatos) {
        $skill = if ($yaTeniaDatos) { '/retomar' } else { '/arranque' }
        Write-Host ''
        Write-Host 'Siguientes pasos:' -ForegroundColor Cyan
        Write-Host "  1. cd `"$carpeta`""
        Write-Host '  2. claude'
        if ($yaTeniaDatos) {
            Write-Host "  3. Dentro de Claude Code escribe: $skill"
        } else {
            Write-Host "  3. Dentro de Claude Code escribe: $skill   (4 preguntas, unos 3 minutos)"
        }
        if ($yaTeniaDatos) {
            Write-Host "     (ya tienes datos: /retomar sigue donde ibas; /arranque solo si quieres refrescar tu perfil)"
        } else {
            Write-Host "  4. Al terminar escribe: /red   (tu sistema como una red de neuronas)"
            Write-Host ''
            Write-Host "  La primera vez, Claude Code pregunta si conf${i}as en la carpeta: di que s${i}."
        }
        Write-Host ''
        Write-Host "  Gu${i}a de los primeros 7 d${i}as: docs\primera-semana.md"
        Write-Host "  Si algo falla, dentro de Claude Code escribe: ay${u}dame a arreglar Atajo"
        Write-Host ''
    }
    # Git escribe su progreso en stderr y PowerShell 5.1 lo puede pintar como error (NativeCommandError).
    # Se corre con --quiet y con la preferencia de error relajada solo durante la llamada.
    function Git-Silencioso([string[]]$argumentos) {
        $anterior = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        try { $salida = & git @argumentos 2>&1 } finally { $ErrorActionPreference = $anterior }
        return @{ Codigo = $LASTEXITCODE; Salida = ($salida | ForEach-Object { "$_" }) -join "`n" }
    }
    # Baja el zip del kit y copia su contenido encima de la carpeta. Solo trae archivos del kit:
    # tus datos no vienen en el zip, asi que nunca se pisan.
    function Descargar-Zip([string]$carpeta) {
        $url = if ($env:ATAJO_ZIP) { $env:ATAJO_ZIP } else { "https://github.com/davidricardobc/atajo/archive/refs/heads/$rama.zip" }
        $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ('atajo-' + [guid]::NewGuid().ToString('N'))
        try {
            New-Item -ItemType Directory -Force -Path $tmp | Out-Null
            $zip = Join-Path $tmp 'atajo.zip'
            if (Test-Path -LiteralPath $url) {
                Copy-Item -LiteralPath $url -Destination $zip
            } else {
                [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
                $anterior = $ProgressPreference; $ProgressPreference = 'SilentlyContinue'
                try { Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing } finally { $ProgressPreference = $anterior }
            }
            Expand-Archive -LiteralPath $zip -DestinationPath (Join-Path $tmp 'x') -Force
            $fuente = Get-ChildItem -LiteralPath (Join-Path $tmp 'x') -Directory | Select-Object -First 1
            if (-not $fuente -or -not (Test-Path -LiteralPath (Join-Path $fuente.FullName 'kit.json'))) { return $false }
            New-Item -ItemType Directory -Force -Path $carpeta | Out-Null
            Get-ChildItem -LiteralPath $fuente.FullName -Force | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $carpeta -Recurse -Force }
            return $true
        } catch {
            return $false
        } finally {
            Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    # Copia plantillas/datos/* a la raiz del kit sin pisar nada. Devuelve cuantos archivos creo.
    function Crear-Datos([string]$carpeta) {
        $origenDatos = Join-Path $carpeta 'plantillas\datos'
        if (-not (Test-Path -LiteralPath $origenDatos)) { return 0 }
        foreach ($sub in @('perfil', 'bitacora', 'bitacora\diario', 'decisiones', 'entrevistas', 'revisiones', 'clientes', 'conocimiento', 'proyectos', 'archivo')) {
            $ruta = Join-Path $carpeta $sub
            if (-not (Test-Path -LiteralPath $ruta)) { New-Item -ItemType Directory -Force -Path $ruta | Out-Null }
        }
        $creados = 0
        Get-ChildItem -LiteralPath $origenDatos -Recurse -File | ForEach-Object {
            $relativa = $_.FullName.Substring($origenDatos.Length).TrimStart('\', '/')
            $destino = Join-Path $carpeta $relativa
            if (-not (Test-Path -LiteralPath $destino)) {
                New-Item -ItemType Directory -Force -Path (Split-Path $destino) | Out-Null
                Copy-Item -LiteralPath $_.FullName -Destination $destino
                $creados++
            }
        }
        return $creados
    }

    Decir ''
    Decir "Atajo: tu sistema operativo personal en espa${n}ol para Claude Code" 'Cyan'
    Decir '----------------------------------------------------------------' 'Cyan'

    Decir "Antes de empezar: para usar Atajo necesitas Claude Code con un plan pago de Claude"
    Decir "(Pro o superior). git y Node son opcionales: sin git bajo el zip; sin Node todo funciona"
    Decir "en modo manual. No pido permisos de administrador ni instalo nada fuera de la carpeta de Atajo."
    Decir ''

    # 1. Requisitos
    $hayGit = Tiene 'git'
    if ($hayGit) {
        Decir ("[ok] git: " + ((git --version) -join ' ')) 'Green'
    } else {
        Decir "[aviso] No encontr${e} git. Instalo desde el zip; para actualizar, corre otra vez este comando." 'Yellow'
        Decir "  Si quieres git (recomendado): winget install --id Git.Git -e   o   https://git-scm.com/downloads/win"
    }

    $hayNode = Tiene 'node'
    if ($hayNode) {
        Decir ("[ok] Node: " + ((node --version) -join ' ')) 'Green'
    } else {
        Decir "[aviso] No encontr${e} Node.js. Atajo funciona igual, pero en modo manual:" 'Yellow'
        Decir "  - no se carga solo tu punto de retorno al abrir (usa /retomar)"
        Decir "  - no hay recordatorio autom${a}tico al cerrar ni guardia autom${a}tica antes de publicar"
        Decir "  - el ${i}ndice de notas no se regenera solo"
        Decir "  Cuando quieras activarlo: instala Node LTS desde https://nodejs.org y borra .claude\settings.local.json"
    }

    if (Tiene 'claude') {
        Decir '[ok] Claude Code encontrado.' 'Green'
    } else {
        Decir "[aviso] No encontr${e} el comando claude en esta terminal." 'Yellow'
        Decir "  Si usas Claude Code dentro de VS Code o la app de escritorio, abre all${i} la carpeta de Atajo."
        Decir '  Para tenerlo en la terminal: irm https://claude.ai/install.ps1 | iex'
        Decir '  Necesitas un plan Pro, Max, Ultra, Team o Enterprise de Claude (el plan gratis no incluye Claude Code).'
    }

    # 2. Carpeta destino
    $destino = if ($env:ATAJO_DESTINO) { $env:ATAJO_DESTINO } else { Preguntar "${q}D${o}nde instalo Atajo? (Enter para $porDefecto)" $porDefecto }
    if ($destino.StartsWith('~')) { $destino = Join-Path $HOME $destino.Substring(1).TrimStart('\', '/') }
    $destino = [System.IO.Path]::GetFullPath($destino)

    # 3. Ya existe?
    if (Test-Path -LiteralPath $destino) {
        $contenido = @(Get-ChildItem -LiteralPath $destino -Force -ErrorAction SilentlyContinue)
        $esAtajo = (Test-Path -LiteralPath (Join-Path $destino 'kit.json')) -or (Test-Path -LiteralPath (Join-Path $destino '.claude-plugin\marketplace.json'))
        if ($contenido.Count -gt 0 -and -not $esAtajo) {
            Decir "La carpeta $destino ya existe y no parece una instalaci${o}n de Atajo." 'Red'
            Decir '  No toco nada. Corre de nuevo el comando y escoge otra carpeta.'
            return $false
        }
        if ($esAtajo) {
            $quienSoy = Join-Path $destino 'perfil\quien-soy.md'
            $yaTeniaDatos = (Test-Path -LiteralPath $quienSoy) -and -not (Select-String -LiteralPath $quienSoy -SimpleMatch 'plantilla: sin llenar' -Quiet)
            Decir "Atajo ya est${a} instalado en $destino." 'Yellow'
            $resp = if ($env:ATAJO_ACTUALIZAR) { $env:ATAJO_ACTUALIZAR } else { Preguntar "${q}Actualizo el kit con la versi${o}n nueva? Tus datos no se tocan. (s/N)" 'n' }
            if ($resp -notmatch '^[sSyY]') {
                Decir "No cambi${e} nada."
                Siguientes $destino $yaTeniaDatos
                return $true
            }
            if (-not $hayGit -or -not (Test-Path -LiteralPath (Join-Path $destino '.git'))) {
                Decir "Actualizo desde el zip (esta instalaci${o}n no usa git)..."
                if (-not (Descargar-Zip $destino)) {
                    Decir "No pude bajar la versi${o}n nueva. Revisa tu conexi${o}n y vuelve a intentarlo. No cambi${e} nada." 'Red'
                    return $false
                }
                $nuevosZip = Crear-Datos $destino
                Decir "[ok] Kit actualizado desde el zip. Tus datos no vienen en el zip, as${i} que no se tocaron." 'Green'
                if ($nuevosZip -gt 0) { Decir "[ok] $nuevosZip archivo(s) de datos nuevos creados desde plantillas/datos." 'Green' }
                Siguientes $destino $yaTeniaDatos
                return $true
            }
            $pendientes = (git -C $destino status --porcelain) -join "`n"
            if ($pendientes) {
                Decir "Hay cambios sin guardar en archivos del kit (tus datos no cuentan: est${a}n fuera de git):" 'Yellow'
                Decir ($pendientes -split "`n" | Select-Object -First 8 | ForEach-Object { "    $_" }) -join "`n"
                Decir "  Si los quieres conservar: cd `"$destino`"; git stash   (y luego git stash pop)."
                Decir "  Si fueron cambios del agente que ya no necesitas, p${i}dele a Claude: `"ay${u}dame a actualizar Atajo`"."
                return $false
            }
            # Si git no sabe quien eres, la union usa una identidad local solo para este paso.
            $identidad = @()
            if (-not (git -C $destino config user.email)) { $identidad = @('-c', 'user.name=Atajo', '-c', 'user.email=atajo@localhost') }
            $r = Git-Silencioso (@('-C', $destino) + $identidad + @('pull', '--quiet', '--no-rebase', '--no-edit', 'origin', $rama))
            if ($r.Codigo -ne 0) {
                Git-Silencioso @('-C', $destino, 'merge', '--abort') | Out-Null
                Decir "La actualizaci${o}n no pudo completarse. Dej${e} todo como estaba." 'Red'
                if ($r.Salida) { Decir ("  git dijo: " + $r.Salida.Trim()) }
                Decir "  P${i}dele a Claude dentro de la carpeta: `"ay${u}dame a actualizar Atajo`"."
                return $false
            }
            $nuevos = Crear-Datos $destino
            Decir "[ok] Kit actualizado. Tus datos (perfil, bit${a}cora, decisiones, clientes) est${a}n fuera de git y no se tocaron." 'Green'
            if ($nuevos -gt 0) { Decir "[ok] $nuevos archivo(s) de datos nuevos creados desde plantillas/datos (los tuyos no se pisaron)." 'Green' }
            Siguientes $destino $yaTeniaDatos
            return $true
        }
    }

    # 4. Clonar
    Decir "Descargando Atajo en $destino ..."
    if ($hayGit) {
        $promptAnterior = $env:GIT_TERMINAL_PROMPT; $env:GIT_TERMINAL_PROMPT = '0'
        try { $r = Git-Silencioso @('clone', '--quiet', '--branch', $rama, $origen, $destino) } finally { $env:GIT_TERMINAL_PROMPT = $promptAnterior }
        if ($r.Codigo -ne 0) {
            Decir "No pude descargar Atajo. Revisa tu conexi${o}n y vuelve a intentarlo." 'Red'
            if ($r.Salida) { Decir ("  git dijo: " + $r.Salida.Trim()) }
            Decir "  Origen: $origen"
            Decir "  Si git dice 'not found' o pide usuario, el enlace est${a} mal o el repositorio todav${i}a no es p${u}blico."
            return $false
        }
    } elseif (-not (Descargar-Zip $destino)) {
        Decir "No pude bajar el zip de Atajo. Revisa tu conexi${o}n y vuelve a intentarlo." 'Red'
        Decir "  Si sigue fallando, desc${a}rgalo a mano desde la p${a}gina del repositorio (bot${o}n Code, Download ZIP)."
        return $false
    }

    # 5. Tus datos: se crean desde plantillas/datos (fuera de git)
    $creados = Crear-Datos $destino
    Decir "[ok] $creados archivos de datos creados (perfil, bit${a}cora, decisiones...). Son tuyos y quedan fuera de git." 'Green'

    # 6. Sin Node: apagar hooks para que no muestren errores (archivo local, fuera de git)
    if (-not $hayNode) {
        $local = Join-Path $destino '.claude\settings.local.json'
        if (-not (Test-Path -LiteralPath $local)) {
            New-Item -ItemType Directory -Force -Path (Split-Path $local) | Out-Null
            [System.IO.File]::WriteAllText($local, "{`n  `"disableAllHooks`": true`n}`n", (New-Object System.Text.UTF8Encoding($false)))
            Decir "[ok] Sin Node, lo autom${a}tico queda apagado. Al abrir Claude Code escribe /retomar." 'Green'
        }
    }

    Decir ''
    Decir "[ok] Atajo qued${o} instalado." 'Green'
    Siguientes $destino $false
    return $true
}

$atajoOk = Install-Atajo
if ($PSCommandPath -and -not $atajoOk) { exit 1 }

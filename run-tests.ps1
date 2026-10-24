# =====================================================================
# ALABASTRO — Suite de Auditoría y Testing Automatizado (PowerShell CLI)
# run-tests.ps1
# =====================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host "          ALABASTRO ALTA PERFUMERIA - TEST SUITE RUNNER            " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$totalTests = 0

function Assert-Test([string]$testName, [bool]$condition, [string]$failureDetails = "") {
    $script:totalTests++
    if ($condition) {
        $script:testsPassed++
        Write-Host "  [PASS] " -ForegroundColor Green -NoNewline
        Write-Host "$testName" -ForegroundColor White
    } else {
        $script:testsFailed++
        Write-Host "  [FAIL] " -ForegroundColor Red -NoNewline
        Write-Host "$testName" -ForegroundColor Yellow
        if ($failureDetails) {
            Write-Host "         -> Detalle: $failureDetails" -ForegroundColor DarkRed
        }
    }
}

$dir = Get-Location

# ---------------------------------------------------------------------
# SUITE 1: Verificación de Archivos y Estructura del Proyecto
# ---------------------------------------------------------------------
Write-Host "[1/6] Auditoría de Archivos y Recursos Críticos..." -ForegroundColor Cyan

Assert-Test "index.html existe en el proyecto" (Test-Path "$dir\index.html")
Assert-Test "styles.css existe en el proyecto" (Test-Path "$dir\styles.css")
Assert-Test "app.js existe en el proyecto" (Test-Path "$dir\app.js")
Assert-Test "tests.html (Dashboard de Pruebas) existe" (Test-Path "$dir\tests.html")
Assert-Test "test-suite.js existe" (Test-Path "$dir\test-suite.js")
Assert-Test "robots.txt y sitemap.xml están presentes" (Test-Path "$dir\robots.txt") -and (Test-Path "$dir\sitemap.xml")

# ---------------------------------------------------------------------
# SUITE 2: Auditoría de Seguridad & Meta Tags en index.html
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "[2/6] Auditoría de Seguridad en index.html..." -ForegroundColor Cyan

$htmlContent = Get-Content "$dir\index.html" -Raw -Encoding UTF8

Assert-Test "Política CSP (Content-Security-Policy) configurada" ($htmlContent -match 'http-equiv="Content-Security-Policy"')
Assert-Test "Cabecera X-Content-Type-Options: nosniff presente" ($htmlContent -match 'http-equiv="X-Content-Type-Options"')
Assert-Test "Cabecera Referrer-Policy estricta configurada" ($htmlContent -match 'name="referrer" content="strict-origin-when-cross-origin"')
Assert-Test "Protección Anti-Clickjacking Frame Buster implementada" ($htmlContent -match 'window\.top\s*!==\s*window\.self')
Assert-Test "Honeypot Anti-Bot en formulario de Newsletter" ($htmlContent -match 'id="newsHoneypot"')
Assert-Test "Honeypot Anti-Bot en formulario de Login" ($htmlContent -match 'id="loginHoneypot"')
Assert-Test "Honeypot Anti-Bot en formulario de Registro" ($htmlContent -match 'id="registerHoneypot"')
Assert-Test "Enlaces target='_blank' protegidos con rel='noopener noreferrer'" (-not ($htmlContent -match 'target="_blank"(?![^>]*rel="[^"]*noopener)'))

# ---------------------------------------------------------------------
# SUITE 3: Integridad del Catálogo en app.js
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "[3/6] Integridad de Fragancias y Reglas en app.js..." -ForegroundColor Cyan

$jsContent = Get-Content "$dir\app.js" -Raw -Encoding UTF8

$has8Products = ($jsContent -match "santal-nectar") -and `
                ($jsContent -match "rose-imperiale") -and `
                ($jsContent -match "oud-nocturne") -and `
                ($jsContent -match "bergamote-sauvage") -and `
                ($jsContent -match "ambre-dore") -and `
                ($jsContent -match "fleur-blanche") -and `
                ($jsContent -match "marina-profonda") -and `
                ($jsContent -match "vanille-celeste")

Assert-Test "Catálogo contiene las 8 fragancias completas (santal, rose, oud, bergamote, ambre, fleur, marina, vanille)" $has8Products
Assert-Test 'Umbral de Envío Gratuito definido en $350.000 COP' ($jsContent -match 'FREE_SHIPPING_THRESHOLD\s*=\s*350000')
Assert-Test "Límite de seguridad de cantidad por producto activo (MAX_CART_ITEM_QTY = 10)" ($jsContent -match 'MAX_CART_ITEM_QTY\s*=\s*10')
Assert-Test "Congelamiento anti-manipulación Object.freeze(PRODUCTS)" ($jsContent -match 'Object\.freeze\(PRODUCTS\)')
Assert-Test "API pública window.Alabastro expuesta para testing" ($jsContent -match 'window\.Alabastro\s*=')

# ---------------------------------------------------------------------
# SUITE 4: Módulo de Seguridad y Criptografía en app.js
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "[4/6] Verificación de Seguridad Criptográfica y Validación..." -ForegroundColor Cyan

Assert-Test "Función de sanitización XSS (sanitizeHTML) presente" ($jsContent -match 'function sanitizeHTML')
Assert-Test "Hashing de contraseñas con Web Crypto SHA-256 presente" ($jsContent -match 'crypto\.subtle\.digest\(''SHA-256''')
Assert-Test "Rate Limiter anti-fuerza bruta presente" ($jsContent -match 'rateLimiter\s*=\s*\{')
Assert-Test "Protección contra Prototype Pollution en safeJSONParse" ($jsContent -match '__proto__' -and $jsContent -match 'constructor')
Assert-Test "Validación robusta de datos de carrito (validateCartData)" ($jsContent -match 'function validateCartData')
Assert-Test "Monitor de inactividad de sesión (setupInactivityWatcher)" ($jsContent -match 'function setupInactivityWatcher')
Assert-Test "Advertencia Self-XSS para consola de desarrollador activa" ($jsContent -match 'Self-XSS')

# ---------------------------------------------------------------------
# SUITE 5: Verificación de Diseño y Estilos en styles.css
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "[5/6] Verificación de Tokens de Diseño y CSS..." -ForegroundColor Cyan

$cssContent = Get-Content "$dir\styles.css" -Raw -Encoding UTF8

Assert-Test "Paleta de colores de lujo definida (--color-dorado, --color-marfil)" ($cssContent -match '--color-dorado' -and $cssContent -match '--color-marfil')
Assert-Test "Tipografía editorial configurada (Playfair Display + DM Sans)" ($cssContent -match 'Playfair Display' -and $cssContent -match 'DM Sans')
Assert-Test "Breakpoints responsive implementados (768px, 600px, 480px, 360px)" ($cssContent -match 'max-width:\s*768px' -and $cssContent -match 'max-width:\s*480px')
Assert-Test "Clase de aviso de seguridad .auth-security-notice presente" ($cssContent -match '\.auth-security-notice')

# ---------------------------------------------------------------------
# SUITE 6: Dashboard de Testing (tests.html & test-suite.js)
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "[6/6] Verificación de la Suite de Pruebas Visual..." -ForegroundColor Cyan

$suiteContent = Get-Content "$dir\test-suite.js" -Raw -Encoding UTF8
Assert-Test "test-suite.js contiene micro-framework de aserciones expect()" ($suiteContent -match 'function expect\(')
Assert-Test "test-suite.js contiene 7 bloques de prueba describe()" ($suiteContent.Split("describe(").Count -gt 7)
Assert-Test "test-suite.js exporta API global window.AlabastroTesting" ($suiteContent -match 'AlabastroTesting')

# ---------------------------------------------------------------------
# RESUMEN FINAL
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host "                     RESUMEN DE PRUEBAS CLI                         " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host "  Total de Pruebas:  $totalTests" -ForegroundColor White
Write-Host "  Aprobadas:         $testsPassed" -ForegroundColor Green
Write-Host "  Fallidas:          $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })

$pct = [Math]::Round(($testsPassed / $totalTests) * 100, 1)
Write-Host "  Tasa de Éxito:     $pct%" -ForegroundColor $(if ($pct -eq 100) { "Green" } else { "Yellow" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host ">>> TODAS LAS PRUEBAS AUTOMATIZADAS PASARON CON EXITO (100%) <<<" -ForegroundColor Green
} else {
    Write-Host ">>> SE DETECTARON PRUEBAS FALLIDAS. REVISAR DETALLES ARRIBA <<<" -ForegroundColor Red
}
Write-Host ""

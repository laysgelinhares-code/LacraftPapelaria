$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080
$pfx = "http://localhost:$port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.jsx'  = 'text/plain; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.ttf'  = 'font/ttf'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($pfx)
$listener.Start()

Write-Host ""
Write-Host "  La Craft OS rodando em $pfx" -ForegroundColor Cyan
Write-Host "  (pressione Ctrl+C para parar)"
Write-Host ""

while ($true) {
  $ctx = $listener.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    $rel = $rel.Replace('/', [IO.Path]::DirectorySeparatorChar).TrimStart([IO.Path]::DirectorySeparatorChar)
    $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $full.StartsWith([IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)) {
      $ctx.Response.StatusCode = 403
      $ctx.Response.Close()
      continue
    }
    if ([IO.Directory]::Exists($full)) { $full = Join-Path $full 'index.html' }
    Write-Host ("  " + $ctx.Request.HttpMethod + " /" + $rel + "  ->  " + ([IO.Path]::GetFileName($full))) -ForegroundColor DarkGray
    if (-not [IO.File]::Exists($full)) {
      $ctx.Response.StatusCode = 404
      $body = [Text.Encoding]::UTF8.GetBytes('404 - arquivo nao encontrado')
      $ctx.Response.ContentType = 'text/plain; charset=utf-8'
      $ctx.Response.OutputStream.Write($body, 0, $body.Length)
      $ctx.Response.Close()
      continue
    }
    $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
    if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
    else { $ctx.Response.ContentType = 'application/octet-stream' }
    $bytes = [IO.File]::ReadAllBytes($full)
    $ctx.Response.ContentLength64 = $bytes.Length
    $out = $ctx.Response.OutputStream
    $out.Write($bytes, 0, $bytes.Length)
    $out.Close()
  } catch {
    Write-Host ("  ERROR: " + $_.Exception.Message) -ForegroundColor Red
    try { $ctx.Response.StatusCode = 500 } catch { }
  } finally {
    try { $ctx.Response.Close() } catch { }
  }
}
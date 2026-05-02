$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = if ($env:PORT) { [int]$env:PORT } else { 8080 }
$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

function Get-LocalIp {
  $addresses = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName())
  $addresses |
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and -not $_.IPAddressToString.StartsWith("127.") } |
    Select-Object -First 1 -ExpandProperty IPAddressToString
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8",
    [bool]$HeadOnly = $false
  )

  $headers = "HTTP/1.1 $Status $StatusText`r`n" +
    "Content-Type: $ContentType`r`n" +
    "Content-Length: $($Body.Length)`r`n" +
    "Cache-Control: no-store`r`n" +
    "X-Content-Type-Options: nosniff`r`n" +
    "Connection: close`r`n`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if (-not $HeadOnly) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$Listener.Start()
$LocalIp = Get-LocalIp
Write-Host ""
Write-Host "Savane Suede rodando localmente:"
Write-Host "  Neste computador: http://localhost:$Port"
if ($LocalIp) {
  Write-Host "  Em outro aparelho na mesma rede: http://$LocalIp`:$Port"
}
Write-Host ""
Write-Host "Mantenha esta janela aberta enquanto quiser acessar o site."
Write-Host "Para parar, pressione Ctrl+C."
Write-Host ""

while ($true) {
  $Client = $Listener.AcceptTcpClient()
  try {
    $Stream = $Client.GetStream()
    $Buffer = New-Object byte[] 8192
    $Read = $Stream.Read($Buffer, 0, $Buffer.Length)
    if ($Read -le 0) { continue }

    $Request = [System.Text.Encoding]::ASCII.GetString($Buffer, 0, $Read)
    $RequestLine = ($Request -split "`r?`n")[0]
    $Parts = $RequestLine -split " "
    if ($Parts.Count -lt 2) {
      Send-Response $Stream 400 "Bad Request" ([System.Text.Encoding]::UTF8.GetBytes("Requisicao invalida"))
      continue
    }

    $Method = $Parts[0].ToUpperInvariant()
    if ($Method -ne "GET" -and $Method -ne "HEAD") {
      Send-Response $Stream 405 "Method Not Allowed" ([System.Text.Encoding]::UTF8.GetBytes("Metodo nao permitido"))
      continue
    }

    $UrlPath = [System.Uri]::UnescapeDataString(($Parts[1] -split "\?")[0])
    if ($UrlPath -eq "/") { $UrlPath = "/index.html" }
    $RelativePath = $UrlPath.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
    $FullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $RelativePath))
    $RootPath = [System.IO.Path]::GetFullPath($Root)

    if (-not $FullPath.StartsWith($RootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
      Send-Response $Stream 403 "Forbidden" ([System.Text.Encoding]::UTF8.GetBytes("Acesso negado"))
      continue
    }

    if (-not [System.IO.File]::Exists($FullPath)) {
      Send-Response $Stream 404 "Not Found" ([System.Text.Encoding]::UTF8.GetBytes("Arquivo nao encontrado"))
      continue
    }

    $Extension = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
    $ContentType = if ($MimeTypes.ContainsKey($Extension)) { $MimeTypes[$Extension] } else { "application/octet-stream" }
    $Body = [System.IO.File]::ReadAllBytes($FullPath)
    Send-Response $Stream 200 "OK" $Body $ContentType ($Method -eq "HEAD")
  } catch {
    try {
      Send-Response $Stream 500 "Internal Server Error" ([System.Text.Encoding]::UTF8.GetBytes("Erro interno"))
    } catch {}
  } finally {
    $Client.Close()
  }
}

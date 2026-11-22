# Preview situs seperti di production.
#
# Artikel memakai URL absolut /blog-dialogika/blog/..., jadi server HARUS dijalankan
# dari folder induk (D:\Magang), bukan dari root repo. Kalau dijalankan dari root repo,
# link artikel akan 404 walaupun file-nya ada.
#
# Pemakaian (dari mana saja):
#   powershell -ExecutionPolicy Bypass -File D:\Magang\blog-dialogika\scripts\preview-lokal.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\preview-lokal.ps1 -Port 8080
param(
  [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot      # D:\Magang\blog-dialogika
$parent = Split-Path -Parent $root              # D:\Magang
$name   = Split-Path -Leaf $root                # blog-dialogika
$url    = "http://127.0.0.1:$Port/$name/"

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
  throw "Python tidak ditemukan. Install Python, atau jalankan server statis lain dari folder induk: $parent"
}

Write-Host ""
Write-Host "Menyajikan : $parent"
Write-Host "Buka       : $url"
Write-Host "Hentikan   : Ctrl+C"
Write-Host ""

Start-Process $url
& $python.Source -m http.server $Port --bind 127.0.0.1 --directory $parent

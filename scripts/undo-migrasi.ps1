# Membatalkan migrasi artikel lama yang dijalankan oleh scripts/migrate-old-articles.js.
# - Mengembalikan assets/data/articles.json dari snapshot
# - Menghapus file artikel baru yang tercatat di .migration-undo/created-files.txt
# Tidak menyentuh riwayat git dan tidak menghapus skrip migrasi.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$undoDir = Join-Path $root ".migration-undo"
$backupJson = Join-Path $undoDir "articles.json.bak"
$createdList = Join-Path $undoDir "created-files.txt"

if (-not (Test-Path $backupJson)) {
  throw "Snapshot tidak ditemukan: $backupJson. Tidak ada yang bisa di-undo."
}

$articlesJson = Join-Path $root "assets\data\articles.json"
Copy-Item $backupJson $articlesJson -Force
Write-Host "OK  articles.json dikembalikan dari snapshot."

if (Test-Path $createdList) {
  $removed = 0
  Get-Content $createdList | Where-Object { $_.Trim() -ne "" } | ForEach-Object {
    $target = Join-Path $root ($_.Trim() -replace "/", "\")
    if (Test-Path $target) {
      Remove-Item $target -Force
      $removed++
      Write-Host "DEL $($_.Trim())"
    }
  }
  Write-Host "OK  $removed file artikel baru dihapus."
} else {
  Write-Host "INFO daftar file baru tidak ditemukan; hanya articles.json yang dikembalikan."
}

Write-Host ""
Write-Host "Undo selesai. Cek dengan: git status --short"

@echo off
for /f %%a in ('powershell -Command "Get-Date -Format yyyyMMddHHmm"') do set VERSION=%%a

echo Updating ?v= to %VERSION%...

powershell -Command "Get-ChildItem -Path '.' -Include '*.html','*.css' -Recurse | ForEach-Object { (Get-Content $_.FullName -Encoding UTF8) -replace '\?v=\d+', ('?v=%VERSION%') | Set-Content $_.FullName -Encoding UTF8 }"

echo Done. All ?v= updated to %VERSION%.
pause

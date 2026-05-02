# Acesso remoto ao site Savane Suede

## Acessar em outro aparelho na mesma rede

1. Abra o PowerShell nesta pasta do projeto.
2. Rode:

```powershell
powershell -ExecutionPolicy Bypass -File .\servidor-local.ps1
```

3. O terminal vai mostrar dois links:

- `http://localhost:8080` para este computador.
- `http://SEU-IP:8080` para celular ou outro PC na mesma rede Wi-Fi.

Mantenha a janela aberta enquanto quiser acessar o site.

## Se o celular não abrir

- Confirme que celular e computador estão na mesma rede Wi-Fi.
- Permita o PowerShell/porta `8080` no Firewall do Windows se aparecer aviso.
- Tente trocar a porta:

```powershell
$env:PORT=8081; powershell -ExecutionPolicy Bypass -File .\servidor-local.ps1
```

## Acesso pela internet

Para qualquer pessoa acessar fora da sua rede, o ideal é publicar em uma hospedagem como GitHub Pages, Netlify, Vercel ou Cloudflare Pages. Este projeto é estático, então basta subir a pasta com `index.html`, `styles.css`, `app.js` e `assets`.

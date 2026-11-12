#!/usr/bin/env node
/* Capturas das telas-chave nos dois temas, para revisar mudanças visuais (teste visual).
   Uso: node scripts/capturas.mjs [pasta]   (padrão: capturas/; precisa do Google Chrome ou Chromium)
   Sobe um servidor local, abre tests/visual/capturar.html para cada tela e tema e salva um PNG por combinação.
   No CI, as imagens ficam como artefato do workflow para comparar com a versão anterior. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
const roda = promisify(execFile);
import { RAIZ } from "./validar.mjs";

const SAIDA = path.resolve(process.argv[2] || path.join(RAIZ, "capturas"));
const TELAS = ["hoje","lista","foco","concluir","ficha","historico","guia"], TEMAS = ["dark","light"];
const TIPOS = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png" };
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]
  .find(c => { try{ execFileSync(c, ["--version"], { stdio:"ignore" }); return true; }catch(e){ return false; } });
if(!CHROME){ console.error("Chrome não encontrado: capturas não geradas."); process.exit(1); }

const srv = http.createServer((req, res) => {
  const p = path.join(RAIZ, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if(!p.startsWith(RAIZ) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => srv.listen(0, "127.0.0.1", r));
const porta = srv.address().port;
fs.mkdirSync(SAIDA, { recursive:true });
for(const tema of TEMAS) for(const tela of TELAS){
  const arq = path.join(SAIDA, `${tela}-${tema === "dark" ? "escuro" : "claro"}.png`);
  // assíncrono: o servidor deste mesmo processo precisa responder ao Chrome enquanto ele carrega
  await roda(CHROME, [...(process.env.CI ? ["--no-sandbox"] : []), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", "--window-size=390,844",
    "--virtual-time-budget=3000", `--user-data-dir=${path.join(SAIDA, ".perfil-" + tema + "-" + tela)}`, `--screenshot=${arq}`,
    `http://127.0.0.1:${porta}/tests/visual/capturar.html?tela=${tela}&tema=${tema}`], { timeout: 60000 });
  fs.rmSync(path.join(SAIDA, ".perfil-" + tema + "-" + tela), { recursive:true, force:true });
  console.log(path.relative(RAIZ, arq));
}
srv.close();

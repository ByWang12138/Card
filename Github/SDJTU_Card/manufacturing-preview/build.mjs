import {access, mkdir, readFile, writeFile} from "node:fs/promises";
import {build} from "esbuild";
import {fileURLToPath} from "node:url";

const local = name => new URL(name,import.meta.url);
try {
  await Promise.all(["private/artwork.mjs","private/atlas.txt"].map(name => access(local(name))));
} catch {
  console.error("Missing private artwork. Run npm run import-private -- <your existing offline index.html>.");
  process.exit(1);
}
const [template,atlas,app]=await Promise.all([
  readFile(local("index.template.html"),"utf8"),
  readFile(local("private/atlas.txt"),"utf8"),
  build({entryPoints:[fileURLToPath(local("app.mjs"))],bundle:true,write:false,
    platform:"browser",format:"iife",minify:true,legalComments:"inline",target:"es2022"})
]);
const script=app.outputFiles[0].text.replace(/<\/script/gi,"<\\/script");
const html=template.replace("OFFLINE_ATLAS_SRC",atlas.trim()).replace("<!-- APP_BUNDLE -->",()=>"<script>"+script+"</script>");
await mkdir(local("dist/"),{recursive:true});
await writeFile(local("dist/index.html"),html);
console.log("Built dist/index.html. Open it directly in a browser.");

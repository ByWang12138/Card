import {readFile, writeFile, mkdir} from "node:fs/promises";
import {resolve} from "node:path";

const input=process.argv[2];
if (!input) {
  console.error("Usage: npm run import-private -- <your existing offline index.html>");
  process.exit(1);
}
const html=await readFile(resolve(input),"utf8");
const config=html.match(/var ln=(\{[\s\S]*?\});const stampSource="(data:image\/png;base64,[^"]+)";const captionPhotoSource="(data:image\/jpeg;base64,[^"]+)";async function zg\(\)/);
const atlas=html.match(/<img id="atlas-map"[^>]* src="(data:image\/webp;base64,[^"]+)"/);
const appStart=html.indexOf("async function zg()");
const defaultSerial=html.slice(appStart,appStart+700).match(/,a="([A-Z]{2}[0-9]{6})",/)?.[1];
if (!config || !atlas || !defaultSerial) throw new Error("Expected the matching offline manufacturing preview with its embedded private assets.");
if (!/^[A-Za-z0-9_{}\[\]\s\-+\/.,:;="'!#()%]*$/.test(config[1])) {
  throw new Error("Unsupported layout data. Use the matching local manufacturing preview.");
}
const folder=new URL("./private/",import.meta.url);
await mkdir(folder,{recursive:true});
await writeFile(new URL("artwork.mjs",folder),
  "export const ln="+config[1]+";\n"+
  "export const stampSource="+JSON.stringify(config[2])+";\n"+
  "export const captionPhotoSource="+JSON.stringify(config[3])+";\n"+
  "export const defaultSerial="+JSON.stringify(defaultSerial)+";\n");
await writeFile(new URL("atlas.txt",folder),atlas[1]+"\n");
console.log("Imported artwork locally into manufacturing-preview/private/.");

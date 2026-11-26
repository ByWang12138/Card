// Browser application. Original artwork and letter contours come from a local asset bundle.
import * as PDFLib from "pdf-lib";
import JSZip from "jszip";
import QRCode from "qrcode";
import {
  Vector2 as Et, Vector3 as N, Shape as mi, Path as Xn, ShapeUtils as kn,
  CanvasTexture as pi, ShapeGeometry as ss, BufferGeometry as an,
  Float32BufferAttribute as Ne, Scene as fi, Mesh as $t, MeshBasicMaterial as Rn,
  MeshPhysicalMaterial as xi, ShaderChunk as kt, WebGLRenderer as So,
  SRGBColorSpace as Se, ACESFilmicToneMapping as Oa, EquirectangularReflectionMapping as ir,
  Color as Ft, PerspectiveCamera as ze, PlaneGeometry as Hn, MathUtils as cr
} from "three";
import {ln,stampSource,captionPhotoSource,defaultSerial} from "./private/artwork.mjs";

async function zg(){let n=ln.face,r={width:16,height:14,codeWidth:12.841111111111111,codeHeight:12.841111111111111,centerX:ln.qr.x+ln.qr.width/2,centerY:ln.qr.y+ln.qr.height/2},s=ln.serial,a=defaultSerial,o='"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif',c=20,l="campus-acrylic-preview-v1",color="yellow",u=document.getElementById("stage"),p=document.getElementById("status"),E=Z=>document.getElementById(Z),m=(Z,rt)=>new Et(Z-100/2,58.5/2-rt),f=new mi,z=(Z,rt)=>{let Y=m(Z,rt);f.lineTo(Y.x,Y.y)},S=(Z,rt,Y,at)=>{let qt=m(Z,rt),yt=m(Y,at);f.quadraticCurveTo(qt.x,qt.y,yt.x,yt.y)};f.moveTo(...m(28.6,0)),z(71.55,0),S(76.8,0,79.6,3.55);let M=58.5-50,y=ln.bodyRadius,C=m(100-y,M+y),P=m(100-y,58.5-y),O=m(y,58.5-y),I=m(y,M+y);z(84.05,M),z(100-y,M),f.absarc(C.x,C.y,y,Math.PI/2,0,!0),z(100,58.5-y),f.absarc(P.x,P.y,y,0,-Math.PI/2,!0),z(y,58.5),f.absarc(O.x,O.y,y,-Math.PI/2,-Math.PI,!0),z(0,M+y),f.absarc(I.x,I.y,y,Math.PI,Math.PI/2,!0),z(16.18,M),z(20.5,3.55),S(23.35,0,28.6,0);let b=new Xn;b.absarc(...m(50.4,5.18),2.35,0,Math.PI*2,!1);let R=Z=>new Xn(Z.map(([rt,Y])=>m(rt,Y))),K=[b,...ln.wordHoles.map(R)],F=Z=>{let rt=[...Z];return rt[0].distanceToSquared(rt.at(-1))<1e-10&&rt.pop(),rt},G=F(f.getPoints(24)),J=K.map(Z=>{let rt=F(Z.getPoints(24));return kn.isClockWise(rt)?rt.reverse():rt}),H=Z=>new Promise((rt,Y)=>{let at=new Image;at.onload=()=>rt(at),at.onerror=Y,at.src=Z}),nt=document.createElement("canvas");nt.width=100*c,nt.height=58.5*c;let D=nt.getContext("2d"),ct=new pi(nt);ct.colorSpace=Se;const rearCanvas=document.createElement("canvas"),rearCtx=rearCanvas.getContext("2d"),rearTexture=new pi(rearCanvas);rearTexture.colorSpace=Se;const serialPrefix = E("serial-prefix");
const serialDigits = E("serial-digits");
serialPrefix.value = defaultSerial.slice(0, 2);
serialDigits.value = defaultSerial.slice(2);
const manufacturingExport = E("manufacturing-export");
const completeSerial = /^[A-Z]{2}[0-9]{6}$/;
let serialNumber = a;
const atlasImage = E("atlas-map");
const atlasReady = atlasImage.decode().then(() => true, () => false);
let [vt,zt,stampImg,captionPhoto,hasAtlas] = await Promise.all([H(ln.background),H(s.image),H(stampSource),H(captionPhotoSource),atlasReady]);

// Bake the map-only palette into the texture shared by WebGL, fallback and exports.
const atlasArtwork = hasAtlas ? colorizeAtlas(atlasImage) : null;
function colorizeAtlas(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.filter = getComputedStyle(image).getPropertyValue("--atlas-palette").trim();
  context.drawImage(image, 0, 0);
  return canvas;
}

function atlasScale(width, height) {
  if (!hasAtlas) return {x: 1, y: 1};
  const viewportAspect = width / height;
  const mapAspect = atlasImage.naturalWidth / atlasImage.naturalHeight;
  return {x: Math.min(viewportAspect / mapAspect, 1), y: Math.min(mapAspect / viewportAspect, 1)};
}

function paintAtlas(context, width, height) {
  context.fillStyle = "#e7f0f4";
  context.fillRect(0, 0, width, height);
  if (!hasAtlas) return;
  const scale = atlasScale(width, height);
  const imageWidth = width / scale.x;
  const imageHeight = height / scale.y;
  context.drawImage(atlasArtwork, (width-imageWidth)/2, (height-imageHeight)/2, imageWidth, imageHeight);
}

function modelCenter() {
  return Number(getComputedStyle(u).getPropertyValue("--model-center")) || .5;
}

function Wt(Z="",rt=!1){p.hidden=!Z,p.textContent=Z,p.classList.toggle("error",rt)}function oe(Z,rt,Y,at,qt){if(!Z)return;D.save(),D.font="700 100px "+o;let{actualBoundingBoxLeft:yt,actualBoundingBoxRight:A,actualBoundingBoxAscent:g,actualBoundingBoxDescent:q}=D.measureText(Z),B=yt+A,Q=g+q;if(B>0&&Q>0){let W=qt/Q,bt=Math.min(Z.length===a.length?at/B:W,at/B);D.translate(rt,Y),D.scale(bt,W),D.fillStyle="#fff",D.fillText(Z,(yt-A)/2,(g-q)/2)}D.restore()}function ee(Z){if(D.fillStyle="#fff",D.fillRect(r.centerX-r.width/2,r.centerY-r.height/2,r.width,r.height),!Z)return;let rt={errorCorrectionLevel:"M"},Y=QRCode.create(Z,rt);Y.version<2&&(Y=QRCode.create(Z,{...rt,version:2}));let{modules:at}=Y,qt=(r.centerX-r.codeWidth/2)*c,yt=(r.centerY-r.codeHeight/2)*c,A=r.codeWidth*c/at.size,g=r.codeHeight*c/at.size;D.save(),D.resetTransform(),D.fillStyle="#080b0e";for(let q=0;q<at.size;q++)for(let B=0;B<at.size;B++)at.get(q,B)&&D.fillRect(qt+B*A,yt+q*g,Math.ceil(A),Math.ceil(g));D.restore()}let captionGlyph;
function getCaptionGlyph() {
  if (captionGlyph) return captionGlyph;
  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 190;
  const context = canvas.getContext("2d");
  context.font = "700 100px " + o;
  context.fillStyle = "#fff";
  context.fillText("毕业留念专属纪念品", 24, 140);

  const pixels = context.getImageData(0,0,canvas.width,canvas.height).data;
  let left=canvas.width, top=canvas.height, right=-1, bottom=-1;
  for (let y=0; y<canvas.height; y++) {
    for (let x=0; x<canvas.width; x++) {
      if (pixels[(y*canvas.width+x)*4+3] === 0) continue;
      left=Math.min(left,x);
      top=Math.min(top,y);
      right=Math.max(right,x);
      bottom=Math.max(bottom,y);
    }
  }
  if (right < left || bottom < top) return null;
  captionGlyph={canvas,left,top,width:right-left+1,height:bottom-top+1};
  return captionGlyph;
}

function drawKeepsakeCaption() {
  const artWidth=1943,artHeight=921;
  // Restore the clean photograph underneath the original lettering.
  D.save();
  D.translate(n.x,n.y);
  D.scale(n.width/artWidth,n.height/artHeight);
  D.beginPath();
  D.rect(650,812,606,82);
  D.clip();
  D.transform(1.66633136,-0.00004448,0.00163680,2.36190822,-7.00551058,0.29190136);
  D.drawImage(captionPhoto,0,0);
  D.restore();

  // Match the original ink rectangle, independent of host font metrics.
  const glyph=getCaptionGlyph();
  if (!glyph) return;
  D.drawImage(glyph.canvas,glyph.left,glyph.top,glyph.width,glyph.height,
    n.x+n.width*671/artWidth,n.y+n.height*824/artHeight,n.width*565/artWidth,n.height*57/artHeight);
}
function X(){D.setTransform(c,0,0,c,0,0),D.imageSmoothingQuality="high",D.fillStyle=color==="yellow"?"#ffff00":"#0562ec",D.fillRect(0,0,100,58.5),D.save(),D.beginPath(),D.roundRect(n.x,n.y,n.width,n.height,n.radius),D.clip(),D.drawImage(vt,n.x,n.y,n.width,n.height),drawKeepsakeCaption();let Z=new Path2D;for(let[at,...qt]of ln.wordHoles){Z.moveTo(...at);for(let yt of qt)Z.lineTo(...yt);Z.closePath()}let rt=new Path2D;rt.rect(0,0,100,58.5),rt.addPath(Z),D.save(),D.clip(rt,"evenodd"),D.strokeStyle="#fff",D.lineWidth=2,D.lineJoin="round",D.stroke(Z),D.restore();let Y=serialNumber;Y===a?D.drawImage(zt,s.x,s.y,s.width,s.height):oe(Y,s.x+s.width/2,s.y+s.height/2,s.width,s.height);try{ee("109-"+Y)}catch{Wt("\u7F16\u53F7\u8FC7\u957F\uFF0C\u65E0\u6CD5\u751F\u6210\u4E8C\u7EF4\u7801\u3002",!0)}D.save(),D.globalAlpha=.5,D.drawImage(stampImg,74.8,32.8,18.5,18.5),D.restore(),D.restore(),ct.needsUpdate=!0,rearCanvas.width=nt.width,rearCanvas.height=nt.height,rearCtx.drawImage(nt,0,0),rearCtx.fillStyle="rgba(255,255,255,0.8)",rearCtx.fillRect(0,0,rearCanvas.width,rearCanvas.height),rearTexture.needsUpdate=!0}
const acrylicThickness = 5;
const acrylicHalfThickness = acrylicThickness / 2;

function cardShape() {
  const signedArea = loop => loop.reduce((sum, point, i) => {
    const next = loop[(i + 1) % loop.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2;
  const oriented = (loop, ccw) => {
    const isCcw = signedArea(loop) > 0;
    return isCcw === ccw ? loop : [...loop].reverse();
  };
  const outer = oriented(G, true);
  const shape = new mi();
  shape.moveTo(outer[0].x, outer[0].y);
  for (const point of outer.slice(1)) shape.lineTo(point.x, point.y);
  shape.closePath();
  for (const contour of J) {
    const hole = oriented(contour, false);
    const path = new Xn();
    path.moveTo(hole[0].x, hole[0].y);
    for (const point of hole.slice(1)) path.lineTo(point.x, point.y);
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

function extrudedCard(shape, depth, z, outerMaterial = 1, holeMaterial = outerMaterial) {
  // Triangulated caps and explicit wall quads form one closed solid.
  const cap = new ss(shape, 24);
  const capPos = cap.getAttribute("position");
  const indices = cap.getIndex();
  const positions = [], normals = [], uvs = [];
  const vertex = (x, y, zz, nx, ny, nz) => {
    positions.push(x,y,zz); normals.push(nx,ny,nz);
    uvs.push(x / 100 + 0.5, y / 58.5 + 0.5);
  };
  const capVertex = (i, zz, nz) => vertex(capPos.getX(i),capPos.getY(i),zz,0,0,nz);
  for (let i=0; i<indices.count; i+=3) {
    const a=indices.getX(i), b=indices.getX(i+1), c=indices.getX(i+2);
    capVertex(a,z+depth,1); capVertex(b,z+depth,1); capVertex(c,z+depth,1);
    capVertex(c,z,-1); capVertex(b,z,-1); capVertex(a,z,-1);
  }
  const capCount = positions.length / 3;
  function appendWall(contour) {
    for (let i=0; i<contour.length; i++) {
      const a=contour[i], b=contour[(i+1)%contour.length];
      const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
      if (len<1e-8) continue;
      const nx=dy/len, ny=-dx/len;
      vertex(a.x,a.y,z,nx,ny,0); vertex(b.x,b.y,z,nx,ny,0); vertex(b.x,b.y,z+depth,nx,ny,0);
      vertex(a.x,a.y,z,nx,ny,0); vertex(b.x,b.y,z+depth,nx,ny,0); vertex(a.x,a.y,z+depth,nx,ny,0);
    }
  }
  appendWall(shape.getPoints(24));
  const holeStart = positions.length / 3;
  for (const hole of shape.holes) appendWall(hole.getPoints(24));

  cap.dispose();
  const geo=new an();
  geo.setAttribute("position",new Ne(positions,3));
  geo.setAttribute("normal",new Ne(normals,3));
  geo.setAttribute("uv",new Ne(uvs,2));
  const vertexCount = positions.length / 3;
  if (outerMaterial === 0) {
    geo.addGroup(0, holeStart, 0);
  } else {
    geo.addGroup(0, capCount, 0);
    geo.addGroup(capCount, holeStart - capCount, outerMaterial);
  }
  if (vertexCount > holeStart) geo.addGroup(holeStart, vertexCount - holeStart, holeMaterial);
  return geo;
}

function makeAcrylic(studio) {
  const shape = cardShape();
  const plaque = new fi();

  // Composite the 80% white coating into a single opaque rear surface.
  // Its geometry has the same through-holes as the acrylic.
  const backingGeometry = new ss(shape, 24);
  const backPos = backingGeometry.getAttribute("position");
  const backUv = backingGeometry.getAttribute("uv");
  for (let i=0; i<backPos.count; i++) {
    backUv.setXY(i, backPos.getX(i)/100+0.5, backPos.getY(i)/58.5+0.5);
  }
  backUv.needsUpdate = true;
  backingGeometry.translate(0, 0, -2.61);
  const backing = new $t(backingGeometry, new Rn({map: rearTexture, side: 1}));
  plaque.add(backing);

  // Single-sided color print, cut through along with the backing and acrylic.
  ct.colorSpace = Se;
  ct.wrapS = ct.wrapT = 1001;
  ct.repeat.set(1, 1);
  ct.offset.set(0, 0);
  ct.needsUpdate = true;
  const print = new $t(extrudedCard(shape, 0.07, -2.57), [
    new Rn({map: ct, color: 0xffffff, side: 0}),
    new Rn({color: 0x33445b, side: 2})
  ]);
  plaque.add(print);

  // Single-pass refraction through the polished 5 mm acrylic.
  const polishedAcrylic = new xi({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 1,
    thickness: acrylicThickness,
    ior: 1.49,
    envMap: studio,
    envMapIntensity: 0.56,
    specularIntensity: 0.72,
    side: 0
  });

  const frostedHoleWalls = polishedAcrylic.clone();
  frostedHoleWalls.roughness = 0.16;
  frostedHoleWalls.thickness = 0.5;
  frostedHoleWalls.envMapIntensity = 0;
  frostedHoleWalls.specularIntensity = 0;
  frostedHoleWalls.side = 2;
  frostedHoleWalls.forceSinglePass = true;
  frostedHoleWalls.onBeforeRender = renderer => {
    // Keep the hole walls visible in the final view, but out of Three.js'
    // back-face transmission pass so they cannot appear inside the glass again.
    const isVisibleView = renderer.getRenderTarget() === null;
    frostedHoleWalls.colorWrite = isVisibleView;
    frostedHoleWalls.depthWrite = isVisibleView;
  };

  polishedAcrylic.onBeforeCompile = shader => {
    const chunk = kt.transmission_pars_fragment;
    const originalSample = "return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );";
    if (chunk.includes(originalSample)) {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        chunk.replace(originalSample, "return textureLod( transmissionSamplerMap, fragCoord, 0.0 );")
      );
    }

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vAcrylicLocalNormal;")
      .replace("#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>\nvAcrylicLocalNormal = normal;");

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
        varying vec3 vAcrylicLocalNormal;

        float studioLightStrip(vec3 ray, vec3 direction, vec2 halfSize, float softness) {
          vec3 forward = normalize(direction);
          vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
          vec3 up = cross(forward, right);
          float facing = dot(ray, forward);
          vec2 offset = abs(vec2(dot(ray, right), dot(ray, up))) / max(facing, 0.001);
          vec2 inside = 1.0 - smoothstep(halfSize - softness, halfSize + softness, offset);
          return step(0.0, facing) * inside.x * inside.y;
        }
      `)
      .replace("#include <opaque_fragment>", `
        if (vAcrylicLocalNormal.z > 0.5) {
          vec3 viewDirection = normalize(vViewPosition);
          vec3 reflectedRay = inverseTransformDirection(reflect(-viewDirection, normal), viewMatrix);
          float key = studioLightStrip(reflectedRay, vec3(0.61, 0.21, 0.76), vec2(0.29, 0.043), 0.023);
          float fill = studioLightStrip(reflectedRay, vec3(-0.38, 0.32, 0.86), vec2(0.21, 0.029), 0.018);
          float grazing = 1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0);
          float reflectance = 0.04 + 0.28 * pow(grazing, 5.0);
          outgoingLight += reflectance * (key * vec3(4.8, 4.65, 4.4) + fill * vec3(2.55, 2.83, 3.2));
        }
        #include <opaque_fragment>
      `);
  };

  const acrylicGeometry = extrudedCard(shape, acrylicThickness, -acrylicHalfThickness, 0, 1);
  const glass = new $t(acrylicGeometry, [polishedAcrylic, frostedHoleWalls]);
  plaque.add(glass);
  plaque.userData.layers = {backing, print, glass};
  return {plaque, eye: new N()};
}

function fe(){let Z=new So({alpha:!0,antialias:!0,preserveDrawingBuffer:!0});Z.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),Z.setClearColor(0,0),Z.outputColorSpace=Se,Z.toneMapping=Oa,Z.toneMappingExposure=1.15,ct.anisotropy=Z.capabilities.getMaxAnisotropy(),u.appendChild(Z.domElement);let rt=new fi,Y=document.createElement("canvas");Y.width=1024,Y.height=512;let at=Y.getContext("2d"),qt=at.createLinearGradient(0,0,0,Y.height);qt.addColorStop(0,"#ddd9d2"),qt.addColorStop(.43,"#f7f5f1"),qt.addColorStop(.68,"#eeeae4"),qt.addColorStop(1,"#d7d2ca"),at.fillStyle=qt,at.fillRect(0,0,Y.width,Y.height);let yt=(pt,jt,de,Xe,x)=>{let U=at.createRadialGradient(pt+de/2,jt+Xe/2,2,pt+de/2,jt+Xe/2,Math.max(de,Xe));U.addColorStop(0,`rgba(255,255,255,${x})`),U.addColorStop(1,"rgba(255,255,255,0)"),at.fillStyle=U,at.fillRect(pt-de,jt-Xe,de*3,Xe*3)};yt(180,120,90,30,.45),yt(770,155,125,24,.38);let A=new pi(Y);A.colorSpace=Se,A.mapping=ir,rt.environment=A;
const atlasTexture = atlasArtwork ? new pi(atlasArtwork) : null;
if (atlasTexture) atlasTexture.colorSpace = Se;
rt.background = atlasTexture || new Ft(0xe7f0f4);
let Q=32,W=new ze(Q,1,1,1500),bt={angle:{yaw:.4,pitch:-.14},front:{yaw:0,pitch:0},side:{yaw:1.08,pitch:-.12},back:{yaw:Math.PI,pitch:0}},{plaque:et,eye:plaqueEye}=makeAcrylic(A),{yaw:ft,pitch:Mt}=bt.angle,$=ft,ut=Mt;et.rotation.set(Mt,ft,0,"YXZ"),rt.add(et);let Rt=document.createElement("canvas");Rt.width=Rt.height=256;let It=Rt.getContext("2d"),lt=It.createRadialGradient(128,128,5,128,128,128);lt.addColorStop(0,"rgba(39,47,63,.46)"),lt.addColorStop(.38,"rgba(39,47,63,.31)"),lt.addColorStop(.75,"rgba(39,47,63,.07)"),lt.addColorStop(1,"rgba(39,47,63,0)"),It.fillStyle=lt,It.fillRect(0,0,256,256);let Zt=new pi(Rt);Zt.colorSpace=Se;let w=new $t(new Hn(121,56),new Rn({map:Zt,transparent:!0,depthWrite:!1,opacity:.71})),tt=new $t(new Hn(107,19),new Rn({map:Zt,transparent:!0,depthWrite:!1,opacity:.49}));for(let pt of[w,tt])pt.rotation.x=-Math.PI/2,rt.add(pt);let ot=1,gt=0,_=0,j=1,xt=1,Vt=null,Jt=0,Lt=new Map,Ye=new N,De=new N(0,0,1);function Ni() {
  const center = modelCenter();
  const aspect = j / xt;
  const halfHeight = Math.max(center > .5 ? 52 : 45, (center > .5 ? 76 : 68) / aspect);
  W.zoom = ot;
  W.position.z = halfHeight / Math.tan(cr.degToRad(Q / 2));
  W.setViewOffset(j, xt, j * (.5 - center), 0, j, xt);
}function $e(){et.updateMatrixWorld();et.worldToLocal(plaqueEye.copy(W.position));let pt=1/0;for(let de of G)for(let Xe of[-acrylicHalfThickness,acrylicHalfThickness])Ye.set(de.x,de.y,Xe).applyMatrix4(et.matrixWorld),pt=Math.min(pt,Ye.y);De.set(0,0,1).applyQuaternion(et.quaternion);let jt=Math.abs(De.z);w.position.set(1.5,pt-3.3,-4),w.scale.x=.53+jt*.47,tt.position.set(1.1,pt-3.05,-.5),tt.scale.x=.22+jt*.78,tt.rotation.z=Math.sin(ft)*.22,Z.render(rt,W)}function Mr(pt){gt=0;let jt=_?pt-_:16,de=1-Math.exp(-jt/38);ft+=($-ft)*de,Mt+=(ut-Mt)*de,Math.abs($-ft)+Math.abs(ut-Mt)>.001?(_=pt,vn()):(_=0,ft=$,Mt=ut),et.rotation.set(Mt,ft,0,"YXZ"),$e()}function vn(){gt||(gt=requestAnimationFrame(Mr))}function Ar(){j=Math.max(1,u.clientWidth),xt=Math.max(1,u.clientHeight),Z.setSize(j,xt,!1);
  if (atlasTexture) {
    const scale = atlasScale(j, xt);
    atlasTexture.repeat.set(scale.x, scale.y);
    atlasTexture.offset.set((1-scale.x)/2, (1-scale.y)/2);
  }
  Ni();
  vn();
}new ResizeObserver(Ar).observe(u),Ar();function Ir(pt=""){document.querySelectorAll("[data-view]").forEach(jt=>jt.setAttribute("aria-pressed",String(jt.dataset.view===pt)))}function Un(pt){ot=1;let jt=bt[pt],de=cr.euclideanModulo(jt.yaw-ft+Math.PI,2*Math.PI)-Math.PI;$=ft+de,ut=jt.pitch,Ni(),Ir(pt),vn()}function Sr(pt,jt){$+=pt,ut=cr.clamp(ut+jt,-.91,.91),Ir(),vn()}function ni(pt){ot=cr.clamp(ot*pt,.55,3.1),Ni(),vn()}u.addEventListener("pointerdown",pt=>{if(pt.button===0&&(u.setPointerCapture(pt.pointerId),Lt.set(pt.pointerId,[pt.clientX,pt.clientY]),Vt=pt.pointerId,Lt.size===2)){let[jt,de]=[...Lt.values()];Jt=Math.hypot(jt[0]-de[0],jt[1]-de[1])}}),u.addEventListener("pointermove",pt=>{if(!Lt.has(pt.pointerId))return;let jt=Lt.get(pt.pointerId);if(Lt.set(pt.pointerId,[pt.clientX,pt.clientY]),Lt.size===2){let[de,Xe]=[...Lt.values()],x=Math.hypot(de[0]-Xe[0],de[1]-Xe[1]);Jt&&x&&ni(x/Jt),Jt=x}else pt.pointerId===Vt&&Sr((pt.clientX-jt[0])*.006,(pt.clientY-jt[1])*.005)});let zr=pt=>{Lt.delete(pt.pointerId),Vt=Lt.keys().next().value??null,Jt=0};u.addEventListener("pointerup",zr),u.addEventListener("pointercancel",zr),u.addEventListener("lostpointercapture",zr),u.addEventListener("wheel",pt=>{pt.preventDefault(),ni(Math.exp(-pt.deltaY*(pt.deltaMode===1?.027:.0016)))},{passive:!1}),u.addEventListener("dblclick",()=>Un("angle")),u.addEventListener("keydown",pt=>{let jt={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};if(jt[pt.key])Sr(...jt[pt.key]);else if(pt.key==="+"||pt.key==="=")ni(1.14);else if(pt.key==="-")ni(1/1.14);else if(pt.key==="0")Un("angle");else return;pt.preventDefault()});return{redraw:vn,setView:Un}}function Ht(){u.replaceChildren();let Z=document.createElement("canvas"),rt=Z.getContext("2d");u.append(Z),u.style.cursor="default";let Y=new Path2D;for(let yt of[G,...J])Y.moveTo(yt[0].x+100/2,58.5/2-yt[0].y),yt.slice(1).forEach(A=>Y.lineTo(A.x+100/2,58.5/2-A.y)),Y.closePath();function at(yt){let A=yt.getContext("2d"),{width:g,height:q}=yt;paintAtlas(A,g,q),A.save();const center=modelCenter();let B=Math.min(g*(center>.5?.47:.82)/100,q*.74/58.5);A.translate(g*center-50*B,(q-58.5*B)/2),A.scale(B,B),A.clip(Y,"evenodd"),A.drawImage(nt,0,0,100,58.5),A.restore()}let qt=()=>{Z.width=Math.max(1,u.clientWidth*(window.devicePixelRatio||1)),Z.height=Math.max(1,u.clientHeight*(window.devicePixelRatio||1)),at(Z)};return new ResizeObserver(qt).observe(u),E("views").hidden=!0,E("view-title").textContent="\u6B63\u9762\u9884\u89C8",qt(),{redraw:qt}}function saveSettings() {
  try {
    localStorage.setItem(l, JSON.stringify({serial: serialNumber, color}));
  } catch {
    Wt("本次修改已显示，浏览器未能保存本地记录。");
  }
}

try {
  const saved = JSON.parse(localStorage.getItem(l));
  const savedSerial = typeof saved?.serial === "string" ? saved.serial.trim().toUpperCase() : "";
  if (completeSerial.test(savedSerial)) {
    serialNumber = savedSerial;
    serialPrefix.value = savedSerial.slice(0, 2);
    serialDigits.value = savedSerial.slice(2);
  }
  if (["yellow", "blue"].includes(saved?.color)) color = saved.color;
} catch {}
document.querySelectorAll("[data-color]").forEach(button =>
  button.setAttribute("aria-pressed", String(button.dataset.color === color)));
X();
let Qt;
try {
  Qt = fe();
} catch (error) {
  console.info("3D preview unavailable", error);
  Qt = Ht();
}

function updateSerial() {
  const proposed = serialPrefix.value + serialDigits.value;
  const valid = serialPrefix.value.length === 2 && serialDigits.value.length === 6
    && completeSerial.test(proposed);
  manufacturingExport.disabled = !valid || exportingManufacturing;
  if (!valid) return;
  serialPrefix.removeAttribute("aria-invalid");
  serialDigits.removeAttribute("aria-invalid");
  if (serialNumber === proposed) return;
  serialNumber = proposed;
  Wt();
  X();
  Qt.redraw();
  saveSettings();
}

for (const field of [serialPrefix, serialDigits]) {
  const prefix = field === serialPrefix;
  const limit = prefix ? 2 : 6;
  const clean = (text) => prefix
    ? text.normalize("NFKC").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, limit)
    : text.normalize("NFKC").replace(/[^0-9]/g, "").slice(0, limit);
  const sanitize = () => {
    const previous = field.value;
    const normalized = clean(previous);
    if (normalized !== previous) {
      const caret = clean(previous.slice(0, field.selectionStart)).length;
      field.value = normalized;
      field.setSelectionRange(caret, caret);
    }
    if (field.value.length === limit) field.removeAttribute("aria-invalid");
    updateSerial();
  };
  field.addEventListener("input", event => {
    if (!event.isComposing) sanitize();
  });
  field.addEventListener("compositionend", sanitize);
  field.addEventListener("blur", () => {
    sanitize();
    if (field.value.length !== limit) field.setAttribute("aria-invalid", "true");
  });
  field.addEventListener("paste", event => {
    const text = event.clipboardData?.getData("text").trim().normalize("NFKC");
    if (!text || !/^[A-Za-z]{2}[0-9]{6}$/.test(text)) return;
    event.preventDefault();
    serialPrefix.value = text.slice(0, 2).toUpperCase();
    serialDigits.value = text.slice(2);
    updateSerial();
  });
}

E("colors").addEventListener("click",Z=>{let rt=Z.target.closest("[data-color]")?.dataset.color;if(!["yellow","blue"].includes(rt))return;color=rt,document.querySelectorAll("[data-color]").forEach(Y=>Y.setAttribute("aria-pressed",String(Y.dataset.color==color))),Wt(),X(),Qt.redraw(),saveSettings()}),E("views").addEventListener("click",Z=>{let{view:rt}=Z.target.dataset;rt&&Qt.setView?.(rt)});
const dxfTemplate = "  0\nSECTION\n  2\nHEADER\n  9\n$ACADVER\n  1\nAC1015\n  9\n$ACADMAINTVER\n 70\n6\n  9\n$DWGCODEPAGE\n  3\nANSI_1252\n  9\n$INSBASE\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$EXTMIN\n 10\n1e+20\n 20\n1e+20\n 30\n1e+20\n  9\n$EXTMAX\n 10\n-1e+20\n 20\n-1e+20\n 30\n-1e+20\n  9\n$LIMMIN\n 10\n0.0\n 20\n0.0\n  9\n$LIMMAX\n 10\n420.0\n 20\n297.0\n  9\n$ORTHOMODE\n 70\n0\n  9\n$REGENMODE\n 70\n1\n  9\n$FILLMODE\n 70\n1\n  9\n$QTEXTMODE\n 70\n0\n  9\n$MIRRTEXT\n 70\n1\n  9\n$LTSCALE\n 40\n1.0\n  9\n$ATTMODE\n 70\n1\n  9\n$TEXTSIZE\n 40\n2.5\n  9\n$TRACEWID\n 40\n1.0\n  9\n$TEXTSTYLE\n  7\nStandard\n  9\n$CLAYER\n  8\n0\n  9\n$CELTYPE\n  6\nByLayer\n  9\n$CECOLOR\n 62\n256\n  9\n$CELTSCALE\n 40\n1.0\n  9\n$DISPSILH\n 70\n0\n  9\n$DIMSCALE\n 40\n1.0\n  9\n$DIMASZ\n 40\n2.5\n  9\n$DIMEXO\n 40\n0.625\n  9\n$DIMDLI\n 40\n3.75\n  9\n$DIMRND\n 40\n0.0\n  9\n$DIMDLE\n 40\n0.0\n  9\n$DIMEXE\n 40\n1.25\n  9\n$DIMTP\n 40\n0.0\n  9\n$DIMTM\n 40\n0.0\n  9\n$DIMTXT\n 40\n2.5\n  9\n$DIMCEN\n 40\n2.5\n  9\n$DIMTSZ\n 40\n0.0\n  9\n$DIMTOL\n 70\n0\n  9\n$DIMLIM\n 70\n0\n  9\n$DIMTIH\n 70\n0\n  9\n$DIMTOH\n 70\n0\n  9\n$DIMSE1\n 70\n0\n  9\n$DIMSE2\n 70\n0\n  9\n$DIMTAD\n 70\n1\n  9\n$DIMZIN\n 70\n8\n  9\n$DIMBLK\n  1\n\n  9\n$DIMASO\n 70\n1\n  9\n$DIMSHO\n 70\n1\n  9\n$DIMPOST\n  1\n\n  9\n$DIMAPOST\n  1\n\n  9\n$DIMALT\n 70\n0\n  9\n$DIMALTD\n 70\n3\n  9\n$DIMALTF\n 40\n0.03937007874\n  9\n$DIMLFAC\n 40\n1.0\n  9\n$DIMTOFL\n 70\n1\n  9\n$DIMTVP\n 40\n0.0\n  9\n$DIMTIX\n 70\n0\n  9\n$DIMSOXD\n 70\n0\n  9\n$DIMSAH\n 70\n0\n  9\n$DIMBLK1\n  1\n\n  9\n$DIMBLK2\n  1\n\n  9\n$DIMSTYLE\n  2\nISO-25\n  9\n$DIMCLRD\n 70\n0\n  9\n$DIMCLRE\n 70\n0\n  9\n$DIMCLRT\n 70\n0\n  9\n$DIMTFAC\n 40\n1.0\n  9\n$DIMGAP\n 40\n0.625\n  9\n$DIMJUST\n 70\n0\n  9\n$DIMSD1\n 70\n0\n  9\n$DIMSD2\n 70\n0\n  9\n$DIMTOLJ\n 70\n0\n  9\n$DIMTZIN\n 70\n8\n  9\n$DIMALTZ\n 70\n0\n  9\n$DIMALTTZ\n 70\n0\n  9\n$DIMUPT\n 70\n0\n  9\n$DIMDEC\n 70\n2\n  9\n$DIMTDEC\n 70\n2\n  9\n$DIMALTU\n 70\n2\n  9\n$DIMALTTD\n 70\n3\n  9\n$DIMTXSTY\n  7\nStandard\n  9\n$DIMAUNIT\n 70\n0\n  9\n$DIMADEC\n 70\n0\n  9\n$DIMALTRND\n 40\n0.0\n  9\n$DIMAZIN\n 70\n0\n  9\n$DIMDSEP\n 70\n44\n  9\n$DIMATFIT\n 70\n3\n  9\n$DIMFRAC\n 70\n0\n  9\n$DIMLDRBLK\n  1\n\n  9\n$DIMLUNIT\n 70\n2\n  9\n$DIMLWD\n 70\n-2\n  9\n$DIMLWE\n 70\n-2\n  9\n$DIMTMOVE\n 70\n0\n  9\n$LUNITS\n 70\n2\n  9\n$LUPREC\n 70\n3\n  9\n$SKETCHINC\n 40\n1.0\n  9\n$FILLETRAD\n 40\n10.0\n  9\n$AUNITS\n 70\n0\n  9\n$AUPREC\n 70\n2\n  9\n$MENU\n  1\n.\n  9\n$ELEVATION\n 40\n0.0\n  9\n$PELEVATION\n 40\n0.0\n  9\n$THICKNESS\n 40\n0.0\n  9\n$LIMCHECK\n 70\n0\n  9\n$CHAMFERA\n 40\n0.0\n  9\n$CHAMFERB\n 40\n0.0\n  9\n$CHAMFERC\n 40\n0.0\n  9\n$CHAMFERD\n 40\n0.0\n  9\n$SKPOLY\n 70\n0\n  9\n$TDCREATE\n 40\n2461371.6081481483\n  9\n$TDUCREATE\n 40\n2458532.153996898\n  9\n$TDUPDATE\n 40\n2461371.6081481483\n  9\n$TDUUPDATE\n 40\n2458532.1544311\n  9\n$TDINDWG\n 40\n0.0\n  9\n$TDUSRTIMER\n 40\n0.0\n  9\n$USRTIMER\n 70\n1\n  9\n$ANGBASE\n 50\n0.0\n  9\n$ANGDIR\n 70\n0\n  9\n$PDMODE\n 70\n0\n  9\n$PDSIZE\n 40\n0.0\n  9\n$PLINEWID\n 40\n0.0\n  9\n$SPLFRAME\n 70\n0\n  9\n$SPLINETYPE\n 70\n6\n  9\n$SPLINESEGS\n 70\n8\n  9\n$HANDSEED\n  5\n1000\n  9\n$SURFTAB1\n 70\n6\n  9\n$SURFTAB2\n 70\n6\n  9\n$SURFTYPE\n 70\n6\n  9\n$SURFU\n 70\n6\n  9\n$SURFV\n 70\n6\n  9\n$UCSBASE\n  2\n\n  9\n$UCSNAME\n  2\n\n  9\n$UCSORG\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSXDIR\n 10\n1.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSYDIR\n 10\n0.0\n 20\n1.0\n 30\n0.0\n  9\n$UCSORTHOREF\n  2\n\n  9\n$UCSORTHOVIEW\n 70\n0\n  9\n$UCSORGTOP\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSORGBOTTOM\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSORGLEFT\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSORGRIGHT\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSORGFRONT\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$UCSORGBACK\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSBASE\n  2\n\n  9\n$PUCSNAME\n  2\n\n  9\n$PUCSORG\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSXDIR\n 10\n1.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSYDIR\n 10\n0.0\n 20\n1.0\n 30\n0.0\n  9\n$PUCSORTHOREF\n  2\n\n  9\n$PUCSORTHOVIEW\n 70\n0\n  9\n$PUCSORGTOP\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSORGBOTTOM\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSORGLEFT\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSORGRIGHT\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSORGFRONT\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PUCSORGBACK\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$USERI1\n 70\n0\n  9\n$USERI2\n 70\n0\n  9\n$USERI3\n 70\n0\n  9\n$USERI4\n 70\n0\n  9\n$USERI5\n 70\n0\n  9\n$USERR1\n 40\n0.0\n  9\n$USERR2\n 40\n0.0\n  9\n$USERR3\n 40\n0.0\n  9\n$USERR4\n 40\n0.0\n  9\n$USERR5\n 40\n0.0\n  9\n$WORLDVIEW\n 70\n1\n  9\n$SHADEDGE\n 70\n3\n  9\n$SHADEDIF\n 70\n70\n  9\n$TILEMODE\n 70\n1\n  9\n$MAXACTVP\n 70\n64\n  9\n$PINSBASE\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  9\n$PLIMCHECK\n 70\n0\n  9\n$PEXTMIN\n 10\n1e+20\n 20\n1e+20\n 30\n1e+20\n  9\n$PEXTMAX\n 10\n-1e+20\n 20\n-1e+20\n 30\n-1e+20\n  9\n$PLIMMIN\n 10\n0.0\n 20\n0.0\n  9\n$PLIMMAX\n 10\n420.0\n 20\n297.0\n  9\n$UNITMODE\n 70\n0\n  9\n$VISRETAIN\n 70\n1\n  9\n$PLINEGEN\n 70\n0\n  9\n$PSLTSCALE\n 70\n1\n  9\n$TREEDEPTH\n 70\n3020\n  9\n$CMLSTYLE\n  2\nStandard\n  9\n$CMLJUST\n 70\n0\n  9\n$CMLSCALE\n 40\n20.0\n  9\n$PROXYGRAPHICS\n 70\n1\n  9\n$MEASUREMENT\n 70\n1\n  9\n$CELWEIGHT\n370\n-1\n  9\n$ENDCAPS\n280\n0\n  9\n$JOINSTYLE\n280\n0\n  9\n$LWDISPLAY\n290\n0\n  9\n$INSUNITS\n 70\n4\n  9\n$HYPERLINKBASE\n  1\n\n  9\n$STYLESHEET\n  1\n\n  9\n$XEDIT\n290\n1\n  9\n$CEPSNTYPE\n380\n0\n  9\n$PSTYLEMODE\n290\n1\n  9\n$FINGERPRINTGUID\n  2\n{E0AD323E-1C60-4329-980F-F07B7ECF22A6}\n  9\n$VERSIONGUID\n  2\n{A7B982BA-6CF9-40AB-AF7B-522A52A9C217}\n  9\n$EXTNAMES\n290\n1\n  9\n$PSVPSCALE\n 40\n0.0\n  9\n$OLESTARTUP\n290\n0\n  0\nENDSEC\n  0\nSECTION\n  2\nCLASSES\n  0\nCLASS\n  1\nACDBDICTIONARYWDFLT\n  2\nAcDbDictionaryWithDefault\n  3\nObjectDBX Classes\n 90\n0\n280\n0\n281\n0\n  0\nCLASS\n  1\nSUN\n  2\nAcDbSun\n  3\nSCENEOE\n 90\n1153\n280\n0\n281\n0\n  0\nCLASS\n  1\nVISUALSTYLE\n  2\nAcDbVisualStyle\n  3\nObjectDBX Classes\n 90\n4095\n280\n0\n281\n0\n  0\nCLASS\n  1\nMATERIAL\n  2\nAcDbMaterial\n  3\nObjectDBX Classes\n 90\n1153\n280\n0\n281\n0\n  0\nCLASS\n  1\nSCALE\n  2\nAcDbScale\n  3\nObjectDBX Classes\n 90\n1153\n280\n0\n281\n0\n  0\nCLASS\n  1\nTABLESTYLE\n  2\nAcDbTableStyle\n  3\nObjectDBX Classes\n 90\n4095\n280\n0\n281\n0\n  0\nCLASS\n  1\nMLEADERSTYLE\n  2\nAcDbMLeaderStyle\n  3\nACDB_MLEADERSTYLE_CLASS\n 90\n4095\n280\n0\n281\n0\n  0\nCLASS\n  1\nDICTIONARYVAR\n  2\nAcDbDictionaryVar\n  3\nObjectDBX Classes\n 90\n0\n280\n0\n281\n0\n  0\nCLASS\n  1\nCELLSTYLEMAP\n  2\nAcDbCellStyleMap\n  3\nObjectDBX Classes\n 90\n1152\n280\n0\n281\n0\n  0\nCLASS\n  1\nMENTALRAYRENDERSETTINGS\n  2\nAcDbMentalRayRenderSettings\n  3\nSCENEOE\n 90\n1024\n280\n0\n281\n0\n  0\nCLASS\n  1\nACDBDETAILVIEWSTYLE\n  2\nAcDbDetailViewStyle\n  3\nObjectDBX Classes\n 90\n1025\n280\n0\n281\n0\n  0\nCLASS\n  1\nACDBSECTIONVIEWSTYLE\n  2\nAcDbSectionViewStyle\n  3\nObjectDBX Classes\n 90\n1025\n280\n0\n281\n0\n  0\nCLASS\n  1\nRASTERVARIABLES\n  2\nAcDbRasterVariables\n  3\nISM\n 90\n0\n280\n0\n281\n0\n  0\nCLASS\n  1\nACDBPLACEHOLDER\n  2\nAcDbPlaceHolder\n  3\nObjectDBX Classes\n 90\n0\n280\n0\n281\n0\n  0\nCLASS\n  1\nLAYOUT\n  2\nAcDbLayout\n  3\nObjectDBX Classes\n 90\n0\n280\n0\n281\n0\n  0\nENDSEC\n  0\nSECTION\n  2\nTABLES\n  0\nTABLE\n  2\nVPORT\n  5\n8\n330\n0\n100\nAcDbSymbolTable\n 70\n1\n  0\nVPORT\n  5\n23\n330\n8\n100\nAcDbSymbolTableRecord\n100\nAcDbViewportTableRecord\n  2\n*Active\n 70\n0\n 10\n0.0\n 20\n0.0\n 11\n1.0\n 21\n1.0\n 12\n0.0\n 22\n0.0\n 13\n0.0\n 23\n0.0\n 14\n0.5\n 24\n0.5\n 15\n0.5\n 25\n0.5\n 16\n0.0\n 26\n0.0\n 36\n1.0\n 17\n0.0\n 27\n0.0\n 37\n0.0\n 40\n1000.0\n 41\n1.34\n 42\n50.0\n 43\n0.0\n 44\n0.0\n 50\n0.0\n 51\n0.0\n 71\n0\n 72\n1000\n 73\n1\n 74\n3\n 75\n0\n 76\n0\n 77\n0\n 78\n0\n281\n0\n 65\n0\n146\n0.0\n  0\nENDTAB\n  0\nTABLE\n  2\nLTYPE\n  5\n2\n330\n0\n100\nAcDbSymbolTable\n 70\n3\n  0\nLTYPE\n  5\n24\n330\n2\n100\nAcDbSymbolTableRecord\n100\nAcDbLinetypeTableRecord\n  2\nByBlock\n 70\n0\n  3\n\n 72\n65\n 73\n0\n 40\n0.0\n  0\nLTYPE\n  5\n25\n330\n2\n100\nAcDbSymbolTableRecord\n100\nAcDbLinetypeTableRecord\n  2\nByLayer\n 70\n0\n  3\n\n 72\n65\n 73\n0\n 40\n0.0\n  0\nLTYPE\n  5\n26\n330\n2\n100\nAcDbSymbolTableRecord\n100\nAcDbLinetypeTableRecord\n  2\nContinuous\n 70\n0\n  3\n\n 72\n65\n 73\n0\n 40\n0.0\n  0\nENDTAB\n  0\nTABLE\n  2\nLAYER\n  5\n1\n330\n0\n100\nAcDbSymbolTable\n 70\n4\n  0\nLAYER\n  5\n27\n330\n1\n100\nAcDbSymbolTableRecord\n100\nAcDbLayerTableRecord\n  2\n0\n 70\n0\n 62\n7\n  6\nContinuous\n370\n-3\n390\n13\n  0\nLAYER\n  5\n28\n330\n1\n100\nAcDbSymbolTableRecord\n100\nAcDbLayerTableRecord\n  2\nDefpoints\n 70\n0\n 62\n7\n  6\nContinuous\n290\n0\n370\n-3\n390\n13\n  0\nLAYER\n  5\n2F\n330\n1\n100\nAcDbSymbolTableRecord\n100\nAcDbLayerTableRecord\n  2\nCUT_OUTER\n 70\n0\n 62\n1\n  6\nContinuous\n370\n-3\n390\n13\n  0\nLAYER\n  5\n30\n330\n1\n100\nAcDbSymbolTableRecord\n100\nAcDbLayerTableRecord\n  2\nCUT_THRU\n 70\n0\n 62\n3\n  6\nContinuous\n370\n-3\n390\n13\n  0\nENDTAB\n  0\nTABLE\n  2\nSTYLE\n  5\n5\n330\n0\n100\nAcDbSymbolTable\n 70\n1\n  0\nSTYLE\n  5\n29\n330\n5\n100\nAcDbSymbolTableRecord\n100\nAcDbTextStyleTableRecord\n  2\nStandard\n 70\n0\n 40\n0.0\n 41\n1.0\n 50\n0.0\n 71\n0\n 42\n2.5\n  3\ntxt\n  4\n\n  0\nENDTAB\n  0\nTABLE\n  2\nVIEW\n  5\n7\n330\n0\n100\nAcDbSymbolTable\n 70\n0\n  0\nENDTAB\n  0\nTABLE\n  2\nUCS\n  5\n6\n330\n0\n100\nAcDbSymbolTable\n 70\n0\n  0\nENDTAB\n  0\nTABLE\n  2\nAPPID\n  5\n3\n330\n0\n100\nAcDbSymbolTable\n 70\n3\n  0\nAPPID\n  5\n2A\n330\n3\n100\nAcDbSymbolTableRecord\n100\nAcDbRegAppTableRecord\n  2\nACAD\n 70\n0\n  0\nAPPID\n  5\n31\n330\n3\n100\nAcDbSymbolTableRecord\n100\nAcDbRegAppTableRecord\n  2\nHATCHBACKGROUNDCOLOR\n 70\n0\n  0\nAPPID\n  5\n32\n330\n3\n100\nAcDbSymbolTableRecord\n100\nAcDbRegAppTableRecord\n  2\nEZDXF\n 70\n0\n  0\nENDTAB\n  0\nTABLE\n  2\nDIMSTYLE\n  5\n4\n330\n0\n100\nAcDbSymbolTable\n 70\n1\n100\nAcDbDimStyleTable\n  0\nDIMSTYLE\n105\n2B\n330\n4\n100\nAcDbSymbolTableRecord\n100\nAcDbDimStyleTableRecord\n  2\nStandard\n 70\n0\n  3\n\n  4\n\n 40\n1.0\n 41\n2.5\n 42\n0.625\n 43\n3.75\n 44\n1.25\n 45\n0.0\n 46\n0.0\n 47\n0.0\n 48\n0.0\n140\n2.5\n141\n2.5\n142\n0.0\n143\n0.03937007874\n144\n1.0\n145\n0.0\n146\n1.0\n147\n0.625\n148\n0.0\n 71\n0\n 72\n0\n 73\n0\n 74\n0\n 75\n0\n 76\n0\n 77\n1\n 78\n8\n 79\n3\n170\n0\n171\n3\n172\n1\n173\n0\n174\n0\n175\n0\n176\n0\n177\n0\n178\n0\n179\n2\n271\n2\n272\n2\n273\n2\n274\n3\n275\n0\n276\n0\n277\n2\n278\n44\n279\n0\n280\n0\n281\n0\n282\n0\n283\n0\n284\n8\n285\n0\n286\n0\n288\n0\n289\n3\n371\n-2\n372\n-2\n  0\nENDTAB\n  0\nTABLE\n  2\nBLOCK_RECORD\n  5\n9\n330\n0\n100\nAcDbSymbolTable\n 70\n2\n  0\nBLOCK_RECORD\n  5\n17\n330\n9\n100\nAcDbSymbolTableRecord\n100\nAcDbBlockTableRecord\n  2\n*Model_Space\n340\n1A\n  0\nBLOCK_RECORD\n  5\n1B\n330\n9\n100\nAcDbSymbolTableRecord\n100\nAcDbBlockTableRecord\n  2\n*Paper_Space\n340\n1E\n  0\nENDTAB\n  0\nENDSEC\n  0\nSECTION\n  2\nBLOCKS\n  0\nBLOCK\n  5\n18\n330\n17\n100\nAcDbEntity\n  8\n0\n100\nAcDbBlockBegin\n  2\n*Model_Space\n 70\n0\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  3\n*Model_Space\n  1\n\n  0\nENDBLK\n  5\n19\n330\n17\n100\nAcDbEntity\n  8\n0\n100\nAcDbBlockEnd\n  0\nBLOCK\n  5\n1C\n330\n1B\n100\nAcDbEntity\n  8\n0\n100\nAcDbBlockBegin\n  2\n*Paper_Space\n 70\n0\n 10\n0.0\n 20\n0.0\n 30\n0.0\n  3\n*Paper_Space\n  1\n\n  0\nENDBLK\n  5\n1D\n330\n1B\n100\nAcDbEntity\n  8\n0\n100\nAcDbBlockEnd\n  0\nENDSEC\n  0\nSECTION\n  2\nENTITIES\n  0\nENDSEC\n  0\nSECTION\n  2\nOBJECTS\n  0\nDICTIONARY\n  5\nA\n330\n0\n100\nAcDbDictionary\n281\n1\n  3\nACAD_COLOR\n350\nB\n  3\nACAD_GROUP\n350\nC\n  3\nACAD_LAYOUT\n350\nD\n  3\nACAD_MATERIAL\n350\nE\n  3\nACAD_MLEADERSTYLE\n350\nF\n  3\nACAD_MLINESTYLE\n350\n10\n  3\nACAD_PLOTSETTINGS\n350\n11\n  3\nACAD_PLOTSTYLENAME\n350\n12\n  3\nACAD_SCALELIST\n350\n14\n  3\nACAD_TABLESTYLE\n350\n15\n  3\nACAD_VISUALSTYLE\n350\n16\n  3\nEZDXF_META\n350\n2D\n  0\nDICTIONARY\n  5\nB\n330\nA\n100\nAcDbDictionary\n281\n1\n  0\nDICTIONARY\n  5\nC\n330\nA\n100\nAcDbDictionary\n281\n1\n  0\nDICTIONARY\n  5\nD\n330\nA\n100\nAcDbDictionary\n281\n1\n  3\nModel\n350\n1A\n  3\nLayout1\n350\n1E\n  0\nDICTIONARY\n  5\nE\n330\nA\n100\nAcDbDictionary\n281\n1\n  3\nByBlock\n350\n1F\n  3\nByLayer\n350\n20\n  3\nGlobal\n350\n21\n  0\nDICTIONARY\n  5\nF\n330\nA\n100\nAcDbDictionary\n281\n1\n  3\nStandard\n350\n2C\n  0\nDICTIONARY\n  5\n10\n330\nA\n100\nAcDbDictionary\n281\n1\n  3\nStandard\n350\n22\n  0\nDICTIONARY\n  5\n11\n330\nA\n100\nAcDbDictionary\n281\n1\n  0\nACDBDICTIONARYWDFLT\n  5\n12\n330\nA\n100\nAcDbDictionary\n281\n1\n  3\nNormal\n350\n13\n100\nAcDbDictionaryWithDefault\n340\n13\n  0\nACDBPLACEHOLDER\n  5\n13\n330\n12\n  0\nDICTIONARY\n  5\n14\n330\nA\n100\nAcDbDictionary\n281\n1\n  0\nDICTIONARY\n  5\n15\n330\nA\n100\nAcDbDictionary\n281\n1\n  0\nDICTIONARY\n  5\n16\n330\nA\n100\nAcDbDictionary\n281\n1\n  0\nLAYOUT\n  5\n1A\n330\nD\n100\nAcDbPlotSettings\n  1\n\n  4\nA3\n  6\n\n 40\n7.5\n 41\n20.0\n 42\n7.5\n 43\n20.0\n 44\n420.0\n 45\n297.0\n 46\n0.0\n 47\n0.0\n 48\n0.0\n 49\n0.0\n140\n0.0\n141\n0.0\n142\n1.0\n143\n1.0\n 70\n1024\n 72\n1\n 73\n0\n 74\n5\n  7\n\n 75\n16\n 76\n0\n 77\n2\n 78\n300\n147\n1.0\n148\n0.0\n149\n0.0\n100\nAcDbLayout\n  1\nModel\n 70\n1\n 71\n0\n 10\n0.0\n 20\n0.0\n 11\n420.0\n 21\n297.0\n 12\n0.0\n 22\n0.0\n 32\n0.0\n 14\n1e+20\n 24\n1e+20\n 34\n1e+20\n 15\n-1e+20\n 25\n-1e+20\n 35\n-1e+20\n146\n0.0\n 13\n0.0\n 23\n0.0\n 33\n0.0\n 16\n1.0\n 26\n0.0\n 36\n0.0\n 17\n0.0\n 27\n1.0\n 37\n0.0\n 76\n1\n330\n17\n  0\nLAYOUT\n  5\n1E\n330\nD\n100\nAcDbPlotSettings\n  1\n\n  4\nA3\n  6\n\n 40\n7.5\n 41\n20.0\n 42\n7.5\n 43\n20.0\n 44\n420.0\n 45\n297.0\n 46\n0.0\n 47\n0.0\n 48\n0.0\n 49\n0.0\n140\n0.0\n141\n0.0\n142\n1.0\n143\n1.0\n 70\n0\n 72\n1\n 73\n0\n 74\n5\n  7\n\n 75\n16\n 76\n0\n 77\n2\n 78\n300\n147\n1.0\n148\n0.0\n149\n0.0\n100\nAcDbLayout\n  1\nLayout1\n 70\n1\n 71\n1\n 10\n0.0\n 20\n0.0\n 11\n420.0\n 21\n297.0\n 12\n0.0\n 22\n0.0\n 32\n0.0\n 14\n1e+20\n 24\n1e+20\n 34\n1e+20\n 15\n-1e+20\n 25\n-1e+20\n 35\n-1e+20\n146\n0.0\n 13\n0.0\n 23\n0.0\n 33\n0.0\n 16\n1.0\n 26\n0.0\n 36\n0.0\n 17\n0.0\n 27\n1.0\n 37\n0.0\n 76\n1\n330\n1B\n  0\nMATERIAL\n  5\n1F\n102\n{ACAD_REACTORS\n330\nE\n102\n}\n330\nE\n100\nAcDbMaterial\n  1\nByBlock\n  2\n\n 70\n0\n 40\n1.0\n 71\n1\n 41\n1.0\n 91\n-1023410177\n 42\n1.0\n 72\n1\n  3\n\n 73\n1\n 74\n1\n 75\n1\n 44\n0.5\n 73\n0\n 45\n1.0\n 46\n1.0\n 77\n1\n  4\n\n 78\n1\n 79\n1\n170\n1\n 48\n1.0\n171\n1\n  6\n\n172\n1\n173\n1\n174\n1\n140\n1.0\n141\n1.0\n175\n1\n  7\n\n176\n1\n177\n1\n178\n1\n143\n1.0\n179\n1\n  8\n\n270\n1\n271\n1\n272\n1\n145\n1.0\n146\n1.0\n273\n1\n  9\n\n274\n1\n275\n1\n276\n1\n 42\n1.0\n 72\n1\n  3\n\n 73\n1\n 74\n1\n 75\n1\n 94\n63\n  0\nMATERIAL\n  5\n20\n102\n{ACAD_REACTORS\n330\nE\n102\n}\n330\nE\n100\nAcDbMaterial\n  1\nByLayer\n  2\n\n 70\n0\n 40\n1.0\n 71\n1\n 41\n1.0\n 91\n-1023410177\n 42\n1.0\n 72\n1\n  3\n\n 73\n1\n 74\n1\n 75\n1\n 44\n0.5\n 73\n0\n 45\n1.0\n 46\n1.0\n 77\n1\n  4\n\n 78\n1\n 79\n1\n170\n1\n 48\n1.0\n171\n1\n  6\n\n172\n1\n173\n1\n174\n1\n140\n1.0\n141\n1.0\n175\n1\n  7\n\n176\n1\n177\n1\n178\n1\n143\n1.0\n179\n1\n  8\n\n270\n1\n271\n1\n272\n1\n145\n1.0\n146\n1.0\n273\n1\n  9\n\n274\n1\n275\n1\n276\n1\n 42\n1.0\n 72\n1\n  3\n\n 73\n1\n 74\n1\n 75\n1\n 94\n63\n  0\nMATERIAL\n  5\n21\n102\n{ACAD_REACTORS\n330\nE\n102\n}\n330\nE\n100\nAcDbMaterial\n  1\nGlobal\n  2\n\n 70\n0\n 40\n1.0\n 71\n1\n 41\n1.0\n 91\n-1023410177\n 42\n1.0\n 72\n1\n  3\n\n 73\n1\n 74\n1\n 75\n1\n 44\n0.5\n 73\n0\n 45\n1.0\n 46\n1.0\n 77\n1\n  4\n\n 78\n1\n 79\n1\n170\n1\n 48\n1.0\n171\n1\n  6\n\n172\n1\n173\n1\n174\n1\n140\n1.0\n141\n1.0\n175\n1\n  7\n\n176\n1\n177\n1\n178\n1\n143\n1.0\n179\n1\n  8\n\n270\n1\n271\n1\n272\n1\n145\n1.0\n146\n1.0\n273\n1\n  9\n\n274\n1\n275\n1\n276\n1\n 42\n1.0\n 72\n1\n  3\n\n 73\n1\n 74\n1\n 75\n1\n 94\n63\n  0\nMLINESTYLE\n  5\n22\n102\n{ACAD_REACTORS\n330\n10\n102\n}\n330\n10\n100\nAcDbMlineStyle\n  2\nStandard\n 70\n0\n  3\n\n 62\n256\n 51\n90.0\n 52\n90.0\n 71\n2\n 49\n0.5\n 62\n256\n  6\nBYLAYER\n 49\n-0.5\n 62\n256\n  6\nBYLAYER\n  0\nMLEADERSTYLE\n  5\n2C\n102\n{ACAD_REACTORS\n330\nF\n102\n}\n330\nF\n100\nAcDbMLeaderStyle\n179\n2\n170\n2\n171\n1\n172\n0\n 90\n2\n 40\n0.0\n 41\n0.0\n173\n1\n 91\n-1056964608\n 92\n-2\n290\n1\n 42\n2.0\n291\n1\n 43\n8.0\n  3\nStandard\n 44\n4.0\n300\n\n342\n29\n174\n1\n175\n1\n176\n0\n178\n1\n 93\n-1056964608\n 45\n4.0\n292\n0\n297\n0\n 46\n4.0\n 94\n-1056964608\n 47\n1.0\n 49\n1.0\n140\n1.0\n294\n1\n141\n0.0\n177\n0\n142\n1.0\n295\n0\n296\n0\n143\n3.75\n271\n0\n272\n9\n273\n9\n  0\nDICTIONARY\n  5\n2D\n330\nA\n100\nAcDbDictionary\n280\n1\n281\n1\n  3\nCREATED_BY_EZDXF\n350\n2E\n  3\nWRITTEN_BY_EZDXF\n350\n33\n  0\nDICTIONARYVAR\n  5\n2E\n330\n2D\n100\nDictionaryVariables\n280\n0\n  1\n1.4.5 @ 2026-11-26T06:35:44.303990+00:00\n  0\nDICTIONARYVAR\n  5\n33\n330\n2D\n100\nDictionaryVariables\n280\n0\n  1\n1.4.5 @ 2026-11-26T06:35:44.304491+00:00\n  0\nENDSEC\n  0\nEOF\n";
const pointsPerMillimeter = 72 / 25.4;
const cardWidth = 100;
const cardHeight = 58.5;
const hangingHole = {x: 50.4, y: 53.32, radius: 2.35};

function productionContours() {
  const toMillimeters = contour => contour.map(({x,y}) => [x + cardWidth/2, y + cardHeight/2]);
  return {outline: toMillimeters(G), lettering: J.slice(1).map(toMillimeters)};
}

function cutDxf({outline, lettering}) {
  const records = [];
  const group = (code, value) => records.push(String(code), String(value));
  const coordinate = value => Number(value.toFixed(5));
  let handle = 0x100;
  function entity(type, layer, subclass) {
    group(0, type);
    group(5, (handle++).toString(16).toUpperCase());
    group(330, "17");
    group(100, "AcDbEntity");
    group(8, layer);
    group(100, subclass);
  }
  function polyline(points, layer) {
    entity("LWPOLYLINE", layer, "AcDbPolyline");
    group(90, points.length);
    group(70, 1);
    for (const [x,y] of points) {
      group(10, coordinate(x));
      group(20, coordinate(y));
    }
  }
  polyline(outline, "CUT_OUTER");
  for (const contour of lettering) polyline(contour, "CUT_THRU");
  entity("CIRCLE", "CUT_THRU", "AcDbCircle");
  group(10, hangingHole.x);
  group(20, hangingHole.y);
  group(30, 0);
  group(40, hangingHole.radius);
  return dxfTemplate.replace("ENTITIES\n  0\nENDSEC", "ENTITIES\n" + records.join("\n") + "\n  0\nENDSEC");
}

function pdfCutPath({outline, lettering}, holesOnly=false) {
  const pt = value => (value * pointsPerMillimeter).toFixed(6);
  const polygons = (holesOnly ? lettering : [outline,...lettering]).map(points => points.map(([x,y],i) =>
    pt(x) + " " + pt(y) + (i ? " l" : " m")).join("\n") + "\nh");
  const {x,y,radius:r} = hangingHole;
  const k = r * 0.552284749831;
  const curve = (...args) => args.map(pt).join(" ") + " c";
  polygons.push([
    pt(x+r) + " " + pt(y) + " m",
    curve(x+r,y+k,x+k,y+r,x,y+r),
    curve(x-k,y+r,x-r,y+k,x-r,y),
    curve(x-r,y-k,x-k,y-r,x,y-r),
    curve(x+k,y-r,x+r,y-k,x+r,y), "h"
  ].join("\n"));
  return polygons.join("\n");
}

async function printPdf(png, contours, serial) {
  const { PDFDocument, PDFName } = PDFLib;
  const document = await PDFDocument.create();
  document.setTitle(serial + " | Color artwork and white ink");
  const width = cardWidth * pointsPerMillimeter;
  const height = cardHeight * pointsPerMillimeter;
  const page = document.addPage([width,height]);
  page.setTrimBox(0,0,width,height);
  const image = await document.embedPng(png);
  const context = document.context;
  const name = value => PDFName.of(value);
  const whiteTint = context.register(context.obj({
    FunctionType:2, Domain:[0,1], C0:[0,0,0,0], C1:[0,0,0,0], N:1
  }));
  page.node.set(name("Resources"), context.obj({
    XObject: { Artwork: image.ref },
    ColorSpace: { WhiteInk: [name("Separation"),name("White"),name("DeviceCMYK"),whiteTint] },
    ExtGState: { WhiteOverprint: { OP:true, op:true, OPM:1 } }
  }));
  const paths = pdfCutPath(contours);
  const content = [
    "q", "/WhiteOverprint gs", "/WhiteInk cs", "1 scn",
    paths, "f*", "Q",
    "q", paths, "W* n", width + " 0 0 " + height + " 0 0 cm", "/Artwork Do", "Q"
  ].join("\n");
  page.node.addContentStream(context.register(context.flateStream(content)));
  return document.save();
}

function canvasPng(canvas) {
  return new Promise((resolve,reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob.arrayBuffer());
      else reject(new Error("Unable to encode manufacturing artwork."));
    },"image/png");
  });
}

async function engineeringPdf(artworkPng, contours, serial, finishColor) {
  const {PDFDocument, PDFName} = PDFLib;
  const doc = await PDFDocument.create();
  doc.setTitle(serial + " | Graduation keepsake engineering drawing");
  const pt = pointsPerMillimeter;
  const image = await doc.embedPng(artworkPng);
  const context = doc.context;
  const name = PDFName.of;
  const pixelScale = 9;
  let sheet,page,legends,text,ops;

  function openSheet(width,height,hasArt=false) {
    sheet={width,height};
    page=doc.addPage([width*pt,height*pt]);
    page.node.set(name("Resources"),context.obj({
      XObject:hasArt?{Artwork:image.ref}:{},
      ExtGState:{AcrylicWash:{CA:1,ca:.30}}
    }));
    legends=document.createElement("canvas");
    legends.width=width*pixelScale;
    legends.height=height*pixelScale;
    text=legends.getContext("2d");
    text.scale(pixelScale,pixelScale);
    text.textBaseline="middle";
    ops=["1 J","1 j"];
  }

  async function closeSheet() {
    const labels=await doc.embedPng(await canvasPng(legends));
    const resources=page.node.get(name("Resources"));
    resources.get(name("XObject")).set(name("Labels"),labels.ref);
    ops.push("q",num(sheet.width*pt)+" 0 0 "+num(sheet.height*pt)+" 0 0 cm","/Labels Do","Q");
    page.node.addContentStream(context.register(context.flateStream(ops.join("\n"))));
  }

  openSheet(420,297,true);
  const ink = "#21343e";
  const muted = "#4d6774";
  const rule = [0.32,0.43,0.49];
  const objectLine = [0.12,0.21,0.26];
  const guide = [0.46,0.57,0.63];
  const light = [0.92,0.95,0.96];
  const num = value => Number(value.toFixed(5));
  const point = (x,y)=> num(x*pt)+" "+num((sheet.height-y)*pt);
  const color = (rgb, suffix)=>rgb.join(" ")+" "+suffix;
  function label(value,x,y,size=3.2,options={}) {
    text.save();
    text.translate(x,y);
    if (options.angle) text.rotate(options.angle*Math.PI/180);
    text.font = (options.bold ? "700 " : "400 ") + size + 'px "Microsoft YaHei","PingFang SC",sans-serif';
    text.textAlign = options.align || "left";
    text.fillStyle = options.fill || ink;
    text.fillText(value,0,0);
    text.restore();
  }
  function polyline(points,{close=false, stroke=objectLine, width=.25, fill=null, dashed=false}={}) {
    ops.push("q");
    if (stroke) ops.push(color(stroke,"RG"),num(width*pt)+" w");
    if (fill) ops.push(color(fill,"rg"));
    if (dashed) ops.push("[7 2 1 2] 0 d");
    for (const [i,[x,y]] of points.entries()) ops.push(point(x,y)+(i ? " l" : " m"));
    if (close) ops.push("h");
    ops.push(fill ? (stroke ? "B" : "f") : "S","Q");
  }
  const line = (a,b,stroke=rule,width=.17) => polyline([a,b],{stroke,width});
  function box(x,y,w,h,stroke=rule,width=.2,fill=null) {
    polyline([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],{close:true,stroke,width,fill});
  }
  function arrow(tip,direction,size=1.7) {
    const [x,y] = tip;
    const length=Math.hypot(...direction);
    const dx=direction[0]/length,dy=direction[1]/length;
    const bx=x-dx*size,by=y-dy*size;
    polyline([[x,y],[bx-dy*.55,by+dx*.55],[bx+dy*.55,by-dx*.55]],
      {close:true,stroke:null,fill:rule});
  }
  function horizontalDimension(left,right,y,fromLeft,fromRight,value,small=false) {
    line([left,fromLeft],[left,y-1.5]);
    line([right,fromRight],[right,y-1.5]);
    if (small) {
      line([left-5,y],[right+5,y]);
      arrow([left,y],[1,0]);
      arrow([right,y],[-1,0]);
    } else {
      line([left,y],[right,y]);
      arrow([left,y],[-1,0]);
      arrow([right,y],[1,0]);
    }
    label(value,(left+right)/2,y-2.8,3.4,{align:"center"});
  }
  function verticalDimension(x,top,bottom,fromTop,fromBottom,value) {
    line([fromTop,top],[x-1.5,top]);
    line([fromBottom,bottom],[x-1.5,bottom]);
    line([x,top],[x,bottom]);
    arrow([x,top],[0,-1]);
    arrow([x,bottom],[0,1]);
    label(value,x-3.4,(top+bottom)/2,3.4,{angle:-90,align:"center"});
  }
  function leader(target,knee,end) {
    polyline([target,knee,end],{stroke:rule,width:.19});
    arrow(target,[target[0]-knee[0],target[1]-knee[1]],1.7);
  }
  function circle(x,y,r,stroke=objectLine,width=.22,fill=null) {
    const k=.552284749831*r;
    const c = (...coords) => point(coords[0],coords[1])+" "+point(coords[2],coords[3])+" "+point(coords[4],coords[5])+" c";
    ops.push("q",color(stroke,"RG"),num(width*pt)+" w");
    if(fill)ops.push(color(fill,"rg"));
    ops.push(point(x+r,y)+" m",c(x+r,y+k,x+k,y+r,x,y+r),
      c(x-k,y+r,x-r,y+k,x-r,y),c(x-r,y-k,x-k,y-r,x,y-r),
      c(x+k,y-r,x+r,y-k,x+r,y),fill?"B":"S","Q");
  }
  const path = pdfCutPath(contours);
  const greenHoles = pdfCutPath(contours,true);
  const holeFill = "0.42 0.81 0.45 rg";

  box(8,8,404,281,objectLine,.40);
  line([8,28],[412,28],objectLine,.35);
  label("毕业留念纪念品",15,18.1,7.4,{bold:true});
  label("加工图",80,18.6,4.2);
  label(serial+"-A01",404,18.1,4,{align:"right",bold:true});
  line([272,28],[272,248],rule,.23);

  // Front view, front face toward the observer.
  const fx=34,fy=59,viewScale=2;
  const rx=fx+cardWidth*viewScale;
  const bottom=fy+cardHeight*viewScale;
  ops.push("q","2 0 0 2 "+num(fx*pt)+" "+num((sheet.height-bottom)*pt)+" cm",
    holeFill,greenHoles,"f*",color(objectLine,"RG"),num(.30*pt/viewScale)+" w",path,"S","Q");
  const hx=fx+hangingHole.x*viewScale;
  const hy=fy+(cardHeight-hangingHole.y)*viewScale;
  polyline([[hx-8,hy],[hx+8,hy]],{stroke:guide,width:.14,dashed:true});
  polyline([[hx,hy-8],[hx,hy+8]],{stroke:guide,width:.14,dashed:true});
  horizontalDimension(fx,rx,35,fy+24,fy+24,"100");
  horizontalDimension(fx,hx,46,fy+17,hy-7,"50.4");
  verticalDimension(19,fy,bottom,fx+57,fx+14,"58.5");
  const offsetX=hx+15;
  line([hx+7,fy],[offsetX+2,fy]);
  line([hx+7,hy],[offsetX+2,hy]);
  line([offsetX,fy-4],[offsetX,hy+4]);
  arrow([offsetX,fy],[0,1],1.35);
  arrow([offsetX,hy],[0,-1],1.35);
  label("5.18",offsetX+2.2,(fy+hy)/2,3.1);
  leader([hx+3.5,hy+3.2],[hx+13,hy+15],[hx+28,hy+15]);
  label("Ø4.7 通孔",hx+29,hy+15,3.2);
  const [letterX,letterY] = contours.lettering.flat().reduce((closest,p) =>
    Math.hypot(p[0]-42,p[1]-43) < Math.hypot(closest[0]-42,closest[1]-43) ? p : closest);
  leader([fx+letterX*viewScale, fy+(cardHeight-letterY)*viewScale],
    [fx+72,fy+25],[fx+44,fy+25]);
  label("校名字孔  贯穿",fx+43,fy+25,3.1,{align:"right"});
  label("正视图  2:1",134,187,3.8,{align:"center",bold:true});
  label("绿色为贯穿孔",134,194,3.1,{align:"center",fill:muted});

  // Right-side orthographic view aligned with the front view.
  const sx=248,thickness=5*viewScale;
  box(sx,fy,thickness,cardHeight*viewScale,objectLine,.30,[.97,.99,.99]);
  line([sx+thickness,fy+17],[sx+thickness,bottom],objectLine,.30);
  horizontalDimension(sx,sx+thickness,46,fy,fy,"5",true);
  label("右视图  2:1",253,187,3.25,{align:"center",bold:true});
  label("右侧为背印面",253,194,2.7,{align:"center",fill:muted});

  line([8,200],[272,200],rule,.23);
  label("加工要求",15,207,3.9,{bold:true});
  label("1  5 mm 透明亚克力，外缘抛光，字孔与挂孔切穿，孔壁轻磨砂。",15,216,3.35);
  label("2  背面彩印后覆白墨，两层均避开孔洞。背印时统一镜像一次。",15,224,3.35);
  label("3  轮廓以 1:1 DXF 为准。打样确认最窄字孔、公差和白墨遮盖度。",15,232,3.35);

  // Exploded diagram. The color and white plates follow exactly the vector cut path.
  label("爆炸图",280,38,4.4,{bold:true});
  label("涂层分开示意  不按比例",280,45.5,3,{fill:muted});
  const x0=284, acrylicY=86, printY=125, whiteY=164;
  const a=.89,b=.18,c=.29,d=.58;
  const project=(x,y,origin)=> [x0+a*x+c*y,origin+b*x-d*y];
  function layerTransform(origin) {
    return [a,-b,c,d,num(x0*pt),num((sheet.height-origin)*pt)].join(" ")+" cm";
  }
  for (const [x,y] of [[20,20],[80,37]]) {
    polyline([project(x,y,acrylicY),project(x,y,whiteY)],
      {stroke:guide,width:.17,dashed:true});
  }
  ops.push("q",layerTransform(whiteY),color([.61,.68,.71],"RG"),num(.30*pt)+" w",
    "1 1 1 rg",path,"B*","Q");
  ops.push("q",layerTransform(printY),path,"W* n",
    [cardWidth*pt,0,0,cardHeight*pt,0,0].map(num).join(" ")+" cm","/Artwork Do","Q");
  ops.push("q",layerTransform(printY),color(objectLine,"RG"),num(.24*pt)+" w",path,"S","Q");
  const projectedTop = contours.outline.map(([x,y])=>project(x,y,acrylicY));
  const projectedBottom = contours.outline.map(([x,y])=>project(x,y,acrylicY+5));
  const silhouette = projectedTop
    .map(([x,y],i)=>({x,y,i}))
    .filter(p=>p.x>298 && p.y>76).sort((a,b)=>b.y-a.y).slice(0,1);
  polyline(projectedBottom,{close:true,stroke:guide,width:.22});
  for (const {i} of silhouette) line(projectedTop[i],projectedBottom[i],guide,.25);
  ops.push("q",layerTransform(acrylicY),color(objectLine,"RG"),num(.30*pt)+" w",
    "/AcrylicWash gs","0.81 0.92 0.95 rg",path,"B*","Q");
  for (const [n,origin] of [[1,acrylicY],[2,printY],[3,whiteY]]) {
    const anchor=project(99.7,11,origin);
    line(anchor,[396.5,anchor[1]],rule,.20);
    circle(400,anchor[1],3,rule,.20,[1,1,1]);
    label(String(n),400,anchor[1],3.2,{align:"center",bold:true});
  }
  line([279,204],[405,204],rule,.23);
  label("1   透明亚克力   5 mm",280,212,3.45,{bold:true});
  label("2   彩印层   贴合亚克力背面",280,222,3.45);
  label("3   白墨层   覆盖彩印背面",280,232,3.45);
  label("印刷 PDF：RGB 彩图 + White 专色版",280,240.5,2.9,{fill:muted});

  // Drawing identification and shop agreement fields.
  box(8,248,404,41,objectLine,.35);
  box(8,248,404,10,null,0,light);
  line([8,258],[412,258],objectLine,.25);
  for (const x of [125,217,299,353]) line([x,248],[x,289],rule,.20);
  label("品名 / 件号",14,253,3.15,{bold:true});
  label("材料 / 颜色",131,253,3.15,{bold:true});
  label("尺寸单位 / 比例",223,253,3.15,{bold:true});
  label("图号 / 版次",305,253,3.15,{bold:true});
  label("图幅 / 张次",359,253,3.15,{bold:true});
  label("毕业留念纪念品",14,266,4.5,{bold:true});
  label(serial,14,280,3.4);
  label("透明 PMMA / 5 mm",131,267,4);
  label(finishColor==="blue"?"蓝色彩印":"黄色彩印",131,280,3.4);
  label("mm / 2:1",223,267,4);
  label("爆炸图不按比例",223,280,3.2);
  label(serial+"-A01",305,267,3.5);
  label("A",305,280,3.4);
  label("A3 / 1 of 2",359,267,3.6);
  label("加工前打样确认",359,280,3.2);

  await closeSheet();

  // This A4 page is a physical-size reference independent of the 2:1 sheet.
  openSheet(297,210);
  box(8,8,281,194,objectLine,.35);
  line([8,28],[289,28],objectLine,.28);
  label("毕业留念纪念品",15,18,6.3,{bold:true});
  label("1:1 实尺寸图",111,18,4.1);
  label(serial+"-A02",282,18,3.5,{align:"right",bold:true});
  const ax=36,ay=68,ar=ax+cardWidth,ab=ay+cardHeight;
  ops.push("q","1 0 0 1 "+num(ax*pt)+" "+num((sheet.height-ab)*pt)+" cm",
    holeFill,greenHoles,"f*",color(objectLine,"RG"),num(.25*pt)+" w",path,"S","Q");
  const holeX=ax+hangingHole.x,holeY=ay+cardHeight-hangingHole.y;
  polyline([[holeX-5,holeY],[holeX+5,holeY]],{stroke:guide,width:.13,dashed:true});
  polyline([[holeX,holeY-5],[holeX,holeY+5]],{stroke:guide,width:.13,dashed:true});
  horizontalDimension(ax,ar,47,ay+14,ay+14,"100");
  verticalDimension(24,ay,ab,ax+28,ax+7,"58.5");
  leader([holeX+1.8,holeY+1.5],[holeX+10,holeY+9],[holeX+23,holeY+9]);
  label("Ø4.7",holeX+24,holeY+9,3.1);
  label("正视图  1:1",(ax+ar)/2,142,3.7,{align:"center",bold:true});
  label("绿色为贯穿孔",(ax+ar)/2,150,3.1,{align:"center",fill:muted});

  const sideX=156;
  box(sideX,ay,5,cardHeight,objectLine,.25);
  horizontalDimension(sideX,sideX+5,47,ay,ay,"5",true);
  label("右视图  1:1",sideX+2.5,142,3.5,{align:"center",bold:true});
  line([181,28],[181,180],rule,.21);
  label("打印核对",191,47,4.2,{bold:true});
  label("选择实际大小 / 100%。",191,61,3.5);
  label("量取下方标尺，应为 50 mm。",191,70,3.5);
  const rulerX=196,rulerY=96;
  line([rulerX,rulerY],[rulerX+50,rulerY],objectLine,.35);
  for (let i=0;i<=50;i+=10) {
    line([rulerX+i,rulerY-2],[rulerX+i,rulerY+2],objectLine,.23);
    label(String(i),rulerX+i,rulerY+6,2.8,{align:"center"});
  }
  label("mm",rulerX+58,rulerY+6,2.8);
  label("孔位和工艺详见第 1 张。",191,124,3.35);
  label("切割轮廓以 1:1 DXF 为准。",191,134,3.35);

  line([8,180],[289,180],objectLine,.27);
  for (const x of [121,205]) line([x,180],[x,202],rule,.21);
  label("透明 PMMA / 5 mm",15,191,3.7,{bold:true});
  label("mm / 1:1",129,191,3.7,{bold:true});
  label("A4 / 2 of 2",214,191,3.6);
  await closeSheet();
  return doc.save();
}

function snapshotPrintArtwork() {
  const output = document.createElement("canvas");
  output.width=4000;
  output.height=2340;
  const oldScale=c;
  try {
    c=40;
    nt.width=output.width;
    nt.height=output.height;
    X();
    output.getContext("2d").drawImage(nt,0,0);
  } finally {
    c=oldScale;
    nt.width=cardWidth*c;
    nt.height=cardHeight*c;
    X();
    Qt.redraw();
  }
  return output;
}

async function disclaimerPdf(serial) {
  const {PDFDocument}=PDFLib;
  const doc=await PDFDocument.create();
  doc.setTitle("Memorial item - Use and allocation of responsibility");
  const p=doc.addPage([210*pointsPerMillimeter,297*pointsPerMillimeter]);
  const canvas=document.createElement("canvas");
  const px=9;
  canvas.width=210*px;
  canvas.height=297*px;
  const ctx=canvas.getContext("2d");
  ctx.scale(px,px);
  ctx.textBaseline="top";
  const ink="#25353c";
  const subtle="#51656e";
  function font(size,weight=400) {
    ctx.font=weight+" "+size+'px "Microsoft YaHei","PingFang SC",sans-serif';
  }
  function write(str,x,y,size,weight=400,fill=ink) {
    font(size,weight);
    ctx.fillStyle=fill;
    ctx.fillText(str,x,y);
  }
  function paragraph(content,x,y,width) {
    font(3.4);
    ctx.fillStyle=ink;
    let row="";
    for (const character of content) {
      if (ctx.measureText(row+character).width>width && row) {
        const tail = /^[，。、；：！？）】》]/.test(character) ? Array.from(row).at(-1) : "";
        ctx.fillText(tail ? row.slice(0,-tail.length) : row,x,y);
        y+=6.0;
        row=tail;
      }
      row+=character;
    }
    if (row) ctx.fillText(row,x,y);
    return y+6.0;
  }
  const sections=[
    ["文件用途",
      "随附程序、图纸、彩稿和导出文件仅供学习参考。本品为毕业留念纪念品，编号、二维码及装饰印记均不具备门禁、通行、停车、身份或资质证明效力。不得将其作为真实凭证提交或使用。"],
    ["禁止改制与转供",
      "未经许可，不得擅自更改版式、编号、二维码或用途标识，不得移除本声明后再发布，也不得擅自委托加工、批量复制、转供或销售。擅改版本不视为经开发者认可。修改者、使用者各自依法负责。"],
    ["禁止伪造与冒用",
      "不得以本品或文件伪造、变造、冒用学校证件、通行凭证或印章。不得使用、复制或仿制学校及其部门的公章、业务专用章或电子印章。牌面恶搞印记仅作装饰。不得以学校或开发者名义宣传、揽客或承诺。"],
    ["第三方行为与责任",
      "对开发者未授权、未参与且未控制的第三方改制、伪造、冒用、生产、销售或违规使用，由实施者依法承担责任。法律允许的范围内，开发者不因提供原始工具或文件而对这些独立行为造成的损失承担赔偿责任。"],
    ["加工、销售与法定责任",
      "自行加工、委托生产或销售的主体，应就自身行为核实素材授权、用途和生产条件，并依法承担相应责任。开发者如实际参与生产、销售或作出承诺，责任按其实际行为、约定和法律确定。本声明不排除消费者依法享有的权利。"]
  ];
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,210,297);
  ctx.fillStyle="#365d66";
  ctx.fillRect(18,20,1.5,21);
  write("用途限制与免责声明",23,21,7.6,700);
  write("毕业留念纪念品   /   "+serial,23,35,3.65,500,subtle);
  ctx.fillStyle="#edf3f4";
  ctx.fillRect(18,51,174,17);
  write("纪念品 · 非通行凭证",23,54.2,4.1,700);
  write("未经授权的改制、伪造及冒用，由实际行为人依法承担责任。",23,61.3,3.3,600);
  let y=77;
  for (const [number,[heading,content]] of sections.entries()) {
    write(String(number+1).padStart(2,"0"),18,y,3.5,700,subtle);
    write(heading,28,y,4.1,700);
    y=paragraph(content,28,y+7.2,164)+4;
  }
  if (y > 265) throw new Error("Disclaimer exceeds the printable area.");
  ctx.fillStyle="#c8d5da";
  ctx.fillRect(18,269,174,.25);
  write("仅供学习参考使用",18,276,3.5,700);
  write("随加工文件附发   /   1 页",142,276,3.15,400,subtle);
  const image=await doc.embedPng(await canvasPng(canvas));
  p.drawImage(image,{x:0,y:0,width:p.getWidth(),height:p.getHeight()});
  return doc.save();
}

async function manufacturingZip(serial, finishColor, artwork) {
  const contours = productionContours();
  const artworkPng = await canvasPng(artwork);
  const [print,proof,disclaimer] = await Promise.all([
    printPdf(artworkPng,contours,serial),
    engineeringPdf(artworkPng,contours,serial,finishColor),
    disclaimerPdf(serial)
  ]);
  const zip = new JSZip();
  zip.file(serial + "_01_切割轮廓.dxf",cutDxf(contours));
  zip.file(serial + "_02_彩印与白墨.pdf",print);
  zip.file(serial + "_03_工艺图纸.pdf",proof);
  zip.file(serial + "_04_免责声明.pdf",disclaimer);
  return zip.generateAsync({type:"uint8array",compression:"DEFLATE"});
}

let exportingManufacturing = false;
manufacturingExport.addEventListener("click", async () => {
  if (exportingManufacturing || manufacturingExport.disabled) return;
  const serial = serialNumber;
  const finishColor = color;
  exportingManufacturing = true;
  manufacturingExport.disabled = true;
  Wt("正在生成加工包…");
  try {
    const artwork = snapshotPrintArtwork();
    const zip = await manufacturingZip(serial,finishColor,artwork);
    const url = URL.createObjectURL(new Blob([zip],{type:"application/zip"}));
    const link = document.createElement("a");
    link.href=url;
    link.download=serial+"_加工包.zip";
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    Wt("加工包已生成。");
  } catch (error) {
    console.error(error);
    Wt("加工包导出失败，请重试。",true);
  } finally {
    exportingManufacturing = false;
    updateSerial();
  }
});
updateSerial();

}zg().catch(i=>{const status=document.getElementById("status");status.hidden=false;status.classList.add("error");status.textContent="预览加载失败，请重新打开页面。";console.error(i)});

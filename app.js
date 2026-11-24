import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { getGlassConfig } from './images.js';

// =========================================================
// 1. NAVEGACIÓN ENTRE SECCIÓN 1 (PORTADA) Y SECCIÓN 2 (3D)
// =========================================================
const homeSection = document.getElementById('home-section');
const labyrinthSection = document.getElementById('labyrinth-section');
const enterUniverseBtn = document.getElementById('enter-universe-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const universeCanvas = document.getElementById('universe-canvas');
const altitudeIndicator = document.getElementById('altitude-indicator');

let isWorldBuilt = false;
let controls = null;

enterUniverseBtn.addEventListener('click', () => {
    homeSection.classList.remove('active');
    labyrinthSection.classList.add('active');

    if (!isWorldBuilt) {
        buildEscalatorUniverse();
        isWorldBuilt = true;
    }

    if (controls) {
        controls.lock();
    }
});

universeCanvas.addEventListener('click', () => {
    if (labyrinthSection.classList.contains('active') && controls && !controls.isLocked) {
        controls.lock();
    }
});

backHomeBtn.addEventListener('click', () => {
    if (controls && controls.isLocked) controls.unlock();
    labyrinthSection.classList.remove('active');
    homeSection.classList.add('active');
});

// =========================================================
// FILTROS: qué capas del mundo se ven
// Cada botón del panel (data-layer) prende o apaga una capa.
// =========================================================
const layerState = {
    tipografia: true,   // imágenes / tipografía de las barandas
    vidrios: true,      // vidrios de las barandas
    escaleras: true,    // estructura, escalones, pasamanos y resplandor
    columnas: true,     // plataformas flotantes y columnas
    suelo: true,        // piso y retícula
    niebla: true        // niebla
};
const PRESETS = {
    todo: { tipografia: true, vidrios: true, escaleras: true, columnas: true, suelo: true, niebla: true },
    'solo-tipografia': { tipografia: true, vidrios: false, escaleras: false, columnas: false, suelo: false, niebla: true }
};
let applyLayers = () => {}; // se completa al construir el mundo

const layerButtons = document.querySelectorAll('#filter-panel [data-layer]');
const presetButtons = document.querySelectorAll('#filter-panel [data-preset]');

function refreshFilterButtons() {
    layerButtons.forEach(btn => {
        const on = layerState[btn.dataset.layer];
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

layerButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        layerState[btn.dataset.layer] = !layerState[btn.dataset.layer];
        refreshFilterButtons();
        applyLayers();
    });
});

presetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Object.assign(layerState, PRESETS[btn.dataset.preset]);
        refreshFilterButtons();
        applyLayers();
    });
});

refreshFilterButtons();

// =========================================================
// 2. CONSTRUCCIÓN DEL UNIVERSO 3D DE ESCALERAS MECÁNICAS
// =========================================================
function buildEscalatorUniverse() {
    const EYE_HEIGHT = 1.75;
    const ANGLE = Math.PI / 6; // Inclinación 30 grados

    // Escena y atmósfera: noche lúgubre con niebla rojiza
    // Lo cercano se ve y lo lejano se va hundiendo de a poco en la bruma.
    const FOG_COLOR = 0x1c0b0e;
    const FOG_DENSITY = 0.032; // más alto = más niebla
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(FOG_COLOR);
    scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY);
    const sceneFog = scene.fog;

    // Registro de capas para los filtros
    const layers = { tipografia: [], vidrios: [], escaleras: [], columnas: [], suelo: [] };
    const typeTextures = []; // { mesh, dark, light }
    function addToLayer(layer, obj) {
        layers[layer].push(obj);
        obj.visible = layerState[layer];
        return obj;
    }
    applyLayers = () => {
        Object.entries(layers).forEach(([layer, objs]) => {
            objs.forEach(o => { o.visible = layerState[layer]; });
        });
        scene.fog = layerState.niebla ? sceneFog : null;
        // Sin vidrio detrás, la tipografía pasa a clara para que se lea sobre lo oscuro
        typeTextures.forEach(t => { t.mesh.material.map = layerState.vidrios ? t.dark : t.light; });
    };

    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, EYE_HEIGHT, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    universeCanvas.appendChild(renderer.domElement);

    // Luz de luna roja, muy tenue
    scene.add(new THREE.HemisphereLight(0x7a3038, 0x1a0c0e, 1.3));

    const sunLight = new THREE.DirectionalLight(0xc0392b, 0.7);
    sunLight.position.set(-40, 80, -90);
    sunLight.target.position.set(0, 0, -45);
    scene.add(sunLight.target);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.radius = 6;
    const d = 75;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Textura radial para halos de luz (faroles y luna)
    function makeGlowTexture(inner, outer) {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, inner);
        grad.addColorStop(0.25, outer);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }


    // Textura de hormigón gastado con manchas de humedad (generada, sin archivos)
    function makeConcreteTexture(repeat) {
        const size = 512;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const g = c.getContext('2d');
        g.fillStyle = '#6b6767';
        g.fillRect(0, 0, size, size);
        const r = mulberryTex(11);
        for (let i = 0; i < 260; i++) {
            const x = r() * size, y = r() * size, rad = 6 + r() * 60;
            const tone = r() < 0.35 ? '70,60,58' : (r() < 0.5 ? '30,26,27' : '120,112,110');
            const grad = g.createRadialGradient(x, y, 0, x, y, rad);
            grad.addColorStop(0, `rgba(${tone},${0.1 + r() * 0.2})`);
            grad.addColorStop(1, `rgba(${tone},0)`);
            g.fillStyle = grad;
            g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        // Chorreados verticales
        for (let i = 0; i < 40; i++) {
            const x = r() * size, w = 2 + r() * 8, h = 40 + r() * 200;
            g.fillStyle = `rgba(20,16,16,${0.08 + r() * 0.14})`;
            g.fillRect(x, r() * size, w, h);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat, repeat);
        return tex;
    }
    function mulberryTex(a) {
        return function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    // Materiales: hormigón oscuro y húmedo, metal negro
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: makeConcreteTexture(1), roughness: 0.9, metalness: 0.0 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x4a4446, roughness: 0.5, metalness: 0.6 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x0e0b0c, roughness: 0.5, metalness: 0.7 });
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x2a2627, roughness: 0.45, metalness: 0.7 });

    // Vidrio de las barandas: caja de luz pálida para que las imágenes
    // se lean bien aunque todo alrededor esté oscuro.
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0xd8c9c6,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Suelo de asfalto mojado con una retícula apenas visible
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x9a8a8c, map: makeConcreteTexture(40), roughness: 0.6, metalness: 0.0 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(addToLayer('suelo', floor));

    const grid = new THREE.GridHelper(300, 120, 0x7a1a1a, 0x2a1416);
    grid.position.y = 0.02;
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    scene.add(addToLayer('suelo', grid));

    // =====================================================
    // LABERINTO DE ESCALERAS
    // Las escaleras se generan encadenadas: cada una sale de una plataforma
    // y termina en otra plataforma flotante, desde donde salen nuevas
    // escaleras en otras direcciones y a otras alturas.
    // El laberinto es siempre el mismo; cambiá MAZE_SEED para generar otro.
    // =====================================================
    const MAZE_SEED = 7;
    const ESCALATOR_COUNT = 50;
    const MAX_HEIGHT = 55;
    const PAD_SIZE = 5;
    const NEONS = [0xff2a2a, 0x8a0f1a, 0xd8d2cc];
    const GLOW_COLORS = [0xff2a2a, 0xb01020, 0xe8ecff];

    const walkablePlatforms = [];
    const escalatorDefs = [];

    function mulberry32(a) {
        return function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const rand = mulberry32(MAZE_SEED);
    const rr = (a, b) => a + rand() * (b - a);
    const angleDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

    // Puntos ocupados por escaleras, plataformas y columnas (para que no se choquen)
    const obstacles = [];

    function isFree(points, ignoreOwner) {
        for (const p of points) {
            if (Math.abs(p.x) > 55 || p.z > 4 || p.z < -100) return false;
            for (const o of obstacles) {
                if (o.owner === ignoreOwner) continue;
                const d = Math.hypot(p.x - o.x, p.z - o.z);
                if (d >= p.r + o.r + 0.4) continue;
                if (o.column ? p.y < o.top + 3.8 : Math.abs(p.y - o.y) < 3.8) return false;
            }
        }
        return true;
    }

    function escalatorPoints(sx, sy, sz, heading, length, width) {
        const fx = -Math.sin(heading), fz = -Math.cos(heading);
        const run = Math.cos(ANGLE) * length;
        const h = Math.sin(ANGLE) * length;
        const pts = [];
        // Los primeros metros quedan sobre la plataforma de salida: no se controlan
        for (let s = 1.4; s <= run + 2.6; s += 1) {
            const t = Math.min(Math.max(s, 0), run) / run;
            pts.push({ x: sx + fx * s, z: sz + fz * s, y: sy + t * h, r: width / 2 + 0.35 });
        }
        return { pts, fx, fz, run, h };
    }

    function padPoints(cx, cy, cz, rot) {
        const pts = [];
        const c = Math.cos(rot), s = Math.sin(rot);
        for (const i of [-1.6, 0, 1.6]) {
            for (const j of [-1.6, 0, 1.6]) {
                pts.push({ x: cx + i * c + j * s, z: cz - i * s + j * c, y: cy, r: 1.0 });
            }
        }
        return pts;
    }

    // Puntos de partida en el suelo (la primera queda justo frente a la entrada)
    const spots = [{ x: 0, y: 0, z: -2, heading: 0, owner: -1, children: 0, maxChildren: 3, used: [], ground: true }];
    for (let i = 0; i < 7; i++) {
        spots.push({ x: rr(-40, 40), y: 0, z: rr(-85, -12), heading: rr(-Math.PI, Math.PI), owner: -1, children: 0, maxChildren: 3, used: [], ground: true });
    }

    let tries = 0;
    while (escalatorDefs.length < ESCALATOR_COUNT && tries++ < 6000) {
        const open = spots.filter(s => s.children < s.maxChildren);
        if (!open.length) break;

        const first = escalatorDefs.length === 0;
        // Se prefieren las plataformas altas para que el laberinto crezca hacia arriba
        const spot = first ? spots[0] : open[Math.floor(Math.pow(rand(), 0.7) * open.length)];

        const heading = first ? 0 : spot.heading + (spot.ground ? rr(-Math.PI, Math.PI) : (rand() < 0.5 ? -1 : 1) * rr(Math.PI / 5, Math.PI * 0.8));
        if (spot.used.some(u => angleDiff(u, heading) < Math.PI / 2.2)) continue;

        const length = first ? 14 : rr(8, 18);
        const width = first ? 2.5 : rr(2.2, 3.0);
        const sx = spot.ground ? spot.x : spot.x - Math.sin(heading) * 1.2;
        const sz = spot.ground ? spot.z : spot.z - Math.cos(heading) * 1.2;
        const sy = spot.y;

        const esc = escalatorPoints(sx, sy, sz, heading, length, width);
        const topY = sy + esc.h;
        if (topY > MAX_HEIGHT) continue;

        const padDist = esc.run + 2.6 + PAD_SIZE / 2 - 0.5;
        const px = sx + esc.fx * padDist;
        const pz = sz + esc.fz * padDist;
        const pad = padPoints(px, topY, pz, heading);

        if (!first && !isFree([...esc.pts, ...pad], spot.owner)) continue;

        const id = escalatorDefs.length + 1;
        escalatorDefs.push({
            id, x: sx, y: sy, z: sz, rotY: heading,
            length, width,
            direction: rand() < 0.5 ? 1 : -1,
            speed: rr(1.3, 2.2),
            neon: NEONS[id % NEONS.length]
        });
        esc.pts.forEach(p => obstacles.push({ ...p, owner: id }));
        pad.forEach(p => obstacles.push({ ...p, owner: id }));

        spot.children++;
        spot.used.push(heading);

        // Columna de apoyo bajo la plataforma, sólo si no atraviesa otra escalera
        const colPoint = { x: px, z: pz, y: 0, r: 0.6 };
        let colFree = true;
        for (const o of obstacles) {
            if (o.owner === id || o.column) continue;
            if (Math.hypot(o.x - px, o.z - pz) < o.r + 1.0 && o.y < topY - 0.5) { colFree = false; break; }
        }
        if (colFree) obstacles.push({ ...colPoint, column: true, top: topY, owner: id });

        spots.push({
            x: px, y: topY, z: pz, heading, owner: id, children: 0,
            maxChildren: 2, used: [heading + Math.PI], ground: false,
            hasColumn: colFree
        });
    }

    // Plataformas flotantes con borde de neón
    const padGeo = new THREE.BoxGeometry(PAD_SIZE, 0.6, PAD_SIZE);
    const padEdgeGeo = new THREE.BoxGeometry(PAD_SIZE, 0.1, 0.1);
    spots.filter(s => !s.ground).forEach((s, i) => {
        const padGroup = new THREE.Group();
        padGroup.position.set(s.x, s.y, s.z);
        padGroup.rotation.y = s.heading;

        const deck = new THREE.Mesh(padGeo, i % 3 === 0 ? steelMat : concreteMat);
        deck.position.y = -0.3;
        deck.castShadow = true;
        deck.receiveShadow = true;
        padGroup.add(addToLayer('columnas', deck));

        const ledMat = new THREE.MeshBasicMaterial({ color: NEONS[i % NEONS.length] });
        [[0, PAD_SIZE / 2, 0], [0, -PAD_SIZE / 2, 0], [PAD_SIZE / 2, 0, Math.PI / 2], [-PAD_SIZE / 2, 0, Math.PI / 2]].forEach(([ex, ez, er]) => {
            const edge = new THREE.Mesh(padEdgeGeo, ledMat);
            edge.position.set(ex, -0.02, ez);
            edge.rotation.y = er;
            padGroup.add(addToLayer('columnas', edge));
        });

        if (s.hasColumn) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, s.y - 0.6, 1.1), concreteMat);
            col.position.y = -0.6 - (s.y - 0.6) / 2;
            col.castShadow = true;
            col.receiveShadow = true;
            padGroup.add(addToLayer('columnas', col));
        }


        scene.add(padGroup);
        walkablePlatforms.push({ x: s.x, z: s.z, y: s.y, rot: s.heading, half: PAD_SIZE / 2 });
    });

    // ---------------------------------------------------------
    // Luces flotando en el espacio: puntos de luz sin farol,
    // suspendidos en la niebla, que se mecen muy despacio.
    // ---------------------------------------------------------
    const redGlow = makeGlowTexture('rgba(255,90,80,1)', 'rgba(255,30,30,0.35)');
    const whiteGlow = makeGlowTexture('rgba(255,255,255,1)', 'rgba(220,228,255,0.3)');
    const FLOATING_LIGHTS = 0; // desactivadas (poné un número, ej. 45, para volver a mostrarlas)
    const floatingLights = [];
    const lightRand = mulberryTex(21);
    for (let i = 0; i < FLOATING_LIGHTS; i++) {
        const isWhite = lightRand() < 0.3;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: isWhite ? whiteGlow : redGlow,
            transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending,
            opacity: 0.35 + lightRand() * 0.45
        }));
        const size = 1.5 + lightRand() * 4.5;
        sprite.scale.set(size, size, 1);
        const base = new THREE.Vector3(
            -50 + lightRand() * 100,
            2 + lightRand() * 42,
            -95 + lightRand() * 95
        );
        sprite.position.copy(base);
        scene.add(sprite);

        let light = null;
        if (i % 5 === 0) {
            light = new THREE.PointLight(isWhite ? 0xe8ecff : 0xff2a2a, 16, 18, 1.6);
            light.position.copy(base);
            scene.add(light);
        }
        floatingLights.push({
            sprite, light, base,
            baseOpacity: sprite.material.opacity,
            phase: lightRand() * Math.PI * 2,
            speed: 0.15 + lightRand() * 0.35,
            amp: 0.4 + lightRand() * 1.4
        });
    }

    // Franja de luz suave (más intensa en el centro) para abajo de las escaleras
    const stripGlow = (() => {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 4;
        const g = c.getContext('2d');
        const grad = g.createLinearGradient(0, 0, 64, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 64, 4);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    })();

    // ---------------------------------------------------------
    // Imágenes PNG sobre el vidrio
    // La imagen se arma como un "azulejo" que se repite repeatX veces
    // a lo largo del vidrio. Para deslizarla se mueve la textura, así
    // el recorrido es continuo y nunca salta de punta a punta.
    // ---------------------------------------------------------
    const imagePromises = new Map();
    const tileCanvases = new Map();

    function loadImage(path) {
        if (!imagePromises.has(path)) {
            imagePromises.set(path, new Promise((resolve, reject) => {
                new THREE.ImageLoader().load(path, resolve, undefined, reject);
            }));
        }
        return imagePromises.get(path);
    }

    // Lienzo con la imagen centrada y espacio transparente a los costados
    function getTileCanvas(img, path, tileAspect) {
        const key = `${path}|${tileAspect.toFixed(3)}`;
        if (tileCanvases.has(key)) return tileCanvases.get(key);

        let h = Math.min(img.height, 512);
        let w = Math.round(h * tileAspect);
        if (w > 4096) {
            h = Math.round(h * 4096 / w);
            w = 4096;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const drawW = Math.min(w, h * img.width / img.height);
        canvas.getContext('2d').drawImage(img, (w - drawW) / 2, 0, drawW, h);

        // Versión clara (misma forma, color hueso) para cuando no hay vidrio
        const light = document.createElement('canvas');
        light.width = w;
        light.height = h;
        const lg = light.getContext('2d');
        lg.drawImage(canvas, 0, 0);
        lg.globalCompositeOperation = 'source-atop';
        lg.fillStyle = '#efe4e1';
        lg.fillRect(0, 0, w, h);

        const pair = { dark: canvas, light };
        tileCanvases.set(key, pair);
        return pair;
    }

    function addGlassImage(railContainer, path, gfx, panelW, panelH, animatedMeshes) {
        loadImage(path).then(img => {
            const imgAspect = img.width / img.height;
            const repeatX = Math.max(1, Math.round(gfx.repeatX || 1));
            const scale = Math.min(Math.max(gfx.scale ?? 0.85, 0.05), 1);

            // Cada copia ocupa panelW / repeatX; el alto se ajusta para no estirar
            const tileW = panelW / repeatX;
            const imgH = Math.min(tileW / imgAspect, panelH * scale);
            const canvases = getTileCanvas(img, path, tileW / imgH);

            // Dos caras: una mira hacia adentro y otra hacia afuera,
            // así el texto nunca se ve espejado.
            [1, -1].forEach(face => {
                const makeTex = (cv) => {
                    const t = new THREE.CanvasTexture(cv);
                    t.colorSpace = THREE.SRGBColorSpace;
                    t.wrapS = THREE.RepeatWrapping;
                    t.wrapT = THREE.ClampToEdgeWrapping;
                    t.repeat.x = repeatX;
                    t.anisotropy = 4;
                    return t;
                };
                const tex = makeTex(canvases.dark);
                const texLight = makeTex(canvases.light);

                const mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(panelW, imgH),
                    new THREE.MeshBasicMaterial({
                        map: layerState.vidrios ? tex : texLight,
                        transparent: true,
                        side: THREE.FrontSide,
                        depthWrite: false
                    })
                );
                mesh.position.z = face * 0.018;
                if (face === -1) mesh.rotation.y = Math.PI;
                railContainer.add(addToLayer('tipografia', mesh));
                typeTextures.push({ mesh, dark: tex, light: texLight });

                if (gfx.moveWithBelt !== false) {
                    animatedMeshes.push({ textures: [tex, texLight], tileW, face });
                }
            });
        }).catch(() => console.warn("Falta subir el archivo PNG:", path));
    }

    const escalators = [];

    escalatorDefs.forEach(cfg => {
        const group = new THREE.Group();
        group.position.set(cfg.x, cfg.y, cfg.z);
        group.rotation.y = cfg.rotY;

        const height = Math.sin(ANGLE) * cfg.length;
        const run = Math.cos(ANGLE) * cfg.length;
        const landingLen = 2.6;

        // Chasis metálico inferior
        const chassis = new THREE.Mesh(
            new THREE.BoxGeometry(cfg.width + 0.45, 0.75, cfg.length),
            concreteMat
        );
        chassis.position.set(0, height / 2 - 0.35, -run / 2);
        chassis.rotation.x = ANGLE;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        group.add(addToLayer('escaleras', chassis));

        // Resplandor leve que sale de abajo de la escalera
        const glowColor = GLOW_COLORS[cfg.id % GLOW_COLORS.length];
        const underGlow = new THREE.Mesh(
            new THREE.PlaneGeometry(cfg.width + 0.2, cfg.length * 0.96),
            new THREE.MeshBasicMaterial({
                map: stripGlow, color: glowColor, transparent: true, opacity: 0.35,
                depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
            })
        );
        underGlow.rotation.x = Math.PI / 2;
        underGlow.position.y = -0.4;
        chassis.add(underGlow);
        if (cfg.id % 5 === 0) {
            const leak = new THREE.PointLight(glowColor, 10, 14, 1.6);
            leak.position.set(0, height / 2 - 2, -run / 2);
            group.add(leak);
        }

        // Plataformas inferior y superior
        const landingGeo = new THREE.BoxGeometry(cfg.width + 0.45, 0.75, landingLen);
        const bottomLanding = new THREE.Mesh(landingGeo, steelMat);
        bottomLanding.position.set(0, -0.375, landingLen / 2);
        bottomLanding.receiveShadow = true;
        group.add(addToLayer('escaleras', bottomLanding));

        const topLanding = new THREE.Mesh(landingGeo, steelMat);
        topLanding.position.set(0, height - 0.375, -run - landingLen / 2);
        topLanding.receiveShadow = true;
        group.add(addToLayer('escaleras', topLanding));

        // Escalones móviles
        const stepCount = Math.floor(cfg.length * 2.3);
        const steps = [];
        const stepGeo = new THREE.BoxGeometry(cfg.width - 0.12, 0.16, 0.44);

        for (let i = 0; i < stepCount; i++) {
            const stepMesh = new THREE.Mesh(stepGeo, stepMat);
            stepMesh.castShadow = true;
            stepMesh.receiveShadow = true;
            group.add(addToLayer('escaleras', stepMesh));
            steps.push({ mesh: stepMesh, progress: i / stepCount });
        }

        // Barandas de vidrio + imágenes PNG (sin estirarse, se leen bien de ambos lados)
        const railHeight = 1.1;
        const animatedMeshes = [];
        const gfx = getGlassConfig(cfg.id);

        [-1, 1].forEach(sideSign => {
            const isLeft = sideSign === -1;
            const xOffset = sideSign * (cfg.width / 2 + 0.06);

            const railContainer = new THREE.Group();
            railContainer.position.set(xOffset, height / 2 + railHeight / 2, -run / 2);
            railContainer.rotation.y = Math.PI / 2;
            railContainer.rotation.z = ANGLE;

            // Vidrio templado
            railContainer.add(addToLayer('vidrios', new THREE.Mesh(new THREE.PlaneGeometry(cfg.length, railHeight), glassMat)));

            // Pasamanos negro superior
            const handrail = new THREE.Mesh(
                new THREE.BoxGeometry(cfg.length + 0.4, 0.1, 0.14),
                darkMetalMat
            );
            handrail.position.set(0, railHeight / 2 + 0.04, 0);
            railContainer.add(addToLayer('escaleras', handrail));

            // Tira LED neón en la base
            const ledStrip = new THREE.Mesh(
                new THREE.BoxGeometry(cfg.length, 0.06, 0.08),
                new THREE.MeshBasicMaterial({ color: cfg.neon })
            );
            ledStrip.position.set(0, -railHeight / 2, 0);
            railContainer.add(addToLayer('escaleras', ledStrip));

            const pngPath = isLeft ? gfx.leftImage : gfx.rightImage;
            if (pngPath) {
                addGlassImage(railContainer, pngPath, gfx, cfg.length, railHeight, animatedMeshes);
            }

            group.add(railContainer);
        });

        scene.add(group);
        escalators.push({ config: cfg, group, steps, height, run, landingLen, animatedMeshes });
    });

    // Física para caminar y viajar sobre los escalones
    const localPos = new THREE.Vector3();
    const conveyorVec = new THREE.Vector3();

    function evaluateFloorAndEscalators(playerPos, delta) {
        const feetY = playerPos.y - EYE_HEIGHT;
        let groundY = 0;
        const transport = new THREE.Vector3(0, 0, 0);

        for (const p of walkablePlatforms) {
            // Plataformas giradas: se pasa la posición al sistema de la plataforma
            const dx = playerPos.x - p.x, dz = playerPos.z - p.z;
            const c = Math.cos(p.rot), sn = Math.sin(p.rot);
            const lx = dx * c - dz * sn, lz = dx * sn + dz * c;
            if (Math.abs(lx) <= p.half && Math.abs(lz) <= p.half) {
                if (feetY >= p.y - 0.85 && p.y > groundY) {
                    groundY = p.y;
                }
            }
        }

        for (const esc of escalators) {
            const { config, group, height, run, landingLen } = esc;
            localPos.copy(playerPos);
            group.worldToLocal(localPos);

            if (Math.abs(localPos.x) <= config.width * 0.52) {
                let surfaceY = null;
                let ridingSteps = false;

                if (localPos.z >= 0 && localPos.z <= landingLen) {
                    surfaceY = 0;
                } else if (localPos.z < 0 && localPos.z >= -run) {
                    surfaceY = (-localPos.z / run) * height;
                    ridingSteps = true;
                } else if (localPos.z < -run && localPos.z >= -run - landingLen) {
                    surfaceY = height;
                }

                if (surfaceY !== null) {
                    const worldY = config.y + surfaceY;
                    if (feetY >= worldY - 0.9 && feetY <= worldY + 1.1 && worldY >= groundY) {
                        groundY = worldY;
                        if (ridingSteps) {
                            const hSpeed = Math.cos(ANGLE) * config.speed * config.direction;
                            conveyorVec.set(0, 0, -hSpeed * delta);
                            conveyorVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), config.rotY);
                            transport.copy(conveyorVec);
                        } else {
                            transport.set(0, 0, 0);
                        }
                    }
                }
            }
        }

        return { groundY, transport };
    }

    // Controles WASD + Mouse
    controls = new PointerLockControls(camera, document.body);

    controls.addEventListener('lock', () => labyrinthSection.classList.add('locked'));
    controls.addEventListener('unlock', () => labyrinthSection.classList.remove('locked'));

    const keys = { f: false, b: false, l: false, r: false, jump: false, down: false };
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let flyMode = false;
    let canJump = true;

    document.addEventListener('keydown', (e) => {
        if (!labyrinthSection.classList.contains('active')) return;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.f = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.b = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.l = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.r = true;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.down = true;

        if (e.code === 'Space') {
            if (flyMode) keys.jump = true;
            else if (canJump) {
                velocity.y = 9.5;
                canJump = false;
            }
        }

        if (e.code === 'KeyV') {
            flyMode = !flyMode;
            velocity.y = 0;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.f = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.b = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.l = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.r = false;
        if (e.code === 'Space') keys.jump = false;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.down = false;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Bucle de animación del universo 3D
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        if (!labyrinthSection.classList.contains('active')) return;

        const delta = Math.min(clock.getDelta(), 0.08);

        // 1. Animar escalones y gráficos PNG centrados de cada baranda
        escalators.forEach(esc => {
            const { config, steps, height, run, animatedMeshes } = esc;
            const stepDelta = (config.speed * delta * config.direction) / config.length;

            steps.forEach(step => {
                step.progress += stepDelta;
                if (step.progress > 1) step.progress -= 1;
                if (step.progress < 0) step.progress += 1;
                step.mesh.position.set(0, step.progress * height, -step.progress * run);
            });

            // Deslizamiento continuo de las imágenes junto con la cinta
            const beltShift = config.speed * delta * config.direction;
            animatedMeshes.forEach(item => {
                const off = item.textures[0].offset.x - item.face * beltShift / item.tileW;
                const wrapped = ((off % 1) + 1) % 1;
                item.textures.forEach(t => { t.offset.x = wrapped; });
            });
        });

        // Luces flotantes: se mecen y titilan apenas
        const time = clock.elapsedTime;
        floatingLights.forEach(fl => {
            const k = time * fl.speed + fl.phase;
            fl.sprite.position.set(
                fl.base.x + Math.sin(k * 0.7) * fl.amp,
                fl.base.y + Math.sin(k) * fl.amp,
                fl.base.z + Math.cos(k * 0.5) * fl.amp
            );
            fl.sprite.material.opacity = fl.baseOpacity * (0.8 + 0.2 * Math.sin(k * 3.1));
            if (fl.light) fl.light.position.copy(fl.sprite.position);
        });

        // 2. Movimiento con WASD (funciona siempre dentro de la Sección 2)
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys.f) - Number(keys.b);
        direction.x = Number(keys.r) - Number(keys.l);
        direction.normalize();

        const speed = flyMode ? 65.0 : 52.0;
        if (keys.f || keys.b) velocity.z -= direction.z * speed * delta;
        if (keys.l || keys.r) velocity.x -= direction.x * speed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        if (flyMode) {
            velocity.y -= velocity.y * 10.0 * delta;
            const dy = Number(keys.jump) - Number(keys.down);
            if (keys.jump || keys.down) velocity.y += dy * speed * delta;
            camera.position.y += velocity.y * delta;
            if (camera.position.y < EYE_HEIGHT) camera.position.y = EYE_HEIGHT;
        } else {
            const { groundY, transport } = evaluateFloorAndEscalators(camera.position, delta);
            camera.position.add(transport);
            velocity.y -= 24.0 * delta;
            camera.position.y += velocity.y * delta;

            if (camera.position.y <= groundY + EYE_HEIGHT) {
                camera.position.y = groundY + EYE_HEIGHT;
                velocity.y = 0;
                canJump = true;
            }
        }


        altitudeIndicator.textContent = `ALTURA: ${Math.max(0, camera.position.y - EYE_HEIGHT).toFixed(1)}m`;

        renderer.render(scene, camera);
    }

    animate();
}

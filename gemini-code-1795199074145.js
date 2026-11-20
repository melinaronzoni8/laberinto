import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { glassGraphics } from './images.js';

// =========================================================
// 1. CAMBIO ENTRE PORTADA Y SECCIÓN DEL LABERINTO 3D
// =========================================================
const homeSection = document.getElementById('home-section');
const labyrinthSection = document.getElementById('labyrinth-section');
const goToLabyrinthBtn = document.getElementById('go-to-labyrinth-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const modeIndicator = document.getElementById('mode-indicator');
const coordsIndicator = document.getElementById('coords-indicator');

let universeCreated = false;
let controls = null;

goToLabyrinthBtn.addEventListener('click', () => {
    homeSection.classList.remove('active');
    labyrinthSection.classList.add('active');

    if (!universeCreated) {
        buildEscalatorUniverse();
        universeCreated = true;
    }

    if (controls) {
        controls.lock();
    }
});

backHomeBtn.addEventListener('click', () => {
    if (controls && controls.isLocked) {
        controls.unlock();
    }
    labyrinthSection.classList.remove('active');
    homeSection.classList.add('active');
});

// =========================================================
// 2. CONSTRUCCIÓN DEL UNIVERSO VIRTUAL 3D DE ESCALERAS
// =========================================================
function buildEscalatorUniverse() {
    const container = document.getElementById('canvas-container');
    const EYE_HEIGHT = 1.75;
    const ANGLE = Math.PI / 6; // Inclinación 30°

    // Escena y atmósfera espacial
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    scene.fog = new THREE.FogExp2(0x06070a, 0.011);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 320);
    camera.position.set(0, EYE_HEIGHT, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Al hacer clic en el canvas dentro de la sección 2, activa/reactiva la mira del mouse
    renderer.domElement.addEventListener('click', () => {
        if (labyrinthSection.classList.contains('active') && controls && !controls.isLocked) {
            controls.lock();
        }
    });

    // Iluminación arquitectónica monumental
    scene.add(new THREE.AmbientLight(0xdce6f2, 0.75));

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(22, 75, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    const sb = 65;
    sunLight.shadow.camera.left = -sb;
    sunLight.shadow.camera.right = sb;
    sunLight.shadow.camera.top = sb;
    sunLight.shadow.camera.bottom = -sb;
    scene.add(sunLight);

    const cyanLight = new THREE.PointLight(0x05d9e8, 55, 65);
    cyanLight.position.set(-16, 16, -20);
    scene.add(cyanLight);

    const pinkLight = new THREE.PointLight(0xff2a6d, 55, 65);
    pinkLight.position.set(16, 24, -30);
    scene.add(pinkLight);

    const topSkyLight = new THREE.PointLight(0xffffff, 60, 80);
    topSkyLight.position.set(0, 42, -25);
    scene.add(topSkyLight);

    // Materiales brutalistas y futuristas
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x22252d, roughness: 0.85, metalness: 0.15 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x9aa4b2, roughness: 0.25, metalness: 0.9 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x101216, roughness: 0.35, metalness: 0.85 });
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x2c313a, roughness: 0.3, metalness: 0.9 });
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x5c6470, roughness: 0.4, metalness: 0.85 });
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xbbe4f2,
        transparent: true,
        opacity: 0.24,
        roughness: 0.06,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Suelo con retícula cian
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), concreteMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(280, 112, 0x05d9e8, 0x191d26);
    grid.position.y = 0.02;
    grid.material.opacity = 0.32;
    grid.material.transparent = true;
    scene.add(grid);

    // Techo / Claraboya futurista en las alturas
    const ceilingFrame = new THREE.GridHelper(120, 24, 0xffffff, 0x333a48);
    ceilingFrame.position.set(0, 45, -24);
    scene.add(ceilingFrame);

    // Columnas estructurales gigantes
    const walkablePlatforms = [];
    const pillarGeo = new THREE.BoxGeometry(2.4, 90, 2.4);
    [
        [-20, -2], [20, -2],
        [-20, -20], [20, -20],
        [-20, -38], [20, -38],
        [-20, -56], [20, -56],
        [-32, -12], [32, -12],
        [-32, -32], [32, -32]
    ].forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, concreteMat);
        pillar.position.set(x, 45, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
    });

    // 5 niveles de galerías laterales y pasarelas aéreas conectadas
    for (let lvl = 1; lvl <= 5; lvl++) {
        const y = lvl * 7;

        [-26, 26].forEach(x => {
            const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.7, 84), concreteMat);
            deck.position.set(x, y - 0.35, -26);
            deck.receiveShadow = true;
            scene.add(deck);

            walkablePlatforms.push({ minX: x - 4, maxX: x + 4, minZ: -68, maxZ: 16, y });

            const led = new THREE.Mesh(
                new THREE.BoxGeometry(0.14, 0.14, 84),
                new THREE.MeshBasicMaterial({ color: lvl % 2 === 0 ? 0x05d9e8 : 0xff2a6d })
            );
            led.position.set(x > 0 ? x - 4 : x + 4, y, -26);
            scene.add(led);
        });

        // Puentes transversales que conectan las salidas de las escaleras
        [-14, -30, -46].forEach(zBridge => {
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(44, 0.65, 4.6), steelMat);
            bridge.position.set(0, y - 0.325, zBridge);
            bridge.receiveShadow = true;
            scene.add(bridge);

            walkablePlatforms.push({
                minX: -22, maxX: 22,
                minZ: zBridge - 2.3, maxZ: zBridge + 2.3,
                y
            });
        });
    }

    // =========================================================
    // 3. DISEÑO DE LAS 24 ESCALERAS MECÁNICAS DEL LABERINTO
    // =========================================================
    const escalatorDefs = [
        // Nivel 0 -> 1 (De frente al entrar: pares ascendentes y descendentes)
        { id: 1,  x: -4,   y: 0,  z: 0,   rotY: 0,            length: 14, width: 2.5, direction: 1,  speed: 1.8, neon: 0x05d9e8 },
        { id: 2,  x: 4,    y: 0,  z: 0,   rotY: 0,            length: 14, width: 2.5, direction: -1, speed: 2.0, neon: 0xff2a6d },
        { id: 3,  x: -11,  y: 0,  z: -2,  rotY: 0,            length: 14, width: 2.2, direction: -1, speed: 1.5, neon: 0xffffff },
        { id: 4,  x: 11,   y: 0,  z: -2,  rotY: 0,            length: 14, width: 2.2, direction: 1,  speed: 1.7, neon: 0x05d9e8 },

        // Nivel 1 -> 2 (En tijera cruzada como tus referencias)
        { id: 5,  x: -4,   y: 7,  z: -16, rotY: 0,            length: 14, width: 2.5, direction: 1,  speed: 1.7, neon: 0xff2a6d },
        { id: 6,  x: 4,    y: 7,  z: -16, rotY: 0,            length: 14, width: 2.5, direction: -1, speed: 2.2, neon: 0x05d9e8 },
        { id: 7,  x: -4,   y: 7,  z: -28, rotY: Math.PI,      length: 14, width: 2.5, direction: 1,  speed: 1.6, neon: 0xffffff },
        { id: 8,  x: 4,    y: 7,  z: -28, rotY: Math.PI,      length: 14, width: 2.5, direction: -1, speed: 1.9, neon: 0xff2a6d },

        // Laterales perpendiculares (de perfil a izquierda y derecha)
        { id: 9,  x: -10,  y: 0,  z: -14, rotY: Math.PI / 2,  length: 14, width: 2.4, direction: 1,  speed: 1.6, neon: 0xffffff },
        { id: 10, x: 10,   y: 0,  z: -14, rotY: -Math.PI / 2, length: 14, width: 2.4, direction: -1, speed: 1.8, neon: 0x05d9e8 },
        { id: 11, x: -10,  y: 7,  z: -30, rotY: Math.PI / 2,  length: 14, width: 2.4, direction: 1,  speed: 1.5, neon: 0xff2a6d },
        { id: 12, x: 10,   y: 7,  z: -30, rotY: -Math.PI / 2, length: 14, width: 2.4, direction: -1, speed: 1.9, neon: 0xffffff },

        // Nivel 2 -> 3 (Invertidas mirándote de frente desde las alturas)
        { id: 13, x: -4.5, y: 14, z: -28, rotY: Math.PI,      length: 14, width: 2.6, direction: 1,  speed: 1.6, neon: 0x05d9e8 },
        { id: 14, x: 4.5,  y: 14, z: -28, rotY: Math.PI,      length: 14, width: 2.6, direction: -1, speed: 2.1, neon: 0xff2a6d },
        { id: 15, x: 0,    y: 14, z: -32, rotY: 0,            length: 14, width: 2.8, direction: 1,  speed: 1.5, neon: 0xffffff },

        // Nivel 3 -> 4 (Centrales monumentales y diagonales)
        { id: 16, x: 0,    y: 21, z: -16, rotY: 0,            length: 14, width: 3.0, direction: 1,  speed: 1.4, neon: 0xffffff },
        { id: 17, x: -8,   y: 21, z: -34, rotY: Math.PI / 4,  length: 14, width: 2.3, direction: -1, speed: 1.7, neon: 0x05d9e8 },
        { id: 18, x: 8,    y: 21, z: -34, rotY: -Math.PI / 4, length: 14, width: 2.3, direction: 1,  speed: 1.5, neon: 0xff2a6d },

        // Nivel 4 -> 5 y estructuras lejanas de profundidad
        { id: 19, x: -4.5, y: 28, z: -32, rotY: 0,            length: 14, width: 2.8, direction: 1,  speed: 1.6, neon: 0x05d9e8 },
        { id: 20, x: 4.5,  y: 28, z: -32, rotY: 0,            length: 14, width: 2.8, direction: -1, speed: 1.8, neon: 0xff2a6d },
        { id: 21, x: -14,  y: 14, z: -44, rotY: -Math.PI / 3, length: 16, width: 2.3, direction: 1,  speed: 1.9, neon: 0xffffff },
        { id: 22, x: 14,   y: 14, z: -44, rotY: Math.PI / 3,  length: 16, width: 2.3, direction: -1, speed: 1.5, neon: 0xff2a6d },
        { id: 23, x: -15,  y: 0,  z: -34, rotY: 0,            length: 14, width: 2.2, direction: 1,  speed: 2.0, neon: 0x05d9e8 },
        { id: 24, x: 15,   y: 0,  z: -34, rotY: 0,            length: 14, width: 2.2, direction: -1, speed: 1.4, neon: 0xff2a6d }
    ];

    const textureLoader = new THREE.TextureLoader();
    const escalators = [];

    escalatorDefs.forEach(cfg => {
        const group = new THREE.Group();
        group.position.set(cfg.x, cfg.y, cfg.z);
        group.rotation.y = cfg.rotY;

        const height = Math.sin(ANGLE) * cfg.length;
        const run = Math.cos(ANGLE) * cfg.length;
        const landingLen = 2.6;

        // Chasis estructural con cercha metálica
        const chassis = new THREE.Mesh(
            new THREE.BoxGeometry(cfg.width + 0.45, 0.72, cfg.length),
            darkMetalMat
        );
        chassis.position.set(0, height / 2 - 0.35, -run / 2);
        chassis.rotation.x = ANGLE;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        group.add(chassis);

        // Costillas metálicas laterales (estilo industrial de tu referencia)
        const ribCount = Math.floor(cfg.length * 1.4);
        const ribGeo = new THREE.BoxGeometry(cfg.width + 0.52, 0.65, 0.12);
        for (let r = 1; r < ribCount; r++) {
            const t = r / ribCount;
            const rib = new THREE.Mesh(ribGeo, trussMat);
            rib.position.set(0, t * height - 0.35, -t * run);
            group.add(rib);
        }

        // Plataformas inferior y superior
        const landingGeo = new THREE.BoxGeometry(cfg.width + 0.45, 0.75, landingLen);
        const bottomLanding = new THREE.Mesh(landingGeo, steelMat);
        bottomLanding.position.set(0, -0.375, landingLen / 2);
        bottomLanding.receiveShadow = true;
        group.add(bottomLanding);

        const topLanding = new THREE.Mesh(landingGeo, steelMat);
        topLanding.position.set(0, height - 0.375, -run - landingLen / 2);
        topLanding.receiveShadow = true;
        group.add(topLanding);

        // Escalones móviles individuales
        const stepCount = Math.floor(cfg.length * 2.3);
        const steps = [];
        const stepGeo = new THREE.BoxGeometry(cfg.width - 0.12, 0.16, 0.44);

        for (let i = 0; i < stepCount; i++) {
            const stepMesh = new THREE.Mesh(stepGeo, stepMat);
            stepMesh.castShadow = true;
            stepMesh.receiveShadow = true;
            group.add(stepMesh);
            steps.push({ mesh: stepMesh, progress: i / stepCount });
        }

        // Barandas de vidrio + Imágenes PNG por baranda
        const railHeight = 1.1;
        const animatedTextures = [];
        const gfx = glassGraphics[cfg.id];

        [-1, 1].forEach(sideSign => {
            const isLeft = sideSign === -1;
            const xOffset = sideSign * (cfg.width / 2 + 0.06);

            const railContainer = new THREE.Group();
            railContainer.position.set(xOffset, height / 2 + railHeight / 2, -run / 2);
            railContainer.rotation.y = Math.PI / 2;
            railContainer.rotation.z = ANGLE;

            // Vidrio templado
            railContainer.add(new THREE.Mesh(new THREE.PlaneGeometry(cfg.length, railHeight), glassMat));

            // Pasamanos negro superior
            const handrail = new THREE.Mesh(
                new THREE.BoxGeometry(cfg.length + 0.5, 0.1, 0.14),
                darkMetalMat
            );
            handrail.position.set(0, railHeight / 2 + 0.04, 0);
            railContainer.add(handrail);

            // Tira LED neón inferior
            const ledStrip = new THREE.Mesh(
                new THREE.BoxGeometry(cfg.length, 0.06, 0.08),
                new THREE.MeshBasicMaterial({ color: cfg.neon })
            );
            ledStrip.position.set(0, -railHeight / 2, 0);
            railContainer.add(ledStrip);

            // Cargar PNG asignado a esta baranda específica (izquierda o derecha)
            const pngPath = gfx ? (isLeft ? gfx.leftImage : gfx.rightImage) : null;
            if (pngPath) {
                const texture = textureLoader.load(
                    pngPath,
                    (tex) => {
                        tex.wrapS = THREE.RepeatWrapping;
                        tex.wrapT = THREE.ClampToEdgeWrapping;
                        tex.repeat.set(gfx.repeatX || 1, 1);
                        tex.colorSpace = THREE.SRGBColorSpace;
                    },
                    undefined,
                    () => console.warn("Falta subir el archivo PNG:", pngPath)
                );

                const decalMat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });

                const decalMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(cfg.length * 0.94, railHeight * 0.86),
                    decalMat
                );
                decalMesh.position.set(0, 0, sideSign * 0.018);
                railContainer.add(decalMesh);

                if (gfx.moveWithBelt !== false) {
                    animatedTextures.push(texture);
                }
            }

            group.add(railContainer);
        });

        scene.add(group);
        escalators.push({ config: cfg, group, steps, height, run, landingLen, animatedTextures });
    });

    // =========================================================
    // 4. FÍSICA PARA SUBIR Y VIAJAR EN LAS ESCALERAS
    // =========================================================
    const localPos = new THREE.Vector3();
    const conveyorVec = new THREE.Vector3();

    function evaluateFloorAndEscalators(playerPos, delta) {
        const feetY = playerPos.y - EYE_HEIGHT;
        let groundY = 0;
        const transport = new THREE.Vector3(0, 0, 0);

        for (const p of walkablePlatforms) {
            if (playerPos.x >= p.minX && playerPos.x <= p.maxX &&
                playerPos.z >= p.minZ && playerPos.z <= p.maxZ) {
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

    // =========================================================
    // 5. CONTROLES WASD + MOUSE (LIBRE Y BLOQUEADO)
    // =========================================================
    controls = new PointerLockControls(camera, document.body);

    // Soporte adicional: mirar arrastrando el mouse si PointerLock no está activo
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');

    renderer.domElement.addEventListener('mousedown', (e) => {
        if (!controls.isLocked) {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (!controls.isLocked && isDragging && labyrinthSection.classList.contains('active')) {
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;

            euler.setFromQuaternion(camera.quaternion);
            euler.y -= dx * 0.003;
            euler.x -= dy * 0.003;
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
            camera.quaternion.setFromEuler(euler);
        }
    });

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
            modeIndicator.textContent = flyMode
                ? "MODO: VUELO LIBRE (ESPACIO / SHIFT)"
                : "MODO: CAMINATA (PISÁ LOS ESCALONES)";
            modeIndicator.style.color = flyMode ? "#ff2a6d" : "#05d9e8";
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

    // =========================================================
    // 6. BUCLE PRINCIPAL DE ANIMACIÓN
    // =========================================================
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        if (!labyrinthSection.classList.contains('active')) return;

        const delta = Math.min(clock.getDelta(), 0.08);

        // 1. Mover escalones y desplazar las imágenes PNG en las barandas
        escalators.forEach(esc => {
            const { config, steps, height, run, animatedTextures } = esc;
            const
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { glassGraphics } from './images.js';

// =========================================================
// 1. GESTIÓN DE SECCIONES (PORTADA <-> UNIVERSO LABERINTO)
// =========================================================
const homeSection = document.getElementById('home-section');
const labyrinthSection = document.getElementById('labyrinth-section');
const goToLabyrinthBtn = document.getElementById('go-to-labyrinth-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const resumeWalkBtn = document.getElementById('resume-walk-btn');
const pointerOverlay = document.getElementById('pointer-overlay');
const hud = document.getElementById('hud');
const modeIndicator = document.getElementById('mode-indicator');
const coordsIndicator = document.getElementById('coords-indicator');

let universeInitialized = false;
let controls = null;

goToLabyrinthBtn.addEventListener('click', () => {
    homeSection.classList.remove('active');
    labyrinthSection.classList.add('active');

    if (!universeInitialized) {
        initLabyrinthUniverse();
        universeInitialized = true;
    }

    // Bloquear cursor automáticamente al entrar a la sección 2
    if (controls) {
        controls.lock();
    }
});

resumeWalkBtn.addEventListener('click', () => {
    if (controls) controls.lock();
});

backHomeBtn.addEventListener('click', () => {
    labyrinthSection.classList.remove('active');
    homeSection.classList.add('active');
});

// =========================================================
// 2. CREACIÓN DEL UNIVERSO LABERINTO DE ESCALERAS MECÁNICAS
// =========================================================
function initLabyrinthUniverse() {
    const container = document.getElementById('canvas-container');
    const EYE_HEIGHT = 1.75;
    const ANGLE = Math.PI / 6; // Inclinación 30°

    // Escena y atmósfera espacial brutalista
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    scene.fog = new THREE.FogExp2(0x06070a, 0.012);

    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 280);
    camera.position.set(0, EYE_HEIGHT, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Iluminación dramática
    scene.add(new THREE.AmbientLight(0xdce6f2, 0.7));

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.3);
    sunLight.position.set(20, 65, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    const shadowBound = 60;
    sunLight.shadow.camera.left = -shadowBound;
    sunLight.shadow.camera.right = shadowBound;
    sunLight.shadow.camera.top = shadowBound;
    sunLight.shadow.camera.bottom = -shadowBound;
    scene.add(sunLight);

    const neonCyanLight = new THREE.PointLight(0x05d9e8, 45, 55);
    neonCyanLight.position.set(-15, 14, -18);
    scene.add(neonCyanLight);

    const neonPinkLight = new THREE.PointLight(0xff2a6d, 45, 55);
    neonPinkLight.position.set(15, 20, -28);
    scene.add(neonPinkLight);

    // Materiales arquitectónicos
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.85, metalness: 0.15 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x8d97a5, roughness: 0.25, metalness: 0.88 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.4, metalness: 0.85 });
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x2d323a, roughness: 0.3, metalness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xbbe2f0,
        transparent: true,
        opacity: 0.25,
        roughness: 0.08,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Suelo infinito con retícula luminosa
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), concreteMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(260, 104, 0x05d9e8, 0x1a1e26);
    grid.position.y = 0.02;
    grid.material.opacity = 0.32;
    grid.material.transparent = true;
    scene.add(grid);

    // Columnas monumentales y pasarelas aéreas conectadas
    const walkablePlatforms = [];
    const pillarGeo = new THREE.BoxGeometry(2.4, 85, 2.4);

    [
        [-18, -4], [18, -4],
        [-18, -22], [18, -22],
        [-18, -40], [18, -40],
        [-30, -14], [30, -14],
        [-30, -34], [30, -34]
    ].forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, concreteMat);
        pillar.position.set(x, 42.5, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
    });

    // 4 niveles de balcones y puentes transversales para conectar las escaleras
    for (let lvl = 1; lvl <= 4; lvl++) {
        const y = lvl * 7;

        // Balcones laterales
        [-24, 24].forEach(x => {
            const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.7, 76), concreteMat);
            deck.position.set(x, y - 0.35, -24);
            deck.receiveShadow = true;
            scene.add(deck);

            walkablePlatforms.push({ minX: x - 4, maxX: x + 4, minZ: -62, maxZ: 14, y });

            const led = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.12, 76),
                new THREE.MeshBasicMaterial({ color: lvl % 2 === 0 ? 0x05d9e8 : 0xff2a6d })
            );
            led.position.set(x > 0 ? x - 4 : x + 4, y, -24);
            scene.add(led);
        });

        // Puentes centrales de conexión en Z = -16 y Z = -32
        [-16, -32].forEach(zBridge => {
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(40, 0.65, 4.5), steelMat);
            bridge.position.set(0, y - 0.325, zBridge);
            bridge.receiveShadow = true;
            scene.add(bridge);

            walkablePlatforms.push({
                minX: -20, maxX: 20,
                minZ: zBridge - 2.25, maxZ: zBridge + 2.25,
                y
            });
        });
    }

    // Diseño del universo de 18 escaleras mecánicas
    const escalatorDefs = [
        // Nivel 0 -> 1 (Frente a vos: una sube, una baja)
        { id: 1,  x: -3.5, y: 0,  z: -2,  rotY: 0,            length: 14, width: 2.5, direction: 1,  speed: 1.8, neon: 0x05d9e8 },
        { id: 2,  x: 3.5,  y: 0,  z: -2,  rotY: 0,            length: 14, width: 2.5, direction: -1, speed: 2.0, neon: 0xff2a6d },

        // Nivel 1 -> 2 (Continuación ascendente/descendente)
        { id: 3,  x: -3.5, y: 7,  z: -18, rotY: 0,            length: 14, width: 2.5, direction: 1,  speed: 1.7, neon: 0xff2a6d },
        { id: 4,  x: 3.5,  y: 7,  z: -18, rotY: 0,            length: 14, width: 2.5, direction: -1, speed: 2.2, neon: 0x05d9e8 },

        // Laterales perpendiculares (de perfil)
        { id: 5,  x: -9,   y: 0,  z: -16, rotY: Math.PI / 2,  length: 14, width: 2.4, direction: 1,  speed: 1.6, neon: 0xffffff },
        { id: 6,  x: 9,    y: 0,  z: -16, rotY: -Math.PI / 2, length: 14, width: 2.4, direction: -1, speed: 1.8, neon: 0x05d9e8 },
        { id: 7,  x: -9,   y: 7,  z: -32, rotY: Math.PI / 2,  length: 14, width: 2.4, direction: 1,  speed: 1.5, neon: 0xff2a6d },
        { id: 8,  x: 9,    y: 7,  z: -32, rotY: -Math.PI / 2, length: 14, width: 2.4, direction: -1, speed: 1.9, neon: 0xffffff },

        // Nivel 2 -> 3 (Invertidas mirándote de frente desde arriba)
        { id: 9,  x: -4,   y: 14, z: -30, rotY: Math.PI,      length: 14, width: 2.6, direction: 1,  speed: 1.6, neon: 0x05d9e8 },
        { id: 10, x: 4,    y: 14, z: -30, rotY: Math.PI,      length: 14, width: 2.6, direction: -1, speed: 2.1, neon: 0xff2a6d },

        // Nivel 3 -> 4 (Central monumental)
        { id: 11, x: 0,    y: 21, z: -18, rotY: 0,            length: 14, width: 3.0, direction: 1,  speed: 1.4, neon: 0xffffff },
        { id: 12, x: -7.5, y: 21, z: -34, rotY: Math.PI / 4,  length: 14, width: 2.3, direction: -1, speed: 1.7, neon: 0x05d9e8 },
        { id: 13, x: 7.5,  y: 21, z: -34, rotY: -Math.PI / 4, length: 14, width: 2.3, direction: 1,  speed: 1.5, neon: 0xff2a6d },

        // Estructuras lejanas y diagonales del laberinto
        { id: 14, x: 0,    y: 28, z: -34, rotY: 0,            length: 16, width: 3.2, direction: -1, speed: 1.6, neon: 0x05d9e8 },
        { id: 15, x: -14,  y: 14, z: -42, rotY: -Math.PI / 3, length: 16, width: 2.3, direction: 1,  speed: 1.9, neon: 0xffffff },
        { id: 16, x: 14,   y: 14, z: -42, rotY: Math.PI / 3,  length: 16, width: 2.3, direction: -1, speed: 1.5, neon: 0xff2a6d },
        { id: 17, x: -15,  y: 0,  z: -36, rotY: 0,            length: 14, width: 2.2, direction: 1,  speed: 2.0, neon: 0x05d9e8 },
        { id: 18, x: 15,   y: 0,  z: -36, rotY: 0,            length: 14, width: 2.2, direction: -1, speed: 1.4, neon: 0xff2a6d }
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

        // Chasis estructural
        const chassis = new THREE.Mesh(
            new THREE.BoxGeometry(cfg.width + 0.45, 0.75, cfg.length),
            darkMetalMat
        );
        chassis.position.set(0, height / 2 - 0.35, -run / 2);
        chassis.rotation.x = ANGLE;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        group.add(chassis);

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

        // Escalones móviles
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

        // Barandas de vidrio + Imágenes PNG individuales por baranda
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

            // Vidrio translúcido
            railContainer.add(new THREE.Mesh(new THREE.PlaneGeometry(cfg.length, railHeight), glassMat));

            // Pasamanos negro superior
            const handrail = new THREE.Mesh(
                new THREE.BoxGeometry(cfg.length + 0.4, 0.1, 0.14),
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

    // Física para pisar plataformas y viajar sobre los escalones
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

    // Controles en primera persona (exclusivos de la Sección 2)
    controls = new PointerLockControls(camera, document.body);

    controls.addEventListener('lock', () => {
        pointerOverlay.classList.add('hidden');
        hud.classList.add('active');
    });

    controls.addEventListener('unlock', () => {
        hud.classList.remove('active');
        if (labyrinthSection.classList.contains('active')) {
            pointerOverlay.classList.remove('hidden');
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
                : "MODO: CAMINATA (PISÁ LAS ESCALERAS)";
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

    // Bucle de renderizado y animación
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        if (!labyrinthSection.classList.contains('active')) return;

        const delta = Math.min(clock.getDelta(), 0.08);

        // 1. Mover escalones y animar las imágenes PNG de cada baranda
        escalators.forEach(esc => {
            const { config, steps, height, run, animatedTextures } = esc;
            const stepDelta = (config.speed * delta * config.direction) / config.length;

            steps.forEach(step => {
                step.progress += stepDelta;
                if (step.progress > 1) step.progress -= 1;
                if (step.progress < 0) step.progress += 1;
                step.mesh.position.set(0, step.progress * height, -step.progress * run);
            });

            animatedTextures.forEach(tex => {
                tex.offset.x -= stepDelta * (tex.repeat.x || 1);
            });
        });

        // 2. Actualizar movimiento del jugador (WASD + Mouse)
        if (controls.isLocked) {
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

            coordsIndicator.textContent = `ALTURA: ${Math.max(0, camera.position.y - EYE_HEIGHT).toFixed(1)}m`;
        }

        renderer.render(scene, camera);
    }

    animate();
}
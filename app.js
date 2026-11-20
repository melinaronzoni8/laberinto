import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { glassGraphics } from './images.js';

// =========================================================
// 1. NAVEGACIÓN ENTRE SECCIÓN 1 (PORTADA) Y SECCIÓN 2 (3D)
// =========================================================
const homeSection = document.getElementById('home-section');
const labyrinthSection = document.getElementById('labyrinth-section');
const enterUniverseBtn = document.getElementById('enter-universe-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const lockBanner = document.getElementById('lock-banner');
const universeCanvas = document.getElementById('universe-canvas');
const modeIndicator = document.getElementById('mode-indicator');
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
    labyrinthSection.classList.remove('active');
    homeSection.classList.add('active');
});

// =========================================================
// 2. CONSTRUCCIÓN DEL UNIVERSO 3D DE ESCALERAS MECÁNICAS
// =========================================================
function buildEscalatorUniverse() {
    const EYE_HEIGHT = 1.75;
    const ANGLE = Math.PI / 6; // Inclinación 30 grados

    // Escena y atmósfera monumental
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070b);
    scene.fog = new THREE.FogExp2(0x06070b, 0.011);

    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 320);
    camera.position.set(0, EYE_HEIGHT, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    universeCanvas.appendChild(renderer.domElement);

    // Iluminación arquitectónica de alto contraste + neón
    scene.add(new THREE.AmbientLight(0xdce6f2, 0.75));

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(22, 70, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    const d = 65;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    const cyanGlow = new THREE.PointLight(0x05d9e8, 55, 65);
    cyanGlow.position.set(-16, 15, -18);
    scene.add(cyanGlow);

    const pinkGlow = new THREE.PointLight(0xff2a6d, 55, 65);
    pinkGlow.position.set(16, 22, -30);
    scene.add(pinkGlow);

    const topCyanGlow = new THREE.PointLight(0x05d9e8, 50, 70);
    topCyanGlow.position.set(0, 34, -36);
    scene.add(topCyanGlow);

    // Materiales brutalistas y cromados
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x22252d, roughness: 0.85, metalness: 0.15 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x929ca8, roughness: 0.25, metalness: 0.88 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x101216, roughness: 0.4, metalness: 0.85 });
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x2f353e, roughness: 0.3, metalness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xbbe2f0,
        transparent: true,
        opacity: 0.26,
        roughness: 0.08,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Suelo con retícula luminosa
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), concreteMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(300, 120, 0x05d9e8, 0x1a1e26);
    grid.position.y = 0.02;
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    scene.add(grid);

    // Columnas gigantes y pasarelas aéreas en 5 niveles
    const walkablePlatforms = [];
    const pillarGeo = new THREE.BoxGeometry(2.5, 95, 2.5);

    [
        [-20, -2], [20, -2],
        [-20, -20], [20, -20],
        [-20, -38], [20, -38],
        [-20, -56], [20, -56],
        [-34, -12], [34, -12],
        [-34, -32], [34, -32],
        [-34, -52], [34, -52]
    ].forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, concreteMat);
        pillar.position.set(x, 47.5, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
    });

    // 5 pisos de balcones y puentes que conectan el laberinto
    for (let lvl = 1; lvl <= 5; lvl++) {
        const y = lvl * 7;

        [-26, 26].forEach(x => {
            const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.7, 88), concreteMat);
            deck.position.set(x, y - 0.35, -28);
            deck.receiveShadow = true;
            scene.add(deck);

            walkablePlatforms.push({ minX: x - 4, maxX: x + 4, minZ: -72, maxZ: 16, y });

            const led = new THREE.Mesh(
                new THREE.BoxGeometry(0.14, 0.14, 88),
                new THREE.MeshBasicMaterial({ color: lvl % 2 === 0 ? 0x05d9e8 : 0xff2a6d })
            );
            led.position.set(x > 0 ? x - 4 : x + 4, y, -28);
            scene.add(led);
        });

        [-14, -30, -46].forEach(zBridge => {
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(44, 0.65, 4.5), steelMat);
            bridge.position.set(0, y - 0.325, zBridge);
            bridge.receiveShadow = true;
            scene.add(bridge);

            walkablePlatforms.push({
                minX: -22, maxX: 22,
                minZ: zBridge - 2.25, maxZ: zBridge + 2.25,
                y
            });
        });
    }

    // 24 escaleras mecánicas de todo tipo: de frente, cruzadas, laterales, invertidas y lejanas
    const escalatorDefs = [
        // Nivel 0 -> 1 (De frente al entrar: una sube, una baja)
        { id: 1,  x: -3.6, y: 0,  z: 0,   rotY: 0,            length: 14, width: 2.5, direction: 1,  speed: 1.8, neon: 0x05d9e8 },
        { id: 2,  x: 3.6,  y: 0,  z: 0,   rotY: 0,            length: 14, width: 2.5, direction: -1, speed: 2.1, neon: 0xff2a6d },

        // Nivel 1 -> 2 (Continuación central cruzada)
        { id: 3,  x: -3.6, y: 7,  z: -16, rotY: 0,            length: 14, width: 2.5, direction: 1,  speed: 1.7, neon: 0xff2a6d },
        { id: 4,  x: 3.6,  y: 7,  z: -16, rotY: 0,            length: 14, width: 2.5, direction: -1, speed: 2.2, neon: 0x05d9e8 },

        // Laterales de perfil (Nivel 0 y Nivel 1)
        { id: 5,  x: -9.5, y: 0,  z: -14, rotY: Math.PI / 2,  length: 14, width: 2.4, direction: 1,  speed: 1.6, neon: 0xffffff },
        { id: 6,  x: 9.5,  y: 0,  z: -14, rotY: -Math.PI / 2, length: 14, width: 2.4, direction: -1, speed: 1.9, neon: 0x05d9e8 },
        { id: 7,  x: -9.5, y: 7,  z: -30, rotY: Math.PI / 2,  length: 14, width: 2.4, direction: 1,  speed: 1.5, neon: 0xff2a6d },
        { id: 8,  x: 9.5,  y: 7,  z: -30, rotY: -Math.PI / 2, length: 14, width: 2.4, direction: -1, speed: 2.0, neon: 0xffffff },

        // Nivel 2 -> 3 (Invertidas mirándote de frente desde las alturas)
        { id: 9,  x: -4.2, y: 14, z: -28, rotY: Math.PI,      length: 14, width: 2.6, direction: 1,  speed: 1.6, neon: 0x05d9e8 },
        { id: 10, x: 4.2,  y: 14, z: -28, rotY: Math.PI,      length: 14, width: 2.6, direction: -1, speed: 2.1, neon: 0xff2a6d },

        // Nivel 3 -> 4 (Tramo monumental central y diagonales)
        { id: 11, x: 0,    y: 21, z: -16, rotY: 0,            length: 14, width: 3.0, direction: 1,  speed: 1.4, neon: 0xffffff },
        { id: 12, x: -8,   y: 21, z: -32, rotY: Math.PI / 4,  length: 14, width: 2.3, direction: -1, speed: 1.7, neon: 0x05d9e8 },
        { id: 13, x: 8,    y: 21, z: -32, rotY: -Math.PI / 4, length: 14, width: 2.3, direction: 1,  speed: 1.5, neon: 0xff2a6d },

        // Nivel 4 -> 5 (Cúpula superior)
        { id: 14, x: -4,   y: 28, z: -32, rotY: 0,            length: 14, width: 2.8, direction: -1, speed: 1.6, neon: 0x05d9e8 },
        { id: 15, x: 4,    y: 28, z: -32, rotY: 0,            length: 14, width: 2.8, direction: 1,  speed: 1.8, neon: 0xff2a6d },

        // Estructuras profundas y laterales lejanas para perspectiva infinita
        { id: 16, x: -15,  y: 14, z: -42, rotY: -Math.PI / 3, length: 16, width: 2.3, direction: 1,  speed: 1.9, neon: 0xffffff },
        { id: 17, x: 15,   y: 14, z: -42, rotY: Math.PI / 3,  length: 16, width: 2.3, direction: -1, speed: 1.5, neon: 0xff2a6d },
        { id: 18, x: -16,  y: 0,  z: -34, rotY: 0,            length: 14, width: 2.2, direction: 1,  speed: 2.0, neon: 0x05d9e8 },
        { id: 19, x: 16,   y: 0,  z: -34, rotY: 0,            length: 14, width: 2.2, direction: -1, speed: 1.4, neon: 0xff2a6d },
        { id: 20, x: -16,  y: 7,  z: -48, rotY: 0,            length: 14, width: 2.2, direction: -1, speed: 1.7, neon: 0xffffff },
        { id: 21, x: 16,   y: 7,  z: -48, rotY: 0,            length: 14, width: 2.2, direction: 1,  speed: 1.6, neon: 0x05d9e8 },
        { id: 22, x: -5,   y: 14, z: -48, rotY: Math.PI,      length: 14, width: 2.5, direction: 1,  speed: 2.1, neon: 0xff2a6d },
        { id: 23, x: 5,    y: 14, z: -48, rotY: Math.PI,      length: 14, width: 2.5, direction: -1, speed: 1.3, neon: 0x05d9e8 },
        { id: 24, x: 0,    y: 28, z: -48, rotY: Math.PI,      length: 16, width: 3.2, direction: 1,  speed: 1.5, neon: 0xffffff }
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

        // Chasis metálico inferior
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

        // Barandas de vidrio + Imágenes PNG centradas sin estirarse
        const railHeight = 1.1;
        const animatedMeshes = [];
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
                new THREE.BoxGeometry(cfg.length + 0.4, 0.1, 0.14),
                darkMetalMat
            );
            handrail.position.set(0, railHeight / 2 + 0.04, 0);
            railContainer.add(handrail);

            // Tira LED neón en la base
            const ledStrip = new THREE.Mesh(
                new THREE.BoxGeometry(cfg.length, 0.06, 0.08),
                new THREE.MeshBasicMaterial({ color: cfg.neon })
            );
            ledStrip.position.set(0, -railHeight / 2, 0);
            railContainer.add(ledStrip);

            // Imagen PNG centrada exacta sin estirarse ni repetirse
            const pngPath = gfx ? (isLeft ? gfx.leftImage : gfx.rightImage) : null;
            if (pngPath) {
                const maxPanelW = cfg.length * 0.94;
                const maxPanelH = railHeight * 0.86;

                textureLoader.load(
                    pngPath,
                    (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        tex.wrapS = THREE.ClampToEdgeWrapping;
                        tex.wrapT = THREE.ClampToEdgeWrapping;

                        const imgAspect = tex.image.width / tex.image.height;
                        const scale = gfx.scale || 0.85;

                        // Calcula el ancho y alto reales manteniendo la proporción exacta del PNG
                        let meshH = maxPanelH * scale;
                        let meshW = meshH * imgAspect;

                        // Si el PNG es muy ancho y supera el largo de la escalera, lo ajusta proporcionalmente
                        if (meshW > maxPanelW * scale) {
                            meshW = maxPanelW * scale;
                            meshH = meshW / imgAspect;
                        }

                        const decalMat = new THREE.MeshBasicMaterial({
                            map: tex,
                            transparent: true,
                            side: THREE.DoubleSide,
                            depthWrite: false
                        });

                        const decalMesh = new THREE.Mesh(
                            new THREE.PlaneGeometry(meshW, meshH),
                            decalMat
                        );

                        // Centrado en el medio exacto del vidrio (0, 0)
                        decalMesh.position.set(0, 0, sideSign * 0.018);
                        railContainer.add(decalMesh);

                        if (gfx.moveWithBelt !== false) {
                            animatedMeshes.push({
                                mesh: decalMesh,
                                travelSpan: maxPanelW - meshW
                            });
                        }
                    },
                    undefined,
                    () => console.warn("Falta subir el archivo PNG:", pngPath)
                );
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

    // Controles WASD + Mouse
    controls = new PointerLockControls(camera, document.body);

    controls.addEventListener('lock', () => {
        lockBanner.classList.add('hidden');
    });

    controls.addEventListener('unlock', () => {
        if (labyrinthSection.classList.contains('active')) {
            lockBanner.classList.remove('hidden');
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
                : "MODO: CAMINATA FÍSICA (PISÁ LAS ESCALERAS)";
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

            animatedMeshes.forEach(item => {
                if (item.travelSpan > 0.2) {
                    const halfSpan = item.travelSpan / 2;
                    item.mesh.position.x += config.speed * delta * config.direction;
                    if (item.mesh.position.x > halfSpan) item.mesh.position.x = -halfSpan;
                    if (item.mesh.position.x < -halfSpan) item.mesh.position.x = halfSpan;
                }
            });
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

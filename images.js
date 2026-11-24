/**
 * =========================================================================
 * CONFIGURACIÓN DE IMÁGENES PNG EN LAS BARANDAS DE CADA ESCALERA
 * =========================================================================
 *
 * Hay 50 escaleras (10 por nivel). Cada una tiene dos barandas de vidrio.
 *
 * TODAS las escaleras llevan imagen automáticamente: se van repartiendo los
 * archivos de IMAGE_FILES en orden (escalera 1 usa 01 y 02, la 2 usa 03 y 04,
 * etc.). Para cambiar una escalera en particular, agregala en glassGraphics.
 *
 * Opciones de cada escalera (todas opcionales):
 * - leftImage:    PNG de la baranda IZQUIERDA (null = sin imagen)
 * - rightImage:   PNG de la baranda DERECHA (null = sin imagen)
 * - moveWithBelt: true  = la imagen se desliza por el vidrio junto con los escalones
 *                 false = queda fija
 * - repeatX:      cuántas copias de la imagen entran a lo largo del vidrio (1, 2, 3...)
 * - scale:        qué parte del ALTO del vidrio ocupa la imagen (1 = 100%, 0.85 = 85%)
 *
 * La imagen nunca se estira: mantiene su proporción y, si sobra lugar,
 * queda espacio transparente a los costados.
 */

// Lista de imágenes que se reparten automáticamente.
// Reemplazá estos PNG en assets/ por imágenes distintas (con fondo transparente).
export const IMAGE_FILES = [
    "assets/imagen-01.png",
    "assets/imagen-02.png",
    "assets/imagen-03.png",
    "assets/imagen-04.png",
    "assets/imagen-05.png",
    "assets/imagen-06.png",
    "assets/imagen-07.png",
    "assets/imagen-08.png"
];

// Valores por defecto para las escaleras que no cambies abajo
export const defaultGlass = {
    moveWithBelt: true,
    repeatX: 1,
    scale: 0.85
};

// Escaleras con configuración propia (pisan los valores automáticos)
export const glassGraphics = {
    1: {
        leftImage: "assets/imagen-01.png",
        rightImage: "assets/imagen-02.png",
        moveWithBelt: false, // queda fija
        scale: 1             // ocupa el 100% del alto del vidrio
    },
    3: { repeatX: 2 },
    5: { rightImage: null },
    6: { leftImage: null },
    9: { repeatX: 2 }
    // Ejemplo para agregar otra:
    // 12: { leftImage: "assets/imagen-07.png", rightImage: "assets/imagen-03.png", repeatX: 2 },
};

// Devuelve la configuración final de una escalera (no hace falta tocar esto)
export function getGlassConfig(id) {
    const n = IMAGE_FILES.length;
    const custom = glassGraphics[id] || {};
    return {
        ...defaultGlass,
        leftImage: n ? IMAGE_FILES[(2 * (id - 1)) % n] : null,
        rightImage: n ? IMAGE_FILES[(2 * (id - 1) + 1) % n] : null,
        ...custom
    };
}

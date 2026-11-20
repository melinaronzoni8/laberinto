/**
 * =========================================================================
 * CONFIGURACIÓN DE IMÁGENES PNG EN LAS BARANDAS DE CADA ESCALERA
 * =========================================================================
 * 
 * Cada escalera tiene un número (del 1 al 24) y dos barandas de vidrio:
 * - leftImage:  Ruta al archivo PNG para la baranda IZQUIERDA (o null)
 * - rightImage: Ruta al archivo PNG para la baranda DERECHA (o null)
 * - moveWithBelt: true (se desliza por el vidrio junto con los escalones)
 *                 false (queda fija pegada en el vidrio)
 * - repeatX: Cuántas veces se repite tu imagen a lo largo del vidrio (ej: 1, 2, 3)
 */

export const glassGraphics = {
    1: {
        leftImage: "assets/imagen-01.png",
        rightImage: "assets/imagen-02.png",
        moveWithBelt: true,
        repeatX: 1
    },
    2: {
        leftImage: "assets/imagen-02.png",
        rightImage: "assets/imagen-03.png",
        moveWithBelt: true,
        repeatX: 1
    },
    3: {
        leftImage: "assets/imagen-03.png",
        rightImage: "assets/imagen-01.png",
        moveWithBelt: true,
        repeatX: 2
    },
    4: {
        leftImage: "assets/imagen-01.png",
        rightImage: "assets/imagen-02.png",
        moveWithBelt: true,
        repeatX: 1
    },
    5: {
        leftImage: "assets/imagen-02.png",
        rightImage: null,
        moveWithBelt: true,
        repeatX: 1
    },
    6: {
        leftImage: null,
        rightImage: "assets/imagen-03.png",
        moveWithBelt: true,
        repeatX: 1
    },
    9: {
        leftImage: "assets/imagen-01.png",
        rightImage: "assets/imagen-02.png",
        moveWithBelt: true,
        repeatX: 2
    },
    10: {
        leftImage: "assets/imagen-03.png",
        rightImage: "assets/imagen-01.png",
        moveWithBelt: true,
        repeatX: 1
    }
    // Podés agregar cualquier escalera del 1 al 24 copiando el mismo bloque
};

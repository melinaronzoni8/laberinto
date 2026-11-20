/**
 * =========================================================================
 * CONFIGURACIÓN DE IMÁGENES PNG POR BARANDA DE CADA ESCALERA (1 a 24)
 * =========================================================================
 * 
 * - leftImage:    Ruta al PNG de la baranda IZQUIERDA (o null)
 * - rightImage:   Ruta al PNG de la baranda DERECHA (o null)
 * - moveWithBelt: true (acompaña el movimiento y dirección de la escalera)
 *                 false (queda fija pegada al vidrio)
 * - repeatX:      Cuántas veces se repite el PNG a lo largo del vidrio (1, 2, 3...)
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
        rightImage: "assets/imagen-03.png",
        moveWithBelt: true,
        repeatX: 1
    },
    6: {
        leftImage: "assets/imagen-01.png",
        rightImage: "assets/imagen-01.png",
        moveWithBelt: false,
        repeatX: 1
    }
    // Podés seguir agregando del 7 al 24 con el mismo formato
};
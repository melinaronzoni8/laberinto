/**
 * =========================================================================
 * CONFIGURACIÓN DE IMÁGENES PNG POR BARANDA DE CADA ESCALERA
 * =========================================================================
 * 
 * Cada escalera (del 1 al 18) tiene dos barandas de vidrio:
 * - leftImage:  Ruta al PNG que va en la baranda IZQUIERDA (o null si va limpia)
 * - rightImage: Ruta al PNG que va en la baranda DERECHA (o null si va limpia)
 * - moveWithBelt: true  -> La imagen se desplaza por el vidrio al ritmo exacto de la escalera
 *                 false -> La imagen queda fija pegada en el vidrio
 * - repeatX: Cuántas veces se repite el gráfico a lo largo del vidrio (ej: 1, 2, 3)
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
        rightImage: null,
        moveWithBelt: true,
        repeatX: 1
    },
    5: {
        leftImage: "assets/imagen-02.png",
        rightImage: "assets/imagen-02.png",
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
        rightImage: "assets/imagen-03.png",
        moveWithBelt: true,
        repeatX: 2
    }
    // Podés seguir agregando del 7 al 18 con el mismo formato
};
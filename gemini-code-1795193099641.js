/**
 * CONFIGURACIÓN DE IMÁGENES PNG EN LAS BARANDAS DE VIDRIO
 * 
 * - escalatorId: Número de la escalera (del 1 al 16)
 * - image: Ruta de tu archivo PNG (ej: "assets/mi-imagen.png")
 * - side: "left" (baranda izquierda), "right" (baranda derecha) o "both" (ambas)
 * - moveWithBelt: true (la imagen se desliza por el vidrio junto con la escalera)
 *                 false (la imagen queda fija en el vidrio)
 * - repeatX: Cantidad de repeticiones a lo largo de la baranda (1, 2, 3...)
 */

export const escalatorImages = [
    {
        escalatorId: 1,
        image: "assets/imagen-01.png",
        side: "both",
        moveWithBelt: true,
        repeatX: 1
    },
    {
        escalatorId: 2,
        image: "assets/imagen-02.png",
        side: "both",
        moveWithBelt: true,
        repeatX: 1
    },
    {
        escalatorId: 3,
        image: "assets/imagen-03.png",
        side: "left",
        moveWithBelt: true,
        repeatX: 2
    },
    {
        escalatorId: 5,
        image: "assets/imagen-01.png",
        side: "both",
        moveWithBelt: true,
        repeatX: 1
    },
    {
        escalatorId: 7,
        image: "assets/imagen-02.png",
        side: "right",
        moveWithBelt: false,
        repeatX: 1
    }
];
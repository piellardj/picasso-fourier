/**
 * Class for instancing and using a 2D HTML Canvas.
 */
class Canvas2D {
    public readonly context: CanvasRenderingContext2D;
    private readonly canvas: HTMLCanvasElement;

    public constructor(canvasElementId: string) {
        this.canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d");
    }

    public adjustSize(): void {
        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export {
    Canvas2D,
};

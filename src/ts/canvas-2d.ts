import { Point } from "./point";

const TWO_PI = 2 * Math.PI;

/**
 * Class for instancing and using a 2D HTML Canvas.
 */
class Canvas2D {
    public readonly context: CanvasRenderingContext2D;

    private readonly canvas: HTMLCanvasElement;
    private isDrawingLine: boolean = false;
    private nbPointsInLine: number = 0;

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

    public drawCircle(center: Point, radius: number): void {
        if (radius > 0.5) {
            this.context.beginPath();
            this.context.arc(center.x, center.y, radius, 0, TWO_PI);
            this.context.closePath();
            this.context.stroke();
        }
    }

    public startLine(): void {
        if (this.isDrawingLine) {
            this.endLine();
        }

        this.context.beginPath();
        this.isDrawingLine = true;
        this.nbPointsInLine = 0;
    }

    public addPointToLine(point: Point): void {
        if (this.nbPointsInLine === 0) {
            this.context.moveTo(point.x, point.y);
        } else {
            this.context.lineTo(point.x, point.y);
        }

        this.nbPointsInLine++;
    }

    public endLine(): void {
        if (this.isDrawingLine) {
            this.context.stroke();
            this.context.closePath();
            this.isDrawingLine = false;
        }
    }

    public download(filename: string): void {
        if ((this.canvas as any).msToBlob) { // for IE
            const blob = (this.canvas as any).msToBlob();
            window.navigator.msSaveBlob(blob, filename);
        } else {
            this.canvas.toBlob((blob: Blob | null) => {
                if (blob !== null) {
                    const link = document.createElement("a");
                    link.download = filename;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                }
            });
        }
    }
}

export {
    Canvas2D,
};

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

    private viewportZoom: number;
    private viewportCenter: Point; // point that should be at the center of the viewport
    private viewportHalfWidth: number;
    private viewportHalfHeight: number;

    public constructor(canvasElementId: string) {
        this.canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d");

        this.viewportZoom = 1;
        this.viewportCenter = { x: 0, y: 0 };
        this.viewportHalfWidth = 0.5 * this.canvas.width;
        this.viewportHalfHeight = 0.5 * this.canvas.height;
    }

    public set center(p: Point) {
        this.viewportCenter.x = p.x;
        this.viewportCenter.y = p.y;
    }

    public set zoom(z: number) {
        this.viewportZoom = z;
    }

    public setFullViewport(): void {
        this.viewportZoom = 1;
        this.viewportCenter.x = this.viewportHalfWidth;
        this.viewportCenter.y = this.viewportHalfHeight;
    }

    public adjustSize(): void {
        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.viewportHalfWidth = 0.5 * this.canvas.width;
            this.viewportHalfHeight = 0.5 * this.canvas.height;
        }
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawCircle(center: Point, radius: number): void {
        const visibleRadius = this.viewportZoom * radius;
        const x = this.viewportZoom * (center.x - this.viewportCenter.x) + this.viewportHalfWidth;
        const y = this.viewportZoom * (center.y - this.viewportCenter.y) + this.viewportHalfHeight;

        if (visibleRadius > 0.5) {
            this.context.beginPath();
            this.context.arc(x, y, visibleRadius, 0, TWO_PI);
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
        const x = this.viewportZoom * (point.x - this.viewportCenter.x) + this.viewportHalfWidth;
        const y = this.viewportZoom * (point.y - this.viewportCenter.y) + this.viewportHalfHeight;

        if (this.nbPointsInLine === 0) {
            this.context.moveTo(x, y);
        } else {
            this.context.lineTo(x, y);
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

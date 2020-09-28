import { Point } from "./point";

import "./page-interface-generated";

const TWO_PI = 2 * Math.PI;

/**
 * Class for instancing and using a 2D HTML Canvas.
 */
class Canvas2D {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly cssPixel: number;

    private wantedLineWidth: number = 1;
    private isDrawingLine: boolean = false;
    private nbPointsInLine: number = 0;

    private viewportZoom: number;
    private viewportCenter: Point; // point that should be at the center of the viewport

    private scale: number;
    private translateX: number;
    private translateY: number;

    public constructor() {
        this.canvas = Page.Canvas.getCanvas();
        this.context = this.canvas.getContext("2d");
        this.cssPixel = window.devicePixelRatio ?? 1;

        this.viewportZoom = 1;
        this.viewportCenter = { x: 0, y: 0 };
        this.precomputeTransformation();
    }

    public set center(p: Point) {
        this.viewportCenter.x = p.x;
        this.viewportCenter.y = p.y;
        this.precomputeTransformation();
    }

    public set zoom(z: number) {
        this.viewportZoom = z;
        this.precomputeTransformation();
    }

    public setFullViewport(): void {
        this.viewportZoom = 1;
        this.viewportCenter.x = 0.5 * this.canvas.width / this.cssPixel;
        this.viewportCenter.y = 0.5 * this.canvas.height / this.cssPixel;
        this.precomputeTransformation();
    }

    public set lineWidth(width: number) {
        this.wantedLineWidth = this.cssPixel * width;
        this.context.lineWidth = this.wantedLineWidth;
    }

    public set strokeStyle(style: string) {
        this.context.strokeStyle = style;
    }

    public adjustSize(): void {
        const actualWidth = Math.floor(this.cssPixel * this.canvas.clientWidth);
        const actualHeight = Math.floor(this.cssPixel * this.canvas.clientHeight);

        if (this.canvas.width !== actualWidth || this.canvas.height !== actualHeight) {
            this.canvas.width = actualWidth;
            this.canvas.height = actualHeight;
            this.setFullViewport();
        }
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawCircle(center: Point, radius: number): void {
        const visibleRadius = this.viewportZoom * radius;
        const x = this.scale * center.x + this.translateX;
        const y = this.scale * center.y + this.translateY;

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

        this.context.lineWidth = this.wantedLineWidth;
        this.context.beginPath();
        this.isDrawingLine = true;
        this.nbPointsInLine = 0;
    }

    public addPointToLine(point: Point): void {
        const x = this.scale * point.x + this.translateX;
        const y = this.scale * point.y + this.translateY;

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

    private precomputeTransformation(): void {
        this.scale = this.cssPixel * this.viewportZoom;
        this.translateX = this.cssPixel * (-this.viewportZoom * this.viewportCenter.x) + 0.5 * this.canvas.width;
        this.translateY = this.cssPixel * (-this.viewportZoom * this.viewportCenter.y) + 0.5 * this.canvas.height;
    }
}

export {
    Canvas2D,
};

import IPoint from "./point";

/**
 * Class for drawing a 2D line.
 * The line is paramaterized by a variable t in [0, 1].
 */
class Line {
    private readonly points: IPoint[];
    private readonly nbSegments: number;

    public constructor(points: IPoint[]) {
        if (points.length < 2) {
            throw "A line must have at least 2 points.";
        }

        this.points = points;
        this.nbSegments = points.length -  1;
    }

    /**
     * Draws the line portion between 0 and t.
     */
    public draw(context: CanvasRenderingContext2D, t: number): void {
        t = Math.min(1, Math.max(0, t)); // clamp t between 0 and 1

        const targetPointIndex = t * this.nbSegments;
        const nbOfFullSegments = Math.floor(targetPointIndex);

        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 0; i < nbOfFullSegments; i++) {
            context.lineTo(this.points[i + 1].x, this.points[i + 1].y);
        }

        if (nbOfFullSegments < this.nbSegments) {
            const lastSectionPortion = targetPointIndex % 1;
            const lastX = Line.interpolate(this.points[nbOfFullSegments].x, this.points[nbOfFullSegments + 1].x, lastSectionPortion);
            const lastY = Line.interpolate(this.points[nbOfFullSegments].y, this.points[nbOfFullSegments + 1].y, lastSectionPortion);
            context.lineTo(lastX, lastY);
        }

        context.stroke();
        context.closePath();
    }

    private static interpolate(a: number, b: number, x: number): number {
        return a * (1 -x) + b * x;
    }
}

export default Line;

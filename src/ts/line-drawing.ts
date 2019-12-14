type Point = {
    x: number;
    y: number;
}

class LineDrawing {
    private points: Point[];

    public constructor() {
        this.points = [];
        this.points.push({ x: 100, y: 100 });
        this.points.push({ x: 400, y: 100 });
        this.points.push({ x: 400, y: 400 });
        this.points.push({ x: 100, y: 400 });
    }

    /* Assumes t is between 0 and 1 included. */
    public draw(context: CanvasRenderingContext2D, t: number) {
        context.beginPath();

        context.moveTo(this.points[0].x, this.points[0].y);

        if (t < 0.33) {
            const dest = LineDrawing.interpolate(this.points[0], this.points[1], t * 3);
            context.lineTo(dest.x, dest.y);
        } else {
            context.lineTo(this.points[1].x, this.points[1].y);

            if (t < 0.66) {
                const dest = LineDrawing.interpolate(this.points[1], this.points[2], (t - 0.33) * 3);
                context.lineTo(dest.x, dest.y);
            } else {
                context.lineTo(this.points[2].x, this.points[2].y);

                const dest = LineDrawing.interpolate(this.points[2], this.points[3], (t - 0.66) * 3);
                context.lineTo(dest.x, dest.y);
            }
        }

        context.stroke();
    }

    /* Assumes t is between 0 and 1 included. */
    private static interpolate(p1: Point, p2: Point, t: number): Point {
        return {
            x: p1.x * (1 - t) + p2.x * t,
            y: p1.y * (1 - t) + p2.y * t,
        };
    }
}

export default LineDrawing;
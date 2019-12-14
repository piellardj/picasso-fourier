import { FourierCoefficient, FourierSeries } from "./fourier-series";
import Point from "./point";

class LineDrawing {
    private readonly points: Point[];
    private readonly nbPoints: number;

    public constructor() {
        this.points = [];

        const N = 50;
        const R = 100;
        const C = 200;
        for (let i = 0; i < N; i++) {
            const angle = 2 * Math.PI * i / N;
            this.points.push({
                x: C + R * Math.cos(angle) + 50 * Math.cos(2 * angle),
                y: C + R * Math.sin(angle) + 50 * Math.cos(2 * angle),
            });
        }
        this.points.push({
            x: C + R + 50,
            y: C + 0,
        });

        // this.points.push({ x: 100, y: 100 });
        // this.points.push({ x: 400, y: 100 });
        // this.points.push({ x: 100, y: 400 });
        // this.points.push({ x: 100, y: 100 });

        this.nbPoints = this.points.length - 1;
    }

    /* Assumes t is between 0 and 1 included. */
    public draw(context: CanvasRenderingContext2D, t: number) {
        context.beginPath();

        context.moveTo(this.points[0].x, this.points[0].y);

        const fullUntil = Math.floor(t * this.nbPoints);
        for (let i = 0; i <= fullUntil; i++) {
            context.lineTo(this.points[i].x, this.points[i].y);
        }

        const finalPoint = this.computePoint(t);
        context.lineTo(finalPoint.x, finalPoint.y);

        context.stroke();
        context.closePath();
    }

    public computeFourierSeries(order: number): FourierSeries {
        const integrationPrecision = 1000;
        const precision = 1 / integrationPrecision;

        /* Precompute function samples to avoid computing them for each coefficient. */
        type FunctionSample = {
            x: number,
            y: number,
            two_pi_t: number, // t is where the drawing was evaluated
        };
        const samples: FunctionSample[] = [];
        for (let i = 0; i < integrationPrecision; i++) {
            const t = (i + 0.5) * precision;
            const point = this.computePoint(t);
            samples.push({
                x: point.x,
                y: point.y,
                two_pi_t: 2 * Math.PI * t,
            });
        }

        const coefficients: FourierCoefficient[] = [];
        for (let i = 0; i < 2 * order + 1; i++) {
            let n = Math.floor((i + 1) / 2);
            if (i > 0 && i % 2 === 0) {
                n *= -1;
            }

            let cx = 0, cy = 0;
            for (const sample of samples) {
                const two_pi_n_t = n * sample.two_pi_t;
                const cos = Math.cos(two_pi_n_t);
                const sin = Math.sin(two_pi_n_t);

                cx += precision * (sample.x * cos + sample.y * sin);
                cy += precision * (sample.y * cos - sample.x * sin);
            }

            coefficients.push({
                magnitude: Math.sqrt(cx * cx + cy * cy),
                phase: Math.atan2(cy, cx),
                n,
            });
        }

        return new FourierSeries(coefficients);
    }

    /* Assumes t is between 0 and 1 included. */
    private computePoint(t: number): Point {
        const index = t * this.nbPoints;
        const floorIndex = Math.floor(index);

        return LineDrawing.interpolate(this.points[floorIndex], this.points[floorIndex + 1], index - floorIndex);
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
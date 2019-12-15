import { FourierSeries, IFourierCoefficient } from "./fourier-series";
import IPoint from "./point";
import * as Presets from "./presets";

class LineDrawing {
    /* Assumes t is between 0 and 1 included. */
    private static interpolate(p1: IPoint, p2: IPoint, t: number): IPoint {
        return {
            x: p1.x * (1 - t) + p2.x * t,
            y: p1.y * (1 - t) + p2.y * t,
        };
    }

    private readonly points: IPoint[];
    private readonly nbPoints: number;
    private readonly pathLength: number;

    public constructor() {
        this.points = [];

        this.points = Presets.Dog;
        this.nbPoints = this.points.length - 1;

        this.pathLength = 0;
        let diffX;
        let diffY;
        for (let i = 0; i < this.points.length - 2; i++) {
            diffX = this.points[i].x - this.points[i + 1].x;
            diffY = this.points[i].y - this.points[i + 1].y;
            this.pathLength += Math.sqrt(diffX * diffX + diffY * diffY);
        }
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
        const integrationPrecision = Math.ceil(this.pathLength);
        const precision = 1 / integrationPrecision;

        /* Precompute function samples to avoid computing them for each coefficient. */
        interface IFunctionSample {
            x: number;
            y: number;
            two_pi_t: number; // t is where the drawing was evaluated
        }

        const samples: IFunctionSample[] = [];
        for (let i = 0; i < integrationPrecision; i++) {
            const t = (i + 0.5) * precision;
            const point = this.computePoint(t);
            samples.push({
                x: point.x,
                y: point.y,
                two_pi_t: 2 * Math.PI * t,
            });
        }

        const coefficients: IFourierCoefficient[] = [];
        for (let i = 0; i < 2 * order + 1; i++) {
            let n = Math.floor((i + 1) / 2);
            if (i > 0 && i % 2 === 0) {
                n *= -1;
            }

            let cx = 0;
            let cy = 0;
            for (const sample of samples) {
                const TWO_PI_N_T = n * sample.two_pi_t;
                const cos = Math.cos(TWO_PI_N_T);
                const sin = Math.sin(TWO_PI_N_T);

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
    private computePoint(t: number): IPoint {
        const index = t * this.nbPoints;
        const floorIndex = Math.floor(index);

        return LineDrawing.interpolate(this.points[floorIndex], this.points[floorIndex + 1], index - floorIndex);
    }
}

export default LineDrawing;

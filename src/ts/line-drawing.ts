import { FourierSeries, IFourierCoefficient } from "./fourier-series";
import { Parameters } from "./parameters";
import IPoint from "./point";

import Log from "./log";
import StopWatch from "./stopwatch";

class LineDrawing {
    /* Assumes t is between 0 and 1 included. */
    private static interpolate(p1: IPoint, p2: IPoint, t: number): IPoint {
        return {
            x: p1.x * (1 - t) + p2.x * t,
            y: p1.y * (1 - t) + p2.y * t,
        };
    }

    private static distance(p1: IPoint, p2: IPoint): number {
        const dX = p1.x - p2.x;
        const dY = p1.y - p2.y;
        return Math.sqrt(dX * dX + dY * dY);
    }

    public readonly pathLength: number; // length of the input path
    private readonly points: IPoint[];
    private readonly extendedPathLength: number; // length of the actual path, potentially extended to make it periodic

    public constructor(points: IPoint[]) {
        this.points = points;

        this.pathLength = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            this.pathLength += LineDrawing.distance(this.points[i], this.points[i + 1]);
        }

        this.extendedPathLength = this.pathLength;

        // For Fourier series computing, artificially make the path periodic
        const firstPoint = this.points[0];
        const lastPoint = this.points[this.points.length - 1];
        if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
            this.extendedPathLength += LineDrawing.distance(lastPoint, firstPoint);
            this.points.push({
                x: firstPoint.x,
                y: firstPoint.y,
            });
        }
    }

    /* Assumes t is between 0 and 1 included. */
    public draw(context: CanvasRenderingContext2D, t: number) {
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);

        t = Math.min(1, Math.max(0, t));
        const desiredLength = t * this.pathLength;

        let currentLength = 0;

        let i: number;
        for (i = 0; i < this.points.length - 1; i++) {
            const lastPoint = this.points[i];
            const nextPoint = this.points[i + 1];
            const segmentLength = LineDrawing.distance(lastPoint, nextPoint);

            if (currentLength + segmentLength < desiredLength) {
                currentLength += segmentLength;
                context.lineTo(nextPoint.x, nextPoint.y);
            } else {
                const interpolationFactor = (desiredLength - currentLength) / segmentLength;
                const finalPoint = LineDrawing.interpolate(lastPoint, nextPoint, interpolationFactor);
                context.lineTo(finalPoint.x, finalPoint.y);
                currentLength += LineDrawing.distance(lastPoint, finalPoint);
                break;
            }
        }

        context.stroke();
        context.closePath();
    }

    public computeFourierSeries(order: number): FourierSeries {
        const stopwatch = new StopWatch();

        const nbSteps = Math.ceil(Parameters.integrationPrecision * this.extendedPathLength);
        const stepSize = this.extendedPathLength / nbSteps;
        const dT = 1 / nbSteps;

        /* Precompute function samples to avoid computing them for each coefficient. */
        interface IFunctionSample {
            x: number;
            y: number;
            two_pi_t: number; // t is where the drawing was evaluated
        }

        const samples: IFunctionSample[] = [];
        {
            let currentLength = 0;
            let lastPointIndex = 0;
            for (let iStep = 0; iStep < nbSteps; iStep++) {
                const desiredT = (iStep + 0.5) * dT;
                const desiredLength = (iStep + 0.5) * stepSize;

                for (let iPoint = lastPointIndex; iPoint < this.points.length - 1; iPoint++) {
                    const lastPoint = this.points[iPoint];
                    const nextPoint = this.points[iPoint + 1];
                    const segmentLength = LineDrawing.distance(lastPoint, nextPoint);

                    if (currentLength + segmentLength < desiredLength) {
                        currentLength += segmentLength;
                        lastPointIndex = iPoint + 1;
                    } else {
                        const interpolationFactor = (desiredLength - currentLength) / segmentLength;
                        const exactPoint = LineDrawing.interpolate(lastPoint, nextPoint, interpolationFactor);
                        samples.push({
                            x: exactPoint.x,
                            y: exactPoint.y,
                            two_pi_t: 2 * Math.PI * desiredT,
                        });
                        break;
                    }
                }
            }
        }

        const coefficients: IFourierCoefficient[] = [];
        for (let i = 0; i < 2 * order + 1; i++) {
            let n = Math.floor((i + 1) / 2); // n is the index of the coefficient we're about to compute
            if (i > 0 && i % 2 === 0) {
                n *= -1;
            }

            let cx = 0;
            let cy = 0;
            for (const sample of samples) {
                const TWO_PI_N_T = n * sample.two_pi_t;
                const cos = Math.cos(TWO_PI_N_T);
                const sin = Math.sin(TWO_PI_N_T);

                cx += dT * (sample.x * cos + sample.y * sin);
                cy += dT * (sample.y * cos - sample.x * sin);
            }

            coefficients.push({
                magnitude: Math.sqrt(cx * cx + cy * cy),
                phase: Math.atan2(cy, cx),
                n,
            });
        }

        Log.message("Computed " + order + " Fourier coefficient with " +
            nbSteps + " integration steps in " + stopwatch.milliseconds + " ms.");
        return new FourierSeries(coefficients, this.pathLength / this.extendedPathLength, this.pathLength);
    }
}

export default LineDrawing;

import { Canvas2D } from "./canvas-2d";
import { FourierSeries, IFourierCoefficient } from "./fourier-series";
import * as Log from "./log";
import { Parameters } from "./parameters";
import { Point } from "./point";
import { StopWatch } from "./stopwatch";
import { SpaceUnit, TimeUnit } from "./units";

/**
 * Represents a 2D line parametrized by a 1D input.
 * The line is 1-periodic: [0,1] -> RxR.
 * The 1D input is called Time (or t).
 * The 2D output is called Space.
 */
class LineDrawing {
    public readonly pathLength: SpaceUnit; // Length of the total path in space-units
    public readonly originalPathDuration: TimeUnit; // Length of the original path in time-units
    private readonly points: Point[];

    /**
     * Builds a LineDrawing from the input points.
     * If the input is not periodic, then we extend it with a last point to make the LineDrawing periodic.
     */
    public constructor(points: Point[]) {
        this.points = points;

        let originalPathLength: SpaceUnit = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            originalPathLength += Point.distance(this.points[i], this.points[i + 1]);
        }

        let totalPathLength: SpaceUnit = originalPathLength;

        // For Fourier series computing, artificially make the path periodic
        const firstPoint = this.points[0];
        const lastPoint = this.points[this.points.length - 1];
        if (!Point.equals(firstPoint, lastPoint)) {
            totalPathLength += Point.distance(lastPoint, firstPoint);
            this.points.push(Point.copy(firstPoint));
        }

        this.pathLength = totalPathLength;
        this.originalPathDuration = originalPathLength / totalPathLength;
    }

    /**
     * Draws the line portion between 0 and t.
     * @param t Expected to be in [0, 1]
     */
    public draw(canvas: Canvas2D, t: TimeUnit): void {
        const desiredLength: SpaceUnit = t * this.pathLength;
        let currentLength: SpaceUnit = 0;

        canvas.startLine();
        canvas.addPointToLine(this.points[0]);

        for (let i = 0; i < this.points.length - 1; i++) {
            const lastPoint = this.points[i];
            const nextPoint = this.points[i + 1];
            const segmentLength = Point.distance(lastPoint, nextPoint);

            if (currentLength + segmentLength < desiredLength) {
                currentLength += segmentLength;
                canvas.addPointToLine(nextPoint);
            } else {
                const interpolationFactor = (desiredLength - currentLength) / segmentLength;
                const finalPoint = Point.interpolate(lastPoint, nextPoint, interpolationFactor);
                canvas.addPointToLine(finalPoint);
                break;
            }
        }

        canvas.endLine();
    }

    public computeFourierSeries(order: number): FourierSeries {
        const stopwatch = new StopWatch();

        const nbSteps = Math.ceil(Parameters.integrationPrecision * this.pathLength);
        const stepSize = this.pathLength / nbSteps;
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
                    const segmentLength = Point.distance(lastPoint, nextPoint);

                    if (currentLength + segmentLength < desiredLength) {
                        currentLength += segmentLength;
                        lastPointIndex = iPoint + 1;
                    } else {
                        const interpolationFactor = (desiredLength - currentLength) / segmentLength;
                        const exactPoint = Point.interpolate(lastPoint, nextPoint, interpolationFactor);
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

        Log.message(`Computed ${order} Fourier coefficient with ${nbSteps} integration steps ` +
            `in ${stopwatch.milliseconds} ms.`);
        return new FourierSeries(coefficients, this.pathLength);
    }
}

export {
    LineDrawing,
};

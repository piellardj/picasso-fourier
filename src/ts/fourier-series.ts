import Point from "./point";

type FourierCoefficient = {
    magnitude: number;
    phase: number;
    x: number;
    y: number;
}

class FourierSeries {
    private readonly _coefficientsPositive: FourierCoefficient[];
    private readonly _coefficientsNegative: FourierCoefficient[];

    public constructor(coefficientsPositive: FourierCoefficient[], coefficientsNegative: FourierCoefficient[]) {
        this._coefficientsPositive = coefficientsPositive;
        this._coefficientsNegative = coefficientsNegative;
    }

    /* Assumes t is between 0 and 1 included. */
    public computePoint(t: number): Point {
        let x = 0, y = 0;

        const TWO_PI = 2 * Math.PI;

        for (let n = 0; n < this._coefficientsPositive.length; n++) {
            const TWO_PI_N_T = TWO_PI * n * t;

            let coefficient = this._coefficientsPositive[n];
            x += coefficient.magnitude * Math.cos(TWO_PI * n * t + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI * n * t + coefficient.phase);

            if (n < this._coefficientsNegative.length) {
                coefficient = this._coefficientsNegative[n];
                x += coefficient.magnitude * Math.cos(TWO_PI * (-n - 1) * t + coefficient.phase);
                y += coefficient.magnitude * Math.sin(TWO_PI * (-n - 1) * t + coefficient.phase);
            }
        }

        return { x, y };
    }

    public drawPathToPoint(context: CanvasRenderingContext2D, t: number): void {
        let x = 0, y = 0;
        context.beginPath();
        context.moveTo(x, y);

        const TWO_PI = 2 * Math.PI;

        for (let n = 0; n < this._coefficientsPositive.length; n++) {
            const TWO_PI_N_T = TWO_PI * n * t;

            let coefficient = this._coefficientsPositive[n];
            x += coefficient.magnitude * Math.cos(TWO_PI * n * t + coefficient.phase);
            y += coefficient.magnitude * Math.sin(TWO_PI * n * t + coefficient.phase);

            if (n < this._coefficientsNegative.length) {
                coefficient = this._coefficientsNegative[n];
                x += coefficient.magnitude * Math.cos(TWO_PI * (-n - 1) * t + coefficient.phase);
                y += coefficient.magnitude * Math.sin(TWO_PI * (-n - 1) * t + coefficient.phase);
            }

            context.lineTo(x, y);
        }

        context.stroke();
        context.closePath();
    }
}

export {
    FourierCoefficient,
    FourierSeries,
};

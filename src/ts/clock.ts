import { Parameters } from "./parameters";

interface IClockCheckpoint {
    clockTime: DOMHighResTimeStamp; // in the clock temporality
    realTime: DOMHighResTimeStamp; // in the Javascript temporality
}

/**
 * This class handles the measuring of time at a variable speed.
 */
class Clock {
    private speed: number;
    private paused: boolean;

    /* This checkpoint system is used to avoid floating point approximations when computing current time. */
    private lastCheckpoint: IClockCheckpoint;

    public constructor() {
        this.speed = Parameters.speed;
        this.paused = false;
        this.lastCheckpoint = {
            clockTime: 0,
            realTime: 0,
        };

        Parameters.speedChangeObservers.push(() => this.updateSpeed());

        this.reset();
    }

    public reset(): void {
        this.paused = false;
        this.lastCheckpoint.clockTime = 0;
        this.lastCheckpoint.realTime = performance.now();
        this.updateSpeed();
    }

    public setSpeed(speed: number): void {
        this.createCheckpoint();
        this.speed = speed;
    }

    public pause(): void {
        if (!this.paused) {
            this.createCheckpoint();
            this.paused = true;
        }
    }

    public resume(): void {
        if (this.paused) {
            this.createCheckpoint();
            this.paused = false;
        }
    }

    public get isPaused(): boolean {
        return this.paused;
    }

    public get current(): DOMHighResTimeStamp {
        if (this.paused) {
            return this.lastCheckpoint.clockTime;
        }

        return this.lastCheckpoint.clockTime + this.speed * (performance.now() - this.lastCheckpoint.realTime);
    }

    private createCheckpoint(): void {
        this.lastCheckpoint.clockTime = this.current;
        this.lastCheckpoint.realTime = performance.now();
    }

    private updateSpeed(): void {
        this.setSpeed(Parameters.speed / Parameters.zoom);
    }
}

export {
    Clock,
};

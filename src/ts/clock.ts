import { Parameters } from "./parameters";

/**
 * This class handles the measuring of time at a variable speed.
 */
class Clock {
    private speed: number;
    private lastCheckpoint: DOMHighResTimeStamp;
    private lastCheckpointReal: DOMHighResTimeStamp;

    public constructor() {
        this.speed = Parameters.speed;
        Parameters.speedChangeObservers.push(() => this.setSpeed(Parameters.speed));

        this.reset();
    }

    public reset(): void {
        this.lastCheckpoint = 0;
        this.lastCheckpointReal = performance.now();
    }

    public setSpeed(speed: number): void {
        this.lastCheckpoint = this.current;
        this.lastCheckpointReal = performance.now();
        this.speed = speed;
    }

    public get current(): DOMHighResTimeStamp {
        return this.lastCheckpoint + this.speed * (performance.now() - this.lastCheckpointReal);
    }
}

export {
    Clock,
};

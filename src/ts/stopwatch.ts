class StopWatch {
    private readonly start: DOMHighResTimeStamp;

    public constructor() {
        this.start = performance.now();
    }

    public get milliseconds(): number {
        return Math.ceil(performance.now() - this.start);
    }
}

export default StopWatch;
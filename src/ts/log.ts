let enabled = true;

class Log {
    public static set enabled(e: boolean) {
        enabled = e;
    }

    public static message(m: string): void {
        if (enabled) {
            console.log(m);
        }
    }
}

export default Log;

import Log from "./log";
import IPoint from "./point";
import StopWatch from "./stopwatch";

/* Enum values must match the values of the controls */
enum EPreset {
    ARLEQUIN = "arlequin",
    BULL = "bull",
    CAMEL = "camel",
    DOG = "dog",
    DOVE = "dove",
    FLAMINGO = "flamingo",
    HORSE = "horse",
    MOUSE = "mouse",
    WOMAN1 = "woman1",
    WOMAN2 = "woman2",
}

class Presets {
    public static getPreset(preset: EPreset, callback: (array: IPoint[]) => any): void {
        const stopwatch = new StopWatch();

        if (typeof Presets.cache === "undefined") {
            Presets.cache = {};
        } else if (typeof Presets.cache[preset] !== "undefined") {
            Log.message("Retrieved preset '" + preset + "' from cache in " + stopwatch.milliseconds + " ms.");
            callback(Presets.cache[preset]);
            return;
        }

        const xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                Log.message("Downloaded preset '" + preset + "' in " + stopwatch.milliseconds + " ms.");

                const retrievedArray = Presets.tryParsePointsArray(xhr.responseText);

                if (retrievedArray) {
                    Presets.cache[preset] = retrievedArray;
                    callback(retrievedArray);
                }
            }
        });

        xhr.open("GET", "resources/" + preset + ".txt");
        xhr.send(null);
    }

    private static cache: {
        [propName: string]: IPoint[];
    };

    private static tryParsePointsArray(text: string): IPoint[] | null {
        if (!text) {
            return null;
        }

        const stopwatch = new StopWatch();

        const points: IPoint[] = [];

        const lines: string[] = text.split("\n");
        for (const line of lines) {
            const partial = line.split(" ");
            if (partial.length !== 2) {
                return null;
            }

            points.push({
                x: +partial[0],
                y: +partial[1],
            });
        }

        if (points.length <= 1) {
            return null;
        }

        Log.message("Parsed preset in " + stopwatch.milliseconds + " ms.");
        return points;
    }
}

export {
    EPreset,
    Presets,
};

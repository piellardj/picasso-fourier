import * as Log from "./log";
import { Point } from "./point";
import { StopWatch } from "./stopwatch";

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

const PRESET_SIZE = 512; // a preset should be dimensionned for a 512 x 512 canvas

/**
 * Class for retrieving on demand the preset drawings with AJAX requests.
 * Tries to minimize the request by using a memory cache.
 */
class Presets {
    public static getPreset(preset: EPreset, wantedSize: number[], callback: (array: Point[]) => any): void {
        const stopwatch = new StopWatch();
        let fromCache = false;

        function safelyCallCallback(points: Point[]): void {
            const scaling = Math.min(wantedSize[0] / PRESET_SIZE, wantedSize[1] / PRESET_SIZE);
            const offsetX = 0.5 * (wantedSize[0] - PRESET_SIZE * scaling);
            const offsetY = 0.5 * (wantedSize[1] - PRESET_SIZE * scaling);

            /* Create a deep copy to keep the cache clean */
            const copy: Point[] = [];
            for (const point of points) {
                copy.push({
                    x: point.x * scaling + offsetX,
                    y: point.y * scaling + offsetY,
                });
            }

            if (fromCache) {
                Log.message(`Retrieved preset '${preset}' from cache in ${stopwatch.milliseconds} ms`);
            } else {
                Log.message(`Downloaded preset '${preset}' in ${stopwatch.milliseconds} ms.`);
            }

            callback(copy);
        }

        if (typeof Presets.cache === "undefined") {
            Presets.cache = {};
        } else if (typeof Presets.cache[preset] !== "undefined") {
            fromCache = true;
            safelyCallCallback(Presets.cache[preset]);
            return;
        }

        const xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                const retrievedArray = Presets.tryParsePointsArray(xhr.responseText);

                if (retrievedArray !== null) {
                    Presets.cache[preset] = retrievedArray;
                    safelyCallCallback(Presets.cache[preset]);
                }
            }
        });

        xhr.open("GET", `resources/${preset}.txt`);
        xhr.send();
    }

    private static cache: {
        [propName: string]: Point[];
    };

    private static tryParsePointsArray(text: string): Point[] | null {
        if (!text) {
            return null;
        }

        const stopwatch = new StopWatch();

        const points: Point[] = [];

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

        Log.message(`Parsed preset in ${stopwatch.milliseconds} ms.`);
        return points;
    }
}

export {
    EPreset,
    Presets,
};

import * as Log from "./log";
import { Point } from "./point";
import { StopWatch } from "./stopwatch";

/* Enum values must match the values of the controls */
enum EPreset {
    ARLEQUIN1 = "arlequin1",
    ARLEQUIN2 = "arlequin2",
    BULL = "bull",
    CAMEL = "camel",
    CUSTOM = "<none>", // not available via interface
    DOG = "dog",
    DOVE = "dove",
    FLAMINGO = "flamingo",
    HORSE = "horse",
    MOUSE = "mouse",
    PENGUIN = "penguin",
    WOMAN1 = "woman1",
    WOMAN2 = "woman2",
}

const PRESET_SIZE = 512; // a preset should be dimensionned for a 512 x 512 canvas

enum EState {
    LOADING,
    LOADED,
}

interface ICachedPreset {
    state: EState;
    points: Point[];
}

type PresetCallback = (array: Point[]) => unknown;

/**
 * Class for retrieving on demand the preset drawings with AJAX requests.
 * Tries to minimize the request by using a memory cache.
 */
class Presets {
    /* Pending callbacks (waiting on preset loading for instance) will be cancelled */
    public static getPreset(preset: EPreset, wantedSize: number[], callback: PresetCallback): void {
        // erase previously registered callbacks
        Presets.lastRegisteredCallback = {
            wantedPreset: preset,
            wantedWidth: wantedSize[0],
            wantedHeight: wantedSize[1],
            callback,
        };

        if (typeof Presets.cache[preset] === "undefined") { // preset never requested before
            Presets.cache[preset] = {
                state: EState.LOADING,
                points: [],
            };

            const stopWatchDownload = new StopWatch();
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        Log.message(`Downloaded preset '${preset}' in ${stopWatchDownload.milliseconds} ms`);

                        const retrievedArray = Presets.tryParsePointsArray(xhr.responseText);

                        if (retrievedArray !== null) {
                            Presets.cache[preset].points = retrievedArray;
                            Presets.cache[preset].state = EState.LOADED;
                            Presets.tryCallRegisteredCallback();
                        } else {
                            Log.message(`Failed to parse download preset '${preset}'`);
                        }
                    } else {
                        Log.message(`Failed to download preset '${preset}'`);
                    }
                }
            });
            xhr.open("GET", `resources/${preset}.txt`);
            xhr.send();
        } else {
            Presets.tryCallRegisteredCallback(); // maybe the preset is ready
        }
    }

    public static setCustomPreset(points: Point[], canvasSize: number[]): void {
        // Scale path to a PRESET_SIZE*PRESET_SIZE canvas.
        // Depending on canvas aspect ratio it may not fit but it doesn't matter
        const center: Point = {
            x: 0.5 * canvasSize[0],
            y: 0.5 * canvasSize[1],
        };

        const scaling = PRESET_SIZE / Math.min(canvasSize[0], canvasSize[1]);

        for (const point of points) {
            point.x = 0.5 * PRESET_SIZE + (point.x - center.x) * scaling;
            point.y = 0.5 * PRESET_SIZE + (point.y - center.y) * scaling;
        }

        Presets.cache[EPreset.CUSTOM] = {
            state: EState.LOADED,
            points,
        };
    }

    private static cache: {
        [propName: string]: ICachedPreset;
    } = {};

    private static lastRegisteredCallback: {
        wantedPreset: EPreset;
        wantedWidth: number;
        wantedHeight: number;
        callback: PresetCallback;
    } = null;

    private static tryCallRegisteredCallback(): void {
        if (Presets.lastRegisteredCallback !== null) {
            const preset = Presets.lastRegisteredCallback.wantedPreset;
            const isPresetLoaded = (typeof Presets.cache[preset] !== "undefined") &&
                (Presets.cache[preset].state === EState.LOADED);

            if (isPresetLoaded) {
                const width = Presets.lastRegisteredCallback.wantedWidth;
                const height = Presets.lastRegisteredCallback.wantedHeight;

                const stopWatchResize = new StopWatch();
                const resizedPreset = Presets.resizePreset(Presets.cache[preset].points, width, height);
                Log.message(`Resized preset '${preset}' in ${stopWatchResize.milliseconds} ms`);

                Presets.lastRegisteredCallback.callback(resizedPreset);
                Presets.lastRegisteredCallback = null;
            }
        }
    }

    private static resizePreset(points: Point[], width: number, height: number): Point[] {
        const scaling = Math.min(width, height) / PRESET_SIZE;
        const offsetX = 0.5 * (width - PRESET_SIZE * scaling);
        const offsetY = 0.5 * (height - PRESET_SIZE * scaling);

        /* Create a deep copy to keep the cache clean */
        const copy: Point[] = [];
        for (const point of points) {
            copy.push({
                x: point.x * scaling + offsetX,
                y: point.y * scaling + offsetY,
            });
        }

        return copy;
    }

    private static tryParsePointsArray(text: string): Point[] | null {
        if (!text) {
            return null;
        }

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

        return points;
    }
}

export {
    EPreset,
    Presets,
};

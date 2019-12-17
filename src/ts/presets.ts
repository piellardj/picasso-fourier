import IPoint from "./point";

enum EPreset {
    ARLEQUIN = "arlequin",
    DOG = "dog",
    ROUND = "round",
    TRIANGLE = "triangle",
}

class Presets {
    public static getPreset(preset: EPreset, callback: (array: IPoint[]) => any): void {
        if (typeof Presets.cache === "undefined") {
            Presets.cache = {};
        } else if (typeof Presets.cache[preset] !== "undefined") {
            callback(Presets.cache[preset]);
            return;
        }

        const xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
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

        return points;
    }
}

export {
    EPreset,
    Presets,
};

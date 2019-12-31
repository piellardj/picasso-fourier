import { Canvas2D } from "./canvas-2d";
import { Point } from "./point";

declare const Canvas: any;
type Callback = (isValid: boolean) => any;

let currentPoints: Point[] = [];
let isRecordingUserInput = false;
const finishedAcquisitionCallbacks: Callback[] = [];

function getMousePosition(): Point {
    const canvasSize: number[] = Canvas.getSize();
    const mousePosition: number[] = Canvas.getMousePosition();
    return {
        x: canvasSize[0] * mousePosition[0],
        y: canvasSize[1] * mousePosition[1],
    };
}

Canvas.Observers.mouseDown.push(() => {
    isRecordingUserInput = true;
    const currentPosition = getMousePosition();
    currentPoints = [currentPosition];
});

Canvas.Observers.mouseUp.push(() => {
    if (isRecordingUserInput) {
        isRecordingUserInput = false;

        for (const callback of finishedAcquisitionCallbacks) {
            callback(currentPoints.length >= 2);
        }
    }
});

Canvas.Observers.mouseMove.push(() => {
    if (isRecordingUserInput) {
        const currentPosition = getMousePosition();
        const isPointFarEnough = Point.distance(currentPoints[currentPoints.length - 1], currentPosition) > 2;
        if (isPointFarEnough) {
            currentPoints.push(currentPosition);
        }
    }
});

function isRecording(): boolean {
    return isRecordingUserInput;
}

function drawCurrentPath(canvas: Canvas2D): void {
    canvas.startLine();

    for (const point of currentPoints) {
        canvas.addPointToLine(point);
    }

    canvas.endLine();
}

export {
    drawCurrentPath,
    finishedAcquisitionCallbacks,
    isRecording,
    currentPoints as recordedPath,
};

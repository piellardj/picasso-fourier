import { Canvas2D } from "./canvas-2d";
import { Clock } from "./clock";
import { FourierSeries } from "./fourier-series";
import { LineDrawing } from "./line-drawing";
import { Parameters } from "./parameters";
import { Point } from "./point";
import { Presets } from "./presets";
import { TimeUnit } from "./units";
import * as UserInput from "./user-input";

declare const Canvas: any;

function setOrderIndicator(value: number): void {
    value = Math.round(100 * value) / 100; // 2 digits max
    Canvas.setIndicatorText("fourier-order", value.toLocaleString());
}

function main(): void {
    const canvas2D = new Canvas2D("canvas");
    const context = canvas2D.context;
    context.lineWidth = 1;

    let drawing: LineDrawing = null;
    let fourier: FourierSeries = null;

    const clock = new Clock();

    let needToRestart = true;
    Parameters.clearObservers.push(() => needToRestart = true);
    UserInput.finishedAcquisitionCallbacks.push((isValid: boolean) => {
        if (isValid) {
            drawing = null;
            fourier = null;
            Canvas.showLoader(true);

            Parameters.setCustomPreset();
            loadPoints(UserInput.recordedPath);
        }
        needToRedraw = true;
    });

    let needToRedraw = true;
    Parameters.redrawObservers.push(() => needToRedraw = true);

    const loopDuration = 2000; // milliseconds, at normal speed
    function mainLoop(): void {
        if (UserInput.isRecording()) {
            canvas2D.clear();
            context.strokeStyle = "white";
            UserInput.drawCurrentPath(canvas2D);
        } else if (drawing !== null && fourier !== null) { // checks that preset is loaded
            let t: TimeUnit = clock.current / loopDuration;
            const maxT: TimeUnit = Parameters.closeLoop ? 1 : drawing.originalPathDuration;
            let finishedLoop = (t >= maxT);

            if (!finishedLoop && clock.isPaused) {
                clock.resume();
            }

            t = Math.min(t, maxT);

            if (finishedLoop) {
                if (Parameters.repeat) {
                    needToRestart = true;
                } else {
                    clock.pause();
                }
            }

            if (needToRestart) {
                needToRestart = false;
                clock.reset();
                fourier.resetCurve();
                t = 0;
                finishedLoop = false;
                setOrderIndicator(Parameters.order);
                canvas2D.clear();
            }

            if (needToRedraw) {
                canvas2D.adjustSize();

                if (!Parameters.persistence) {
                    canvas2D.clear();
                }

                if (Parameters.displayOriginalCurve) {
                    context.strokeStyle = "rgb(0,128,0)";
                    const previousWidth = context.lineWidth;
                    context.lineWidth = 2;

                    drawing.draw(canvas2D, Parameters.isProgressiveMode ? maxT : t);

                    context.lineWidth = previousWidth;
                }

                if (Parameters.displayCircles) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.3)";
                    fourier.drawCirclesToPoint(canvas2D, Parameters.order, t);
                }

                if (Parameters.displayCurve) {
                    context.strokeStyle = "white";
                    fourier.drawCurve(canvas2D, Parameters.order, t);
                }

                if (Parameters.displaySegments) {
                    context.strokeStyle = Parameters.persistence ? "rgba(255,0,0,0.01)" : "red";
                    fourier.drawSegmentsToPoint(canvas2D, Parameters.order, t);
                }

                if (Parameters.isProgressiveMode) {
                    let order = Parameters.order * t / maxT;

                    if (!Parameters.persistence) {
                        context.strokeStyle = "white";
                    } else if (Parameters.smooth) {
                        context.strokeStyle = "rgba(255,255,255,0.01)";
                    } else {
                        context.strokeStyle = "rgba(255,255,255,0.03)";
                    }

                    if (!Parameters.smooth) {
                        order = Math.floor(order);
                        fourier.drawCurve(canvas2D, order, maxT);
                    } else {
                        fourier.drawCurvePartialOrder(canvas2D, order, maxT);
                    }

                    setOrderIndicator(order);
                }
            }

            needToRedraw = !finishedLoop && Parameters.speed > 0;
        }

        requestAnimationFrame(mainLoop);
    }

    function loadPoints(points: Point[]): void {
        drawing = new LineDrawing(points);
        fourier = drawing.computeFourierSeries(300 + 1); // one more to avoid out of bounds exceptions
        needToRestart = true;
        clock.reset();
        Canvas.showLoader(false);
    }

    function loadPreset(): void {
        drawing = null;
        fourier = null;

        const canvasSize: number[] = Canvas.getSize();
        Canvas.showLoader(true);
        Parameters.restoreLastPreset(); // in case we're exiting user input mode
        Presets.getPreset(Parameters.preset, canvasSize, loadPoints);
    }

    Parameters.presetObservers.push(loadPreset);
    Canvas.Observers.canvasResize.push(loadPreset);

    loadPreset();
    requestAnimationFrame(mainLoop);
}

main();

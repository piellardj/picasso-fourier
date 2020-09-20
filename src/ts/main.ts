import { Canvas2D } from "./canvas-2d";
import { Clock } from "./clock";
import { FourierSeries } from "./fourier-series";
import { LineDrawing } from "./line-drawing";
import { Parameters } from "./parameters";
import { Point } from "./point";
import { Presets } from "./presets";
import { TimeUnit } from "./units";
import * as UserInput from "./user-input";

import "./page-interface-generated";

function setOrderIndicator(value: number): void {
    value = Math.round(100 * value) / 100; // 2 digits max
    Page.Canvas.setIndicatorText("fourier-order", value.toLocaleString());
}

function main(): void {
    const canvas2D = new Canvas2D("canvas");
    canvas2D.lineWidth = 1;

    Parameters.downloadObservers.push(() => canvas2D.download("picasso-fourier.png"));

    let drawing: LineDrawing = null;
    let fourier: FourierSeries = null;

    const clock = new Clock();

    let needToRestart = true;
    Parameters.clearObservers.push(() => needToRestart = true);
    UserInput.finishedAcquisitionCallbacks.push((isValid: boolean) => {
        if (isValid) {
            drawing = null;
            fourier = null;
            Page.Canvas.showLoader(true);

            Presets.setCustomPreset(UserInput.recordedPath, Page.Canvas.getSize());
            Parameters.setCustomPreset();
        }
        needToRedraw = true;
    });

    let needToRedraw = true;
    Parameters.redrawObservers.push(() => needToRedraw = true);

    function loadPoints(points: Point[]): void {
        drawing = new LineDrawing(points);
        fourier = drawing.computeFourierSeries(300 + 1); // one more to avoid out of bounds exceptions
        needToRestart = true;
        clock.reset();
        Page.Canvas.showLoader(false);
    }

    function loadPreset(): void {
        drawing = null;
        fourier = null;

        const canvasSize: number[] = Page.Canvas.getSize();
        Page.Canvas.showLoader(true);
        Presets.getPreset(Parameters.preset, canvasSize, loadPoints);
    }

    Parameters.presetObservers.push(loadPreset);
    Page.Canvas.Observers.canvasResize.push(loadPreset);

    const loopDuration = 2000; // milliseconds, at normal speed
    function mainLoop(): void {
        if (UserInput.isRecording()) {
            canvas2D.clear();
            canvas2D.setFullViewport();
            Parameters.resetZoom();
            canvas2D.strokeStyle = "white";
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
                if (Parameters.isProgressiveMode) {
                    Parameters.resetZoom();
                }

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

                if (Parameters.isProgressiveMode || Parameters.zoom === 1) {
                    canvas2D.setFullViewport();
                } else {
                    canvas2D.zoom = Parameters.zoom;
                    canvas2D.center = fourier.computePoint(Parameters.order, t);
                }

                if (!Parameters.persistence) {
                    canvas2D.clear();
                }

                if (Parameters.displayOriginalCurve) {
                    canvas2D.strokeStyle = "rgb(0,128,0)";
                    canvas2D.lineWidth = 3;
                    drawing.draw(canvas2D, Parameters.isProgressiveMode ? maxT : t);
                    canvas2D.lineWidth = 1;
                }

                if (Parameters.displayCircles) {
                    canvas2D.strokeStyle = Parameters.persistence ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.3)";
                    fourier.drawCirclesToPoint(canvas2D, Parameters.order, t);
                }

                if (Parameters.displayCurve) {
                    canvas2D.strokeStyle = "white";
                    fourier.drawCurve(canvas2D, Parameters.order, t);
                }

                if (Parameters.displaySegments) {
                    canvas2D.strokeStyle = Parameters.persistence ? "rgba(255,0,0,0.01)" : "red";
                    fourier.drawSegmentsToPoint(canvas2D, Parameters.order, t);
                }

                if (Parameters.isProgressiveMode) {
                    let order = Parameters.order * t / maxT;

                    if (!Parameters.persistence) {
                        canvas2D.strokeStyle = "white";
                    } else if (Parameters.smooth) {
                        canvas2D.strokeStyle = "rgba(255,255,255,0.01)";
                    } else {
                        canvas2D.strokeStyle = "rgba(255,255,255,0.03)";
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

    loadPreset();
    requestAnimationFrame(mainLoop);
}

main();

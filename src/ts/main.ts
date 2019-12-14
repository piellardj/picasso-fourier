import { Parameters } from "./parameters";

declare const Canvas: any;

function main() {
    function mainLoop() {
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();

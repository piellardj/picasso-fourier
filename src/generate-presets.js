const fs = require('fs');
const fse = require("fs-extra");
const path = require("path");

const svgPath = require("svg-path-properties");

const ATTRIBUTE_KEY = "ATTRIBUTE";
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser({ attrkey: ATTRIBUTE_KEY });


const SOURCE_DIR = path.resolve(__dirname, "resources");
const DEST_DIR = path.resolve(__dirname, "..", "docs", "resources");

const PRESET_FULL_SIZE = 512;
const PRESET_MARGIN = 56;
const PRESET_SIZE = PRESET_FULL_SIZE - 2 * PRESET_MARGIN;


function buildPreset(pathString /* string */) /* string */ {
    const pathObject = new svgPath.svgPathProperties(pathString);

    const length = pathObject.getTotalLength();
    const segmentLength = 2; // in viewport units
    const nbSamples = Math.ceil(length / segmentLength);

    const boundingBox = { minX: 10000, minY: 10000, maxX: -10000, maxY: -10000 };
    const pointsList = [];
    for (let i = 0; i < nbSamples; i++) {
        const point = pathObject.getPointAtLength(i * segmentLength)
        pointsList.push(point);
        boundingBox.minX = Math.min(point.x, boundingBox.minX);
        boundingBox.minY = Math.min(point.y, boundingBox.minY);
        boundingBox.maxX = Math.max(point.x, boundingBox.maxX);
        boundingBox.maxY = Math.max(point.y, boundingBox.maxY);
    }

    boundingBox.x = boundingBox.minX;
    boundingBox.y = boundingBox.minY;
    boundingBox.width = boundingBox.maxX - boundingBox.minX;
    boundingBox.height = boundingBox.maxY - boundingBox.minY;

    // try to scale and center the drawing
    const scale = Math.min(PRESET_SIZE / boundingBox.width, PRESET_SIZE / boundingBox.height);
    const offsetX = 0.5 * (PRESET_FULL_SIZE - scale * boundingBox.width) - scale * boundingBox.x;
    const offsetY = 0.5 * (PRESET_FULL_SIZE - scale * boundingBox.height) - scale * boundingBox.y;

    const P = 10;
    const pointsStringList = []; /* string */
    for (const point of pointsList) {
        point.x = point.x * scale + offsetX;
        point.y = point.y * scale + offsetY;

        const roundedX = Math.round(P * point.x) / P;
        const roundedY = Math.round(P * point.y) / P;

        pointsStringList.push(roundedX + " " + roundedY);
    }

    return pointsStringList.join("\n");
}

fse.ensureDirSync(DEST_DIR);
fs.readdir(SOURCE_DIR, (err, files) => {
    files.forEach(file => {
        const filepath = path.join(SOURCE_DIR, file);

        if (path.extname(file) !== ".svg") {
            console.log(`WARNING: preset generation, ignored file ${filepath}.`);
            return;
        }

        const destFilepath = path.format({
            dir: DEST_DIR,
            name: path.basename(file, ".svg"),
            ext: ".txt",
        });

        fs.readFile(filepath, (errorReadFile, fileContent) => {
            if (errorReadFile) throw new Error(`Error: cannot read '${filepath}': ${errorReadFile}`);

            xmlParser.parseString(fileContent, function (errorParseString, parsedXml) {
                if (errorParseString) throw new Error(`Error: cannot parse '${filepath}': ${errorParseString}`);

                if (!parsedXml.svg || !parsedXml.svg.path || !parsedXml.svg.path[0] || !parsedXml.svg.path[0][ATTRIBUTE_KEY] || !parsedXml.svg.path[0][ATTRIBUTE_KEY].d) {
                    throw new Error(`ERROR: cannot find the svg/path.d attribute in file '${filepath}'`);
                }

                const pathString = parsedXml.svg.path[0][ATTRIBUTE_KEY].d;
                const parsedPreset = buildPreset(pathString);
                fs.writeFile(destFilepath, parsedPreset, () => { console.log(`Built preset '${filepath}'.`) });
            });
        });
    });
});
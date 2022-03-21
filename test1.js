"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lens_1 = require("./lib/lens");
var vector_1 = require("./lib/vector");
var erroranalysis_1 = require("./lib/erroranalysis");
var erroranalysis_2 = require("./lib/erroranalysis");
var process_1 = require("process");
var assert_1 = require("assert");
var test2d = [[0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15]];
var raySet1 = [0.0, 0.15, 0.30, 0.45, 0.60, 0.7, 0.8, 0.875, 0.925, 0.975, 1.0];
var raySet2 = [0.0, 0.087, 0.170, 0.249, 0.324, 0.395, 0.463, 0.527, 0.586, 0.642, 0.695, 0.743, 0.787, 0.828, 0.865, 0.897, 0.926, 0.952, 0.973, 0.990, 1.0];
var raySet3 = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
var raySet4 = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
var numRays = 100;
var numAngles = 3;
var fiberRadius = 0.1;
var halfCa = 10.0;
var refocus = 0.0;
var lens = lens_1.Lens.testLens();
var zeroDir = new vector_1.Vector3D(0.0, 0.0, 1.0);
console.log("EFL: " + lens.EFL.toFixed(2) + " mm");
// test for function CalcRMSError
//export function CalcRMSError( raySet: [number], lens: Lens, refocus: number, halfCa: number )
var eStat = (0, erroranalysis_1.radialRMSError)(raySet1, lens, refocus, halfCa);
var signum = 6;
console.log("AVE Error: " + eStat.average.toFixed(signum) + ", " + "RMS Error: " + eStat.rms.toFixed(signum));
console.log("Min: " + ", " + eStat.min.toFixed(signum) + ", " + "Max: " + ", " + eStat.max.toFixed(signum));
console.log("");
(0, assert_1.strict)(eStat.rms.toFixed(6) === "0.083979", "CalcRMSError did not return proper value!");
var p0 = new vector_1.Vector3D(0.0, halfCa, 0.0);
var lst = (0, erroranalysis_1.CalcLSAVecs)(p0, zeroDir, lens, 0.0);
console.log("   aoi       lsa        yout");
console.log((lst.aoi).toFixed(signum) + ", " + lst.lsa.toFixed(signum) + ", " + lst.rayout.pVector.y.toFixed(signum));
var opdtest = (0, erroranalysis_1.calcWfeVecs)(p0, zeroDir, lens, 0.0);
console.log("\nSingle Point OPD: " + opdtest.toFixed(6) + "  @  " + p0.y.toFixed(3) + " mm");
(0, assert_1.strict)(opdtest.toFixed(6) === "3.741671", "calcWfeRay Calc did not return proper value!");
var wradial = (0, erroranalysis_1.raidalWFE)(lens, refocus, halfCa, 21);
console.log("radial WFE PV: " + wradial.toFixed(6) + "\n");
(0, assert_1.strict)(wradial.toFixed(6) === "3.741671", "raidalWFE Calc did not return proper value!");
var gridsize = 21;
var map = (0, erroranalysis_2.GenWfeMap)(lens, refocus, halfCa, gridsize);
var dimensions = [map.length, map[0].length];
console.log(dimensions + "\n");
for (var row = 0; row < gridsize; row++) {
    for (var col = 0; col < gridsize; col++) {
        process_1.stdout.write(map[row][col].toFixed(3) + " ");
    }
    console.log("");
}
console.log();
(0, assert_1.strict)(map[0][(gridsize - 1) / 2].toFixed(6) === "3.741671", "raidalWFE Calc did not return proper value!");

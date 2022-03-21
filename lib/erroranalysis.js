"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalcLSAVecs = exports.calcWfeVecs = exports.GenWfeMap = exports.raidalWFE = exports.radialRMSError = void 0;
var mathjs_1 = require("mathjs");
var vector_1 = require("./vector");
var raytrace_1 = require("./raytrace");
var zeroDir = new vector_1.Vector3D(0.0, 0.0, 1.0);
// calculates the RMS spot size error across one radial slice of the part - of course along the 0 to ymax
// this spot size error is essentially the error function used in the optimization of the lens
// this function should be wired to the main lens design sheet "Error Func" which is probably is not grammatically correct
function radialRMSError(raySet, lens, refocus, halfCa) {
    var eZeroDir = new vector_1.Vector3D(0.0, 0.0, 1.0);
    var sumSum = 0;
    var Sum = 0.0;
    var min = 1.0e20;
    var max = -1.0e20;
    raySet.forEach(function (value) {
        var p = new vector_1.Vector3D(0.0, value * halfCa, 0);
        var y = (0, raytrace_1.trace3DRay)(p, zeroDir, lens, 0.0).pVector.y;
        if (y < min) {
            min = y;
        }
        if (y > max) {
            max = y;
        }
        Sum += y;
        sumSum += y * y;
    });
    var average = (Sum / raySet.length);
    var rms = (0, mathjs_1.sqrt)(sumSum / raySet.length);
    var eStat = { min: min, max: max, pv: (max - min), average: average, rms: rms };
    return eStat;
}
exports.radialRMSError = radialRMSError;
// calculates the WFE (wavefront error) across one radial slice of the part - of course along the 0 to ymax
// this function should be wired to the main lens design sheet "WFE Error" which is probably is not grammatically correct
function raidalWFE(lens, refocus, halfCA, numsamples) {
    var min = 1.0e20;
    var max = -1.0e20;
    for (var i = 0; i <= numsamples; i++) {
        var y = halfCA * i / numsamples;
        var p0 = new vector_1.Vector3D(0.0, halfCA * i / numsamples, 0.0);
        var wfe = calcWfeVecs(p0, zeroDir, lens, refocus);
        if (wfe < min) {
            min = wfe;
        }
        if (wfe > max) {
            max = wfe;
        }
        //console.log("y: " + y.toFixed(3) + ",   wfe: " + wfe.toFixed(6))
    }
    return (max - min);
}
exports.raidalWFE = raidalWFE;
// this function can be used to produce a WFE grid that can be turned into a bitmap or 2d wavefront map
// this will only be useful I guess until the GPU calculators get going???
function GenWfeMap(lens, refocus, halfCa, gridsize) {
    var map = new Array();
    var inc = 2.0 * halfCa / (gridsize - 1);
    var diag = halfCa * halfCa * 1.0001; // add a little extra to make sure and get the cardinal points
    for (var row = 0; row < gridsize; row++) {
        map[row] = new Array();
        for (var col = 0; col < gridsize; col++) {
            var x = -halfCa + row * inc;
            var y = -halfCa + col * inc;
            if (diag > (x * x + y * y)) {
                var p = new vector_1.Vector3D(x, y, 0.0);
                map[row][col] = calcWfeVecs(p, zeroDir, lens, refocus);
            }
            else
                map[row][col] = -1.0;
        }
    }
    return map;
}
exports.GenWfeMap = GenWfeMap;
// *************************************************************************
// all functions below would normally not be exported, but they now are so  
// that the test1.ts main program can debug or vet their results.
// *************************************************************************
function calcWfeVecs(p0, e0, lens, refocus) {
    var p1 = new vector_1.Vector3D(p0.x / (0, mathjs_1.sqrt)(2.0), p0.y / (0, mathjs_1.sqrt)(2.0), 0.0);
    var rsq = p0.x * p0.x + p0.y * p0.y;
    var rsqsq = rsq * rsq;
    if (rsq < 1.0e-8) {
        return 0.0;
    }
    var lstatm = CalcLSAVecs(p0, e0, lens, refocus);
    var lstatz = CalcLSAVecs(p1, e0, lens, refocus);
    var a = (4.0 * lstatz.lsa - lstatm.lsa) / rsq;
    var b = (2.0 * lstatm.lsa - 4.0 * lstatz.lsa) / rsqsq;
    /*
    console.log("")
    console.log("p0: " + p0.toString2(3))
    console.log("e0: " + e0.toString2(3));
    console.log("p1: " + p1.toString2(3))
    console.log("rm.v: " + lstatm.rayout.pVector.toString2(6))
    console.log("rz.v: " + lstatz.rayout.pVector.toString2(6))
    console.log("lstatm: " + LsaResToStr(lstatm, 6))
    console.log("lstatz: " + LsaResToStr(lstatz, 6))
    console.log("a: " + a.toFixed(8))
    console.log("b: " + b.toFixed(8))
    */
    return (1000.0 * ((0, mathjs_1.sin)(lstatm.aoi) * (0, mathjs_1.sin)(lstatm.aoi) / 2.0) * (refocus - a * rsq / 2.0 - b * rsqsq / 3.0) / lens.wavelength);
}
exports.calcWfeVecs = calcWfeVecs;
function CalcLSAVecs(p0, e0, lens, refocus) {
    // taken from rust implementation
    //let aoi = self.edir.dot_product(&CPROPV).acos();
    //let lsa = -1.0 * (self.pvector.x.powi(2) + self.pvector.y.powi(2)).sqrt() / aoi.tan();
    //(aoi, lsa)
    var rayout = (0, raytrace_1.trace3DRay)(p0, e0, lens, refocus);
    var aoi = (0, mathjs_1.acos)(vector_1.Vector3D.dotProduct(rayout.eDir, zeroDir));
    var lsa = -1.0 * (0, mathjs_1.sqrt)(rayout.pVector.x * rayout.pVector.x + rayout.pVector.y * rayout.pVector.y) / (0, mathjs_1.tan)(aoi);
    var lsares = { rayout: rayout, lsa: lsa, aoi: aoi };
    return lsares; // calls to this function expect radians
}
exports.CalcLSAVecs = CalcLSAVecs;
// *************************************************************************
// temporary utils
// *************************************************************************
function LsaResToStr(lsar, places) {
    return "{lsa: " + lsar.lsa.toFixed(places) + ",  aoi: " + lsar.aoi.toFixed(places) + "}";
}

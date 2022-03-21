import { cos, pi, sin, sqrt } from 'mathjs'
import { Lens, Surface } from './lib/lens'
import { Vector3D } from './lib/vector'
import { trace3DRay } from './lib/raytrace'
import type { Ray } from './lib/raytrace'
import { radialRMSError, calcWfeVecs, CalcLSAVecs, raidalWFE } from './lib/erroranalysis'
import type { LsaResults } from './lib/erroranalysis'
import type { BasicStats } from './lib/erroranalysis'
import { GenWfeMap } from './lib/erroranalysis'
import { stdin, stdout } from 'process'

import { strict as assert } from 'assert';

let test2d = [ [ 0, 1, 2, 3 ],
               [ 4, 5, 6, 7 ],
               [ 8, 9, 10, 11 ],
               [ 12, 13, 14, 15 ] ]

let raySet1 = [ 0.0, 0.15, 0.30, 0.45, 0.60, 0.7, 0.8, 0.875, 0.925, 0.975, 1.0 ]
let raySet2 = [ 0.0, 0.087, 0.170, 0.249, 0.324, 0.395, 0.463, 0.527, 0.586, 0.642, 0.695, 0.743, 0.787, 0.828, 0.865, 0.897, 0.926, 0.952, 0.973, 0.990, 1.0 ]
let raySet3 = [ 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0 ]
let raySet4 = [ 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 ]

let numRays = 100
let numAngles = 3
let fiberRadius = 0.1
let halfCa = 10.0;
const refocus = 0.0
const lens = Lens.testLens()  

const zeroDir = new Vector3D(0.0, 0.0, 1.0)

console.log("EFL: " + lens.EFL.toFixed(2) + " mm")


// test for function CalcRMSError
//export function CalcRMSError( raySet: [number], lens: Lens, refocus: number, halfCa: number )
let eStat: BasicStats = radialRMSError(raySet1, lens, refocus, halfCa)
const signum = 6;
console.log("AVE Error: " + eStat.average.toFixed(signum) + ", " + "RMS Error: " + eStat.rms.toFixed(signum))
console.log("Min: " + ", " + eStat.min.toFixed(signum) + ", " + "Max: " + ", " + eStat.max.toFixed(signum))
console.log("");
assert(eStat.rms.toFixed(6) === "0.083979", "CalcRMSError did not return proper value!")

let p0 = new Vector3D(0.0, halfCa, 0.0)

let lst = CalcLSAVecs(p0, zeroDir, lens, 0.0)
console.log("   aoi       lsa        yout")
console.log((lst.aoi).toFixed(signum) + ", " + lst.lsa.toFixed(signum) + ", " + lst.rayout.pVector.y.toFixed(signum));

let opdtest = calcWfeVecs(p0, zeroDir, lens, 0.0)
console.log("\nSingle Point OPD: " + opdtest.toFixed(6) + "  @  " + p0.y.toFixed(3) + " mm")
assert(opdtest.toFixed(6) === "3.741671", "calcWfeRay Calc did not return proper value!")

let wradial = raidalWFE(lens, refocus, halfCa, 21)
console.log("radial WFE PV: " + wradial.toFixed(6) + "\n")
assert(wradial.toFixed(6) === "3.741671", "raidalWFE Calc did not return proper value!")

const gridsize = 21
let map = GenWfeMap(lens, refocus, halfCa, gridsize)
const dimensions = [ map.length, map[0].length ];
console.log(dimensions + "\n")

for (let row = 0; row < gridsize; row++) 
{
    for (let col = 0; col < gridsize; col++) 
    {
        stdout.write(map[row][col].toFixed(3) + " ")
    }
    console.log("")
}
console.log()
assert(map[0][(gridsize - 1) / 2].toFixed(6) === "3.741671", "raidalWFE Calc did not return proper value!")

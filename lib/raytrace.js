"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trace3DRay = exports.calcSag3D = exports.runJSRaytrace = void 0;
var mathjs_1 = require("mathjs");
var vector_1 = require("./vector");
// export function runJSRaytrace(gr: GenRays, lens: Lens, refocus: number) {
function runJSRaytrace(numRays, numAngles, fiberRadius, refocus, lens) {
    var randomRays = generateRays(numRays, numAngles, lens.surf1.ap, fiberRadius / lens.EFL);
    var raysOut = [];
    for (var _i = 0, randomRays_1 = randomRays; _i < randomRays_1.length; _i++) {
        var rayIn = randomRays_1[_i];
        var rayOut = trace3DRay(rayIn.pVector, rayIn.eDir, lens, refocus);
        raysOut.push(rayOut);
    }
    return raysOut;
}
exports.runJSRaytrace = runJSRaytrace;
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function generateRays(numRays, numAngles, halfAp, halfAng) {
    var rays = [];
    var x, y, xdir, ydir;
    var diag = Math.pow(halfAp, 2);
    var anglediag = Math.pow(halfAng, 2);
    var a, r;
    var maxAngle = 2.0 * mathjs_1.pi;
    for (var i = 0; i < numRays; i++) {
        r = halfAp * (0, mathjs_1.sqrt)(randomRange(0.0, 1.0));
        a = randomRange(0.0, maxAngle);
        x = r * (0, mathjs_1.cos)(a);
        y = r * (0, mathjs_1.sin)(a);
        var pVector = new vector_1.Vector3D(x, y, 0.0);
        for (var i_1 = 0; i_1 < numAngles; i_1++) {
            r = halfAng * (0, mathjs_1.sqrt)(randomRange(0.0, 1.0));
            a = randomRange(0.0, maxAngle);
            xdir = r * (0, mathjs_1.cos)(a);
            ydir = r * (0, mathjs_1.sin)(a);
            var eDir = new vector_1.Vector3D(xdir, ydir, Math.sqrt(1.0 - Math.pow(xdir, 2) - Math.pow(ydir, 2)));
            rays.push({ pVector: pVector, eDir: eDir });
        }
    }
    return rays;
}
function calcSag3D(x, y, surf, rTolforZero) {
    if (rTolforZero === void 0) { rTolforZero = 0.001; }
    var c = 0;
    if (Math.abs(surf.r) > rTolforZero) {
        c = 1 / surf.r;
    }
    var r2 = Math.pow(x, 2) + Math.pow(y, 2);
    var sqrtvalue = 1 - (1 + surf.k) * Math.pow(c, 2) * r2;
    if (sqrtvalue < 0) {
        return 0;
    }
    else {
        return (c * r2) / (1 + Math.sqrt(sqrtvalue)) + surf.ad * Math.pow(r2, 2) + surf.ae * Math.pow(r2, 3);
    }
}
exports.calcSag3D = calcSag3D;
function calcSlope3D(P, s) {
    var p = Math.pow(P.x, 2) + Math.pow(P.y, 2);
    var q0 = P.z - s.ad * Math.pow(p, 2) - s.ae * Math.pow(p, 3);
    var q1 = -4 * s.ad * p - 6 * s.ae * Math.pow(p, 2);
    var dx = P.x * (-s.c - s.c * (s.k + 1) * q1 * q0 + q1);
    var dy = P.y * (-s.c - s.c * (s.k + 1) * q1 * q0 + q1);
    var dz = 1 - s.c * (s.k + 1) * q0;
    var N = new vector_1.Vector3D(dx, dy, dz);
    var n = N.divide(N.length);
    var F = -(s.c / 2) * p - (s.c / 2) * (s.k + 1) * Math.pow(q0, 2) + q0;
    return [n, F];
}
function calcDirSines(E, N, nin, nout) {
    var alpha = vector_1.Vector3D.dotProduct(E, N);
    //var aoi = Math.Acos(alpha).RadToDeg();
    //var aor = Math.Asin(Math.Sin(Math.Acos(alpha)) * nin / nout).RadToDeg();
    var a = 1.0;
    var b = 2 * alpha;
    var c = 1 - Math.pow(nout, 2) / Math.pow(nin, 2);
    var sol2 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
    var Ep = E.add(N.multiply(sol2));
    Ep = Ep.divide(Ep.length);
    return Ep;
    //return (Ep, aoi, aor);
}
function translateToFlatSurf(P, E, zplane) {
    var u = (zplane - P.z) / E.z;
    return P.add(E.multiply(u));
}
function traceToSurf(D, E, surf, plane) {
    if (plane === void 0) { plane = 0; }
    if (surf.type === 'plane') {
        return translateToFlatSurf(D, E, plane);
    }
    var zest1 = calcSag3D(D.x, D.y, surf) + plane;
    var u = (zest1 - D.z) / E.z;
    var P1 = D;
    var P2 = D.add(E.multiply(u));
    for (var i = 0; i < 10; i++) {
        if (P1.sub(P2).length > 1e-4) {
            P1 = P2;
            zest1 = calcSag3D(P1.x, P1.y, surf) + plane;
            u = (zest1 - D.z) / E.z;
            P2 = D.add(E.multiply(u));
        }
        else {
            break;
        }
    }
    return P2;
}
function trace3DRay(P0, E0, lens, Refocus) {
    // D or P are position vectors
    // C center points of surfaces
    // E are ray direction cosine vectors
    // N are surface normals
    // Z is the zero vector used as place holder in data table
    //var P2 = TraceRayToSide1_A(P0, E0, lens);
    var P2 = traceToSurf(P0, E0, lens.surf1, 0.0);
    var _a = calcSlope3D(P2, lens.surf1), N2 = _a[0], F = _a[1];
    //var (E2, aoi2, aor2) = CalcDirSines(E0, N2, 1.0, lens_in.n);  // after refraction
    var E2 = calcDirSines(E0, N2, 1.0, lens.nIndex); // after refraction
    // Trace to Surface 2 after refraction
    var P3 = traceToSurf(P2, E2, lens.surf2, lens.ct);
    var _b = calcSlope3D(new vector_1.Vector3D(P3.x, P3.y, P3.z - lens.ct), lens.surf2), N3 = _b[0], _ = _b[1]; // adjust z for CT of lens
    //var (E3, aoi3, aor3) = CalcDirSines(E2, N3, lens_in.n, 1);
    var E3 = calcDirSines(E2, N3, lens.nIndex, 1);
    // transfer ray to image plane
    var P4 = translateToFlatSurf(P3, E3, lens.ct + lens.BFL + Refocus);
    //var E5 = E3;
    //var N5 = new Vector3D(0, 0, 1);
    //var aoi5 = Math.Acos(Vector3D.DotProduct(E3, N5)).RadToDeg();
    return { pVector: P4, eDir: E3 };
}
exports.trace3DRay = trace3DRay;
// function gen2DZeroArray(size: number): number[][] {
//   return new Array(size).fill(new Array(size).fill(0))
// }
// export function processVlistData(
//   Vlist: Vector3D[],
//   lens: Lens,
//   Refocus: number,
//   fiber_radius: number
// ) {
//   const maxbin = 2 * fiber_radius
//   const minbin = -maxbin
//   const steps = 201
//   const binsize = (maxbin - minbin) / steps
//   const indata = gen2DZeroArray(steps)
//   let errors = 0
//   Vlist.forEach((p) => {
//     const row = Math.round((p.x - minbin) / binsize)
//     const col = Math.round((p.y - minbin) / binsize)
//     if (row >= 0 && row < steps && col >= 0 && col < steps) {
//       indata[row][col] += 1
//     } else {
//       errors++
//     }
//   })
//   return indata
// }
// export function sliceDataMidPt(data: number[][], border = 0) {
//   const rows = data.length
//   const cols = data[0].length
//   const midrow = Math.round(rows / 2)
//   const odata: number[] = new Array(cols).fill(0)
//   for (let c = 0; c < cols; c++) {
//     let sum = 0
//     for (let r = midrow - border; r <= midrow + border; r++) {
//       sum += data[r][c]
//     }
//     odata[c] = sum / (1 + 2 * border)
//   }
//   return odata
// }
// export interface WFERay {
//   yIn: number
//   yEnd: number
//   zEnd: number
//   AOI: number
//   slope: number
//   LSA: number
//   OPD: number
// }
// export class PointD {
//   x: number
//   y: number
//   constructor(x: number = 0, y: number = 0) {
//     this.x = x
//     this.y = y
//   }
//   isAlmostZero(): boolean {
//     return Math.sqrt(this.x * this.x + this.y * this.y) < 0.05
//   }
// }
// export class RayVector {
//   pBegin: PointD
//   pEnd: PointD
//   AOI: number
//   AOR: number
//   index: number
//   constructor(
//     x0: number,
//     y0: number,
//     x1: number,
//     y1: number,
//     index: number,
//     aoi: number,
//     aor: number
//   ) {
//     this.pBegin = new PointD(x0, y0)
//     this.pEnd = new PointD(x1, y1)
//     this.index = index
//     this.AOI = aoi
//     this.AOR = aor
//   }
//   get OPD(): number {
//     const l = Math.sqrt(
//       (this.pEnd.x - this.pBegin.x) * (this.pEnd.x - this.pBegin.x) +
//         (this.pEnd.y - this.pBegin.y) * (this.pEnd.y - this.pBegin.y)
//     )
//     return l * this.index
//   }
// }

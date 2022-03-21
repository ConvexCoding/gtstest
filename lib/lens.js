"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lens = exports.Surface = void 0;
var material_1 = require("./material");
var Surface = /** @class */ (function () {
    function Surface(fullAperture, radius, conic, ad, ae) {
        if (conic === void 0) { conic = 0; }
        if (ad === void 0) { ad = 0; }
        if (ae === void 0) { ae = 0; }
        this.ap = typeof fullAperture === 'string' ? parseFloat(fullAperture) : fullAperture;
        this.r = typeof radius === 'string' ? parseFloat(radius) : radius;
        this.k = typeof conic === 'string' ? parseFloat(conic) : conic;
        this.ad = typeof ad === 'string' ? parseFloat(ad) : ad;
        this.ae = typeof ae === 'string' ? parseFloat(ae) : ae;
    }
    Object.defineProperty(Surface.prototype, "type", {
        get: function () {
            if (Math.abs(this.r) < 0.01 &&
                Math.abs(this.k) < 1e-8 &&
                Math.abs(this.ad) < 1e-20 &&
                Math.abs(this.ae) < 1e-20) {
                return 'plane';
            }
            if (Math.abs(this.ad) < 1e-20 && Math.abs(this.ae) < 1e-20) {
                return 'sphere';
            }
            return 'asphere';
        },
        enumerable: false,
        configurable: true
    });
    Surface.calcCurv = function (r) {
        if (typeof r === 'string') {
            r = parseFloat(r);
        }
        return r === 0 ? 0 : 1 / r;
    };
    Object.defineProperty(Surface.prototype, "c", {
        get: function () {
            return Surface.calcCurv(this.r);
        },
        set: function (c) {
            this.r = Surface.calcCurv(c);
        },
        enumerable: false,
        configurable: true
    });
    Surface.calcSag = function (radius, conic, ad, ae, x, y) {
        if (y === void 0) { y = 0; }
        var c = Surface.calcCurv(radius);
        var hyp = Math.pow(x, 2) + Math.pow(y, 2);
        var sqrtvalue = 1 - (1 + conic) * Math.pow(c, 2) * hyp;
        return sqrtvalue < 0
            ? 0
            : (c * hyp) / (1 + Math.sqrt(sqrtvalue)) + ad * Math.pow(hyp, 2) + ae * Math.pow(hyp, 3);
    };
    Surface.prototype.sagAt = function (x, y) {
        if (y === void 0) { y = 0; }
        return Surface.calcSag(this.r, this.k, this.ad, this.ae, x, y);
    };
    Object.defineProperty(Surface.prototype, "sag", {
        get: function () {
            return this.sagAt(this.ap / 2);
        },
        enumerable: false,
        configurable: true
    });
    // need to format the values to match the struct in rust
    Surface.prototype.toRustStruct = function () {
        return {
            r: this.r,
            c: this.c,
            k: this.k,
            ad: this.ad,
            ae: this.ae,
            surf_type: this.type === 'plane' ? 0 : this.type === 'sphere' ? 1 : 2,
        };
    };
    return Surface;
}());
exports.Surface = Surface;
var Lens = /** @class */ (function () {
    function Lens(diameter, ct, material, wavelength, surf1, surf2) {
        if (surf1.ap > this.diameter || surf2.ap > this.diameter) {
            throw new Error("Surface aperture can't be greater than lens diameter.");
        }
        this.diameter = typeof diameter === 'string' ? parseFloat(diameter) : diameter;
        this.ct = typeof ct === 'string' ? parseFloat(ct) : ct;
        this.material = material;
        this.wavelength = typeof wavelength === 'string' ? parseFloat(wavelength) : wavelength;
        this.surf1 = surf1;
        this.surf2 = surf2;
    }
    Lens.testLens = function () {
        return new Lens(25, 5, material_1.default.FusedSilica, 1.07, new Surface(25, 44.966), new Surface(25, -1000));
    };
    Object.defineProperty(Lens.prototype, "et", {
        get: function () {
            return this.ct - this.surf1.sag + this.surf2.sag;
        },
        set: function (val) {
            console.log('vallll', val);
            val = typeof val === 'string' ? parseFloat(val) : val;
            this.ct = val + this.surf1.sag - this.surf2.sag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Lens.prototype, "flat1", {
        get: function () {
            return (this.diameter - this.surf1.ap) / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Lens.prototype, "flat2", {
        get: function () {
            return (this.diameter - this.surf2.ap) / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Lens.prototype, "nIndex", {
        get: function () {
            return this.material.nIndexAt(this.wavelength);
        },
        enumerable: false,
        configurable: true
    });
    Lens.calcEFL = function (s1c, s2c, ct, nIndex) {
        s1c = typeof s1c === 'string' ? parseFloat(s1c) : s1c;
        s2c = typeof s2c === 'string' ? parseFloat(s2c) : s2c;
        ct = typeof ct === 'string' ? parseFloat(ct) : ct;
        nIndex = typeof nIndex === 'string' ? parseFloat(nIndex) : nIndex;
        var phi = (nIndex - 1) * (s1c - s2c + ((nIndex - 1) * ct * s1c * s2c) / nIndex);
        return 1 / phi;
    };
    Object.defineProperty(Lens.prototype, "EFL", {
        get: function () {
            return Lens.calcEFL(this.surf1.c, this.surf2.c, this.ct, this.nIndex);
        },
        enumerable: false,
        configurable: true
    });
    Lens.calcBFL = function (s1c, s2c, ct, nIndex) {
        s1c = typeof s1c === 'string' ? parseFloat(s1c) : s1c;
        s2c = typeof s2c === 'string' ? parseFloat(s2c) : s2c;
        ct = typeof ct === 'string' ? parseFloat(ct) : ct;
        nIndex = typeof nIndex === 'string' ? parseFloat(nIndex) : nIndex;
        var efl = Lens.calcEFL(s1c, s2c, ct, nIndex);
        var pp = (nIndex - 1) * s1c * efl * (1 / nIndex) * ct;
        return efl - pp;
    };
    Object.defineProperty(Lens.prototype, "BFL", {
        get: function () {
            return Lens.calcBFL(this.surf1.c, this.surf2.c, this.ct, this.nIndex);
        },
        enumerable: false,
        configurable: true
    });
    // need to format the values to match the struct in rust
    Lens.prototype.toRustStruct = function () {
        return {
            diameter: this.diameter,
            // TODO: figure out best meaning for clear_ap here
            clear_ap: Math.min(this.surf1.ap, this.surf2.ap),
            ct: this.ct,
            n_index: this.nIndex,
            side1: this.surf1.toRustStruct(),
            side2: this.surf2.toRustStruct(),
        };
    };
    return Lens;
}());
exports.Lens = Lens;

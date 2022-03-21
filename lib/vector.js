"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector3D = void 0;
var Vector3D = /** @class */ (function () {
    function Vector3D(xin, yin, zin) {
        this.x = xin;
        this.y = yin;
        this.z = zin;
    }
    Vector3D.dotProduct = function (a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    };
    Object.defineProperty(Vector3D.prototype, "lengthSquared", {
        get: function () {
            return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3D.prototype, "length", {
        get: function () {
            return Math.sqrt(this.lengthSquared);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3D.prototype, "magnitude", {
        get: function () {
            return this.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3D.prototype, "isAlmostZero", {
        get: function () {
            return this.length < 0.05;
        },
        enumerable: false,
        configurable: true
    });
    Vector3D.prototype.normalize = function () {
        var mag = this.magnitude;
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    };
    Vector3D.prototype.toString = function (decimals) {
        if (decimals === void 0) { decimals = 4; }
        return "{X= ".concat(this.x.toFixed(decimals), ",   Y= ").concat(this.y.toFixed(decimals), ",   Z= ").concat(this.z.toFixed(decimals), "}");
    };
    Vector3D.prototype.toString2 = function (decimals) {
        if (decimals === void 0) { decimals = 4; }
        return "".concat(this.x.toFixed(decimals), ", ").concat(this.y.toFixed(decimals), ", ").concat(this.z.toFixed(decimals));
    };
    Vector3D.add = function (a, b) {
        return new Vector3D(a.x + b.x, a.y + b.y, a.z + b.z);
    };
    Vector3D.prototype.add = function (b) {
        return Vector3D.add(this, b);
    };
    Vector3D.sub = function (a, b) {
        return new Vector3D(a.x + b.x, a.y + b.y, a.z + b.z);
    };
    Vector3D.prototype.sub = function (b) {
        return Vector3D.sub(this, b);
    };
    Vector3D.multiply = function (a, b) {
        if (typeof b === 'number') {
            return new Vector3D(a.x * b, a.y * b, a.z * b);
        }
        else {
            return new Vector3D(a.x * b.x, a.y * b.y, a.z * b.z);
        }
    };
    Vector3D.prototype.multiply = function (b) {
        return Vector3D.multiply(this, b);
    };
    Vector3D.divide = function (a, b) {
        if (typeof b === 'number') {
            return new Vector3D(a.x / b, a.y / b, a.z / b);
        }
        else {
            return new Vector3D(a.x / b.x, a.y / b.y, a.z / b.z);
        }
    };
    Vector3D.prototype.divide = function (b) {
        return Vector3D.divide(this, b);
    };
    return Vector3D;
}());
exports.Vector3D = Vector3D;

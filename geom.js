"use strict";
var geom = (function() {
	var proto_vec = {};
	function vec(x, y) {
		return Object.create(proto_vec, {
			x: { writable: false, value: x },
			y: { writable: false, value: y }
		});
	}
	proto_vec.add = function(w) {
		return vec(this.x + w.x, this.y + w.y);
	};
	proto_vec.sub = function(w) {
		return vec(this.x - w.x, this.y - w.y);
	};
	proto_vec.mul = function(t) {
		return vec(t * this.x, t * this.y);
	};
	proto_vec.length = function() {
		return Math.sqrt(this.dot(this));
	};
	proto_vec.rotate = function(a) {
		var c = Math.cos(a), s = Math.sin(a);
		return vec(c * this.x - s * this.y, s * this.x + c * this.y);
	};
	proto_vec.dot = function(w) {
		return this.x * w.x + this.y * w.y;
	};
	return Object.create({}, {
		vec: {
			writable: false,
			value: vec
		},
		bar: {
			writable: false,
			value: function(pts) {
				var i = pts.length, v = vec(0, 0), c = 0;
				while (i > 0) {
					c += pts[--i].w;
					v = v.add(pts[i].p.mul(pts[i].w));
				}
				return v.mul(1 / c);
			}
		}
	});
})();

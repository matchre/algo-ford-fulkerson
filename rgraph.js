"use strict";
var rgraph = (function() {
	var proto_REdge, obj;
	proto_REdge = Object.create({}, {
		start: {
			get: function() { return this.reversed ? this.b.end : this.b.start; }
		},
		end: {
			get: function() { return this.reversed ? this.b.start : this.b.end; }
		},
		capacity: {
			get: function() { return this.reversed ? (this.b.used - this.b.low_mark)
			                                       : (this.b.high_mark - this.b.used); }
		},
		adjustment: {
			set: function(v) { this.b.adjustment = this.reversed ? -v : v; }
		},
		adjust: {
			writable: false, value: function() { this.b.adjust(); }
		}
	});
	obj = Object.create({}, {
		edge: {
			writable: false,
			value: function(n, e) {
				return Object.create(proto_REdge, {
					b:        { writable: false, value: e },
					reversed: { writable: false, value: (n !== e.start) }
				});
			}
		},
		edges: {
			writable: false,
			value: function(n) {
				var e = [], i, t, x;
				t = n.edges;
				i = t.length;
				while (i > 0) {
					--i;
					x = obj.edge(n, t[i]);
					if (x.capacity > 0 && x.end !== n) { e.push(x); }
				}
				return e;
			}
		}
	});
	return obj;
})();

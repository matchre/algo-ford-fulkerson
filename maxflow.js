"use strict";
function fordFulkerson(node_start, node_end) {
	function f() {
		ui.search(node_start, node_end, {
			found: function(path) {
				var i = path.length, c = Infinity, t;
				while (i > 0) {
					t = path[--i].capacity;
					if (t < c) { c = t; }
				}
				i = path.length;
				while (i > 0) {
					path[--i].b.state = "active";
					path[i].adjustment = c;
				}
				ui.delay(function() {
					var i = path.length;
					while (i > 0) {
						path[--i].b.state = "normal";
						path[i].adjust();
					}
					ui.delay(f);
				});
			},
			unreachable: function(comp) {
				var i = comp.length;
				while (i > 0) { comp[--i].state = "reachable"; }
				ui.state = "completed";
			}
		});
	}
	ui.delay(f);
}

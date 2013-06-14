"use strict";
function breadthFirstSearch(node_start, node_end, opts) {
	var queue = [node_start], info = {}, x, y, e, i;
	if (node_start === node_end) {
		if (typeof(opts.found) !== "undefined") { opts.found([]); }
		return;
	}
	info[node_start.id] = { node: node_start, edge: null };
	while (queue.length > 0) {
		x = queue.shift();
		e = rgraph.edges(x);
		i = e.length;
		while (i > 0) {
			y = e[--i].end;
			if (typeof(info[y.id]) === "undefined") {
				info[y.id] = { node: y, edge: e[i] };
				if (y === node_end) {
					if (typeof(opts.found) !== "undefined") {
						queue = [];
						for (; y !== node_start; y = e.start) {
							e = info[y.id].edge;
							queue.unshift(e);
						}
						opts.found(queue);
					}
					return;
				}
				queue.push(y);
			}
		}
	}
	if (typeof(opts.unreachable) !== "undefined") {
		for (i in info) { queue.push(info[i].node); }
		opts.unreachable(queue);
	}
}
function depthFirstSearch(node_start, node_end, opts) {
	var path = [], info = {}, x = node_start, t, u, e, i;
	while (x !== node_end) {
		t = info[x.id];
		if (typeof(t) === "undefined") {
			t = { node: x, index: 0, edges: rgraph.edges(x) }
			info[x.id] = t;
		}
		x = null;
		while (t.index < t.edges.length) {
			e = t.edges[t.index++];
			u = info[e.end.id];
			if (typeof(u) === "undefined" || u.index === 0) {
				path.push(e);
				x = e.end;
				break;
			}
		}
		if (x === null) {
			if (path.length > 0) {
				t.index = 0;
				x = path.pop().start;
			} else {
				if (typeof(opts.unreachable) !== "undefined") {
					for (i in info) { path.push(info[i].node); }
					opts.unreachable(path);
				}
				return;
			}
		} else {
			if (x === node_end)
				break;
		}
	}
	if (typeof(opts.found) !== "undefined") { opts.found(path); }
}

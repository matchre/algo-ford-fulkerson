"use strict";
var xmlgraph = (function() {
	function ldf(ctx, code) {
		return eval("(" + code.toString() + ")").bind(ctx);
	}
	return Object.create({}, {
		load: {
			writable: false,
			value: function(svg, url, cont) {
				var req = new XMLHttpRequest();
				req.open("GET", url, true);
				req.onreadystatechange = function() {
					var g, opts, x, p, obj, v, w, c,
					    nodes = {}, edges = {}, xalg = [], xcss = [], xsvg = [],
					    scale = 1, info, id_start = "start", id_end = "end";
					if (req.readyState !== 4 || !req.responseXML) {
						return;
					}
					x = req.responseXML.documentElement;
					opts = {
						node_radius: 16.0,
						gauge_width: 10.0,
						gauge_length_ratio: 1.0
					};
					if ((v = x.getAttribute("scale")) !== null) {
						scale = parseFloat(v);
						if (scale <= 0) { scale = 1; }
					}
					if ((v = x.getAttribute("node-radius")) !== null) {
						opts.node_radius = scale * parseFloat(v);
					}
					if ((v = x.getAttribute("gauge-width")) !== null) {
						opts.gauge_width = scale * parseFloat(v);
					}
					if ((v = x.getAttribute("gauge-ratio")) !== null) {
						opts.gauge_length_ratio = scale * parseFloat(v);
					}
					if ((v = x.getAttribute("deviation-ratio")) !== null) {
						opts.deviation_ratio = scale * parseFloat(v);
					}
					if ((v = x.getAttribute("arrow-length")) !== null) {
						opts.arrow_length = scale * parseFloat(v);
					}
					if ((v = x.getAttribute("arrow-angle")) !== null) {
						opts.arrow_angle = parseFloat(v) * (Math.PI / 180.0);
					}
					g = graph.create(svg, opts);
					v = x.getAttribute("width");
					g.svg.width.baseVal.newValueSpecifiedUnits(5, v !== null ? scale * parseFloat(v) : 0);
					v = x.getAttribute("height");
					g.svg.height.baseVal.newValueSpecifiedUnits(5, v !== null ? scale * parseFloat(v) : 0);
					if ((v = x.getAttribute("start")) !== null) {
						id_start = v;
					}
					if ((v = x.getAttribute("end")) !== null) {
						id_end = v;
					}
					info = x.getAttribute("info");
					for (p = x.firstChild; p !== null; p = p.nextSibling) {
						if (p.nodeType !== 1 || p.nodeName !== "node") {
							continue;
						}
						v = p.getAttribute("x");
						w = p.getAttribute("y");
						if (v === null || w === null) {
							continue;
						}
						obj = g.addNode(scale * parseFloat(v), scale * parseFloat(w));
						if ((v = p.getAttribute("radius")) !== null) {
							obj.radius = scale * parseFloat(v);
						}
						if ((v = p.getAttribute("id")) !== null) {
							nodes[v] = obj;
							obj.svg.setAttribute("id", "g-" + v);
						}
					}
					for (p = x.firstChild; p !== null; p = p.nextSibling) {
						if (p.nodeType !== 1 || p.nodeName !== "edge") {
							continue;
						}
						v = p.getAttribute("s");
						w = p.getAttribute("t");
						c = p.getAttribute("c");
						if (v === null || w === null || c === null) {
							continue;
						}
						if (typeof(nodes[v]) === "undefined" || typeof(nodes[w]) === "undefined") {
							continue;
						}
						obj = g.addEdge(nodes[v], nodes[w], parseFloat(c));
						if ((v = p.getAttribute("id")) !== null) {
							edges[v] = obj;
							obj.svg.setAttribute("id", "g-" + v);
						}
						if ((v = p.getAttribute("rev")) !== null) {
							obj.low_mark = -parseFloat(v);
						}
						if ((v = p.getAttribute("start-angle")) !== null) {
							obj.start_angle = parseFloat(v) * (Math.PI / 180.0);
						}
						if ((v = p.getAttribute("end-angle")) !== null) {
							obj.end_angle = parseFloat(v) * (Math.PI / 180.0);
						}
						if ((v = p.getAttribute("gauge-width")) !== null) {
							obj.gauge_width = scale * parseFloat(v);
						}
						if ((v = p.getAttribute("gauge-ratio")) !== null) {
							obj.gauge_length_ratio = scale * parseFloat(v);
						}
						if ((v = p.getAttribute("deviation-ratio")) !== null) {
							obj.deviation_ratio = scale * parseFloat(v);
						}
						if ((v = x.getAttribute("arrow-length")) !== null) {
							obj.arrow_length = scale * parseFloat(v);
						}
						if ((v = x.getAttribute("arrow-angle")) !== null) {
							obj.arrow_angle = parseFloat(v) * (Math.PI / 180.0);
						}
					}
					for (p = x.firstChild; p !== null; p = p.nextSibling) {
						if (p.nodeType !== 1 || p.nodeName !== "custom-search") {
							continue;
						}
						v = p.getAttribute("name");
						if (v === null) { v = ""; }
						xalg.push({
							name: v,
							alg: ldf({ nodes: nodes, edges: edges }, p.textContent)
						});
					}
					for (p = x.firstChild; p !== null; p = p.nextSibling) {
						if (p.nodeType !== 1 || p.nodeName !== "stylesheet") {
							continue;
						}
						xcss.push(p.textContent);
					}
					for (p = x.firstChild; p !== null; p = p.nextSibling) {
						if (p.nodeType !== 1 || p.nodeName !== "svg") {
							continue;
						}
						for (v = p.firstChild; v !== null; v = v.nextSibling) {
							xsvg.push(v);
						}
					}
					nodes[id_start].svg.className.baseVal += " start";
					nodes[id_end].svg.className.baseVal += " end";
					cont(Object.create({}, {
						graph: { writable: false, value: g },
						nodes: { writable: false, value: nodes },
						edges: { writable: false, value: edges },
						start: { writable: false, value: nodes[id_start] },
						end:   { writable: false, value: nodes[id_end] },
						xalg:  { writable: false, value: xalg },
						info:  { writable: false, value: info },
						css:   { writable: false, value: xcss },
						svg:   { writable: false, value: xsvg }
					}));
				};
				req.send();
			}
		}
	});
})();

"use strict";
var graph = (function() {
	var proto_Graph = {}, proto_Node = {}, proto_Edge = {};
	return Object.create({}, {
		create: {
			writable: false,
			value: function(svg_root, graph_options) {
				var nodes = {}, edges = {}, counter = 0, gr,
				    node_radius = 0, gauge_width = 0, gauge_length_ratio = 1, deviation_ratio = 0.2,
				    arrow_length = 12, arrow_angle = Math.PI / 6,
				    ns_svg = "http://www.w3.org/2000/svg";
				function get_id() {
					while (typeof(nodes[counter]) !== "undefined" || typeof(edges[counter]) !== "undefined") {
						++counter;
					}
					return counter++;
				}
				if (typeof(graph_options) !== "undefined") {
					if (typeof(graph_options.node_radius) !== "undefined") {
						if (graph_options.node_radius < 0) {
							throw new Error("Radius must be nonnegative");
						}
						node_radius = graph_options.node_radius;
					}
					if (typeof(graph_options.gauge_width) !== "undefined") {
						if (graph_options.node_radius < 0) {
							throw new Error("Gauge width must be nonnegative");
						}
						gauge_width = graph_options.gauge_width;
					}
					if (typeof(graph_options.gauge_length_ratio) !== "undefined") {
						if (graph_options.node_radius < 0) {
							throw new Error("Gauge length ratio must be nonnegative");
						}
						gauge_length_ratio = graph_options.gauge_length_ratio;
					}
					if (typeof(graph_options.deviation_ratio) !== "undefined") {
						if (graph_options.node_radius < 0) {
							throw new Error("Deviation ratio must be nonnegative");
						}
						deviation_ratio = graph_options.deviation_ratio;
					}
					if (typeof(graph_options.arrow_length) !== "undefined") {
						if (graph_options.node_radius < 0) {
							throw new Error("Arrow length must be nonnegative");
						}
						arrow_length = graph_options.arrow_length;
					}
					if (typeof(graph_options.arrow_angle) !== "undefined") {
						arrow_angle = graph_options.arrow_angle;
					}
				}
				gr = Object.create(proto_Graph, {
					addNode: {
						writable: false,
						value: function(x, y) {
							var node,
							    dom = document.createElementNS(ns_svg, "circle"),
							    id = get_id(),
							    c = geom.vec(x, y),
							    r = node_radius,
							    node_edges = {},
							    state = "normal";
							function refresh() {
								var i;
								for (i in node_edges) { node_edges[i].redraw(); }
							}
							node = Object.create(proto_Node, {
								graph: {
									get: function() { return gr; }
								},
								id : {
									get: function() { return id; }
								},
								svg: {
									get: function() { return dom; }
								},
								center: {
									get: function() { return c; },
									set: function(v) {
										c = v;
										dom.cx.baseVal.newValueSpecifiedUnits(1, v.x);
										dom.cy.baseVal.newValueSpecifiedUnits(1, v.y);
										refresh();
									}
								},
								radius: {
									get: function() { return r; },
									set: function(v) {
										if (v < 0) {
											throw new Error("Radius must be nonnegative");
										}
										r = v;
										dom.r.baseVal.newValueSpecifiedUnits(1, v);
										refresh();
									}
								},
								state: {
									get: function() { return state; },
									set: function(v) {
										if (! /^\w*$/.test(v)) {
											throw new Error("Invalid state string");
										}
										state = v;
										dom.className.baseVal = dom.className.baseVal.replace(
											/\s{1,}state-\w*/, " state-" + state);
									}
								},
								remove: {
									writable: false,
									value: function() {
										var i;
										for (i in node_edges) { node_edges[i].obj.remove(); }
										delete nodes[id];
										svg_root.removeChild(dom);
									}
								},
								edges: {
									get: function() {
										var i, x = [];
										for (i in node_edges) { x.push(node_edges[i].obj); }
										return x;
									}
								}
							});
							dom.className.baseVal = "node state-" + state;
							dom.cx.baseVal.newValueSpecifiedUnits(1, c.x);
							dom.cy.baseVal.newValueSpecifiedUnits(1, c.y);
							dom.r.baseVal.newValueSpecifiedUnits(1, r);
							dom.style.pointerEvents = "all";
							svg_root.appendChild(dom);
							nodes[id] = { obj: node, edges: node_edges };
							dom.addEventListener("mousedown", function(evt) {
								var offset = c.sub(geom.vec(evt.screenX, evt.screenY));
								function on_move(evt) {
									node.center = offset.add(geom.vec(evt.screenX, evt.screenY));
									evt.stopPropagation();
									evt.preventDefault();
								}
								function on_up(evt) {
									node.center = offset.add(geom.vec(evt.screenX, evt.screenY));
									svg_root.removeEventListener("mousemove", on_move, true);
									svg_root.removeEventListener("mouseup", on_up, true);
									evt.stopPropagation();
									evt.preventDefault();
								}
								svg_root.addEventListener("mousemove", on_move, true);
								svg_root.addEventListener("mouseup", on_up, true);
								evt.stopPropagation();
								evt.preventDefault();
							}, true);
							dom.addEventListener("touchstart", function(evt) {
								var t = evt.touches.item(0),
								    offset = c.sub(geom.vec(t.screenX, t.screenY));
								function on_move(evt) {
									var t = evt.touches.item(0);
									node.center = offset.add(geom.vec(t.screenX, t.screenY));
									evt.stopPropagation();
									evt.preventDefault();
								}
								function on_up(evt) {
									var t = evt.touches.item(0);
									node.center = offset.add(geom.vec(t.screenX, t.screenY));
									dom.removeEventListener("touchmove", on_move, true);
									dom.removeEventListener("touchend", on_up, true);
									evt.stopPropagation();
									evt.preventDefault();
								}
								dom.addEventListener("touchmove", on_move, true);
								dom.addEventListener("touchend", on_up, true);
								evt.stopPropagation();
								evt.preventDefault();
							}, true);
							return node;
						}
					},
					addEdge: {
						writable: false,
						value: function(node_start, node_end, capacity) {
							if (! (proto_Node.isPrototypeOf(node_start) && proto_Node.isPrototypeOf(node_end))) {
								throw new Error("Node objects expected");
							}
							if (gr !== node_start.graph || gr !== node_end.graph) {
								throw new Error("Parent graphs mismatch");
							}
							if (capacity < 0) {
								throw new Error("Edge capacity must be nonnegative");
							}
							var edge,
							    dom = document.createElementNS(ns_svg, "g"),
							    dom_LS = document.createElementNS(ns_svg, "path"),
							    dom_AS = document.createElementNS(ns_svg, "path"),
							    dom_LE = document.createElementNS(ns_svg, "path"),
							    dom_AE = document.createElementNS(ns_svg, "path"),
							    dom_BG = document.createElementNS(ns_svg, "path"),
							    dom_RC = document.createElementNS(ns_svg, "path"),
							    dom_RU = document.createElementNS(ns_svg, "path"),
							    dom_RA = document.createElementNS(ns_svg, "path"),
							    id = get_id(), state = "normal",
							    high = capacity, low = 0, used = 0, adj = 0,
							    start_angle = 0, end_angle = 0, g_width = gauge_width,
							    gl_ratio = gauge_length_ratio, dev_ratio = deviation_ratio,
							    arr_length = arrow_length, arr_angle = arrow_angle;
							function updateClass(rx, str) {
								dom.className.baseVal = dom.className.baseVal.replace(rx, "") + str;
							}
							function initArc(x) {
								var sl = x.pathSegList;
								sl.initialize(x.createSVGPathSegMovetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegCurvetoQuadraticAbs(0, 0, 0, 0));
							}
							function initArrow(x) {
								var sl = x.pathSegList;
								sl.initialize(x.createSVGPathSegMovetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegClosePath());
							}
							function initRect(x) {
								var sl = x.pathSegList;
								sl.initialize(x.createSVGPathSegMovetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegClosePath());
							}
							function initDoubleRect(x) {
								var sl = x.pathSegList;
								sl.initialize(x.createSVGPathSegMovetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
								sl.appendItem(x.createSVGPathSegLinetoAbs(0, 0));
							}
							function setSegMoveTo(sl, i, w) {
								var s = sl.getItem(i);
								s.x = w.x;
								s.y = w.y;
							}
							function setSegLineTo(sl, i, w) {
								var s = sl.getItem(i);
								s.x = w.x;
								s.y = w.y;
							}
							function setSegCurveTo(sl, i, c, e) {
								var s = sl.getItem(i);
								s.x = e.x;
								s.y = e.y;
								s.x1 = c.x;
								s.y1 = c.y;
							}
							function setArc(x, p) {
								var sl = x.pathSegList;
								setSegMoveTo(sl, 0, p.s);
								setSegCurveTo(sl, 1, p.c, p.e);
							}
							function setArrow(x, p) {
								var sl = x.pathSegList;
								setSegMoveTo(sl, 0, p.t);
								setSegLineTo(sl, 1, p.p0);
								setSegLineTo(sl, 2, p.p1);
							}
							function setRect(x, p) {
								var sl = x.pathSegList, t = p.b.add(p.u);
								setSegMoveTo(sl, 0, p.b);
								setSegLineTo(sl, 1, t);
								setSegLineTo(sl, 2, t.add(p.v));
								setSegLineTo(sl, 3, p.b.add(p.v));
							}
							function setDoubleRect(x, p) {
								var sl = x.pathSegList, s = p.b.add(p.v),
								    t0 = p.b.add(p.u0), t1 = p.b.add(p.u1);
								setSegMoveTo(sl, 0, p.b);
								setSegLineTo(sl, 1, t0);
								setSegLineTo(sl, 2, t0.add(p.v));
								setSegLineTo(sl, 3, s);
								setSegLineTo(sl, 4, p.b);
								setSegLineTo(sl, 5, t1);
								setSegLineTo(sl, 6, t1.add(p.v));
								setSegLineTo(sl, 7, s);
							}
							function redraw() {
								var pos = computeEdge();
								setArc(dom_LS, pos.arc_before);
								setArrow(dom_AS, pos.arrow_before);
								setArc(dom_LE, pos.arc_after);
								setArrow(dom_AE, pos.arrow_after);
								setRect(dom_BG, pos.gauge_bg);
								setDoubleRect(dom_RC, pos.gauge_rect);
								setRect(dom_RU, pos.gauge_used);
								setRect(dom_RA, pos.gauge_adj);
								if (pos.arc_len >= 0.7 * arr_length) {
									dom_LS.style.visibility = "visible";
									dom_AS.style.visibility = "visible";
									dom_LE.style.visibility = "visible";
									dom_AE.style.visibility = "visible";
								} else {
									dom_LS.style.visibility = "hidden";
									dom_AS.style.visibility = "hidden";
									dom_LE.style.visibility = "hidden";
									dom_AE.style.visibility = "hidden";
								}
								if (adj === 0) {
									updateClass(/\s{1,}adj-\w*/, "");
									dom_RA.style.visibility = "hidden";
								} else {
									updateClass(/\s{1,}adj-\w*/, (adj > 0 ? " adj-positive" : " adj-negative"));
									dom_RA.style.visibility = "visible";
								}
							}
							function computeEdge() {
								var a, b, x, y, d, gl, u, v, dl, da, db, u_low, u_used, m, rb, s, ca, cb, mu, xa;
								a = node_start.center;
								b = node_end.center;
								x = b.sub(a);
								d = x.length();
								x = (d > 0) ? x.mul(1 / d) : geom.vec(1, 0);
								y = x.rotate(Math.PI / 2);
								gl = gauge_length_ratio * (high - low);
								u = x.mul(gl);
								u_low = x.mul(gauge_length_ratio * low);
								u_used = x.mul(gauge_length_ratio * used);
								v = y.mul(gauge_width);
								da = x.rotate(start_angle);
								db = x.rotate(end_angle + Math.PI);
								a = a.add(da.mul(node_start.radius));
								b = b.add(db.mul(node_end.radius));
								dl = deviation_ratio * Math.max(0, d - gl);
								m = a.add(da.mul(dl)).add(b.add(db.mul(dl))).mul(0.5).sub(u.mul(0.5));
								mu = m.add(u);
								rb = m.sub(v.mul(0.5)).sub(u_low);
								if (Math.abs(s = y.dot(da)) > 0.1) {
									ca = a.add(da.mul(y.dot(m.sub(a)) / s));
								} else {
									ca = m.add(a).mul(0.5);
								}
								if (Math.abs(s = y.dot(db)) > 0.1) {
									cb = b.add(db.mul(y.dot(mu.sub(b)) / s));
								} else {
									cb = mu.add(b).mul(0.5);
								}
								da = da.mul(arr_length);
								db = db.mul(arr_length);
								return {
									arc_len: 0.5 * (d - node_start.radius - node_end.radius - gl),
									arc_before: { s: a, c: ca, e: m },
									arc_after: { s: mu, c: cb, e: b },
									arrow_before: { t: a, p0: a.add(da.rotate(arr_angle)),
									                p1: a.add(da.rotate(-arr_angle)) },
									arrow_after: { t: b, p0: b.add(db.rotate(arr_angle)),
									               p1: b.add(db.rotate(-arr_angle)) },
									gauge_bg: { b: rb.add(u_low), u: u, v: v },
									gauge_rect: { b: rb, u0: x.mul(gauge_length_ratio * high), u1: u_low, v: v },
									gauge_used: { b: rb, u: u_used, v: v },
									gauge_adj: { b: rb.add(u_used), u: x.mul(gauge_length_ratio * adj), v: v }
								};
							}
							dom.className.baseVal = "edge state-" + state + (high > 0 ? " capa-positive" : "");
							dom_LS.className.baseVal = "line-start";
							dom_AS.className.baseVal = "arrow-start";
							dom_LE.className.baseVal = "line-end";
							dom_AE.className.baseVal = "arrow-end";
							dom_BG.className.baseVal = "gauge-bg";
							dom_RC.className.baseVal = "gauge-rect";
							dom_RU.className.baseVal = "gauge";
							dom_RA.className.baseVal = "gauge-adj";
							initArc(dom_LS);
							initArrow(dom_AS);
							initArc(dom_LE);
							initArrow(dom_AE);
							initRect(dom_BG);
							initDoubleRect(dom_RC);
							initRect(dom_RU);
							initRect(dom_RA);
							dom.appendChild(dom_BG);
							dom.appendChild(dom_LS);
							dom.appendChild(dom_LE);
							dom.appendChild(dom_AS);
							dom.appendChild(dom_AE);
							dom.appendChild(dom_RU);
							dom.appendChild(dom_RA);
							dom.appendChild(dom_RC);
							svg_root.appendChild(dom);
							edge = Object.create(proto_Edge, {
								graph: {
									get: function() { return gr; }
								},
								id: {
									get: function() { return id; }
								},
								svg: {
									get: function() { return dom; }
								},
								start: {
									get: function() { return node_start; }
								},
								end: {
									get: function() { return node_end; }
								},
								start_angle: {
									get: function() { return start_angle; },
									set: function(v) {
										if (start_angle !== v) {
											start_angle = v;
											redraw();
										}
									}
								},
								end_angle: {
									get: function() { return end_angle; },
									set: function(v) {
										if (end_angle !== v) {
											end_angle = v;
											redraw();
										}
									}
								},
								gauge_width: {
									get: function() { return g_width; },
									set: function(v) {
										if (v < 0) {
											throw new Error("Gauge width must be nonnegative");
										}
										if (g_width !== v) {
											g_width = v;
											redraw();
										}
									}
								},
								gauge_length_ratio: {
									get: function() { return gl_ratio; },
									set: function(v) {
										if (v < 0) {
											throw new Error("Gauge length ratio must be nonnegative");
										}
										if (gl_ratio !== v) {
											gl_ratio = v;
											redraw();
										}
									}
								},
								deviation_ratio: {
									get: function() { return dev_ratio; },
									set: function(v) {
										if (v < 0) {
											throw new Error("Deviation ratio must be nonnegative");
										}
										if (dev_ratio !== v) {
											dev_ratio = v;
											redraw();
										}
									}
								},
								arrow_length: {
									get: function() { return arr_length; },
									set: function(v) {
										if (v < 0) {
											throw new Error("Arrow length must be nonnegative");
										}
										if (arr_length !== v) {
											arr_length = v;
											redraw();
										}
									}
								},
								arrow_angle: {
									get: function() { return arr_angle; },
									set: function(v) {
										if (arr_angle !== v) {
											arr_angle = v;
											redraw();
										}
									}
								},
								high_mark: {
									get: function() { return high; },
									set: function(v) {
										if (v < 0) {
											throw new Error("High mark must be nonnegative");
										}
										if (high !== v || adj !== 0) {
											high = v; adj = 0;
											if (used > v) { used = v; }
											updateClass(/\s{1,}capa-positive\b/,
												(v > 0 ? " capa-positive" : ""));
											redraw();
										}
									}
								},
								low_mark: {
									get: function() { return low; },
									set: function(v) {
										if (v > 0) {
											throw new Error("Low mark must be non positive");
										}
										if (low !== v || adj !== 0) {
											low = v; adj = 0;
											if (used < v) { used = v; }
											updateClass(/\s{1,}capa-negative\b/,
												(v < 0 ? " capa-negative" : ""));
											redraw();
										}
									}
								},
								used: {
									get: function() { return used; },
									set: function(v) {
										if (v < low || v > high) {
											throw new Error("Edge usage is out of range");
										}
										if (used !== v || adj !== 0) {
											used = v; adj = 0;
											updateClass(/\s{1,}used-\w*/,
												(v > 0 ? " used-positive"
												       : (v < 0 ? " used-negative" : "")));
											redraw();
										}
									}
								},
								adjustment: {
									get: function() { return adj; },
									set: function(v) {
										if (v < low - used || v > high - used) {
											throw new Error("Edge adjustment is out of range");
										}
										if (adj !== v) {
											adj = v;
											redraw();
										}
									}
								},
								adjust: {
									writable: false,
									value: function() { edge.used = used + adj; }
								},
								state: {
									get: function() { return state; },
									set: function(v) {
										if (! /^\w*$/.test(v)) {
											throw new Error("Invalid state string");
										}
										if (state !== v) {
											state = v;
											updateClass(/\s{1,}state-\w*/, " state-" + v);
										}
									}
								},
								remove: {
									writable: false,
									value: function() {
										svg_root.removeChild(dom);
										delete edges[id];
										delete nodes[node_start.id].edges[id];
										delete nodes[node_end.id].edges[id];
									}
								}
							});
							edges[id] = { obj: edge, redraw: redraw };
							nodes[node_start.id].edges[id] = edges[id];
							nodes[node_end.id].edges[id] = edges[id];
							redraw();
							return edge;
						}
					},
					clear: {
						writeable: false,
						value: function() {
							var i;
							for (i in nodes) { nodes[i].obj.remove(); }
						}
					},
					svg: {
						get: function() { return svg_root; }
					},
					nodes: {
						get: function() {
							var i, x = [];
							for (i in nodes) { x.push(nodes[i].obj); }
							return x;
						}
					},
					edges: {
						get: function() {
							var i, x = [];
							for (i in edges) { x.push(edges[i].obj); }
							return x;
						}
					}
				});
				return gr;
			}
		}
	});
})();

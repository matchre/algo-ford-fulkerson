"use strict";
var ui = (function() {
	var dom = {}, obj, gdscs = [], gobj = null, nstart, nend, state = "initial",
	    tmid = null, delayed = null, calgs = null, ialg = null,
	    xcss = [], xsvg = [],
	    ns_svg = "http://www.w3.org/2000/svg",
	    salgs = [ { name: "Parcours en largeur", alg: breadthFirstSearch },
	              { name: "Parcours en profondeur", alg: depthFirstSearch } ];
	obj = Object.create({}, {
		init: {
			writable: false,
			value: function() {
				var xhr = new XMLHttpRequest();
				dom.param = document.getElementById("btn-param");
				dom.start = document.getElementById("btn-start");
				dom.info = document.getElementById("sp-info");
				dom.panel = document.getElementById("panel");
				dom.pgraph = document.getElementById("sel-graph");
				dom.palgo = document.getElementById("sel-algo");
				dom.pclose = document.getElementById("btn-close");
				dom.svg = document.getElementById("graph");
				dom.param.addEventListener("click", function() {
					dom.panel.style.display = "block";
				}, false);
				dom.pclose.addEventListener("click", function() {
					dom.panel.style.display = "none";
				}, false);
				dom.pgraph.addEventListener("change", function() {
					obj.loadGraph();
				}, false);
				dom.palgo.addEventListener("change", function() {
					ialg = dom.palgo.selectedIndex;
				}, false);
				dom.start.addEventListener("click", function() {
					var c;
					if (state === "loaded") {
						obj.state = "running";
						fordFulkerson(nstart, nend);
					} else if (state === "completed") {
						obj.loadGraph();
					} else if (state === "running") {
						if (tmid !== null) {
							window.clearTimeout(tmid);
							tmid = null;
						}
						obj.state = "paused";
						dom.start.blur();
					} else if (state === "paused") {
						c = delayed;
						obj.state = "running";
						delayed = null;
						c();
					}
				}, false);
				document.addEventListener("keydown", function(evt) {
					var c;
					if (state !== "paused")
						return;
					if (typeof(evt.key) !== "undefined") {
						if (evt.key !== "Spacebar")
							return;
					} else {
						if (evt.keyCode !== 0x20)
							return;
					}
					evt.preventDefault();
					c = delayed;
					delayed = null;
					c();
				}, false);
				dom.svg.addEventListener("touchstart", function(evt) {
					var c;
					if (state !== "paused" || evt.touches.length < 2)
						return;
					evt.stopPropagation();
					evt.preventDefault();
					c = delayed;
					delayed = null;
					c();
				}, false);
				xhr.open("GET", "graphs.xml", true);
				xhr.onreadystatechange = function() {
					var x, d, o;
					if (xhr.readyState !== 4 || !xhr.responseXML)
						return;
					for (x = xhr.responseXML.documentElement.firstChild; x !== null; x = x.nextSibling) {
						if (x.nodeType !== 1 || x.nodeName !== "graph")
							continue;
						d = {
							name: x.getAttribute("name"),
							url:  x.getAttribute("desc")
						};
						o = document.createElement("option");
						o.appendChild(document.createTextNode(d.name));
						dom.pgraph.appendChild(o);
						gdscs.push(d);
					}
					obj.loadGraph();
				}
				xhr.send();
			}
		},
		loadGraph: {
			writable: false,
			value: function() {
				obj.state = "initial";
				xmlgraph.load(dom.svg, gdscs[dom.pgraph.selectedIndex].url, function(xd) {
					var i, j, x, y, z;
					gobj = xd.graph;
					nstart = xd.start;
					nend = xd.end;
					if (ialg !== null) {
						z = calgs[ialg].name;
					}
					while ((x = dom.palgo.firstChild) !== null) {
						dom.palgo.removeChild(x);
					}
					calgs = [];
					for (i = 0; i < salgs.length; ++i) {
						calgs.push(salgs[i]);
					}
					for (i = 0; i < xd.xalg.length; ++i) {
						calgs.push(xd.xalg[i]);
					}
					for (i = 0; i < calgs.length; ++i) {
						x = document.createElement("option");
						x.appendChild(document.createTextNode(calgs[i].name));
						dom.palgo.appendChild(x);
					}
					if (ialg === null) {
						ialg = 0;
					} else if (ialg >= calgs.length || calgs[ialg].name !== z) {
						ialg = null;
						for (i = 0; i < calgs.length; ++i) {
							if (calgs[i].name === z) {
								ialg = i;
								break;
							}
						}
						if (ialg === null) {
							ialg = 0;
						}
					}
					dom.palgo.selectedIndex = ialg;
					for (i = 0; i < xd.css.length; ++i) {
						x = document.createElement("style");
						x.type = "text/css";
						x.className = "custom-stylesheet";
						x.appendChild(document.createTextNode(xd.css[i]));
						document.head.appendChild(x);
						xcss.push(x);
					}
					i = xd.svg.length;
					while (i > 0) {
						x = document.importNode(xd.svg[--i], true);
						dom.svg.insertBefore(x, dom.svg.firstChild);
						xsvg.push(x);
					}
					if (xd.info !== null) {
						x = document.createElement("a");
						x.target = "_blank";
						x.href = xd.info;
						x.appendChild(document.createTextNode("explications"));
						dom.info.appendChild(x);
					}
					obj.state = "loaded";
				});
			}
		},
		state: {
			get: function() { return state; },
			set: function(v) {
				var x;
				if (v === "initial") {
					if (tmid !== null) {
						window.clearTimeout(tmid);
						tmid = null;
					}
					delayed = null;
					if (gobj !== null) {
						gobj.clear();
						gobj = null;
					}
					while (typeof(x = xsvg.pop()) !== "undefined") {
						dom.svg.removeChild(x);
					}
					dom.svg.width.baseVal.newValueSpecifiedUnits(5, 0);
					dom.svg.height.baseVal.newValueSpecifiedUnits(5, 0);
					while (typeof(x = xcss.pop()) !== "undefined") {
						document.head.removeChild(x);
					}
					while ((x = dom.info.firstChild) !== null) {
						dom.info.removeChild(x);
					}
				} else if (v === "loaded") {
					dom.start.value = "R\u00e9soudre";
					dom.start.disabled = false;
				} else if (v === "running") {
					dom.start.value = "Pause";
					dom.start.disabled = false;
				} else if (v === "paused") {
					dom.start.value = "Continuer";
					dom.start.disabled = false;
				} else if (v === "completed") {
					dom.start.value = "R\u00e9initialiser";
					dom.start.disabled = false;
				} else {
					throw new Error("Invalid UI state name (" + v + ")");
				}
				state = v;
			}
		},
		delay: {
			writable: false,
			value: function(cont) {
				delayed = cont;
				if (state === "running") {
					tmid = window.setTimeout(function() {
						var c = delayed;
						tmid = null;
						delayed = null;
						c();
					}, 1000);
				}
			}
		},
		search: {
			get: function() {
				return calgs[ialg].alg;
			}
		}
	});
	return obj;
})();
document.addEventListener("DOMContentLoaded", ui.init.bind(ui), false);

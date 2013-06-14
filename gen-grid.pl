#!/usr/bin/perl -w
use strict;

my $sx = 800; my $sy = 600;
my $Nx = 7; my $Ny = 5;
my $dx = 100; my $dy = 100;
my $inf = 5000;


print << "EOF";
﻿<?xml version="1.0" encoding="utf-8" standalone="yes"?>

<graph width="$sx" height="$sy" node-radius="10" gauge-width="8">
EOF

my $lx = ($Nx - 1) * $dx; my $decx = ($sx - $lx) / 2;
my $ly = ($Ny - 1) * $dy; my $decy = ($sy - $ly) / 2;


print "<node id=\"start\" x=\"" . ($decx - $inf) . "\" y=\"" . ($decy - $inf) . "\"/>\n";
print "<node id=\"end\" x=\"" . ($decx + $lx + $inf) . "\" y=\"" . ($decy + $ly + $inf) . "\"/>\n";


my $i; my $j; my $x; my $y;
for ($i = 0; $i < $Nx; $i++) {
  $x = $dx*$i + $decx;
  for ($j = 0; $j < $Ny; $j++) {
    $y = $dy*$j + $decy;
    print "<node id=\"$i-$j\" x=\"$x\" y=\"$y\" />\n";
  }
}

my $c = int($inf/2);
$j = $Ny - 1;
for ($i = 0; $i < $Nx-1; $i++) {
  print "<edge s=\"start\" t=\"$i-0\" c=\"$c\" />\n";
  print "<edge t=\"end\" s=\"" . ($i+1) . "-$j\" c=\"$c\" />\n";
}
$i = $Nx - 1;
for ($j = 1; $j < $Ny-1; $j++) {
  print "<edge s=\"start\" t=\"0-$j\" c=\"$c\" />\n";
  print "<edge t=\"end\" s=\"$i-$j\" c=\"$c\" />\n";
}

my @edge = ( );
for ($i = 0; $i < $Nx; $i++) {
  for ($j = 0; $j < $Ny; $j++) {
    $c = int(rand(50)) + 5;
    push @edge, "<edge s=\"$i-$j\" t=\"" . ($i+1) . "-$j\" c=\"$c\" />\n" if $i < $Nx - 1;
    $c = int(rand(50)) + 5;
    push @edge, "<edge s=\"$i-$j\" t=\"$i-" . ($j+1) . "\" c=\"$c\" />\n" if $j < $Ny - 1;
  }
}

my $N = $#edge + 1;
while ($N > 0) {
  my $r = int(rand($N));
  print $edge[$r];
  $N--;
  $edge[$r] = $edge[$N];
}

print << "EOF";

<stylesheet>
  \@namespace svg "http://www.w3.org/2000/svg";

  svg|*.gauge {
    fill: rgb(64,128,255);
    stroke: none;
  }

  svg|*.node {
    fill: red;
  }
  svg|*.node.state-reachable {
    fill: black;
  }

  svg|*.edge.capa-positive > svg|*.arrow-end,
  svg|*.edge.capa-negative > svg|*.arrow-end {
    fill: none;
  }

  svg|*.edge.state-active {
    stroke: black;
    stroke-width: 3px;
  }

  svg|*.edge.state-active.adj-positive > svg|*.arrow-end {
    stroke: black;
    stroke-width: 2px;
    fill: black;
  }

  svg|*.edge.state-active.adj-negative {
    stroke: rgb(128,0,0);
    stroke-width: 3px;
  }

  svg|*.edge.state-active.adj-negative > svg|*.arrow-start {
    stroke: rgb(128,0,0);
    stroke-width: 2px;
    fill: rgb(128,0,0);
  }

  svg|*.edge.adj-positive:not(.used-negative) > svg|*.gauge-adj,
  svg|*.edge.adj-negative:not(.used-positive) > svg|*.gauge-adj {
    fill: rgb(64,255,64);
  }

  svg|*.edge.adj-negative.used-positive > svg|*.gauge-adj,
  svg|*.edge.adj-positive.used-negative > svg|*.gauge-adj {
    fill: rgb(255,64,64);
  }
</stylesheet>

</graph>
EOF

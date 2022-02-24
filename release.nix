let
  pkgs = import <nixpkgs> { config = {}; overlays = []; };
in {
  example-data = pkgs.callPackage ./example-data.nix {};
  gnuplot-js = pkgs.callPackage ./gnuplot-js.nix {};
  graph1 = pkgs.callPackage ./generate-graph.nix {};
}

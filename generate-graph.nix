{ pkgs, runCommand, substituteAll, gnuplot }:

let
  gnuplot-js = pkgs.callPackage ./gnuplot-js.nix {};
in substituteAll {
  name = "graph.html";
  src = ./template.html;
  dir = ".";
  postInstall = ''
    ln -sv ${gnuplot-js}/*js $out/
    cat > $out/second-file.txt <<EOF
    1 2
    2 4
    4 8
    EOF
    ln -sv ${gnuplot}/share/gnuplot/5.4/js $out/jsdir
  '';
  config = builtins.toJSON {
    script = ''
      set terminal svg size 400,300 enhanced fname 'arial'  fsize 10 butt solid
      #set terminal canvas jsdir 'jsdir'
      set output 'out.svg'

      set key inside bottom right
      set xlabel 'Deflection (m)'
      set ylabel 'Force (kN)'
      set title 'Some Data'
      plot  "data.txt" using 1:2 title 'Col-Force' with lines, "data.txt" using 1:3 title 'Beam -Force' with linespoints
    '';
    files = {
      "data.txt" = ''
        1 2 3
        4 5 6
        7 8 9
      '';
    };
    neededFiles = [ "lk.bin" ];
    processScript = ''
      function (files) {
        const view = new Int8Array(files."lk.bin");
        function sum(previous, current) {
          return previous + current;
        }
        return {
          files = {
            "file1.txt" = view.reduce(sum)
          };
          plotCommands = {
            graph1 = "plot \"file1.txt\" using 1:2";
          };
        };
      }
    '';
    graphOrder = [ "graph2" "graph1" ];
  };
}

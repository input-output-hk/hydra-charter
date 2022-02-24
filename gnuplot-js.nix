{ stdenv, fetchFromGitHub }:

stdenv.mkDerivation {
  name = "gnuplot-js";
  src = fetchFromGitHub {
    owner = "chhu";
    repo = "gnuplot-JS";
    rev = "62a3c8488ad00c97807ba48ae75738ca3af607fe";
    hash = "sha256-dPI9+LIQ4NhOzmZ/C4dttTTHbK+7J2GUD+V1fD1e31M=";
  };
  installPhase = ''
    mv -vi www $out
  '';
}

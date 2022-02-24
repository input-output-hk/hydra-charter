{ runCommand }:

runCommand "example-data" {
  exampleData = builtins.toJSON {
  };
  passAsFile = [ "exampleData" ];
} ''
  mkdir $out
  cp $exampleDataPath $out/data.json
''

import plumbum as pb
from plumbum import cli
import json

_CELL_DATA_MAX_SIZE = 1023


def split_into_cells(data, chunk_size=_CELL_DATA_MAX_SIZE):
    return [data[i : i + chunk_size] for i in range(0, len(data), chunk_size)]


class Gen(cli.Application):
    input = cli.SwitchAttr(["-i", "--input"], cli.ExistingFile, default="input.json")
    output = cli.SwitchAttr(
        ["-o", "--output"], pb.LocalPath, default=pb.LocalPath("./output.ts")
    )
    repeat_input = cli.SwitchAttr(["-r", "--repeat-input"], int, default=1)

    find_value = cli.SwitchAttr(["-f", "--find"], str, default="")
    replace_value = cli.SwitchAttr(["-p", "--replace"], str, default="")

    def main(self):
        input = self.input.read().strip()
        data = input
        for i in range(self.repeat_input):
            data += input

        output_data = data.replace(self.find_value, self.replace_value)

        result = (
            f"const input = {json.dumps(split_into_cells(data))};\n"
            f"const output = {json.dumps(output_data)};\n"
            "export { input, output };"
        )
        self.output.write(result)


if __name__ == "__main__":
    Gen.run()

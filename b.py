import json

_CELL_DATA_MAX_SIZE = 1023


def split_into_cells(data, chunk_size=_CELL_DATA_MAX_SIZE):
    return [data[i : i + chunk_size] for i in range(0, len(data), chunk_size)]


def main():
    input = '10111'
    flag = "1010"
    value = "1000"
    output_data = input.replace(flag, value)
    print(len(input))
    result = (
        f"const input = {json.dumps(split_into_cells(input))};\n"
            f"const output = {json.dumps(output_data)};\n"
            f"const flag = 0b{flag}n\n"
            f"const value = 0b{value}n\n"
            "export { input, output, flag, value };"
        )
    with open('out.ts', 'w') as f:
        f.write(result)

main()
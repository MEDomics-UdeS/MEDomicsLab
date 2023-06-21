import json
import os

import os
import sys
import argparse

# py .\MEDml\utils\underscoresToCamelCase.py ./flaskProject/static/drawflow_objects.js -o ./MEDml/utils/convertedFile.js

def main(arguments):

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('infile', help="Input file", type=argparse.FileType('r'))
    parser.add_argument('-o', '--outfile', help="Output file",
                        default=sys.stdout, type=argparse.FileType('w'))

    args = parser.parse_args(arguments)

    print(args)
    input_string = args.infile.read()
    underscores_index = [i for i, ltr in enumerate(input_string) if ltr == '_']
    output_string = input_string
    counter = 0
    for index in underscores_index:
        input_string = input_string[:index+1] + input_string[index + 1].upper() + input_string[index + 2:]

    args.outfile.write(input_string.replace('_', ''))

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

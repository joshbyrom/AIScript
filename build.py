import os, sys, fnmatch

ignore = ['processing.js']
def get_js_files(path):
    js = []
    for path, dirs, files in os.walk(path):
        for file in files:
            if not file in ignore and fnmatch.fnmatch(file.lower(), r'*.js'):
                    js.append(os.path.join(path, file))
    return js

target = r'*PACK-HERE*'
def get_main_file(js_files):
    for dot_js in js_files:
        FILE = open(dot_js, 'r')
        for line in FILE.readlines():
            if fnmatch.fnmatch(line, target):
                return dot_js
        FILE.close()

def build(main, files, output):
    IN = open(main, 'r')
    OUT = open(output, 'w')

    for in_line in IN.readlines():
        if fnmatch.fnmatch(in_line, target):
            for file in files:
                FILE = open(file, 'r')
                for line in FILE.readlines():
                    OUT.write(line)
                FILE.close()
        else:
            OUT.write(in_line)

    OUT.close()
    IN.close()
        
if __name__ == '__main__':
    files= get_js_files(sys.path[0])
    
    main= get_main_file(files)
    files = [x for x in files if x != main]

    outfile = os.path.join(sys.path[0],'build','AIScript.js')
    
    build(main, files, outfile)

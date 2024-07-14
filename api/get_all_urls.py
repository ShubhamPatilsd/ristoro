import ast

def get_url_list():
    f = open("maps_list.txt", "r")
    file_contents = f.read()
    file_contents = ast.literal_eval(file_contents)
    return file_contents


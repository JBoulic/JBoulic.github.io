import csv
import json
import os

data_dir = os.path.dirname(__file__)
data = {}
LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
           "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"]

def generate_words():
    print("--Letter pair words started--")
    with open(os.path.join(data_dir, 'words.csv'), encoding="utf8", mode='r') as csv_file:
        letter_1_row = None
        for row in csv.reader(csv_file):
            if letter_1_row == None:
                letter_1_row = row
            else:
                for i in range(1, len(row)):
                    if letter_1_row[i] == row[0]:
                        continue
                    letter_pair = letter_1_row[i] + row[0]
                    data[letter_pair] = {}
                    data[letter_pair]["word"] = row[i].replace("'", "\\u0027")
    print("--Letter pair words processed--")

def generate_x_centers():
    print("--X center algs started--")
    with open(os.path.join(data_dir, 'x_centers.csv'), encoding="utf8", mode='r') as csv_file:
        rows = [row for row in csv.reader(csv_file)]
        for i in range(len(rows)):
            for j in range(len(rows[i])):
                if '\ufeff' in rows[i][j]:
                    rows[i][j] = rows[i][j].strip('\ufeff')
                letter_pair_1 = LETTERS[i] + LETTERS[j]
                letter_pair_2 = LETTERS[j] + LETTERS[i]
                if len(rows[i][j]) == 0:
                    continue
                elif rows[i][j] == "twist":
                    print("Twist: " + letter_pair_1 + " " + letter_pair_2)
                else:
                    if letter_pair_1 not in data:
                        print("MISSING LETTER PAIR: " + letter_pair_1)
                        continue
                    elif letter_pair_2 not in data:
                        print("MISSING LETTER PAIR: " + letter_pair_2)
                        continue
                    alg = rows[i][j].replace("'", "\\u0027")
                    data[letter_pair_1]["x_center_alg"] = alg
                    data[letter_pair_2]["x_center_alg"] = alg
    print("--X center algs processed--")

def generate_wings():
    print("--Wings algs started--")
    with open(os.path.join(data_dir, 'wings.csv'), encoding="utf8", mode='r') as csv_file:
        letter_1_row = None
        for row in csv.reader(csv_file):
            if letter_1_row == None:
                letter_1_row = row
            else:
                for i in range(1, len(row)):
                    if letter_1_row[i] >= row[0]:
                        break
                    letter_pair_1 = letter_1_row[i] + row[0]
                    letter_pair_2 = row[0] + letter_1_row[i]
                    if letter_pair_1 not in data:
                        print("MISSING LETTER PAIR: " + letter_pair_1)
                        continue
                    elif letter_pair_2 not in data:
                        print("MISSING LETTER PAIR: " + letter_pair_2)
                        continue
                    alg = row[i].replace("'", "\\u0027")
                    data[letter_pair_1]["wing_alg"] = alg
                    data[letter_pair_2]["wing_alg"] = alg
    print("--Wings algs processed--")

generate_words()
generate_x_centers()
generate_wings()

# Dump json
json_dump = json.dumps(data)
# print(json_dump)
f = open(os.path.join(data_dir, "data.json"), "w")
f.write("json_data = '" + json_dump + "';")
f.close()
print("Data saved in data.json")

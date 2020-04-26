import csv
import json

data = {}
LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"]

def generate_letter_pair_words():
    print("--Letter pair words started--")
    with open('letter_pair_words.csv', encoding="utf8", mode='r') as csv_file:
        for row in csv.reader(csv_file):
            letter_pair = row[0] + row[1]
            # Handle first invisible character
            if '\ufeff' in letter_pair:
                letter_pair = letter_pair.strip('\ufeff')
            data[letter_pair] = {}
            data[letter_pair]["word"] = row[2].replace("'", "\\u0027")
            if len(row[2]) == 0:
                print("Missing letter pair words: " + letter_pair)
    print("--Letter pair words processed--")

def generate_corner_algs():
    print("--Corner algs started--")
    with open('corner_algs.csv', encoding="utf8", mode='r') as csv_file:
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
                    if letter_pair_1 not in data or letter_pair_2 not in data:
                        print("Oops, corner " + letter_pair_1 + " or " + letter_pair_2 + " have not letter_pair entry")
                        continue
                    data[letter_pair_1]["corner_alg"] = rows[i][j].replace("'", "\\u0027")
                    data[letter_pair_2]["corner_alg"] = rows[i][j].replace("'", "\\u0027")
    print("--Corner algs processed--")

def generate_corner_twist_algs():
    print("--Corner twist algs started--")
    with open('corner_twist_algs.csv', encoding="utf8", mode='r') as csv_file:
        for row in csv.reader(csv_file):
            if '\ufeff' in row[0]:
                row[0] = row[0].strip('\ufeff')
            letters = row[0].split(" / ")
            for i in range(3):
                letter_pair_1 = letters[i] + letters[(i + 1) % 3]
                letter_pair_2 = letters[(i + 1) % 3] + letters[i]
                print(letter_pair_1 + " " + letter_pair_2)
                if letter_pair_1 not in data or letter_pair_2 not in data:
                    print("Oops, corner twist " + letter_pair_1 + " or " + letter_pair_2 + " have not letter_pair entry")
                    continue
                data[letter_pair_1]["corner_twist_alg"] = row[1].replace("'", "\\u0027")
                data[letter_pair_2]["corner_twist_alg"] = row[2].replace("'", "\\u0027")
    print("--Corner twist algs processed--")

def generate_edge_algs():
    print("--Edge algs started--")
    with open('edge_algs.csv', encoding="utf8", mode='r') as csv_file:
        rows = [row for row in csv.reader(csv_file)]
        for i in range(len(rows)):
            for j in range(len(rows[i])):
                if '\ufeff' in rows[i][j]:
                    rows[i][j] = rows[i][j].strip('\ufeff')
                letter_pair_1 = LETTERS[i] + LETTERS[j]
                letter_pair_2 = LETTERS[j] + LETTERS[i]
                if len(rows[i][j]) == 0:
                    continue
                elif rows[i][j] == "flip":
                    print("Flip: " + letter_pair_1 + " " + letter_pair_2)
                else:
                    if letter_pair_1 not in data or letter_pair_2 not in data:
                        print("Oops, edge " + letter_pair_1 + " or " + letter_pair_2 + " have not letter_pair entry")
                        continue
                    data[letter_pair_1]["edge_alg"] = rows[i][j].replace("'", "\\u0027")
                    data[letter_pair_2]["edge_alg"] = rows[i][j].replace("'", "\\u0027")
    print("--Edge algs processed--")

def generate_edge_flip_algs():
    print("--Edge flip algs started--")
    with open('edge_flip_algs.csv', encoding="utf8", mode='r') as csv_file:
        for row in csv.reader(csv_file):
            if '\ufeff' in row[0]:
                row[0] = row[0].strip('\ufeff')
            letters = row[0].split(" / ")
            letter_pair_1 = letters[0] + letters[1]
            letter_pair_2 = letters[1] + letters[0]
            print(letter_pair_1 + " " + letter_pair_2)
            if letter_pair_1 not in data or letter_pair_2 not in data:
                print("Oops, edge flip " + letter_pair_1 + " or " + letter_pair_2 + " have not letter_pair entry")
                continue
            data[letter_pair_1]["edge_flip_alg"] = row[1].replace("'", "\\u0027")
            data[letter_pair_2]["edge_flip_alg"] = row[1].replace("'", "\\u0027")
    print("--Edge flip algs processed--")


generate_letter_pair_words()
generate_corner_algs()
generate_corner_twist_algs()
generate_edge_algs()
generate_edge_flip_algs()

# Dump json
json_dump = json. dumps(data)
# print(json_dump)
f = open("data.json", "w")
f.write("json_data = '" + json_dump + "';")
f.close()

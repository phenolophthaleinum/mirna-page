import flask
import re
from table_parser import read_db
from collections import defaultdict
from utils import AliasedDict


app = flask.Flask(__name__, template_folder='.')

whites_pattern = re.compile(r'\s+')
db = read_db("mirna_table.pkl")

@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/search', methods=['GET', 'POST'])
def search_mirna():
    if flask.request.method == 'POST':
        # data = flask.request.form
        data = flask.request.get_json(force=True)
        query_clear = re.sub(whites_pattern, '', data['query']).strip(",.;|-")
        query_list = set(re.split(r',|;', query_clear))
        result = defaultdict(list)
        for query in query_list:
            try:
                db_rec = db[query]
                # print(db_rec)
            except:
                result['bad'].append([query])
                continue
            if isinstance(db_rec, list):
                for key in db.aliases[query]:
                    record = db[key]
                    if record['CMC/non-CMC'].startswith("CMC"):
                        result['CMC'].append([f"{key} <- {query}"])
                    else:
                        result['nCMC'].append([f"{key} <- {query}"])
                continue
            if db_rec['CMC/non-CMC'].startswith("CMC"):
                result['CMC'].append([query])
            else:
                result['nCMC'].append([query])
                
        return flask.jsonify(result)
    else:
        return "Empty"


if __name__ == '__main__':
    app.run(debug=True)
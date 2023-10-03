import flask
import re
import os
from table_parser import read_db
from collections import defaultdict
from utils import AliasedDict


app = flask.Flask(__name__, template_folder='.')
app.config['UPLOAD_FOLDER']='raw_data'

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
        result = defaultdict(set)
        for query in query_list:
            try:
                db_rec = db[query]
                # print(db_rec)
            except:
                result['bad'].add(query)
                continue
            if isinstance(db_rec, list):
                for key in db.aliases[query]:
                    record = db[key]
                    if record['CMC/non-CMC'].startswith("CMC"):
                        result['CMC'].add(key)
                    else:
                        result['nCMC'].add(key)
                continue
            if db_rec['CMC/non-CMC'].startswith("CMC"):
                result['CMC'].add(query)
            else:
                result['nCMC'].add(query)
        
        final_result =  {key: [[elem] for elem in value] for key, value in result.items()}

        return flask.jsonify(final_result)
    else:
        return "Empty"


@app.route('/record/<id>')
def record_page(id):
    return flask.render_template('record.html',
                                 record_id=id)


@app.route('/raw_data/<path:filename>', methods=['GET', 'POST'])
def download(filename):
    full_path = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
    return flask.send_from_directory(full_path, filename)



if __name__ == '__main__':
    app.run(debug=True)
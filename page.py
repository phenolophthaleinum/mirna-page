import flask
import re
import os
from table_parser import read_db, std_read
from collections import defaultdict
from utils import AliasedDict


app = flask.Flask(__name__, template_folder='.')
app.config['UPLOAD_FOLDER']='raw_data'

whites_pattern = re.compile(r'\s+')
master_db = std_read("mirna_table.pkl")
db = master_db['data']
db_version = master_db['version']


@app.route('/')
def index():
    return flask.render_template('index.html',
                                 db_version=db_version)


@app.route('/search', methods=['GET', 'POST'])
def search_mirna():
    if flask.request.method == 'POST':
        # data = flask.request.form
        data = flask.request.get_json(force=True)
        query_clear = re.sub(whites_pattern, '', data['query']).strip(",.;|-")
        # print(query_clear)
        query_list_temp = [query for query in re.split(r',|;', query_clear.lower()) if query]
        # print(query_list_temp)
        query_list = set([query.replace('-5p', '').replace('-3p', '') for query in query_list_temp])
        # print(query_list)
        # print(query_list)
        result = defaultdict(set)
        for query in query_list:
            try:
                db_rec = db[query]

                # print(db_rec)
            except:
                # print("in bad")
                result['bad'].add(query)
                continue
            if isinstance(db_rec, list):
                for key in db.aliases[query]:
                    record = db[key]
                    if record['CMC/non-CMC'].startswith("CMC"):
                        result['CMC'].add(key.upper())
                    elif record['CMC/non-CMC'].startswith("non-CMC"):
                        result['nCMC'].add(key.upper())
                    else:
                        result['nc'].add(key.upper())
                continue
            if db_rec['CMC/non-CMC'].startswith("CMC"):
                result['CMC'].add(query.upper())
            elif db_rec['CMC/non-CMC'].startswith("non-CMC"):
                result['nCMC'].add(query.upper())
            else:
                result['nc'].add(query.upper())
        result['nc'].update(result['bad'])
        
        final_result =  {key: [[elem] for elem in value] for key, value in result.items()}

        return flask.jsonify(final_result)
    else:
        return "Empty"


@app.route('/record/<id>')
def record_page(id):
    # cmc_criterions = [
    #     'miRCancer POINTS [criterion I]',
    #     'dbDEMC POINTS [criterion II]',
    #     'oncomiRDB POINTS [criterion III]',
    #     'consistency of associations [criterion IV]',
    #     'cancer hallmarks POINTS [criterion V]',
    #     'KEGG "MicroRNAs in cancer" POINTS [criterion VI]',
    #     'cancer drivers POINTS [criterion VII]'
    # ]
    diff_expr = [col for col in db[id.lower()].keys() if col.startswith('differentially expressed in TCGA')]
    hallmarks = [col for col in db[id.lower()].keys() if any(substring in col.lower() for substring in ['hallmark_', 'hypoxia', 'immune', 'invasiveness', 'proliferation', 'apoptosis', 'angiogenesis'])]
    cmc_criterions = [col for col in db[id.lower()].keys() if "criterion" in col]
    # print(type(db['mir101-1']['cancer drivers POINTS [criterion VII]']))
    # print(db['mir101-1'].keys())
    # print(hallmarks)
    return flask.render_template('record.html',
                                 record_id=id,
                                 record_data=db[id.lower()],
                                 cmc_criterions=cmc_criterions,
                                 diff_expr=diff_expr,
                                 hallmarks=hallmarks,
                                 db_version=db_version)


@app.route('/raw_data/<path:filename>', methods=['GET', 'POST'])
def download(filename):
    full_path = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
    return flask.send_from_directory(full_path, filename)



if __name__ == '__main__':
    app.run(debug=True)
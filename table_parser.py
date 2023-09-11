import pandas as pd
import dill
# import pickle
from utils import AliasedDict
import json

dill.settings['recurse'] = True

def parse():
    df = pd.read_excel("./table_s4.xlsx", index_col=0, skiprows=[0])
    alias_df = pd.read_excel("./table_s9.xlsx", skiprows=[0])

    # mirna gene ID (HUGO) are actually unique
    assert len(alias_df.iloc[:,0].unique()) == len(alias_df.iloc[:, 0])

    # base dict from all HUGO mirna id 
    db = df.to_dict(orient='index')

    # initialise aliased dict
    adb = AliasedDict(db)

    # assign aliases
    for key in adb:
        mask = alias_df['miRNA gene ID (HUGO)'].values == key
        row = alias_df.loc[mask]
        try:
            items ,= row.iloc[:, 1:4].values
            for item in items:
                if pd.isna(item):
                    continue
                adb.add_alias(item, key)
        except:
            continue

    # save to dill
    with open("mirna_table.pkl", 'wb') as f:
    #     f.write(dill.dumps(adb))
    # return dill.dumps(adb)
        dill.dump((dict(adb), adb.aliases), f)
    # with open("mirna_table.json", 'w') as f:
    #     json.dump(adb, f)


def read_db(filename: str):
    # with open(filename, 'r') as f:
    #     return json.load(f)
    # with open(filename, 'r') as f:
    #     return dill.loads(f)
    with open(filename, 'rb') as f:
        data_dict, aliases = dill.load(f)
        adict = AliasedDict(data_dict)
        adict.aliases = aliases
        return adict
    #     db = f.read()
    #     return dill.loads(db)
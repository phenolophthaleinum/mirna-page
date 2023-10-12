import pandas as pd
import dill
# import pickle
from utils import AliasedDict
import json
import pprint as p

dill.settings['recurse'] = True

def parse():
    # df = pd.read_excel("./table_s4.xlsx", index_col=0, skiprows=[0])
    # df = pd.read_excel("./table_s4.xlsx", skiprows=[0])
    # alias_df = pd.read_excel("./table_s9.xlsx", skiprows=[0])
    df = pd.read_excel("./classification_table.xlsx", skiprows=[0])
    alias_df = pd.read_excel("./characteristics_table.xlsx", skiprows=[0])

    df.rename(columns={'background miRNA genes': "miRNA gene ID (HUGO)"}, inplace=True)
    overlap_cols = df.columns.intersection(alias_df.columns)[1:]
    # print(overlap_cols[1:])
    alias_df = alias_df.drop(columns=overlap_cols)
    df.set_index('miRNA gene ID (HUGO)', inplace=True)
    df = df.merge(alias_df, left_index=True, right_on='miRNA gene ID (HUGO)', how='left')

    # print(df.columns)
    df.set_index('miRNA gene ID (HUGO)', inplace=True)
    df[df.filter(like='criterion').columns] = df.filter(like='criterion').fillna(0)

    # df.rename(columns={'background miRNA genes': "miRNA gene ID (HUGO)"}, inplace=True)
    # overlap_cols = df.columns.intersection(alias_df.columns)[1:]
    # print(overlap_cols[1:])
    # alias_df = alias_df.drop(columns=overlap_cols)
    # print(alias_df.columns)
    # df.join(alias_df.set_index('miRNA gene ID (HUGO)'), on='miRNA gene ID (HUGO)', how='inner')
    # df.set_index("miRNA gene ID (HUGO)", inplace=True)
    # print(df.columns)

    # mirna gene ID (HUGO) are actually unique
    assert len(alias_df.iloc[:,0].unique()) == len(alias_df.iloc[:, 0])

    # base dict from all HUGO mirna id 
    df.index = df.index.str.lower()
    alias_df.iloc[:, 0:4] = alias_df.iloc[:, 0:4].apply(lambda x: x.str.lower())
    # print(alias_df.iloc[:, 0:4])
    db = df.to_dict(orient='index')

    # initialise aliased dict
    adb = AliasedDict(db)
    p.pprint(adb)
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
        dill.dump(adb, f)
    #     f.write(dill.dumps(adb))
    # return dill.dumps(adb)
        # dill.dump((dict(adb), adb.aliases), f)
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

def std_read(filename: str):
    with open(filename, 'rb') as f:
        adict = dill.load(f)
        # print(adict.aliases)
        return adict
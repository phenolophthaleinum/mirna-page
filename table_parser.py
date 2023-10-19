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
    base_df = pd.read_excel("./classification_table_full.xlsx")
    feature_df = pd.read_excel("./characteristics_table.xlsx", skiprows=[0])

    overlap_cols = list(base_df.columns.intersection(feature_df.columns)[1:])
    overlap_cols.append("cancer drivers POINTS [criterion VII]")
    # print(overlap_cols[1:])
    feature_df = feature_df.drop(columns=overlap_cols)
    base_df.set_index('miRNA gene ID (HUGO)', inplace=True)
    base_df = base_df.merge(feature_df, left_index=True, right_on='miRNA gene ID (HUGO)', how='left')


    # print(df.columns)
    base_df.set_index('miRNA gene ID (HUGO)', inplace=True)
    hallmarks = [col for col in base_df.columns if any(substring in col.lower() for substring in ['hallmark_', 'hypoxia', 'immune', 'invasiveness', 'proliferation', 'apoptosis', 'angiogenesis'])]
    # print(hallmarks)
    base_df[base_df.filter(like='criterion').columns] = base_df.filter(like='criterion').fillna(0)
    base_df[base_df.filter(like='differentially expressed in TCGA').columns] = base_df.filter(like='differentially expressed in TCGA').fillna("N/D")
    base_df[base_df.filter(like='miRNA targets').columns] = base_df.filter(like='miRNA targets').fillna("-")
    base_df[hallmarks] = base_df[hallmarks].fillna("-")
    base_df['oncogene (O)/tumor-suppressor (TS)'] = base_df['oncogene (O)/tumor-suppressor (TS)'].fillna("Not classified")
    # df[df.filter(like='criterion').columns] = df.filter(like='criterion').fillna(0)

    # df.rename(columns={'background miRNA genes': "miRNA gene ID (HUGO)"}, inplace=True)
    # overlap_cols = df.columns.intersection(alias_df.columns)[1:]
    # print(overlap_cols[1:])
    # alias_df = alias_df.drop(columns=overlap_cols)
    # print(alias_df.columns)
    # df.join(alias_df.set_index('miRNA gene ID (HUGO)'), on='miRNA gene ID (HUGO)', how='inner')
    # df.set_index("miRNA gene ID (HUGO)", inplace=True)
    # print(df.columns)

    # mirna gene ID (HUGO) are actually unique
    assert len(base_df.iloc[:,0].unique()) == len(base_df.iloc[:, 0])
    # base_df.to_excel("merge_test.xlsx")

    # base dict from all HUGO mirna id 
    base_df.index = base_df.index.str.lower()
    # alias_df.iloc[:, 0:4] = alias_df.iloc[:, 0:4].apply(lambda x: x.str.lower())
    # print(alias_df.iloc[:, 0:4])
    db = base_df.to_dict(orient='index')

    # initialise aliased dict
    adb = AliasedDict(db)
    # assign aliases
    for key in adb:
        # mask = base_df['miRNA gene ID (HUGO)'].values == key
        # mask = base_df.index == key
        # row = base_df.loc[mask]
        # print(row)
        try:
            # print(str(adb[key]['miRNA genes annotated in MirGeneDB (MirGeneDB ID)']))
            alias_keys = ['all miRNA precursors/loci (miRBase ID)', 'miRNA ID', 'miRNA genes annotated in MirGeneDB (MirGeneDB ID)']
            # items ,= row.loc[['all miRNA precursors/loci (miRBase ID)', 'miRNA ID', 'miRNA genes annotated in MirGeneDB (MirGeneDB ID)']].values
            # print(items)
            for a_key in alias_keys:
                alias = str(adb[key][a_key]).lower()
                if alias == 'nan':
                    continue
                adb.add_alias(alias, key)
        except:
            continue
    
    p.pprint(adb.aliases)
    # exit()
    p.pprint(adb)
    p.pprint(base_df)

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
import pandas as pd
import dill
from utils import AliasedDict


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
    dill.dump(adb, f)
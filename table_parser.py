import pandas as pd
import dill
import io
from utils import AliasedDict
import pprint as p
import datetime

dill.settings['recurse'] = True

def parse():
    """
    This function parses two excel files: 'classification_table_full.xlsx' and 'characteristics_table.xlsx', 
    merges them based on the 'miRNA gene ID (HUGO)' column, and cleans the data (removing, renaming columns, 
    checking the uniqueness of the 'miRNA gene ID (HUGO)', converts IDs to lowercase) to obtain full table with all 
    characteristics without overlapping information.
    Table/data is store as dictionary with aliased access to keys along with data ompilation timestamp. 
    Both elements are stored in the master dictionary which is saved into a dill file named 'mirna_table.pkl'.

    Parameters:
    None

    Returns:
    None

    Raises:
    AssertionError: If the 'miRNA gene ID (HUGO)' column is not unique.

    """

    base_df = pd.read_excel("./classification_table_full.xlsx")
    feature_df = pd.read_excel("./characteristics_table.xlsx", skiprows=[0])

    overlap_cols = list(base_df.columns.intersection(feature_df.columns)[1:])
    overlap_cols.append("cancer drivers POINTS [criterion VII]")
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
    base_df['CMC score'] = base_df['CMC score'].fillna(0)
    base_df[['all miRNA precursors/loci (miRBase ID)', 'miRNA ID', 'miRNA genes annotated in MirGeneDB (MirGeneDB ID)']] = base_df[['all miRNA precursors/loci (miRBase ID)', 'miRNA ID', 'miRNA genes annotated in MirGeneDB (MirGeneDB ID)']].fillna('-')
    base_df["CMC/non-CMC"] = base_df["CMC/non-CMC"].apply(str)
    base_df.drop(columns=["miRNA precursor/locus ID (miRBase)", "miRNA ID (miRBase)", "miRNA precursor/locus ID (MirGeneDB)", "oncogene (O)/tumor-suppressor (TS) only for CMC"], inplace=True)
    print(base_df["CMC/non-CMC"].dtype)

    # mirna gene ID (HUGO) are actually unique
    assert len(base_df.iloc[:,0].unique()) == len(base_df.iloc[:, 0])

    # base dict from all HUGO mirna id 
    base_df.index = base_df.index.str.lower()
    db = base_df.to_dict(orient='index')

    # initialise aliased dict
    adb = AliasedDict(db)
    # assign aliases
    for key in adb:
        try:
            alias_keys = ['all miRNA precursors/loci (miRBase ID)', 'miRNA ID', 'miRNA genes annotated in MirGeneDB (MirGeneDB ID)']
            for a_key in alias_keys:
                alias = str(adb[key][a_key]).lower()
                if alias == 'nan':
                    continue
                adb.add_alias(alias, key)
        except:
            continue
    
    p.pprint(adb.aliases)
    p.pprint(adb)
    p.pprint(base_df)
    p.pprint(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    master = {
        'data': adb,
        'version': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

    # save to dill
    with open("mirna_table.pkl", 'wb') as f:
        dill.dump(master, f)


# def read_db(filename: str):
#     with open(filename, 'rb') as f:
#         data_dict, aliases = dill.load(f)
#         adict = AliasedDict(data_dict)
#         adict.aliases = aliases
#         return adict


def std_read(filename: str):
    """
    This function loads dill file with master dict which is expected to contain db data, and returns the loaded content.

    Parameters:
    filename (str): The name of the file to be read. The file should be a dill file created using the dill module.

    Returns:
    dict: The content of the file, loaded using the dill module.

    """
    with open(filename, 'rb') as f:
        master = dill.load(f)
        return master


def get_table_column(data_dict):
    """
    This function takes a data table dictionary as input, and converts it into a pandas DataFrame, and then
    saves into CSV as a BytesIO object.

    Parameters:
    data_dict (dict): The data table dictionary ('mirna_table.pkl;') to be converted into a csv.

    Returns:
    table (io.BytesIO): The BytesIO object containing the CSV representation of the DataFrame.
    """
    # df = pd.read_excel("./raw_data/list_of_CMC_miRNA_genes_with_characteristics.xlsx", index_col=0, skiprows=[0]).loc[ids]
    df = pd.DataFrame.from_dict(data_dict, orient='index')
    df.reset_index(names=["miRNA gene ID (HUGO)"], inplace=True)
    df.drop(columns=[
        "miRNAS as cancer therapeutic targets in clinical trials Kim&Croce, Exp Mol Med, 2023", 
        "CRISPR/Cas9 KO screen  of microRNAs  affecting cell growth (MV4-11 - myeloid leukemia cell line) Wallace et al., PLOS one, 2016", 
        "CRISPR/Cas9 KO screen  of pro/anti-fitness-associated miRNAs (HeLa - cervical cancer cell line) Kurata&Lin, RNA, 2018", 
        "CRISPR/Cas9 KO screen  of pro/anti-fitness-associated miRNAs (NCI-N87 - gastric cancer cell line) Kurata&Lin, RNA, 2018"], inplace=True)
    # print(df)
    table = io.BytesIO()
    df.to_csv(table)
    table.seek(0)
    return table
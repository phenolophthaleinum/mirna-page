import pandas as pd


df = pd.read_excel("./table_s4.xlsx", index_col=0, header=None, skiprows=[0])
print(df)
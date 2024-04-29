
import pandas as pd
df = pd.read_csv('data.tsv', sep='\t')

#
df = df.groupby(['year']).agg({'km': 'sum'})
df.loc[1992, 'km'] += 8326  # - 606
df['km'] = df['km'].cumsum().round().astype('int')
print(df)

# #
# df = df[df['year'] == 2020]
# df['km'] = df['km'].cumsum()
# print(df)
# df['km'] = df['km'].cumsum()

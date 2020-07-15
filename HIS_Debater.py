import numpy as np
import pandas as pd
from scipy.stats import binom

# import debater_values csv from the folder

deb_val = pd.read_csv('debater_values.csv')
deb_val.dropna(inplace=True)
deb_val.reset_index(drop=True, inplace=True)  # have to dropnas and reset index or else pandas breaks

# CONSTANTS:

hit_chance = 1/3  # hit chance of each roll; vanilla HIS dice are 1d6 and hit on 5 or 6
attacker_base = 3  # extra dice for attacker; base 3 in vanilla
commit_base = 1
uncommit_base = 2  # extra dice for committed and uncommitted debaters, respectively

# take input

while True:
    attacker = input('Enter attacking debater:\n')

    att_val = int(
        deb_val[deb_val['Debater'] == attacker].loc[deb_val[deb_val['Debater'] == attacker].index[0], 'Value'])
    att_team = deb_val[deb_val['Debater'] == attacker].loc[
        deb_val[deb_val['Debater'] == attacker].index[0], 'Affiliation']

    defender = input('Enter defending debater:\n')

    def_val = int(deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0], 'Value'])
    def_team = deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0],
                                                           'Affiliation']
    if att_team == def_team:
        print(f'You have chosen two {att_team} debaters. Choose one Papal and one Protestant debater.')
    else:
        break

commit = input('Defender committed? (y/n)\n')  # TODO: want to add some error handling or try/catch here
if att_team == 'Papal':
    thomas_more = input('Debate called using Thomas More? (y/n)\n')  # TODO: find out all the debate dice cards
else:
    thomas_more = 0

# get debate language:

if att_team == 'Protestant':
    language = deb_val[deb_val['Debater'] == attacker].loc[deb_val[deb_val['Debater'] == attacker].index[0],
                                                           'Language']
elif def_team == 'Protestant':
    language = deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0],
                                                           'Language']

# get attacker, defender values

def_val = int(deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0], 'Value'])

# calculate attacker dice:

att_dice = att_val + attacker_base

if attacker == 'Eck':
    att_dice += 1
if thomas_more == 'y':
    if language == 'English':
        att_dice += 3
    else:
        att_dice += 1

# calculate defender dice:

if commit == 'y':
    def_dice = def_val + commit_base
elif commit == 'n':
    def_dice = def_val + uncommit_base

# calculating odds of winning for each side:

att_win = 0
tie = 0
def_win = 0

def_burn = 0

for i in range(0, att_dice + 1):  # att_dice + 1 to include endpoint
    att_hits_chance = binom.pmf(i, att_dice, hit_chance)  # find odds of attacker getting exactly this many hits
    def_hits_fewer = binom.cdf(i - 1, def_dice, hit_chance)  # find odds of defender getting fewer than this many hits
    def_hits_equal = binom.pmf(i, def_dice, hit_chance)  # find odds of defender getting equal number of hits
    def_hits_more = 1 - def_hits_fewer - def_hits_equal  # find odds of defender getting more than this many hits

    att_win += att_hits_chance * def_hits_fewer
    tie += att_hits_chance * def_hits_equal
    def_win += att_hits_chance * def_hits_more

    def_hits_burn = binom.cdf(i - (def_val + 1), def_dice, hit_chance)  # find odds of defender getting few enough
    # hits to be burnt/disgraced (attacker must score more hits than defensive debater's rating)

    def_burn += att_hits_chance * def_hits_burn
    # TODO: add chances of defender burning/disgracing attacker

# print statements

print(f'{attacker} ({att_val}) debates {defender} ({def_val}) in {language}: {att_dice} v {def_dice} dice\n')

print(f'{attacker} wins {round(att_win * 100, 2)}% of the time')
print(f'Tie {round(tie * 100, 2)}% of the time')
print(f'{defender} wins {round(def_win * 100, 2)}% of the time')
print(f'Average number of spaces flipped by debate winner: {round(abs(att_dice - def_dice) * hit_chance, 2)}')

# TODO: implement debater bonuses for Aleander/Campeggio and any others

if att_team == 'Protestant':
    print(f'{attacker} has a {round(def_burn * 100, 2)}% chance to disgrace {defender}')
elif def_team == 'Protestant':
    print(f'{attacker} has {round(def_burn * 100, 2)}% chance to burn {defender}')

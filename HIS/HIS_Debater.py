import pandas as pd
from HIS_Debater_Logic import get_dice, find_odds

# import debater_values csv from the folder

deb_val = pd.read_csv('debater_values.csv')
deb_val.dropna(inplace=True)
deb_val.reset_index(drop=True, inplace=True)  # have to dropnas and reset index or else pandas breaks

# CONSTANTS:

hit_chance = 1/3  # hit chance of each roll; vanilla HIS dice are 1d6 and hit on 5 or 6

# TODO: Remove this once the avg spaces flipped function has been created and works, to streamline this file a bit

# take input

while True:
    attacker = input('Enter attacking debater:\n')
    att_team = deb_val[deb_val['Debater'] == attacker].loc[
        deb_val[deb_val['Debater'] == attacker].index[0], 'Affiliation']  # TODO: add similar while loops here so
    # no keyerrors

    defender = input('Enter defending debater:\n')
    def_team = deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0],
                                                           'Affiliation']
    if att_team == def_team:
        print(f'You have chosen two {att_team} debaters. Choose one Papal and one Protestant debater.')
    else:
        break

while True:
    commit = input('Defender committed? (u/c)\n')
    if commit == 'u' or 'c':
        break
    else:
        print(f'Enter either 'u' for an uncommitted debater or "c" for a committed debater.')

if commit == 'u':  # set commit status as either committed or uncommited based on stuff
    status = 'uncommitted'
elif commit == 'c':
    status = 'committed'

if att_team == 'Papal':
    while True:
        thomas_more = input('Debate called using Thomas More? (y/n)\n')  # TODO: find out all the debate dice cards
        if thomas_more == 'n':
            while True:
                inq = input('Debate called using Papal Inquisition? (y/n)\n')
                if inq == 'y' or inq == 'n':
                    break
                else:
                    print(f'Enter y(es) or "n(o)"')
            break
        elif thomas_more == 'y':
            inq = 'n'
            break
        else:
            print(f'Enter "y(es)" or "n(o)"')
else:
    thomas_more = 'n'
    inq = 'n'

# TODO: also clean up the while breaks (or checking if equal to y or n), could make that a function in debater logic

while True:
    augsburg = input('Augsburg Confession active? (y/n)\n')
    if augsburg == 'y' or augsburg == 'n':
        break
    else:
        print(f'Enter "y(es) or "n(o)"')

# get debate language:

if att_team == 'Protestant':
    language = deb_val[deb_val['Debater'] == attacker].loc[deb_val[deb_val['Debater'] == attacker].index[0],
                                                           'Language']
elif def_team == 'Protestant':
    language = deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0],
                                                           'Language']
# get attacker, defender values

att_val = int(deb_val[deb_val['Debater'] == attacker].loc[deb_val[deb_val['Debater'] == attacker].index[0], 'Value'])
def_val = int(deb_val[deb_val['Debater'] == defender].loc[deb_val[deb_val['Debater'] == defender].index[0], 'Value'])

# get attacker, defender dice

att_dice = get_dice(att_val, att_team, language, attacker, 'a', thomas_more, inq, augsburg)
def_dice = get_dice(def_val, def_team, language, defender, commit, thomas_more, inq, augsburg)

# calculate odds

att_win, tie, def_win, att_burn, def_burn = find_odds(att_dice, def_dice, att_val, def_val)

# summary of debate

print(f'{attacker} ({att_val}) debates {status} {defender} ({def_val}) in {language}: {att_dice} v {def_dice} dice\n')

# odds of win, tie, loss

print(f'{attacker} wins {round(att_win * 100, 2)}% of the time')
print(f'Tie {round(tie * 100, 2)}% of the time')
print(f'{defender} wins {round(def_win * 100, 2)}% of the time')

# avg spaces flipped

print(f'Average number of spaces flipped by debate winner: {round(abs(att_dice - def_dice) * hit_chance, 2)}\n')

# TODO: implement debater bonuses for Aleander/Campeggio and any others, add a function to compute average number of
#  spaces flipped in a more sophisticated way

# Disgraced/burned debaters

if att_team == 'Protestant':
    print(f'{attacker} has a {round(att_burn * 100, 2)}% chance to disgrace {defender}')
    print(f'{defender} has a {round(def_burn * 100, 2)}% chance to burn {attacker}')
elif def_team == 'Protestant':
    print(f'{attacker} has {round(att_burn * 100, 2)}% chance to burn {defender}')
    print(f'{defender} has {round(def_burn * 100, 2)}% chance to disgrace {attacker}')

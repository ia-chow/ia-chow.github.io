import pandas as pd
from Treatise_Logic import reform_odds

while True:
    atk_dice = int(input('Number of dice for attacker:\n'))
    if atk_dice > 0:
        break
    else:
        print('Enter a number greater than 0')
while True:
    def_dice = int(input('Number of dice for defender:\n'))
    if def_dice > 0:
        break
    else:
        print('Enter a number greater than 0')
while True:
    win_ties = input('Does attacker or defender win ties? (a/d)\n')
    if win_ties == 'a':
        adv = 'Attacker'
        break
    if win_ties == 'd':
        adv = 'Defender'
        break
    else:
        print(f'Enter "a" if attacker wins ties or "d" if defender does')
while True:
    bible = input('Bible translation bonus active? (y/n)\n')  # TODO: ADD STUFF FOR BIBLE TRANSLATION IN TREATISE_LOGIC
    if bible == 'y':
        trans = 'active'
        break
    if bible == 'n':
        trans = 'not active'
        break
    else:
        print(f'Enter "y" if translation bonus is active or "n" if it is not')

prob = reform_odds(atk_dice, def_dice, win_ties, bible)

# print statements:

print(f'{atk_dice} vs. {def_dice} dice: {adv} wins ties, Bible translation bonus {trans}\n')  # summary

print(f'Attacker has {round(prob[0] * 100, 2)}% chance of winning')  # attacker's chance of winning
print(f'Defender has {round(prob[1] * 100, 2)}% chance of winning')  # defender's chance of winning

import pandas as pd
import numpy as np

# CONSTANTS:

DICE_FACES = 6  # number of faces on die

# todo: add handling for bible translations


def reform_odds(atk_dice, def_dice, win_ties, bible_trans, dice_faces=DICE_FACES):
    """
    Finds odds of reformation/counter reformation succeeding:
    :param int atk_dice: number of dice the attacker rolls
    :param int def_dice: number of dice the defender rolls
    :param str win_ties: whether attacker or defender wins ties (a/d)
    :param bool bible_trans: reformation attempts from bible translation? t/f (CURRENTLY INACTIVE)
    :param default dice_faces: dice faces (all rolls in HIS are d6 by default/vanilla)
    :return: odds of attacker, defender winning
    """

    atk_win = 0
    def_win = 0

    for val in range(1, dice_faces + 1):

        prob_def = ((val / dice_faces) ** def_dice) - (((val - 1) / dice_faces) ** def_dice)
        # probability that the highest defender roll is exactly equal to this value
        prob_atk_less = ((val - 1)/dice_faces) ** atk_dice  # chance that all attacker dice are less than given value
        prob_equal = (val/dice_faces) ** atk_dice - prob_atk_less  # chance that the highest attacker roll is
        # exactly equal to the given value (tie)
        prob_atk_more = 1 - prob_atk_less - prob_equal  # chance that highest attacker roll is greater than given value

        atk_win += prob_def * prob_atk_more
        def_win += prob_def * prob_atk_less
        if win_ties == 'a':
            atk_win += prob_equal * prob_def
        elif win_ties == 'd':
            def_win += prob_equal * prob_def

    return atk_win, def_win

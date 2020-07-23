from scipy.stats import binom

# constants:

attacker_base = 3  # extra dice for attacker; base 3 in vanilla
commit_base = 1
uncommit_base = 2  # extra dice for committed and uncommitted debaters, respectively; base 1 and 2 in vanilla

HIT_CHANCE = 1/3 # vanilla HIS dice hit on 5 or 6

# debater/condition bonuses:

eck_bonus = 1  # eck bonus dice on offense
tmore_bonus_eng = 3  # bonus dice for thomas more on offense
tmore_bonus_other = 1
augsburg_pen = 1  # malus dice for effects of Augsburg Confession
inq_bonus = 2  # bonus dice for papal inquisition


def get_dice(value, team, language, name, status, tmore, inq, augsburg):
    """
    Get dice for a debater based on value and a bunch of params

    :param int value: Debater's value
    :param str team: Debater's affiliation (Papal/Protestant):
    :param str language: Language of debate
    :param str name: name of the debater
    :param str status: Debater status (attacker, committed defender, uncommitted defender) (a/c/u)
    :param str tmore: Debate called with Thomas More? (y/n)
    :param str inq: Debate called with Papal Inquisition? (y/n)
    :param str augsburg: Augsburg Confession active? (y/n)
    :return: int num_dice: number of dice debater gets
    """

    num_dice = value  # base number of dice

    if status == 'a':  # check for debater status: attacking, committed defender, or uncommitted defender
        num_dice += attacker_base
        if name == 'Eck':
            num_dice += eck_bonus
        if team == 'Papal':
            if tmore == 'y':
                if language == 'English':
                    num_dice += tmore_bonus_eng
                else:
                    num_dice += tmore_bonus_other
            if inq == 'y':
                num_dice += inq_bonus

    elif status == 'c':
        num_dice += commit_base
    elif status == 'u':
        num_dice += uncommit_base

    if team == 'Papal' and augsburg == 'y':
        num_dice -= augsburg_pen

    return num_dice


def find_odds(att_dice, def_dice, att_val, def_val, hit_chance=HIT_CHANCE):
    """
    Finds odds of outcome in debate (win/tie/loss) as well as burn chances
    :param int att_dice: number of dice that the attacker rolls
    :param int def_dice: number of dice that the defender rolls
    :param int att_val: attacker's debate value
    :param int def_val: defender's debate value
    :param default hit_chance: default param ,hit chance per die (should be 1/3 for vanilla HIS
    :return:
    """
    # calculating odds of winning for each side:

    att_win = 0
    tie = 0
    def_win = 0
    att_burn = 0
    def_burn = 0

    for i in range(0, att_dice + 1):  # att_dice + 1 to include endpoint
        att_hits_chance = binom.pmf(i, att_dice, hit_chance)  # find odds of attacker getting exactly this many hits
        def_hits_fewer = binom.cdf(i - 1, def_dice,
                                   hit_chance)  # find odds of defender getting fewer than this many hits
        def_hits_equal = binom.pmf(i, def_dice, hit_chance)  # find odds of defender getting equal number of hits
        def_hits_more = 1 - def_hits_fewer - def_hits_equal  # find odds of defender getting more than this many hits

        att_win += att_hits_chance * def_hits_fewer
        tie += att_hits_chance * def_hits_equal
        def_win += att_hits_chance * def_hits_more

        att_hits_burn = binom.cdf(i - (def_val + 1), def_dice, hit_chance)  # find odds of defender getting few enough
        # hits to be burnt/disgraced (attacker must score more hits than defensive debater's rating)
        def_hits_burn = 1 - binom.cdf(i + att_val, def_dice, hit_chance)  # find odds of defender getting enough hits to
        # burn/disgrace the attacker (defender must score more hits than offensive debater's rating)

        att_burn += att_hits_chance * att_hits_burn  # finding chance attacker burns defender
        def_burn += att_hits_chance * def_hits_burn  # finding chace defender burns attacker

    return att_win, tie, def_win, att_burn, def_burn


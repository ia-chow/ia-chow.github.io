// CONSTANTS:
const DICE_FACES = 6 //number of faces on a die

function get_debater_dice(value, team, language, name, status, tmore, inq, augsburg){
    /*
    Gets the number of dice each debater rolls in a debate


    */
   const deb_data = require("./debater_values.json")
    return deb_data
    num_dice = value

}
function get_reform_odds(atk_dice, def_dice, win_ties, bible_trans, dice_faces=DICE_FACES){
    /*
    param int atk_dice: number of dice the attacker rolls
    param int def_dice: number of dice the defender rolls 
    param bool win_ties: whether attacker wins ties or not (T/F)
    param dice_faces: default param, number of dice faces
    */
    var atk_win = 0
    var def_win = 0
    var val;
    for (val = 1; val < dice_faces + 1; val++){
        const prob_def = ((val/dice_faces) ** def_dice) - (((val - 1)/dice_faces) ** def_dice); // probability that highest defender roll is equal to this value
        
        const prob_atk_less = ((val - 1)/dice_faces) ** atk_dice;  // probability that all defender dice are lower than this value
        const prob_equal = (val/dice_faces) ** atk_dice - prob_atk_less; // probability that highest attacker roll is exactly equal to the given roll (tie)
        const prob_atk_more = 1 - prob_atk_less - prob_equal; // probability that highest attacker roll is greater than given value

        atk_win += prob_def * prob_atk_more;
        def_win += prob_def * prob_atk_less;
        if (win_ties == true){
            atk_win += prob_equal * prob_def;
        }
        else if (win_ties == false){
            def_win += prob_equal * prob_def;
        }
        //console.log(atk_win, def_win, prob_def, prob_atk_less, prob_atk_more, prob_equal);
    }
    return [atk_win, def_win];
}

console.log(get_reform_odds(3, 4, true, 3));

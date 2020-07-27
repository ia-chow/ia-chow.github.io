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
function get_reform_odds(dice_faces=DICE_FACES){
    /*
    Gets reform odds and then changes html element on the page appropriately
    */
    let atk_results = document.getElementById('ref_results_atk');
    let def_results = document.getElementById('ref_results_def');

    var atk_dice = document.getElementById('attacker_dice').value;
    const def_dice = document.getElementById('defender_dice').value;
    const tie = document.getElementById('tie_winner').value;

    //console.log(atk_results, def_results, atk_dice, def_dice, tie)

    if (tie == 'attacker'){
        win_ties = true
    }
    else if (tie == 'defender'){
        win_ties = false
    }

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
    atk_results.textContent = 'Attacker has ' + (atk_win * 100).toFixed(2) + '% chance of winning' // print to page
    def_results.textContent = 'Defender has ' + (def_win * 100).toFixed(2) + '% chance of winning' // print to page
}

function enforceMinMax(el){
    if(el.value != ""){
      if(parseInt(el.value) < parseInt(el.min)){
        el.value = el.min;
      }
      if(parseInt(el.value) > parseInt(el.max)){
        el.value = el.max;
      }
    }
  }

// console.log(get_reform_odds(3, 4, 'defender', 3));

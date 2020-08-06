// CONSTANTS:

const DICE_FACES = 6 // number of faces on a die (vanilla HIS uses 6 dice)
const BIBLE_BONUS = 1 // +1 bonus given from bible translations

const ATK_BASE = 3 // 3 dice for attacker in theological debates
const UNC_BASE = 2 // 2 dice for uncommitted defender in theological debates
const COM_BASE = 1 // 1 die for committed defender in theological debates
const ECK_BONUS = 1 // bonus die for Eck
const GARD_BONUS = 1 // bonus die for gardiner in the english language zone
const TMORE_BONUS_ENG = 3  // bonus dice for thomas more on offense
const TMORE_BONUS_OTHER = 1
const AUGSBURG_PEN = 1  // malus dice for effects of Augsburg Confession
const INQ_BONUS = 2  // bonus dice for papal inquisition
const MARY_MULTIPLIER = 2 // multiplier for papal debater value in england if mary rules england

// import json of debaters and associated values:

// var debaters;
var debaters;
var data = jQuery.getJSON("./debater_values.json", function(get_debaters){debaters = get_debaters;}); // uses debater_values.json
// creates debaters as a list of debaters
// console.log(data)
// console.log(debaters)

//console.log(data)
//console.log(debaters)

function get_debater_odds(){
  /*
  Gets debate odds and changes html elements as appropriate
  */
  let deb_results_atk = document.getElementById('deb_results_atk')
  let deb_results_def = document.getElementById('deb_results_def')
  let elim_chance_atk = document.getElementById('elim_chance_atk')
  let elim_chance_def = document.getElementById('elim_chance_def')
  // console.log('2')

  // ADD DROPDOWN FOR THOMAS MORE/PAPAL INQUISITION
  // ADD CHECKBOX FOR AUGSBURG
  // DISPLAY CHECKBOX FOR MARY ONLY IF ENGLISH LANGUAGE DEBATER SELECTED
  const atk_debater = document.getElementById('atk_dropdown').value;
  const def_debater = document.getElementById('def_dropdown').value;
  // console.log(atk_debater)
  const tmore = document.getElementById("tmore").checked;
  console.log(tmore)
  
}

function get_debater_dice(name, language, status, tmore, inq, augsburg, mary, atk_base = ATK_BASE, unc_base = UNC_BASE, com_base = COM_BASE, eck_bonus = ECK_BONUS, gard_bonus = GARD_BONUS, tmore_bonus_eng = TMORE_BONUS_ENG, tmore_bonus_other = TMORE_BONUS_OTHER, inq_bonus = INQ_BONUS, augsburg_pen = AUGSBURG_PEN, mary_multiplier = MARY_MULTIPLIER){
    /*
    Gets the number of dice a debater rolls in a debate
    tmore, inq, augsburg, mary should all be booleans
    */
   
   // console.log(debaters)

   deb_data = debaters.filter(debater => debater.Debater == name)
   let deb_val = deb_data.map(deb_name => deb_name.Value);//.map(value => value.Value);

   var tot_dice = deb_val

   /* const language = deb_data.map(deb_language => deb_language.Language)
   console.log(base_dice)
   console.log(language) */
   if (status == 'atk'){
     if (language == 'English'){
       if (mary){
         tot_dice *= mary_multiplier
       }
       if (name == 'Gardiner'){
         tot_dice += gard_bonus
       }
     }
     tot_dice += atk_base
     if (name == 'Eck'){
        tot_dice += eck_bonus
      }
   }
   else if (status == 'unc'){
     tot_dice += unc_base
   }
   else if (status == 'com'){
     tot_dice += com_base
   }
   else{
     throw 'Debater is in an invalid status please report'
   }

   if (team = 'Papal'){
     if (tmore){
       if (language == 'English'){
         tot_dice += tmore_bonus_eng
       }
       else{
         tot_dice += tmore_bonus_other
       }
     }
     if (inq){
       tot_dice += inq_bonus
     }
     if (augsburg){
       tot_dice -= augsburg_pen
     }
   }
   return tot_dice

}

// console.log(get_debater_dice('Eck'));

function get_reform_odds(dice_faces = DICE_FACES, bible_bonus = BIBLE_BONUS){
    /*
    Gets reform odds and then changes html element on the page appropriately
    // TODO: HIDE THE BOX ON THE PAGE IF POSSIBLE
    // HIDE THE CHECKBOX IF DEFENDER IS CHECKED
    */
    let atk_results = document.getElementById('ref_results_atk');
    let def_results = document.getElementById('ref_results_def');

    const atk_dice = document.getElementById('attacker_dice').value;
    const def_dice = document.getElementById('defender_dice').value;
    const tie = document.getElementById('tie_winner').value;

    const bible = document.getElementById('bible_trans').checked;
    //console.log(bible)

    //console.log(atk_results, def_results, atk_dice, def_dice, tie)

    // TODO: make the code a little better by doing the validation before entering anything
    // Makes it a lot easier to see whether attacker or defender dice is the issue

    if (tie == 'attacker'){
        win_ties = true
    }
    else if (tie == 'defender'){
        win_ties = false
    }

    var atk_win = 0
    var def_win = 0
    var val;

    if (bible == true){ // set bonus to bible bonus if bible translation active (check dice from higher value)
      var bonus = bible_bonus;
    }
    else if (bible == false){
      var bonus = 0;
    }

    //console.log(bonus)

    for (val = 1; val < dice_faces + 1; val++){
        const prob_def = ((val/dice_faces) ** def_dice) - (((val - 1)/dice_faces) ** def_dice); // probability that highest defender roll is equal to this value
        
        const prob_atk_less = ((val - 1 - bonus)/dice_faces) ** atk_dice;  // probability that all attacker dice are lower than this value
        const prob_equal = ((val - bonus)/dice_faces) ** atk_dice - prob_atk_less; // probability that highest attacker roll is exactly equal to the given roll (tie)
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
    // console.log((atk_win * 100).toFixed(2))
    
    if(0 < (atk_win * 100).toFixed(2) && (atk_win * 100).toFixed(2) < 100){
      atk_results.textContent = 'Attacker has ' + (atk_win * 100).toFixed(2) + '% chance of winning' // print to page
      def_results.textContent = 'Defender has ' + (def_win * 100).toFixed(2) + '% chance of winning' // print to page

      document.getElementById('ref_results_atk').style.color = 'white' // change text to red
      document.getElementById('ref_results_def').style.visibility = 'visible' // show element
    }
    else {
      atk_results.textContent = 'Please enter a valid number of attacking and defending dice.' // print to page

      document.getElementById('ref_results_atk').style.color = 'red' // change text to red
      document.getElementById('ref_results_def').style.visibility = 'hidden' // hide element
    }
}

function enforceMinMax(el){
  // NOT CURRENTLY IN USE
  // FIX THIS FXN AT SOME POINT
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

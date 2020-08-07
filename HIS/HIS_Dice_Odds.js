// CONSTANTS:

const HIT_CHANCE = 1/3 // in vanilla HIS, 5 or 6 on a d6 is a hit for debates/battles

const DICE_FACES = 6 // number of faces on a die (vanilla HIS uses 6 dice)
const BIBLE_BONUS = 1 // +1 bonus given from bible translations/calvin's institutes

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

function get_debater_odds(hit_chance = HIT_CHANCE){
  /*
  Gets debate odds and changes html elements as appropriate
  hit chance is default param
  */

  //todo: add avg number of spaces flipped in more sophisticated way, add debater bonuses for aleander/campeggio

  let summary = document.getElementById('deb_summary')
  let deb_results_atk = document.getElementById('deb_results_atk')
  let deb_results_def = document.getElementById('deb_results_def')
  let deb_results_tie = document.getElementById('deb_results_tie')
  let elim_chance_atk = document.getElementById('elim_chance_atk')
  let elim_chance_def = document.getElementById('elim_chance_def')
  // console.log('2')

  // TODO: ADD DROPDOWN FOR THOMAS MORE/PAPAL INQUISITION
  // ADD CHECKBOX FOR AUGSBURG
  // DISPLAY CHECKBOX FOR MARY ONLY IF ENGLISH LANGUAGE DEBATER SELECTED
  // NOT SUPER HIGH PRIORITY THOUGH

  // grabbing all the data from the page
  const atk_debater = document.getElementById('atk_dropdown').value;
  const def_debater = document.getElementById('def_dropdown').value;
  const atk_status = 'atk'
  const def_status = $("input[type='radio'][name='commit']:checked").val(); // jquery
  // might want to fix this so whole func either uses or doesn't use jquery
  // console.log(atk_debater)
  const tmore = document.getElementById("tmore").checked;
  // console.log(tmore)
  const inq = document.getElementById('inq').checked;
  const augsburg = document.getElementById('augsburg').checked;
  const mary = document.getElementById('mary').checked;

/*   console.log(status)
  console.log(atk_debater)
  console.log(def_debater) */

  let atk_dat = debaters.filter(debater => debater.Debater == atk_debater)
  let def_dat = debaters.filter(debater => debater.Debater == def_debater)

/*   console.log(atk_dat)
  console.log(def_dat)

  console.log(atk_dat.map(deb_team => deb_team.Affiliation)[0]) */

  // determining language of the debate and whether they should burn or disgrace opponents

  if (atk_dat.map(deb_team => deb_team.Affiliation)[0] == 'Protestant'){ // if attacker is protestant
    var language = atk_dat.map(deb_lang => deb_lang.Language)[0]
    //console.log('1')
    //console.log(language)
    var atk_msg = 'disgrace'
    var def_msg = 'burn'
  }
  else if (def_dat.map(deb_team => deb_team.Affiliation)[0] == 'Protestant'){ // if defender is protestant
    var language = def_dat.map(deb_lang => deb_lang.Language)[0]
    //console.log('2')
    var atk_msg = 'burn'
    var def_msg = 'disgrace'
  }
  else{
    summary.style.color = 'red' // change text to red
    // console.log($("input[type='radio'][name='deb_team']:checked").val());
    if ($("input[type='radio'][name='deb_team']:checked").val() == undefined){
      summary.textContent = 'Choose an attacking side'
      // deb_results_atk.style.color = 'red'
    }
    else{
      summary.textContent = 'Choose two debaters'
    }
    // deb_results_atk.textContent = 'Choose two debaters' // change text to red and throw err
    // deb_results_atk.style.color = 'red'
    throw "Error: either no protestant debater selected or array not length 1" //throw err
  }
  //console.log(language)

  var data_atk = get_debater_dice(atk_debater, language, atk_status, tmore, inq, augsburg, mary); // get debater dice and value
  var data_def = get_debater_dice(def_debater, language, def_status, tmore, inq, augsburg, mary);

  var deb_atk_dice = data_atk[0]
  var deb_def_dice = data_def[0]
  var atk_val = data_atk[1]
  var def_val = data_def[1]

  //console.log(data_atk)
  /* console.log(deb_atk_dice)
  console.log(deb_def_dice) */
  //console.log(atk_val)
  //console.log(def_val)

  // add binomial distribution calculations to the js heere!

  var atk_win = 0; // odds of attacker win, tie, or def win
  var tie = 0;
  var def_win = 0;
  var atk_elim = 0; // attacker eliminates defender
  var def_elim = 0; // vice versa

  for (i = 0; i < deb_atk_dice + 1; i++){ // deb_atk_dice + 1 to include the endpoint
    // console.log(i)
    // have to check whether there are invalid cases (e.g. checking for more hits than there are dice and convert the nans to 0)
    atk_hits_chance = NantoZero(jStat.binomial.pdf(i, deb_atk_dice, hit_chance)) // odds of attacker getting exactly this many hits
    // console.log(atk_hits_chance)
    def_hits_fewer = NantoZero(jStat.binomial.cdf(i - 1, deb_def_dice, hit_chance)) // odds of defender getting fewer than this many hits
    def_hits_equal = NantoZero(jStat.binomial.pdf(i, deb_def_dice, hit_chance)) // odds of defender getting equal number of hits
    def_hits_more = 1 - def_hits_fewer - def_hits_equal // odds of defender getting more than this many hits

 /*    console.log(atk_hits_chance)
    console.log(def_hits_fewer)
    console.log(def_hits_equal)
    console.log(def_hits_more) */

    atk_win += (atk_hits_chance * def_hits_fewer) // adding chances of attacker win, tie, and defender win for this many hits
    // console.log(atk_win)
    tie += (atk_hits_chance * def_hits_equal)
    def_win += (atk_hits_chance * def_hits_more)

    atk_hits_elim = NantoZero(jStat.binomial.cdf(i - (def_val + 1), deb_def_dice, hit_chance)) // odds of attacker burning/disgracing defender (defender scores few enough hits)
    def_hits_elim = NantoZero(1 - jStat.binomial.cdf(i + atk_val, deb_def_dice, hit_chance)) // odds of defender burning/disgracing attacker (defender gets enough hits)

    atk_elim += atk_hits_chance * atk_hits_elim
    def_elim += atk_hits_chance * def_hits_elim
  }
  
/* 
  console.log(atk_win)
  console.log(tie)
  console.log(def_win)
  console.log(atk_elim)
  console.log(def_elim) */

  if (def_status == 'unc'){
    com_msg = 'uncommitted'
  }
  else if (def_status == 'com'){
    com_msg = 'committed'
  }
  else{
    throw 'Somehow defender isn\'t committed or uncommitted?'
  }

  summary.textContent = atk_debater + ' (' + atk_val + ') debates ' + com_msg + ' ' + def_debater + ' (' + def_val + ') in ' + language + ': ' + deb_atk_dice + ' v ' + deb_def_dice + ' dice'
  // TODO: figure out how to make some of this appear in different colours
  deb_results_atk.textContent = atk_debater + ' wins ' + (atk_win * 100).toFixed(2) + '% of the time'
  deb_results_tie.textContent = 'Tie ' + (tie * 100).toFixed(2) + '% of the time'
  deb_results_def.textContent = def_debater + ' wins ' + (def_win * 100).toFixed(2) + '% of the time'

  elim_chance_atk.textContent = atk_debater + ' has a ' + (atk_elim * 100).toFixed(2) + '% chance to ' + atk_msg + ' ' + def_debater // display to page
  elim_chance_def.textContent = def_debater + ' has a ' + (def_elim * 100).toFixed(2) + '% chance to ' + def_msg + ' ' + atk_debater
  // deb_results_def.textContent = '2'
  /* elim_chance_atk.textContent = '3'
  elim_chance_def.textContent = '4' */

  summary.style.color = 'inherit'

  return true;
}

function NantoZero(val){return +val || 0} // one-line function that checks if there is a nan and converts it to zero

function get_debater_dice(name, language, status, tmore, inq, augsburg, mary, atk_base = ATK_BASE, unc_base = UNC_BASE, com_base = COM_BASE, eck_bonus = ECK_BONUS, gard_bonus = GARD_BONUS, tmore_bonus_eng = TMORE_BONUS_ENG, tmore_bonus_other = TMORE_BONUS_OTHER, inq_bonus = INQ_BONUS, augsburg_pen = AUGSBURG_PEN, mary_multiplier = MARY_MULTIPLIER){
    /*
    Gets array containing the number of dice a debater rolls in a debate and the debater value

    name, language, status should be strs
    tmore, inq, augsburg, mary should all be booleans
    */
   
   // console.log(debaters)
   // let deb_data = debaters.filter(debater => debater.Debater == name)
   let deb_data = debaters.filter(debater => debater.Debater == name)

   let deb_val = deb_data.map(deb_name => deb_name.Value)[0];//.map(value => value.Value);
   // get the value
   let team = deb_data.map(deb_team => deb_team.Affiliation)[0]

   var tot_dice = deb_val

   // console.log(tot_dice)

   /* const language = deb_data.map(deb_language => deb_language.Language)
   console.log(base_dice)
   console.log(language) */
   if (status == 'atk'){
     if (language == 'English' && team == 'Papal'){
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
     throw 'Error: Debater is in an invalid status please report'
   }

   if (team == 'Papal'){
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
   return ([tot_dice, deb_val])

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

      atk_results.style.color = 'inherit' // change text to default color
      def_results.style.visibility = 'visible' // show element
    }
    else {
      atk_results.textContent = 'Please enter a valid number of attacking and defending dice.' // print to page

      atk_results.style.color = 'red' // change text to red
      def_results.style.visibility = 'hidden' // hide element
    }
    return true;
}

// NOT CURRENTLY IN USE
// FIX THIS FXN AT SOME POINT
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

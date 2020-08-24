// CONSTANTS:

const HITCHANCE = 1/3 // in vanilla HIS, 5 or 6 on a d6 is a hit for debates/battles
const ROUNDTO = 2 // number of significant figures (after the decimal point) that all the results should round to

const DICEFACES = 6 // number of faces on a die (vanilla HIS uses 6 dice)
const BIBLE_BONUS = 1 // +1 bonus given from bible translations/calvin's institutes

const ATK_BASE = 3 // 3 dice for attacker in theological debates
const UNC_BASE = 2 // 2 dice for uncommitted defender in theological debates
const COM_BASE = 1 // 1 die for committed defender in theological debates
const ECK_BONUS = 1 // bonus die for Eck
const GARD_BONUS = 1 // bonus die for gardiner in the english language zone
const TMORE_BONUS_ENG = 3  // bonus dice for thomas more on offense
const TMORE_BONUS_OTHER = 1
const AUGSBURG_PEN_DEBATE = 1  // debate malus dice for effects of Augsburg Confession
const AUGSBURG_PEN_REFORM = 1 // dice roll malus modifier for effects of augsburg confession
const INQ_BONUS = 2  // bonus dice for papal inquisition
const MARY_MULTIPLIER = 2 // multiplier for papal debater value in england if mary rules england

const NUMSIMULATIONS = 100000 // number of simulations to do for calculating the number of spaces flipped in debates/battles
const HITVALUE = 5 // value on die for which a hit is scored (and higher values); vanilla HIS hits on 5 or 6
const ALEANDERBONUS = 1 // bonus spaces flipped by aleander when he's in a debate
const CAMPEGGIOCANCEL = 5 // value (or higher) on die for which campeggio cancels a loss when he's in a debate (vanilla HIS cancels if 5 or 6)
const DEFBONUSDICE = 1 // extra die defender gets in battles/assaults for being the defender

const CUTOFFPROB = 0.00005 // outcomes that have fewer than this probability to happen are eliminated from the simulations, by default set to 0.00005
const GARRISONSIZE = 4 // maximum size for a garrison in assaults (vanilla HIS is 4)

// import json of debaters and associated values:

// var debaters;
var debaters;
var data = jQuery.getJSON("./debater_values.json", function(get_debaters){debaters = get_debaters;}); // uses debater_values.json
// creates debaters as a list of debaters
// console.log(data)
// console.log(debaters)

function generateTableHead(table, data) {
  /*
  Generates a table head
  */
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
    // console.log('thead print')
  }
  return true;
}

function generateTable(table, data) {
  /*
  Generates a table
  */

  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
      // console.log('thead print')
    }
  }
  return true;
}

//console.log(data)
//console.log(debaters)
//$(document).ready(function() { // check to make sure document is loaded because otherwise debater lists don't generate properly sometimes
function getDebaterOdds(hitChance = HITCHANCE, roundTo = ROUNDTO){
  /*
  Gets debate odds and changes html elements as appropriate
  hit chance is default param
  */
  let summary = document.getElementById('deb_summary')
  let deb_results_atk = document.getElementById('deb_results_atk')
  let deb_results_def = document.getElementById('deb_results_def')
  let deb_results_tie = document.getElementById('deb_results_tie')
  let elim_chance_atk = document.getElementById('elim_chance_atk')
  let elim_chance_def = document.getElementById('elim_chance_def')
  // console.log('2')

  // tODO: DISPLAY CHECKBOX FOR MARY ONLY IF ENGLISH LANGUAGE DEBATER SELECTED

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
  const augsburg = document.getElementById('augsburg_debate').checked;
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

  var data_atk = getDebaterDice(atk_debater, language, atk_status, tmore, inq, augsburg, mary); // get debater dice and value
  var data_def = getDebaterDice(def_debater, language, def_status, tmore, inq, augsburg, mary);

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

  for (ddice = 0; ddice < deb_atk_dice + 1; ddice++){ // deb_atk_dice + 1 to include the endpoint
    // console.log(i)
    // have to check whether there are invalid cases (e.g. checking for more hits than there are dice and convert the nans to 0)
    let atk_hits_chance = NantoZero(jStat.binomial.pdf(ddice, deb_atk_dice, hitChance)) // odds of attacker getting exactly this many hits
    // console.log(atk_hits_chance)
    let def_hits_fewer = NantoZero(jStat.binomial.cdf(ddice - 1, deb_def_dice, hitChance)) // odds of defender getting fewer than this many hits
    let def_hits_equal = NantoZero(jStat.binomial.pdf(ddice, deb_def_dice, hitChance)) // odds of defender getting equal number of hits
    let def_hits_more = 1 - def_hits_fewer - def_hits_equal // odds of defender getting more than this many hits

 /*    console.log(atk_hits_chance)
    console.log(def_hits_fewer)
    console.log(def_hits_equal)
    console.log(def_hits_more) */

    atk_win += (atk_hits_chance * def_hits_fewer) // adding chances of attacker win, tie, and defender win for this many hits
    // console.log(atk_win)
    tie += (atk_hits_chance * def_hits_equal)
    def_win += (atk_hits_chance * def_hits_more)

    let atk_hits_elim = NantoZero(jStat.binomial.cdf(ddice - (def_val + 1), deb_def_dice, hitChance)) // odds of attacker burning/disgracing defender (defender scores few enough hits)
    let def_hits_elim = NantoZero(1 - jStat.binomial.cdf(ddice + atk_val, deb_def_dice, hitChance)) // odds of defender burning/disgracing attacker (defender gets enough hits)

    atk_elim += atk_hits_chance * atk_hits_elim
    def_elim += atk_hits_chance * def_hits_elim
  }

  const differenceOdds = Object.entries(getHitDifference(atk_debater, def_debater, deb_atk_dice, deb_def_dice)) // get the odds of certain hit differences and convert to arr

  // Object.filter = (obj, predicate) => Object.keys(obj).filter(key => predicate(obj[key])).reduce((res, key) => (res[key] = obj[key],res),{});

  // console.log(differenceOdds)

  /* console.log(differenceOdds)
  console.log(atkOdds) */
  // console.log(Object.keys(differenceOdds)[1])
  // console.log(defOdds) 

  let atkTable = document.getElementById("deb_hit_difference_atk");
  let defTable = document.getElementById('deb_hit_difference_def');

  outcomeOdds = genHitDiffTables(differenceOdds, atkTable, defTable, 'debate', atk_debater, def_debater) // generates hit difference tables for debate
  let atkWin = outcomeOdds[0]; let defWin = outcomeOdds[1]; let tieOdds = outcomeOdds[2]; // get chances for attacker, defender and tie from the outcome array

  atkTable.style.display = 'inline' // display tables
  defTable.style.display = 'inline'

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
    throw 'Error: Somehow defender isn\'t committed or uncommitted? Fix this'
  }

  // display the other stuff that isn't the text from earlier

  /* console.log(atk_debater)
  console.log(def_debater) */

  summary.textContent = atk_debater + ' (' + atk_val + ') debates ' + com_msg + ' ' + def_debater + ' (' + def_val + ') in ' + language + ': ' + deb_atk_dice + ' v ' + deb_def_dice + ' dice'
  // TODO: figure out how to make some of this appear in different colours
  deb_results_atk.textContent = atk_debater + ' wins ' + (atkWin).toFixed(roundTo) + '% of the time'
  deb_results_tie.textContent = 'Tie ' + (tieOdds).toFixed(roundTo) + '% of the time'
  deb_results_def.textContent = def_debater + ' wins ' + (defWin).toFixed(roundTo) + '% of the time'


  //TODO: CHANGE THE BURN/DISGRACE CHANCES TO USE THE NEW SIMULATION AS WELL!
  elim_chance_atk.textContent = atk_debater + ' has a ' + (atk_elim * 100).toFixed(roundTo) + '% chance to ' + atk_msg + ' ' + def_debater // display to page
  elim_chance_def.textContent = def_debater + ' has a ' + (def_elim * 100).toFixed(roundTo) + '% chance to ' + def_msg + ' ' + atk_debater
  // deb_results_def.textContent = '2'
  /* elim_chance_atk.textContent = '3'
  elim_chance_def.textContent = '4' */

  summary.style.color = 'inherit'

  return true;
}
//});

function genHitDiffTables(differenceOdds, atkTable, defTable, caller, atk_debater, def_debater){
/*
Generates the hit difference tables using a difference odds array, and then two table objects for attack and defense
used for debater and battle rolls
atk_debater and def_debater are optional params used only for the case where caller = 'debate'

Also returns the chances of the attacker and defender winning, and the chances of ties
*/

let atkOdds = (differenceOdds.filter(diff => diff[0] > 0)) // split differenceOdds into two arrays for attacker and defender
// if called from simulate field battle, let defense odds include cases where attacker and defener got the same number of hits (since defender wins ties)
// otherwise debates can end in ties
if (caller == 'fb'){
  var defOdds = (differenceOdds.filter(diff => diff[0] <= 0)) // negative means defender has more hits
}
else{
  var defOdds = (differenceOdds.filter(diff => diff[0] < 0)) 
}

// atkOdds = Math.abs(atkOdds)

// might make this into a fxn at some point?

/*   if (atk_debater == 'Aleander'){
  atkOdds[0] += aleanderBonus
}
else if (def_debater == 'Aleander'){
  defOdds[0] += aleanderBonus
} */

// TODO: Try to find a more efficient way to do this that does not use a for loop
var atkWin = 0;
var defWin = 0;

for (var i = 0; i < atkOdds.length; i ++){
  atkOdds[i][0] = Math.abs(atkOdds[i][0]) //take absolute value of hit differences (since negative were for defender earlier)
  atkWin += parseFloat(atkOdds[i][1])
  atkOdds[i][1] = atkOdds[i][1] + "%"  //append "%" to the end of every probability value in the table
}
for (var j = 0; j < defOdds.length; j++){
  defOdds[j][0] = Math.abs(defOdds[j][0]) // same for def
  defWin += parseFloat(defOdds[j][1])
  /* console.log(defOdds[j][1])
  console.log(defWin) */
  defOdds[j][1] = defOdds[j][1] + "%"
}

var tieOdds = 100 - atkWin - defWin

atkOdds = atkOdds.sort((a, b) => a[0] - b[0]); // sort arrays so they go from lowest die difference to highest die difference
defOdds = defOdds.sort((a, b) => a[0] - b[0]);

/* console.log(atkOdds)
console.log(defOdds) */

atkTable.deleteTHead(); // deletes table heads if exist already
defTable.deleteTHead();

switch (caller){ // uses different column headings depending on whether func was called by getting debate odds or battle odds
  case 'debate':
    generateTableHead(atkTable, ['Hit Difference for ' + atk_debater, 'Chance']); // generate the two tables using the generate table func
    generateTableHead(defTable, ['Hit Difference for ' + def_debater, 'Chance'])
    break;
  case 'fb':
    generateTableHead(atkTable, ['Hit Difference for Attacking Army', 'Chance'])
    generateTableHead(defTable, ['Hit Difference for Defending Army', 'Chance'])
    defWin += tieOdds // for field battle, defender wins ties
    tieOdds = 0 // no ties in field battles
    break;
  }

generateTable(atkTable, atkOdds); // generate tables
generateTable(defTable, defOdds);

return [atkWin, defWin, tieOdds]; // generates tables and also returns the odds of attacker and defender winning
}

function getHitDifference(atkDebater, defDebater, atkDice, defDice, numSimulations=NUMSIMULATIONS, diceFaces=DICEFACES, hitValue=HITVALUE, aleanderBonus=ALEANDERBONUS, campeggioCancel=CAMPEGGIOCANCEL, roundTo = ROUNDTO){
  /*
  Gets the odds of hit difference (for debates) of attacking and defending dice by simulating rolls
  takes the number of attacking and defending dice
  Returns array containing probabilities of hit differences for attacker and defender

  Negative numbers represent defender getting more hits than the attacker
  */
  var sims = []

  for (i = 0; i < numSimulations; i++){
    // rand = Math.floor(Math.random() * 6) + 1;

    var atkHits = 0;
    var defHits = 0;
    // const hitDif;

    // BELOW CODE CAN GET SLOW FOR LARGE VALUES OF ATTACK AND DEFENSE DICE MAYBE (notable difference when at >1e7 trials I think)?
    // CAN TRY TO OPTIMIZE IF POSSIBLE

    for (var j = 1; j <= atkDice; j++) { // j = 1 and until j = atkDice
      // const rand = Math.floor(Math.random() * diceFaces) + 1 // generates random number from 1 to dice value
      if (Math.floor(Math.random() * diceFaces) + 1 >= hitValue){ // if random is equal to or greater than hitvalue then record a hit
        atkHits ++;
      }
    }
    for (var j = 1; j <= defDice; j++){
      // const rand =  // same thing but for defense dice
      if (Math.floor(Math.random() * diceFaces) + 1 >= hitValue){
        defHits ++;
      }
    }
    // console.log(atkHits);
    // console.log(defHits);
    var spacesFlipped = atkHits - defHits // positive hit difference means attacker scores more hits, negative means defender scores more
    
    if (atkDebater == 'Aleander' || defDebater == 'Aleander'){ // checks if aleander was in the debate, if he is then it flips an extra space for the winner
      if (spacesFlipped > 0){
        spacesFlipped += aleanderBonus
      }
      else if (spacesFlipped < 0){
        spacesFlipped -= aleanderBonus
      }
    }

    if ((atkDebater == 'Campeggio' && spacesFlipped < 0) || (defDebater == 'Campeggio' && spacesFlipped > 0)){ // checks if campeggio was in the debate and lost
        if ((Math.floor(Math.random() * diceFaces) + 1) >= campeggioCancel){ // rolls a die to see if debate is canceled
          spacesFlipped = 0;
        }
        // else nothing
    }
    sims.push(spacesFlipped);
    // console.log(hitDif)
  }
  // console.log(sims)
  var results = { };
  for (var k = 0; k < sims.length; k++){ // count up all the values that appear in the results in a js obj
    if (!results[sims[k]]){
      results[sims[k]] = 0;
    }
    results[sims[k]]++;
  }
  //console.log(sims)
  //console.log(results)
  //console.log(Object.entries(results))
  probabilities = Object.fromEntries(Object.entries(results).map(([key, value]) => [key, (value/numSimulations * 100).toFixed(roundTo)])); // divides values in obj by the number of simulations and then multiplies by 100, to find probability in percentages, and then rounds to two digits
  // console.log(probabilities)
  return probabilities;
}

function NantoZero(val){return +val || 0} // one-line function that checks if there is a nan and converts it to zero

function getDebaterDice(name, language, status, tmore, inq, augsburg, mary, atk_base = ATK_BASE, unc_base = UNC_BASE, com_base = COM_BASE, eck_bonus = ECK_BONUS, gard_bonus = GARD_BONUS, tmore_bonus_eng = TMORE_BONUS_ENG, tmore_bonus_other = TMORE_BONUS_OTHER, inq_bonus = INQ_BONUS, augsburg_pen = AUGSBURG_PEN_DEBATE, mary_multiplier = MARY_MULTIPLIER){
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

    tot_dice += atk_base

    if (team == 'Papal'){
      if (language == "English"){
        if (mary){
          tot_dice *= mary_multiplier
        }
        if (name == 'Gardiner'){
          tot_dice += gard_bonus
        }
       }
      if (name == 'Eck'){
        tot_dice += eck_bonus
      }
      if (inq){
        tot_dice += inq_bonus
      }
      if (tmore){
        if (language == 'English'){
          tot_dice += tmore_bonus_eng
        }
        else{
          tot_dice += tmore_bonus_other
        }
      }
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
   if (team == 'Papal' && augsburg){
    tot_dice -= augsburg_pen
   }
   return ([tot_dice, deb_val])
}

// console.log(getDebaterDice('Eck'));

function getReformOdds(diceFaces = DICEFACES, bible_bonus = BIBLE_BONUS, roundTo = ROUNDTO, augsburgPenReform = AUGSBURG_PEN_REFORM){
    /*
    Gets reform odds and then changes html element on the page appropriately
    // TODO: HIDE THE BOX ON THE PAGE IF POSSIBLE
    // HIDE THE CHECKBOX IF DEFENDER IS CHECKED
    */
    let atk_results = document.getElementById('ref_results_atk');
    let def_results = document.getElementById('ref_results_def');

    const atk_dice = document.getElementById('attacker_dice').value;
    const def_dice = document.getElementById('defender_dice').value;
    const tie = $("input[type='radio'][name='tie_winner']:checked").val(); // ditto for this piece of jquery (see debate odds func)
    const augsburgPapSide= $("input[type='radio'][name='pap_status']:checked").val(); // same here
    // augsburgPapSide evaluates to undefined if the augsburg confession active button isn't checked (since both raido buttons are unchecked)
    //console.log(augsburgPapSide)

    if (augsburgPapSide == 'atk'){ // depending on value of augsburgPapSide, applies a penalty for either attacker or defender
      augsburgBonus = -augsburgPenReform
    }
    else if (augsburgPapSide == 'def'){
      augsburgBonus = augsburgPenReform
    }
    else{
      augsburgBonus = 0;
    }

    // console.log(document.getElementById('bible_trans').checked);

    if (document.getElementById('bible_trans').checked){
      var bible = true
      // console.log('test')
    }
    else{
      var bible = false
      // console.log('test2')
    }
    // console.log(bible)

    //console.log(atk_results, def_results, atk_dice, def_dice, tie)

    // TODO: make the code a little better by doing the validation before entering anything
    // Makes it a lot easier to see whether attacker or defender dice is the issue

    if (tie == 'atk'){
        var win_ties = true
    }
    else if (tie == 'def'){
        var win_ties = false
    }
    else{
      atk_results.textContent = 'Choose a side to win ties'
      atk_results.style.color = 'red'
      throw 'Error: pick a side to win ties'
    }

    var atk_win = 0
    var def_win = 0
    var val;

    if (bible){ // set bonus to bible bonus if bible translation active (check dice from higher value)
      var bonus = bible_bonus;
    }
    else if (!bible){
      var bonus = 0;
    }

    // console.log(bonus)

    for (val = 1; val < diceFaces + 1; val++){
        const prob_def = ((val/diceFaces) ** def_dice) - (((val - 1)/diceFaces) ** def_dice); // probability that highest defender roll is equal to this value
        
        const prob_atk_less = ((val - 1 - bonus - augsburgBonus)/diceFaces) ** atk_dice;  // probability that all attacker dice are lower than this value
        const prob_equal = ((val - bonus - augsburgBonus)/diceFaces) ** atk_dice - prob_atk_less; // probability that highest attacker roll is exactly equal to the given roll (tie)
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
    
    if(0 < (atk_win * 100).toFixed(roundTo) && (atk_win * 100).toFixed(roundTo) < 100){
      atk_results.textContent = 'Attacker has ' + (atk_win * 100).toFixed(roundTo) + '% chance of winning' // print to page
      def_results.textContent = 'Defender has ' + (def_win * 100).toFixed(roundTo) + '% chance of winning' // print to page

      atk_results.style.color = 'inherit' // change text to default color
      def_results.style.display = 'block' // show element
    }
    else { // TODO: maybe use the css error class to handle this in the future?
      atk_results.textContent = 'Please enter a valid number of attacking and defending dice' // print to page

      atk_results.style.color = 'red' // change text to red
      def_results.style.visibility = 'none' // hide element
    }
    return true;
}

function simulateBattle(battleType, numSimulations = NUMSIMULATIONS, defBonusDice = DEFBONUSDICE, hitValue = HITVALUE, diceFaces = DICEFACES, cutoffProb = CUTOFFPROB, roundTo = ROUNDTO, garrisonSize = GARRISONSIZE){
  /*
  Simulate field battles/assaults with a certain number of attacker and defender dice and leaders
  Finds odds fof assault winning/losing, and the odds it will take a certain number of impulses to finish
  */

  let atkTroops = parseInt(document.getElementById('atk_rms').value)// gets number of attacking and defending dice by dividing number of troops by 2 and rounding up, then adding battle rating of leaders
  let defTroops = parseInt(document.getElementById('def_rms').value);
  let atkCav = parseInt(document.getElementById('atk_cav').value);
  let defCav = parseInt(document.getElementById('def_cav').value);
  const atkRating = parseInt(document.getElementById('atk_br').value); // attacker and defender battlerating
  const defRating = parseInt(document.getElementById('def_br').value);
  const atkCavStrat = parseInt(document.getElementById('atk_el_cav').value); // how many cav the attacker and defender want to keep
  const defCavStrat = parseInt(document.getElementById('def_el_cav').value);

  /* console.log(atkCavStrat)
  console.log(defCavStrat) */

  // if (atkTroop)

  /* console.log(atkUnits)
  console.log(defUnits)
  console.log(atkRating)
  console.log(defRating) */

  //TODO: add some error handling here to figure out what should happen otherwise!
  var cardsToConclude = []

  switch (battleType){
    case 'assault':

    // getting document elements

      let atkAssaultWinner = document.getElementById('atk_assault_odds') // get assault winning chances
      let defAssaultWinner = document.getElementById('def_assault_odds')
      let atkAssaultImpulses = document.getElementById('atk_assault_impulses') // get tables 
      let defAssaultImpulses = document.getElementById('def_assault_impulses')

    // FINDING NUMBER OF DICE ROLLED BY BOTH SIDES:

      var atkAssaultDice;
      var defAssaultDice;
    
      defAssaultDice = defRating + defBonusDice + defTroops // defender always gets 1 die per merc/regular in the castle, bonus dice, and 1 die per battlerating of best leader
      
      if ((defTroops + defCav) == 0){ // case where there are no units in the castle
        atkAssaultDice = atkRating + atkTroops // attacker gets 1 die per non-cav unit and one die per battle rating of best leader
      }
      else if ((defTroops + defCav) > 0){ // case where there are 1 or more units in the castle
        atkAssaultDice = atkRating + Math.ceil(atkTroops/2) // attacker gets 1 die per every two non-cav units (rounded up) and one die per battle rating of best leader
      }
      else{
        throw 'Error: negative dice being rolled, check why this is happening'
      }

      //error handling, may want to clean this up
      // TODO: CLEAN THIS UP

      if (atkAssaultDice == 0){
        atkAssaultWinner.textContent = 'Attacker must roll at least 1 die in the assault'
        // atkAssaultWinner.style.color = 'red'
        throw "Error: attacker rolling 0 dice in the assault"
      }
      if ((atkTroops + atkCav) <= (defTroops + defCav)){
        atkAssaultWinner.textContent = 'Attacker must outnumber defender to siege'
        // atkAssaultWinner.style.color = 'red'
        throw "Error: attacker must have more units than defender to siege"
      }
      if ((defTroops + defCav) > garrisonSize){
        atkAssaultWinner.textContent = 'Defender has too many units in the space to garrison all of them'
        // atkAssaultWinner.style.color = 'red'
        throw "Error: Defender has too many units in the space to garrison all of them"
      }
      if (atkCavStrat > atkCav){
        atkAssaultWinner.textContent = 'Attacker cannot keep more cavalry than started with'
        // atkAssaultWinner.style.color = 'red'
        throw "Error: Attacker trying to keep more cavalry than started with"
      }
      if (defCavStrat > defCav){
        atkAssaultWinner.textContent = 'Defender cannot keep more cavalry than started with'
        // atkAssaultWinner.style.color = 'red'
        throw "Error: Defender trying to keep more cavalry than started with"
      }

      //console.log(atkAssaultDice)
      //console.log(defAssaultDice)
      // Run simulations of dice to see the chances an assault will take a certain number of impulses to succeed and the chances it will fail

      const atkTroopsO = atkTroops; // save the old variable names in "original" before they are reassigned
      const atkCavO = atkCav;
      const defTroopsO = defTroops;
      const defCavO = defCav;
      const atkAssaultDiceO = atkAssaultDice; // sort of a hacky work around but whatever
      const defAssaultDice0 = defAssaultDice; 

      var impulses;
      var atkScoredHit;
      var winner;

      for(let i = 0; i < numSimulations; i++){

        impulses = 0;
        
        atkTroops = atkTroopsO; // reassign all these variables back to the original so that the calculations can take place
        atkCav = atkCavO;
        defTroops = defTroopsO;
        defCav = defCavO;
        atkAssaultDice = atkAssaultDiceO;
        defAssaultDice = defAssaultDice0;

        atkScoredHit = false; // reset atkScoreHit to false before the beginning of every sim

        // loop continues to run if: there are more attacking units than defending units and there are more than 0 defending units (units are left in the battle) or if there are 0 defensive units but the attacker did not score a hit in the impulse (if attacker attacked an ungarrisoned fort)
        while ((((atkTroops + atkCav) > (defTroops + defCav)) && ((defTroops + defCav) > 0)) || ((atkTroops + atkCav) > 0 && ((defTroops + defCav) <= 0) && !atkScoredHit)){ // simulation of one series of impulses ends when either all defending units are eliminated and the attacker scored at least one hit in the previous round of combat or attacker does not outnumber the defender (must break siege)
          
          let atkRolls = Array(atkAssaultDice).fill().map(() => Math.floor(Math.random() * diceFaces) + 1) // generate two arrays of attack and defense rolls
          let defRolls = Array(defAssaultDice).fill().map(() => Math.floor(Math.random() * diceFaces) + 1) // generate two arrays of attack and defense rolls

          let atkHits = atkRolls.filter(roll => roll >= hitValue).length; // filter to find number of attacker and defender hits
          let defHits = defRolls.filter(roll => roll >= hitValue).length;

          //console.log(atkHits)
          //console.log(defHits)

          if (atkHits > 0){ // set atkScoredHit to true if attackers score at least one hit
            atkScoredHit = true
          }

          atkArray = elimUnits(defHits, atkCav, atkTroops, atkCavStrat) // takes number of hits socred by defender and eliminated atk cav and troops appropriately
          defArray = elimUnits(atkHits, defCav, defTroops, defCavStrat) // same but eliminates def cav/troops

          /* console.log(atkArray)
          console.log(defArray) */

          atkCav = atkArray[0]; atkTroops = atkArray[1]
          defCav = defArray[0]; defTroops = defArray[1]

          // maybe more efficient way to do this than just copy pasting what is above but i will figure this out some other time

          if ((defTroops + defCav) == 0){ // case where there are no units in the castle
            atkAssaultDice = atkRating + atkTroops // attacker gets 1 die per non-cav unit and one die per battle rating of best leader
          }
          else if ((defTroops + defCav) > 0){ // case where there are 1 or more units in the castle
            atkAssaultDice = atkRating + Math.ceil(atkTroops/2) // attacker gets 1 die per every two non-cav units (rounded up) and one die per battle rating of best leader
          }

          defAssaultDice = defRating + defTroops + defBonusDice

          /* console.log(atkAssaultDice)
          console.log(defAssaultDice) */

          impulses += 1
          
          /* switch (atkCavStrat) {
            case 'always_cav':
              let atkArray = elimUnits(defHits, atkCav, atkTroops) // returns array containing remaining attacker cav and regs/mercs

              atkCav = atkArray[0] // get the number of attacking cav and regs/mercs
              atkTroops = atkArray[1]

              break;
            case 'one_cav':
              //TODO: FINISH THIS
              break;
          }
          switch (defCavStrat){
            case 'always_cav':
              let defArray = elimUnits(atkHits, defCav, defTroops)

              defCav = defArray[0] // get the number of defending cav and regs/mercs
              defTroops = defArray[1] 

              break;
            case 'one_cav':
              //TODO: fINISH THIS TOO
              break;
          } */
          /* console.log(atkRolls)
          console.log(atkHits) */

          //TODO: IMPLEMENT CASE WHERE BOTH ATTACKER AND DEFENDER UNITS ARE ALL DEAD
          
        }
        if ((defTroops + defCav) <= 0 && atkScoredHit && (atkTroops + atkCav) > 0){ // if siege ends because defender has no units in fort and attacker scored at least one hit and ther eis at least one attacking unit remaining then set attacker as winner
          winner = 'atk'
        }
        else if (((atkTroops + atkCav) <= (defTroops + defCav)) || (atkTroops + atkCav) <= 0) { // if siege ends because attacker does not outnumber defender, or because all attacking units have been eliminated, then set defender as winner
          winner = 'def'
        }
        cardsToConclude.push([impulses, winner]) // adds array containing number of impulses it took to conclude the assault and then the assault winner
      }
    
    let atkWins = cardsToConclude.filter(arr => arr[1] == 'atk') // split array into two arrays for attacker and defender wins
    let defWins = cardsToConclude.filter(arr => arr[1] == 'def')
    // let atkWins = cardsToConclude.reduce((n, val) => n + (val == 'atk'));// split array into two arrays for attacker and defender wins
    // let defWins = cardsToConclude.filter(winner => winner == 'def')
    //console.log(atkWins)

    var atkImpulseArr = []; // define atk and def impulse arr
    var defImpulseArr = [];
    var filtered;
  
    const atkImpulseMin = Math.min.apply(null, ([].concat.apply([], atkWins)).filter(val => !isNaN(val))) // calculate min and max number of impulses taken to resolve the full assasult
    const atkImpulseMax = Math.max.apply(null, ([].concat.apply([], atkWins)).filter(val => !isNaN(val)))
    const defImpulseMin = Math.min.apply(null, ([].concat.apply([], defWins)).filter(val => !isNaN(val)))
    const defImpulseMax = Math.max.apply(null, ([].concat.apply([], defWins)).filter(val => !isNaN(val)))

   /*  console.log(atkImpulseMin)
    console.log(atkImpulseMax) */

    //const atkImpulseMax = atkWins.sort(function(a,b){return a[0] < b[0];})[0]
    // const defImpulseMin = defWins.sort(function(a,b){return a[0] > b[0];})[0]
    // const defImpulseMax = defWins.sort(function(a,b){return a[0] < b[0];})[0]

    for (let val = atkImpulseMin; val < atkImpulseMax + 1; val++){
      filtered = atkWins.filter(arr => arr[0] == val)
      if (filtered.length/numSimulations > cutoffProb){ // checks to make sure the number of simulations is above the cutoff probability, to avoid random very low probabiity things being added to the end of the array
        atkImpulseArr.push([val, filtered])
      }
    }
    atkImpulseArr = atkImpulseArr.map(([impulses, numOutcomes]) => [impulses, (100 * numOutcomes.length/numSimulations).toFixed(roundTo) + "%"]) // change the number of outcomes from an array of all the outcomes to the chances (with % added to the end)

    for (let val = defImpulseMin; val < defImpulseMax + 1; val++){
      filtered = defWins.filter(arr => arr[0] == val)
      if (filtered.length/numSimulations > cutoffProb){ // same for defenders
        defImpulseArr.push([val, defWins.filter(arr => arr[0] == val)])
      }
    }
    defImpulseArr = defImpulseArr.map(([impulses, numOutcomes]) => [impulses, (100 * numOutcomes.length/numSimulations).toFixed(roundTo) + "%"]) // same thing but for defenders

    /* console.log(atkImpulseArr)
    console.log(defImpulseArr) */
    //for (val = Math.min(atkWins[0]))

    let atkAssaultOdds = (atkWins.length)/numSimulations // get attack and defense win odds 
    let defAssaultOdds = (defWins.length)/numSimulations
    
    /* console.log(atkAssaultOdds)
    console.log(defAssaultOdds) */
    /* for (var i = 0; i < atkAssaultImpulses.length; i ++){
      atkAssaultImpulses[i][1] = atkAssaultImpulses[i][1] + "%"  //append "%" to the end of every probability value in the table
    } */

    atkAssaultImpulses.deleteTHead(); // deletes table heads if exist already
    defAssaultImpulses.deleteTHead();

    generateTableHead(atkAssaultImpulses, ['Impulses to Resolve Assault for Attacker', 'Chance']); // generate the two tables using the generate table func
    generateTable(atkAssaultImpulses, atkImpulseArr);

    generateTableHead(defAssaultImpulses, ['Impulses to Resolve Assault for Defender', 'Chance'])
    generateTable(defAssaultImpulses, defImpulseArr);

    atkAssaultWinner.textContent = 'Attacker has a ' + (atkAssaultOdds * 100).toFixed(roundTo) + '% chance to win the siege'
    defAssaultWinner.textContent = 'Defender has a ' + (defAssaultOdds * 100).toFixed(roundTo) + '% chance to win (repel attacker)'

    /* for (val = Math.min.apply(cardsToConclude); val < Math.max.apply(cardsToConclude); val++){
      cardsToConclude.filter(v => v === val).length;
    } */

    break;
    
    case 'fb':
      /* let atkTable = document.getElementById('atk_fb_hits') 
      let defTable = document.getElementById('def_fb_hits') */
      let atkFbWinner = document.getElementById('atk_fb_odds') // get sections to print to
      let defFbWinner = document.getElementById('def_fb_odds')
      let atkFbHitDif = document.getElementById('atk_fb_hit_dif') // get attacker and defender tables
      let defFbHitDif = document.getElementById('def_fb_hit_dif')

      let hitArr = Object.entries(getHitDifference('', '', atkTroops + atkCav + atkRating, defTroops + defCav + defRating + defBonusDice)) // find hits scored by attacker and defender using the gttetHitDifference func from earlier, also converts this to an array
      // might want to add the array conversion in the function in the future since easier than obj
      
      // console.log(hitArr)

      // let atkHits = hitArr.filter(diff => diff[0] > 0); let defHits = hitArr.filter(diff => diff[0] < 0) // filter for attacker and defender hits (similar to debate)
      let outcomeOdds = genHitDiffTables(hitArr, atkFbHitDif, defFbHitDif, 'fb') // generate tables and return odds of each outcome (attacker, defender winning)
      // outcomeOdds = outcomeOdds.map(([hitDiff, numOutcomes]) => [hitDiff, parseInt(numOutcomes).toFixed(roundTo) + "%"]) // convert the number of outcomes to a percentage and round it
      // console.log(outcomeOdds)

      let atkWin = outcomeOdds[0].toFixed(roundTo) + "%"; let defWin = outcomeOdds[1].toFixed(roundTo) + "%" // get attacker and defender winning odds, round as required and add percentage at the end.
      
      atkFbWinner.textContent = 'Attacker has a ' + atkWin + ' chance of winning the battle'
      defFbWinner.textContent = 'Defender has a ' + defWin + ' chance of winning the battle'

      atkFbWinner.style.color = 'inherit' // change text to default color
      defFbWinner.style.color = 'inherit' // show element
      
      break;
    }
    //console.log(cardsToConclude)
}

function elimUnits(hits, cav, troops, cavToKeep){
  /*
    Eliminates units based on how many hits are scored depending on cav strategy
    Note that hits are the hits scored by the OTHER side
  */

/*   switch (hitsAppliedTo){
    case 'attacker':
      if  */

  if ((cav - cavToKeep) >= hits){ // if there are an equal number or greater attacking cavalry than defender hits, then eliminate cavalry
    cav -= hits
  }
  else if ((cav - cavToKeep) < hits){ // if there are fewer attacking cavalry than defender hits, then eliminate all cav before moving on to regs/mercs
    hits -= (cav - cavToKeep) // subtract the number of cavalry (minus how many cav to keep) from the number of defender hits
    cav -= (cav - cavToKeep) // remove that number of cav
    troops -= hits // apply all remaining defender hits to regulars/mercs
  }

 /*  switch (strat){
    case 'always_cav':
      if (cav >= hits){ // if there are an equal number or greater attacking cavalry than defender hits, then eliminate cavalry
        cav -= hits
      }
      else if (cav < hits){ // if there are fewer attacking cavalry than defender hits, then eliminate all cav before moving on to regs/mercs
        hits -= cav // subtract the number of attacking cavalry from the number of defender hits
        troops -= hits // apply all remaining defender hits to regulars/mercs
        cav -= cav // remove all cav
    }
    case 'one_cav':
      if (cav > hits){
        cav -= hits
      }
      else if (cav <= hits){
        hits -= cav
      }
  } */
  return [cav, troops] // returns the number of cavalry and regulars/mercs after one round of unit elimination
}

// FUNCTIONS CURRENTLY NOT IN USE:

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
    return true;
  }

// console.log(getReformOdds(3, 4, 'defender', 3));

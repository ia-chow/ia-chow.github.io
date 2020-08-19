// CONSTANTS:

const HIT_CHANCE = 1/3 // in vanilla HIS, 5 or 6 on a d6 is a hit for debates/battles

const DICEFACES = 6 // number of faces on a die (vanilla HIS uses 6 dice)
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

const NUMSIMULATIONS = 100000 // number of simulations to do for calculating the number of spaces flipped in debates/battles
const HITVALUE = 5 // value on die for which a hit is scored (and higher values); vanilla HIS hits on 5 or 6
const ALEANDERBONUS = 1 // bonus spaces flipped by aleander when he's in a debate
const CAMPEGGIOCANCEL = 5 // value (or higher) on die for which campeggio cancels a loss when he's in a debate (vanilla HIS cancels if 5 or 6)

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
function getDebaterOdds(hit_chance = HIT_CHANCE){
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
    let atk_hits_chance = NantoZero(jStat.binomial.pdf(ddice, deb_atk_dice, hit_chance)) // odds of attacker getting exactly this many hits
    // console.log(atk_hits_chance)
    let def_hits_fewer = NantoZero(jStat.binomial.cdf(ddice - 1, deb_def_dice, hit_chance)) // odds of defender getting fewer than this many hits
    let def_hits_equal = NantoZero(jStat.binomial.pdf(ddice, deb_def_dice, hit_chance)) // odds of defender getting equal number of hits
    let def_hits_more = 1 - def_hits_fewer - def_hits_equal // odds of defender getting more than this many hits

 /*    console.log(atk_hits_chance)
    console.log(def_hits_fewer)
    console.log(def_hits_equal)
    console.log(def_hits_more) */

    atk_win += (atk_hits_chance * def_hits_fewer) // adding chances of attacker win, tie, and defender win for this many hits
    // console.log(atk_win)
    tie += (atk_hits_chance * def_hits_equal)
    def_win += (atk_hits_chance * def_hits_more)

    let atk_hits_elim = NantoZero(jStat.binomial.cdf(ddice - (def_val + 1), deb_def_dice, hit_chance)) // odds of attacker burning/disgracing defender (defender scores few enough hits)
    let def_hits_elim = NantoZero(1 - jStat.binomial.cdf(ddice + atk_val, deb_def_dice, hit_chance)) // odds of defender burning/disgracing attacker (defender gets enough hits)

    atk_elim += atk_hits_chance * atk_hits_elim
    def_elim += atk_hits_chance * def_hits_elim
  }

  const differenceOdds = Object.entries(getHitDifference(atk_debater, def_debater, deb_atk_dice, deb_def_dice)) // get the odds of certain hit differences

  // Object.filter = (obj, predicate) => Object.keys(obj).filter(key => predicate(obj[key])).reduce((res, key) => (res[key] = obj[key],res),{});

  // console.log(differenceOdds)

  /* console.log(differenceOdds)
  console.log(atkOdds) */
  // console.log(Object.keys(differenceOdds)[1])
  // console.log(defOdds) 

  let atkTable = document.getElementById("deb_hit_difference_atk");
  let defTable = document.getElementById('deb_hit_difference_def');

  let atkOdds = (differenceOdds.filter(diff => diff[0] > 0)) // split differenceOdds into two arrays for attacker and defender
  let defOdds = (differenceOdds.filter(diff => diff[0] < 0)) // negative means defender has more hits

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

  generateTableHead(atkTable, ['Hit Difference for ' + atk_debater, 'Chance']); // generate the two tables using the generate table func
  generateTable(atkTable, atkOdds);

  generateTableHead(defTable, ['Hit Difference for ' + def_debater, 'Chance'])
  generateTable(defTable, defOdds);

  atkTable.style.display = 'inline' // display table
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

  summary.textContent = atk_debater + ' (' + atk_val + ') debates ' + com_msg + ' ' + def_debater + ' (' + def_val + ') in ' + language + ': ' + deb_atk_dice + ' v ' + deb_def_dice + ' dice'
  // TODO: figure out how to make some of this appear in different colours
  deb_results_atk.textContent = atk_debater + ' wins ' + (atkWin).toFixed(2) + '% of the time'
  deb_results_tie.textContent = 'Tie ' + (tieOdds).toFixed(2) + '% of the time'
  deb_results_def.textContent = def_debater + ' wins ' + (defWin).toFixed(2) + '% of the time'


  //TODO: CHANGE THE BURN/DISGRACE CHANCES TO USE THE NEW SIMULATION AS WELL!
  elim_chance_atk.textContent = atk_debater + ' has a ' + (atk_elim * 100).toFixed(2) + '% chance to ' + atk_msg + ' ' + def_debater // display to page
  elim_chance_def.textContent = def_debater + ' has a ' + (def_elim * 100).toFixed(2) + '% chance to ' + def_msg + ' ' + atk_debater
  // deb_results_def.textContent = '2'
  /* elim_chance_atk.textContent = '3'
  elim_chance_def.textContent = '4' */

  summary.style.color = 'inherit'

  return true;
}
//});

function getHitDifference(atkDebater, defDebater, atkDice, defDice, numSimulations=NUMSIMULATIONS, diceFaces=DICEFACES, hitValue=HITVALUE, aleanderBonus=ALEANDERBONUS, campeggioCancel=CAMPEGGIOCANCEL){
  /*
  Gets the odds of hit difference of attacking and defending dice by simulating rolls
  takes the number of attacking and defending dice
  Returns probabilities of hit differences for attacker and defender

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
  probabilities = Object.fromEntries(Object.entries(results).map(([key, value]) => [key, (value/numSimulations * 100).toFixed(2)])); // divides values in obj by the number of simulations and then multiplies by 100, to find probability in percentages, and then rounds to two digits
  // console.log(probabilities)
  return probabilities;
}

function NantoZero(val){return +val || 0} // one-line function that checks if there is a nan and converts it to zero

function getDebaterDice(name, language, status, tmore, inq, augsburg, mary, atk_base = ATK_BASE, unc_base = UNC_BASE, com_base = COM_BASE, eck_bonus = ECK_BONUS, gard_bonus = GARD_BONUS, tmore_bonus_eng = TMORE_BONUS_ENG, tmore_bonus_other = TMORE_BONUS_OTHER, inq_bonus = INQ_BONUS, augsburg_pen = AUGSBURG_PEN, mary_multiplier = MARY_MULTIPLIER){
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

// console.log(getDebaterDice('Eck'));

function getReformOdds(diceFaces = DICEFACES, bible_bonus = BIBLE_BONUS){
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
        
        const prob_atk_less = ((val - 1 - bonus)/diceFaces) ** atk_dice;  // probability that all attacker dice are lower than this value
        const prob_equal = ((val - bonus)/diceFaces) ** atk_dice - prob_atk_less; // probability that highest attacker roll is exactly equal to the given roll (tie)
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
      def_results.style.display = 'block' // show element
    }
    else { // TODO: maybe use the css error class to handle this in the future?
      atk_results.textContent = 'Please enter a valid number of attacking and defending dice' // print to page

      atk_results.style.color = 'red' // change text to red
      def_results.style.visibility = 'none' // hide element
    }
    return true;
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

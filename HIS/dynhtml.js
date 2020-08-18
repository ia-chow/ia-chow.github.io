/* define(function (require) {
    const debaters = require(); //fix this 
});
 */
var debaters;
var data = jQuery.getJSON("./debater_values.json", function(get_debaters){debaters = get_debaters;}); // uses debater_values.json

//console.log(data)
//console.log(debaters)

function dynamicDropdown(team) {
    /*
    Creates dynamic drop down lists of attacking and defending debaters given the attacking team
    */
   // console.log(debaters)

   let pap_list = debaters.filter(debater => debater.Affiliation == 'Papal').map(name => name.Debater);
   let prot_list = debaters.filter(debater => debater.Affiliation == 'Protestant').map(name => name.Debater);

   //console.log(pap_list)
   // console.log(prot_list)

    atk_list = document.getElementById("atk_dropdown");
    def_list = document.getElementById("def_dropdown");

    for(i = atk_list.options.length - 1; i >= 0; i --){
        atk_list.remove(i)
    }
    for(i = def_list.options.length - 1; i >= 0; i --){
        def_list.remove(i)
    }

    //console.log(atk_list)
    //console.log(def_list)

        switch (team)
        {
        case "papal" :
            // console.log(name_list)
            for (i = 0; i < pap_list.length; i++) {
                atk_list.options[i] = new Option(pap_list[i], pap_list[i])
                // def_list.options[i] = new Option(prot_list[i])
                // console.log(pap_list[i])
            }
            for (i = 0; i < prot_list.length; i++){
                def_list.options[i] = new Option(prot_list[i], prot_list[i])
            }
            break;
        case "protestant" :
            for (i = 0; i < prot_list.length; i++){
                atk_list.options[i] = new Option(prot_list[i], prot_list[i])
                // def_list.options[i] = new Option(pap_list[i])
                // console.log(prot_list[i])
            }
            for (i = 0; i < pap_list.length; i++){
                def_list.options[i] = new Option(pap_list[i], pap_list[i])
            }
            /* 
            document.getElementById("status").options[0]=new Option("Select status","");
            document.getElementById("status").options[1]=new Option("OPEN","open");
            document.getElementById("status").options[2]=new Option("DELIVERED","delivered");
            document.getElementById("status").options[3]=new Option("SHIPPED","shipped"); */
            break;
        }
        // console.log(atk_list)

        return true;
    }
    // might want to find out how to put in 
    // might also want to merge this into the main his_dice_odds js file later

// dynamicdropdown("papal", require("./debater_values.json"))

function bibleVis(){ // hides bible/calvin box depending on who wins ties

    var tie_winner = $("input[type='radio'][name='tie_winner']:checked").val();
    console.log(tie_winner)

    if (tie_winner == 'atk'){
        document.getElementById('bible').style.display = 'block' // if attacker button has been clicked display the bible/calvin box
    }
    else if (tie_winner == 'def'){ 
        document.getElementById('bible').checked = false; // if defender button has been clicked hide the bible/calvin box and uncheck it
        document.getElementById('bible').style.display = 'none'
    }
}

// FUNCTIONS NOT CURRENTLY IN USE:

//FXN NOT CURRENTLY IN USE
function toggleVis(elem){ // make elements visible or invisible, and uncheck it if it is a checkbox/radio
    // param str elem: name of string
    // param bool disp: whether to set the element to visible or not

    var visible = $('#' + elem).is(':visible') // checks to see if element is visible or not, uses jquery
    // console.log(visible)
    
    if (visible){
        document.getElementById(elem).style.display = 'block'
    }
    else {
        document.getElementById(elem).style.display = 'none'
    }
    /* if (style.display == 'none'){
        document.getElementById(elem).style.display == 'inline'
    }
    else{
        document.getElementById(elem).style.display == 'none'
    } */
    /* let elem_type = $('#' + elem).prop('tagName');
    console.log(elem_type) */

    /* if (tie_winner == 'atk'){
        document.getElementById("bible").style.visibility = 'visible'
    }
    else if (tie_winner == 'def'){
        document.getElementById("bible").style.visibility = 'hidden'
    }
    else{
        throw 'Error: Choose a side to win ties'
    } */
}

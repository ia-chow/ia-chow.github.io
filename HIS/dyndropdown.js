/* define(function (require) {
    const debaters = require(); //fix this 
});
 */
var debaters;
var data = jQuery.getJSON("./debater_values.json", function(get_debaters){debaters = get_debaters;}); // uses debater_values.json

function dynamicdropdown(team) {
    /*
    Creates dynamic drop down lists of attacking and defending debaters given the attacking team
    */
   // console.log(debaters)
   let pap_list = debaters.filter(debater => debater.Affiliation == 'Papal').map(name => name.Debater);
   let prot_list = debaters.filter(debater => debater.Affiliation == 'Protestant').map(name => name.Debater);
        switch (team)
        {
        case "papal" :
            // console.log(name_list)
            for (i = 0; i < pap_list.length; i++) {
                document.getElementById("atk_dropdown").options[i] = new Option(pap_list[i])
                document.getElementById("def_dropdown").options[i] = new Option(prot_list[i])
                // console.log(pap_list[i])
            }
            break;
        case "protestant" :
            for (i = 0;i < prot_list.length; i++){
                document.getElementById("atk_dropdown").options[i] = new Option(prot_list[i])
                document.getElementById("def_dropdown").options[i] = new Option(pap_list[i])
                // console.log(prot_list[i])
            }
            /* 
            document.getElementById("status").options[0]=new Option("Select status","");
            document.getElementById("status").options[1]=new Option("OPEN","open");
            document.getElementById("status").options[2]=new Option("DELIVERED","delivered");
            document.getElementById("status").options[3]=new Option("SHIPPED","shipped"); */
            break;
        }
        return true;
    }
    // figure out how this works as well and implement it so it works properly (the dynamic dropdown)

// dynamicdropdown("papal", require("./debater_values.json"))
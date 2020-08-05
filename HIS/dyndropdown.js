/* define(function (require) {
    const debaters = require(); //fix this 
});
 */
function dynamicdropdown(team) {
    /*
    Creates dynamic drop down list of debaters for a given team
    */
   jQuery.get("./students.json", function(debaters){
    }, "json");
   // var get_debaters = JSON.parse(./debater_values.json);
   console.log(debaters)
        switch (team)
        {
        case "papal" :
            let name_list = debaters.filter(debater => debater.Affiliation == 'Papal').map(name => name.Debater);
            console.log(name_list)
            for (i = 0; i < name_list.length; i++) {
                document.getElementById("atk_dropdown").options[i]=new Option(name_list[i])
                console.log(name_list[i])
            }
            break;
        case "protestant" : 
            let prot_info = debaters.filter(debater => debater.Affiliation == 'Protestant').map(name => name.Debater);

            console.log(prot_info)
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
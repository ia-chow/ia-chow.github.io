function dynamicdropdown(team) {
    /*
    Creates dynamic drop down list of debaters for a given team
    */
   const debaters = require()
        switch (team)
        {
        case "papal" :
            let name_list = debaters.filter(debater => debater.Affiliation == 'Papal').map(name => name.Debater);
            for (i = 0; i < name_list.length; i++) {
                document.getElementById("atk_dropdown").options[i]=new Option(name_list[i])
                console.log(name_list[i])
            }
            break;
        case "protestant" : 
            let prot_info = debaters.filter(debater => debater.Affiliation == 'Protestant')

            console.log(prot_info)
            /* 
            document.getElementById("status").options[0]=new Option("Select status","");
            document.getElementById("status").options[1]=new Option("OPEN","open");
            document.getElementById("status").options[2]=new Option("DELIVERED","delivered");
            document.getElementById("status").options[3]=new Option("SHIPPED","shipped"); */
            break;
        }
        return true;
        return a;
    }
    // figure out how this works as well and implement it so it works properly (the dynamic dropdown)

// dynamicdropdown("papal", require("./debater_values.json"))
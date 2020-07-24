function dynamicdropdown(listindex)
    {
        var data = $.csv.toObjects(debater_values.csv)
        switch (listindex)
        {
        case "manual" :
            document.getElementById("status").options[0]=new Option("Select status","");
            document.getElementById("status").options[1]=new Option("OPEN","open");
            document.getElementById("status").options[2]=new Option("DELIVERED","delivered");
            break;
        case "online" :
            document.getElementById("status").options[0]=new Option("Select status","");
            document.getElementById("status").options[1]=new Option("OPEN","open");
            document.getElementById("status").options[2]=new Option("DELIVERED","delivered");
            document.getElementById("status").options[3]=new Option("SHIPPED","shipped");
            break;
        }
        return true;
    }
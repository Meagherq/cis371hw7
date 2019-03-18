var database = firebase.database();
var topRef = database.ref();
//let friendRef = topRef.child('friends');  
var mark = new Object();
var init = true;
topRef.on('child_added', addTable);
topRef.on('child_removed', removeTableRow);


function processUpload() {
    var uploadInfo = document.getElementById('upload');
    if ('files' in uploadInfo) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var jsonObj = JSON.parse(event.target.result); //an array of objects
            /* put your code here, whatever you need to do with jsonObj */
            for (var key in jsonObj) {
                var val = jsonObj[key];
                    topRef.push().set(val);
            }
        };
        /* file is an array and we are interested only in the first element */
        reader.readAsText(uploadInfo.files[0]);
    }
}

function addTable(snapshot) {
    var newTable = document.getElementById("friendTable");
    var div = newTable.parentNode;
    mark[snapshot.key] = snapshot.val();
    var temp;
    for(var key in mark) {
        if(mark.hasOwnProperty(key)) {
            var numLen = mark[key].phone;
            if(numLen.length == 7 || numLen.length == 10) {
                if(numLen.length == 7) {
                    temp = numLen.substring(0,3) + "-" + numLen.substring(3);
                }
                if(numLen.length == 10) {
                    temp = "(" + numLen.substring(0,3) + ")" + numLen.substring(3,6) + "-" + numLen.substring(6);
                }
                mark[key].phone = temp;
            }
        }
    }

    var tr = document.createElement('TR');
    for (var val in mark[snapshot.key]) {
        if(mark[snapshot.key].hasOwnProperty(val)) {
            var td = document.createElement('TD')
            td.appendChild(document.createTextNode(mark[snapshot.key][val]));
            tr.appendChild(td)
        }
    }
    // document.getElementById("totalRecords").innerHTML = friendTable.rows.length + " records inserted to Firebase.";
    var td = document.createElement('TD')
    var actionButton = document.createElement('BUTTON');
    actionButton.appendChild(document.createTextNode("Delete"));
    actionButton.setAttribute('onclick', `removeRow("${snapshot.key}")`);
    td.appendChild(actionButton);
    tr.appendChild(td)
    newTable.appendChild(tr);   

    if(init) {
        if(document.getElementById("deleteAllFriends") == null) {
            var deleteAllFriends = document.createElement('button');
            deleteAllFriends.id = "deleteAllFriends";
            deleteAllFriends.innerHTML = "Delete All Friends";
            deleteAllFriends.setAttribute('onclick', "removeAllRows()");
            div.appendChild(deleteAllFriends);
        }
        div.className = "center";
        init = false;
    }
    document.getElementById("totalRecords").innerHTML = friendTable.rows.length-1 + " records inserted to Firebase.";
}

function checkNewFriend() {
    var nameResult = document.getElementById("nameResult").value;
    var phoneResult = document.getElementById("phoneResult").value;
    var ageResult = document.getElementById("ageResult").value;
    var testPass = true;

    if(/[A-Z]{1}[a-z]+/.test(nameResult)) {
    
    } else {
        testPass = false;
        alert("Invalid name. Please enter a new name.");
    }
    if(/^([0-9]{7})$|^([0-9]{10})$/.test(phoneResult)) {

    } else {
        testPass = false;
        alert("Invalid phone number. Please enter a new phone number.");
    }

    if(/^[0-9]{1,2}$/.test(ageResult)) {

    } else {
        testPass = false;
        alert("Inavlid age. Please enter a new age.");
    }

    if(testPass) {
        addFriend(nameResult, phoneResult, ageResult);
    }
}

function searchFriends() {
    var searchVal = document.getElementById("searchText").value;
    
    if(/[A-Za-z]+/.test(searchVal)) {
        var resultsTable = document.getElementById("resultsTable");
        var parentDiv = resultsTable.parentNode;
        parentDiv.className = "visible";            
        var prevInfo = document.querySelectorAll("#resultsTable tr");
        var prevLength = resultsTable.rows.length;
    
        for(var i = 1; i < prevLength; ++i) {
            resultsTable.deleteRow(1);
        }
    }
    topRef.orderByChild('name').on('child_added', commenceSearch);
}

function commenceSearch(snapshot) {
    var searchText = document.getElementById("searchText").value;
    var resultsTable = document.getElementById("resultsTable");

    if(/[A-Za-z]+/.test(searchText)) {
        var results = new Object();
        results[snapshot.key] = snapshot.val();
        var valid = new Object();

        for(var val in results) {
            if(results.hasOwnProperty(val)) {
                if(results[snapshot.key].name.toLowerCase().includes(searchText.toLowerCase())) {
                    valid[snapshot.key] = snapshot.val();
                }
            }
        }
        var tr = document.createElement('TR');
        for (var val in valid[snapshot.key]) {
            if(valid[snapshot.key].hasOwnProperty(val)) {
                var td = document.createElement('TD')
                td.appendChild(document.createTextNode(valid[snapshot.key][val]));
                tr.appendChild(td)
                resultsTable.appendChild(tr);
            }
        }
    }
}

function removeRow(key) {
    var childRef = topRef.child(key);
    childRef.remove();
    document.getElementById("totalRecords").innerHTML = friendTable.rows.length-1 + " records inserted to Firebase.";
}

function removeTableRow(snapshot) {
    var name = snapshot.val().name;
    var rows = document.getElementsByTagName("tr");
    for (var i = rows.length; i--;) {
        if(rows[i].innerHTML.indexOf(name) !== -1) {
            rows[i].parentNode.removeChild( rows[i] );
        }
    }
}

function removeAllRows() {
    topRef.remove();
    var emptyTable = document.getElementById("friendTable");
    var prev = emptyTable.parentNode;
    prev.className = "hidden";
    init = true;
}

function addFriend(nameResult, phoneResult, ageResult) {
    topRef.push().set({name: nameResult, phone: phoneResult, yage: ageResult});
}
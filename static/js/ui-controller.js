var resElem = document.getElementById("search-result-container");
var sForm = document.getElementById("search-form");
// var badTable = null;
// var cmcTable = null;
// var ncmcTable = null;
var tables = {
    'bad': null,
    'CMC': null,
    'nCMC': null
}

// check for url params
window.onload = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var tab = urlParams.get('tab');
    if (tab) {
        var button = document.getElementById(tab);
        if (button) {
            button.click();
        }
    }
};

// check navigation events and preserve table
let navigationEntry = performance.getEntriesByType("navigation")[0];
if (sessionStorage.getItem("autosave") && (navigationEntry.type == "back_forward" || location.hash == '#search_results')) {
    console.log("true");
    saved_response = JSON.parse(sessionStorage.getItem('autosave'));
    // resElem = sessionStorage.getItem('autosave');
    for(var [key, value] of Object.entries(tables)){

        var toWrap = document.getElementById(`${key}-wrapper`);
        var wrapperCol = document.createElement('div');
        wrapperCol.classList.add('col');
        toWrap.parentNode.insertBefore(wrapperCol, toWrap)
        wrapperCol.appendChild(toWrap);

        document.getElementById(`${key}-header`).style.display = 'block';
        tables[key] = new DataTable(`#${key}-table`, {
            responsive: true,
            fixedHeader: true,
            // stateSave: true,
            // stateSaveCallback: function(settings, data) {
            //     localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
            //   },
            // stateLoadCallback: function(settings) {
            //     console.log(localStorage.getItem('DataTables_' + settings.sInstance))
            // return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance));
            // },
            columns: [
                {title: 'ID', data: 0},
                // {data: null, defaultContent: "<button>Click!</button>"}
            ],
            // columns: response['bad'].map((e)=> {return {title: 'ID', data: e}}),
            // data: value,
            data: saved_response[key],
            createdRow: function(row, data, dataIndex) {
                // Only add the anchor element if the key is not "bad"
                if (key != 'bad') {
                    // Create a new anchor element
                    var a = document.createElement('a');
    
                    // Set the href attribute to the desired URL
                    a.href = '/record/' + data[0].split("<")[0]; // assuming data[0] is the record ID
                    a.textContent = data[0];
    
                    // Add the full-row-link class
                    a.classList.add('full-row-link');
    
                    // Append the anchor element to each cell in the row
                    for (var i = 0; i < row.cells.length; i++) {
                        row.cells[i].textContent = '';
                        row.cells[i].appendChild(a.cloneNode(true));
                    }
                }
            }
        });
        // if (key != 'bad') {
        //     // var rows = document.getElementById(`${key}-table`).querySelectorAll("tbody > tr");
        //     var tableElem = document.getElementById(`${key}-table`);

        //     tableElem.addEventListener("click", (e) => {
        //         var row = e.target.closest("tbody > tr");
        //         if (row) {
        //             record_id = e.target.innerText.split("<")[0];
        //             window.open('/record/' + record_id, "_self");
        //         }
        //     });

        //     // console.log(rows);
        //     // for (var row of rows) {
        //     //     console.log(row)
        //     //     row.addEventListener("click", (e) => {
        //     //         console.log(e.target.innerText)
        //     //         record_id = e.target.innerText.split("<")[0];
        //     //         // var data = table.row(this).data();
        //     //         window.open('/record/' + record_id, "_self");
        //     //     });
        //     // }
        // }
    }
    document.getElementById("search-result-container").style.clipPath = 'inset(0% -10% -10% -10%)';
}
else {
    sessionStorage.removeItem('autosave');
}

// MIRAS; MIR21, MIR505, MIR1247, miR-101
sForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    // history.replaceState({}, "");
    var query = document.getElementById("search-input").value;
    console.log(JSON.stringify({ query: query }))
    $.ajax({
        url: '/search',
        type: 'POST', // Change the request type to POST
        contentType: 'application/json',
        dataType: 'json',
        // data: {query: query}, // Send the query as data in the request
        data: JSON.stringify({ query: query }), // Send the query as data in the request
        success: function(response) {
            console.log(response);
            // var tmp = response['CMC'].map(e => [e]);
            // console.log(tmp)
            // document.getElementById("search-result-container").style.display = "none";
            document.getElementById("search-result-container").style.clipPath = 'inset(0% -10% 100% -10%)';
            for(var [key, value] of Object.entries(tables)){
                try {
                    value.destroy();
                    tables[key] = null;
                    document.getElementById(`${key}-table`).innerHTML = "";
                    document.getElementById(`${key}-header`).style.display = 'none';
                    var toRemove = document.getElementById(`${key}-wrapper`).parentElement;
                    toRemove.replaceWith(...toRemove.childNodes);
                } catch (error) {
                    console.log(error);
                }
            // }
            // for(var [key, value] of Object.entries(response)){

                var toWrap = document.getElementById(`${key}-wrapper`);
                var wrapperCol = document.createElement('div');
                wrapperCol.classList.add('col');
                toWrap.parentNode.insertBefore(wrapperCol, toWrap)
                wrapperCol.appendChild(toWrap);

                document.getElementById(`${key}-header`).style.display = 'block';
                tables[key] = new DataTable(`#${key}-table`, {
                    responsive: true,
                    fixedHeader: true,
                    language: {
                        // infoEmpty: "No records found"
                        zeroRecords: "No matching records found"
                    },
                    // stateSave: true,
                    // stateSaveCallback: function(settings, data) {
                    //     localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                    //   },
                    // stateLoadCallback: function(settings) {
                    //     console.log(localStorage.getItem('DataTables_' + settings.sInstance))
                    // return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance));
                    // },
                    columns: [
                        {title: 'ID', data: 0},
                        // {data: null, defaultContent: "<button>Click!</button>"}
                    ],
                    // columns: response['bad'].map((e)=> {return {title: 'ID', data: e}}),
                    // data: value,
                    data: response[key],
                    createdRow: function(row, data, dataIndex) {
                        // Only add the anchor element if the key is not "bad"
                        if (key != 'bad') {
                            // Create a new anchor element
                            var a = document.createElement('a');
            
                            // Set the href attribute to the desired URL
                            a.href = '/record/' + data[0].split("<")[0]; // assuming data[0] is the record ID
                            a.textContent = data[0];

                            // Add the full-row-link class
                            a.classList.add('full-row-link');

                            // Append the anchor element to each cell in the row
                            for (var i = 0; i < row.cells.length; i++) {
                                row.cells[i].textContent = '';
                                row.cells[i].appendChild(a.cloneNode(true));
                            }
                        }
                    }
                });
                // if (key != 'bad') {
                //     // var rows = document.getElementById(`${key}-table`).querySelectorAll("tbody > tr");
                //     // console.log(rows);
                //     // for (var row of rows) {
                //     //     console.log(row)
                //     //     row.addEventListener("click", (e) => {
                //     //         console.log(e.target.innerText)
                //     //         record_id = e.target.innerText.split("<")[0];
                //     //         // var data = table.row(this).data();
                //     //         window.open('/record/' + record_id, "_self");
                //     //     });
                //     // }
                //     var tableElem = document.getElementById(`${key}-table`);

                //     tableElem.addEventListener("click", (e) => {
                //         var row = e.target.closest("tbody > tr");
                //         if (row) {
                //             record_id = e.target.innerText.split("<")[0];
                //             window.open('/record/' + record_id, "_self");
                //         }
                //     });
                // }
            }
            sessionStorage.setItem('autosave', JSON.stringify(response));
            location.hash = '#search_results';
            // var state = JSON.stringify(response);
            // history.pushState(state, "")
            // console.log(resElem);
            // document.getElementById("search-result-container").style.display = "block";
            document.getElementById("search-result-container").style.clipPath = 'inset(0% -10% -10% -10%)';
            //     try {
            //         badTable.destroy();
            //     } catch (error) {
            //         console.log(error);
            //     }
            //     // var data = response['bad'].map(e => [e]);
            //     var data = response['bad'];
            //     badTable = new DataTable("#bad-table", {
            //         columns: [
            //             {title: 'ID'}
            //         ],
            //         // columns: response['bad'].map((e)=> {return {title: 'ID', data: e}}),
            //         data: data
            //     });
            // }
            // if (response['CMC']){
            //     try {
            //         cmcTable.destroy();
            //     } catch (error) {
            //         console.log(error);
            //     }
            //     // var data = response['CMC'].map(e => [e]);
            //     var data = response['CMC'];
            //     cmcTable = new DataTable("#cmc-table", {
            //         columns: [
            //             {title: 'ID'}
            //         ],
            //         // columns: response['CMC'].map((e)=> {return {title: 'ID', data: e}}),
            //         data: data
            //     });
            // }
            // if (response['nCMC']){
            //     try {
            //         ncmcTable.destroy();
            //     } catch (error) {
            //         console.log(error);
            //     }
            //     // var data = response['nCMC'].map(e => [e]);
            //     var data = response['nCMC'];
            //     ncmcTable = new DataTable("#ncmc-table", {
            //         columns: [
            //             {title: 'ID'}
            //         ],
            //         // columns: response['nCMC'].map((e)=> {return {title: 'ID', data: e}}),
            //         data: data
            //     });
            // }
            // Update the UI with the received data
            // For example, you can display the data in a table
            // or update any other relevant elements on the page
        },
        error: function(xhr) {
            alert(xhr.responseText);
        }
    });
})

// $('#CMC-table tbody').on('click', 'tr', function () {
//     var data = table.row(this).data();
//     window.open('/record/' + data[0], '_blank');
// });

// function performSearch() {
//     var query = document.getElementById("search-input").value;
//     console.log(JSON.stringify({ query: query }))
//     $.ajax({
//         url: '/search',
//         type: 'POST', // Change the request type to POST
//         contentType: 'application/json',
//         dataType: 'json',
//         // data: {query: query}, // Send the query as data in the request
//         data: JSON.stringify({ query: query }), // Send the query as data in the request
//         success: function(response) {
//             console.log(response);
//             resElem.innerText = response;
//             // Update the UI with the received data
//             // For example, you can display the data in a table
//             // or update any other relevant elements on the page
//         },
//         error: function(xhr) {
//             alert(xhr.responseText);
//         }
//     });
//     // $.ajax({
//     //     url: '/search',
//     //     type: 'GET',
//     //     success: function(response) {
//     //         console.log(response);
//     //     },
//     //     error: function(xhr) {
//     //         alert(xhr.responseText);
//     //     }
//     // });
// }

// window.addEventListener("popstate", function(e) {
//     if (e.state) {
//         var state = e.state;
//         console.log(JSON.parse(state));
//         // Restore DataTable from state
//     }
// });
// window.addEventListener('popstate', function (event) {
//     // Your code to handle navigation (back/forward) here
//     console.log('Navigation event triggered');
// });
// window.addEventListener("beforeunload", function(event) {
//     sessionStorage.removeItem('autosave');
// });

console.log(navigationEntry.type);

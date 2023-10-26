var resElem = document.getElementById("search-result-container");
var sForm = document.getElementById("search-form");
// var badTable = null;
// var cmcTable = null;
// var ncmcTable = null;
var tables = {
    'nc': null,
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
    var clickEvent = new Event('click');
    document.getElementById('pills-search-tab').dispatchEvent(clickEvent);
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
            "searching": false,
            language: {
                // infoEmpty: "No records found"
                zeroRecords: `<div class="alert alert-warning d-flex align-items-center  alert-override alert-bad "
                role="alert">
                <i
                    class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                <div>
                    miRNA ID not found.
                </div>
            </div>`
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
            data: saved_response[key],
            createdRow: function(row, data, dataIndex) {
                // Create a new anchor element
                var a = document.createElement('a');
            
                // Set the href attribute to the desired URL
                a.href = '/record/' + data[0].split("<")[0]; // assuming data[0] is the record ID
                a.textContent = data[0];
            
                // Add the full-row-link class
                a.classList.add('full-row-link');
            
                // Create a new div element for the alert
                var div = document.createElement('div');
                div.className = 'alert alert-warning alert-override alert-bad ';
                div.role = 'alert';
                div.innerHTML = '<i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>ID not identified';
            
                // Append the anchor element or alert to each cell in the row
                for (var i = 0; i < row.cells.length; i++) {
                    row.cells[i].textContent = '';
                    if (key != 'nc') {
                        row.cells[i].appendChild(a.cloneNode(true));
                    } else if (!saved_response['bad'].some(sub => sub.includes(data[0]))) {
                        // row.cells[i].textContent = data[0];
                        row.cells[i].appendChild(a.cloneNode(true));
                    } else if (saved_response['bad'].some(sub => sub.includes(data[0]))) {
                         // Create a new div element for the wrapper
                        var wrapper = document.createElement('div');
                        wrapper.style.display = 'flex';
                        wrapper.style.alignItems = 'baseline';
                        wrapper.style.justifyContent = "space-between"

                        // Create a new text node for the data
                        var text = document.createTextNode(data[0]);

                        // Append the text and alert to the wrapper
                        wrapper.appendChild(text);
                        wrapper.appendChild(div.cloneNode(true));

                        // Set the cell's content to the wrapper
                        row.cells[i].textContent = '';
                        row.cells[i].appendChild(wrapper);
                        // row.cells[i].textContent = data[0];
                        // console.log(`${data[0]} was bad`)
                        // row.cells[i].appendChild(div.cloneNode(true));

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
                    "searching": false,
                    language: {
                        // infoEmpty: "No records found"
                        zeroRecords: `<div class="alert alert-warning d-flex align-items-center alert-override alert-bad "
                        role="alert">
                        <i
                            class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                        <div>
                            miRNA ID not found.
                        </div>
                    </div>`
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
                        // Create a new anchor element
                        var a = document.createElement('a');
                    
                        // Set the href attribute to the desired URL
                        a.href = '/record/' + data[0].split("<")[0]; // assuming data[0] is the record ID
                        a.textContent = data[0];
                    
                        // Add the full-row-link class
                        a.classList.add('full-row-link');
                    
                        // Create a new div element for the alert
                        var div = document.createElement('div');
                        div.className = 'alert alert-warning alert-override alert-bad ';
                        div.role = 'alert';
                        div.innerHTML = '<i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>ID not identified';
                    
                        // Append the anchor element or alert to each cell in the row
                        for (var i = 0; i < row.cells.length; i++) {
                            row.cells[i].textContent = '';
                            if (key != 'nc') {
                                row.cells[i].appendChild(a.cloneNode(true));
                            } else if (!response['bad'].some(sub => sub.includes(data[0]))) {
                                // row.cells[i].textContent = data[0];
                                row.cells[i].appendChild(a.cloneNode(true));
                            } else if (response['bad'].some(sub => sub.includes(data[0]))) {
                                 // Create a new div element for the wrapper
                                var wrapper = document.createElement('div');
                                wrapper.style.display = 'flex';
                                wrapper.style.alignItems = 'baseline';
                                wrapper.style.justifyContent = "space-between"

                                // Create a new text node for the data
                                var text = document.createTextNode(data[0]);

                                // Append the text and alert to the wrapper
                                wrapper.appendChild(text);
                                wrapper.appendChild(div.cloneNode(true));

                                // Set the cell's content to the wrapper
                                row.cells[i].textContent = '';
                                row.cells[i].appendChild(wrapper);
                                // row.cells[i].textContent = data[0];
                                // console.log(`${data[0]} was bad`)
                                // row.cells[i].appendChild(div.cloneNode(true));

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

// var alertElement = document.querySelector('#info-anim-content');

// // Initial state
// gsap.set(alertElement, {
//     clipPath: 'inset(0 0 100% 0)'
// });

// document.querySelector('.btn-icon').addEventListener('click', function(e) {
//     if (!e.target.classList.contains('collapsed')) {
//         // Collapsing up
//         gsap.to(alertElement, {
//             clipPath: 'inset(0 0 0% 0)',
//             duration: 0.5,
//             ease: "power2.inOut",
//         });
//     } else {
//         // Collapsing down
//         gsap.to(alertElement, {
//             clipPath: 'inset(0 0 200% 0)',
//             duration: 0.5,
//             ease: "power2.inOut",
//             onComplete() {
//                 console.log('whole tween done');
//                 gsap.to(this.targets(), { 
//                   background: 'red'
//                 })
//             },
//         });
//     }
// });

var animatedContent = document.querySelector('#info-anim-content');
var btnSearchInfo = document.querySelector('#btn-searchInfo');

// When the collapse animation starts
btnSearchInfo.addEventListener('show.bs.collapse', function () {
  // Add the background color
  animatedContent.style.backgroundColor = 'rgba(13, 110, 253, 0.3)';
});

// When the collapse animation ends
btnSearchInfo.addEventListener('hidden.bs.collapse', function () {
  // Remove the background color
  animatedContent.style.backgroundColor = 'transparent';
});

let versionDropdown = document.getElementById('version-dropdown');

// versionDropdown.addEventListener('show.bs.dropdown', function() {
//     this.querySelector('.animated-dropdown').style.display = 'block';
//     this.querySelector('.animated-dropdown').classList.add('slideIn');
// });

// versionDropdown.addEventListener('hide.bs.dropdown', function(e) {
//     // preventDefault();
//     // e.stopPropagation();
//     this.querySelector('.animated-dropdown').classList.add('slideOut');
// });

// versionDropdown.querySelector('.animated-dropdown').addEventListener('animationend', function() {
//     if(this.classList.contains('slideOut')) {
//         this.style.display = 'none';
//         this.classList.remove('slideOut');
//     } else {
//         this.classList.remove('slideIn');
//     }
// });
    

// versionDropdown.addEventListener('show.bs.dropdown', function() {
//     console.log(this);
//     console.log(this.querySelector('.animated-dropdown'));
//     gsap.to(this.querySelector('.animated-dropdown'), {duration: 0.5, clipPath: 'inset(0 0 0% 0)', display: 'block', ease: "power1.out"});
// });

// versionDropdown.addEventListener('hide.bs.dropdown', function(e) {
//     e.stopPropagation();
//     gsap.set(this, {
//         display: 'block'
//     })
//     gsap.to(this.querySelector('.animated-dropdown'), {
//             duration: 0.5, 
//             clipPath: 'inset(0 0 100% 0)', 
//             // onComplete: function() {
//             //     gsap.set(this.target, {
//             //     display: 'none'
//             //     })
//             // }, 
//             ease: "power1.in"
//     });
// });

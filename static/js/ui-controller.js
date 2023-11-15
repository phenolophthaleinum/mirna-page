/*!
 * Index page controller
 * Copyright 2023 Maciej Michalczyk
 *
*/

var resElem = document.getElementById("search-result-container");
var sForm = document.getElementById("search-form");
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

    // auto-navigate to search results tab
    var clickEvent = new Event('click');
    document.getElementById('pills-search-tab').dispatchEvent(clickEvent);

    //read autosave
    saved_response = JSON.parse(sessionStorage.getItem('autosave'));

    for(var [key, value] of Object.entries(tables)){
        // insert columns for tables
        var toWrap = document.getElementById(`${key}-wrapper`);
        var wrapperCol = document.createElement('div');
        wrapperCol.classList.add('col');
        toWrap.parentNode.insertBefore(wrapperCol, toWrap)
        wrapperCol.appendChild(toWrap);

        //display and create datatables
        document.getElementById(`${key}-header`).style.display = 'block';
        tables[key] = new DataTable(`#${key}-table`, {
            responsive: true,
            fixedHeader: true,
            "searching": false,
            language: {
                zeroRecords: " "
            },
            // maybe temporary remove of alert if nothing was found
            // language: {
            //     zeroRecords: 
            //     `<div class="alert alert-warning d-flex align-items-center  alert-override alert-bad "
            //     role="alert">
            //     <i
            //         class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
            //     <div>
            //         miRNA ID not found.
            //     </div>
            // </div>`
            // },
            columns: [
                {title: 'ID', data: 0},
            ],
            data: saved_response[key],
            createdRow: function(row, data, dataIndex) {
                // create links for row in datatable with ids
                var a = document.createElement('a');

                a.href = '/record/' + data[0].split("<")[0];
                a.textContent = data[0];
            
                a.classList.add('full-row-link');
            
                // alert div if no results
                var div = document.createElement('div');
                div.className = 'alert alert-warning alert-override alert-bad ';
                div.role = 'alert';
                div.innerHTML = '<i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>ID not identified';
            
                // populate with elements depending on col type or data type (link, plain id or alert) to each cell in the row (cell in row is the key here!)
                for (var i = 0; i < row.cells.length; i++) {
                    row.cells[i].textContent = '';
                    if (key != 'nc') {
                        // if Not Classified
                        row.cells[i].appendChild(a.cloneNode(true));
                    } else if (!saved_response['bad'].some(sub => sub.includes(data[0]))) {
                        // if Not Classified and data from it is NOT contained in the bad response
                        row.cells[i].textContent = data[0];
                    } else if (saved_response['bad'].some(sub => sub.includes(data[0]))) {
                        // if Not Classified and data from it IS contained in the bad response
                         
                        // wrapper for better formatting of alert with plain name of bad id/name/whatever is given
                        var wrapper = document.createElement('div');
                        wrapper.style.display = 'flex';
                        wrapper.style.alignItems = 'baseline';
                        wrapper.style.justifyContent = "space-between"

                        // text node for the data
                        var text = document.createTextNode(data[0]);

                        // append the text and alert to the wrapper
                        wrapper.appendChild(text);
                        wrapper.appendChild(div.cloneNode(true));

                        // set the cell's content to the wrapper
                        row.cells[i].textContent = '';
                        row.cells[i].appendChild(wrapper);
                    }
                }
            }
        });
    }
    // clip path reveal to show results
    document.getElementById("search-result-container").style.clipPath = 'inset(0% -10% -10% -10%)';
}
else {
    // if not coming back from using navigation back or coming back from record, then remove save
    sessionStorage.removeItem('autosave');
}

// request to fetch data
sForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    var query = document.getElementById("search-input").value;
    // console.log(JSON.stringify({ query: query }))
    $.ajax({
        url: '/search',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ query: query }),
        success: function(response) {
            // clip path set to hide results
            document.getElementById("search-result-container").style.clipPath = 'inset(0% -10% 100% -10%)';
            for(var [key, value] of Object.entries(tables)){
                // try clearing previous search resutls
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
                // insert columns for tables
                var toWrap = document.getElementById(`${key}-wrapper`);
                var wrapperCol = document.createElement('div');
                wrapperCol.classList.add('col');
                toWrap.parentNode.insertBefore(wrapperCol, toWrap)
                wrapperCol.appendChild(toWrap);

                //display and create datatables
                document.getElementById(`${key}-header`).style.display = 'block';
                tables[key] = new DataTable(`#${key}-table`, {
                    responsive: true,
                    fixedHeader: true,
                    "searching": false,
                    language: {
                        zeroRecords: " "
                    },
                    // maybe temporary remove of alert if nothing was found
                    // language: {
                    //     zeroRecords: `<div class="alert alert-warning d-flex align-items-center alert-override alert-bad "
                    //     role="alert">
                    //     <i
                    //         class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                    //     <div>
                    //         miRNA ID not found.
                    //     </div>
                    // </div>`
                    // },
                    columns: [
                        {title: 'ID', data: 0},
                    ],
                    data: response[key],
                    createdRow: function(row, data, dataIndex) {
                        // create links for row in datatable with ids
                        var a = document.createElement('a');
                    
                        a.href = '/record/' + data[0].split("<")[0];
                        a.textContent = data[0];
                    
                        a.classList.add('full-row-link');
                    
                        // alert div if no results
                        var div = document.createElement('div');
                        div.className = 'alert alert-warning alert-override alert-bad ';
                        div.role = 'alert';
                        div.innerHTML = '<i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>ID not identified';
                    
                        // populate with elements depending on col type or data type (link, plain id or alert) to each cell in the row (cell in row is the key here!)
                        for (var i = 0; i < row.cells.length; i++) {
                            row.cells[i].textContent = '';
                            if (key != 'nc') {
                                // if Not Classified
                                row.cells[i].appendChild(a.cloneNode(true));
                            } else if (!response['bad'].some(sub => sub.includes(data[0]))) {
                                // if Not Classified and data from it is NOT contained in the bad response
                                row.cells[i].textContent = data[0];;
                            } else if (response['bad'].some(sub => sub.includes(data[0]))) {
                                // if Not Classified and data from it IS contained in the bad response

                                // wrapper for better formatting of alert with plain name of bad id/name/whatever is given
                                var wrapper = document.createElement('div');
                                wrapper.style.display = 'flex';
                                wrapper.style.alignItems = 'baseline';
                                wrapper.style.justifyContent = "space-between"

                                // text node for the data
                                var text = document.createTextNode(data[0]);

                                // append the text and alert to the wrapper
                                wrapper.appendChild(text);
                                wrapper.appendChild(div.cloneNode(true));

                                // set the cell's content to the wrapper
                                row.cells[i].textContent = '';
                                row.cells[i].appendChild(wrapper);
                            }
                        }
                    }
                });
            }
            // make autosave
            sessionStorage.setItem('autosave', JSON.stringify(response));
            location.hash = '#search_results';
            // clip path reveal to show results
            document.getElementById("search-result-container").style.clipPath = 'inset(0% -10% -10% -10%)';
        },
        error: function(xhr) {
            alert(xhr.responseText);
        }
    });
})

// debug for navigation
// console.log(navigationEntry.type);

// info special-jumbotron events + animation
var animatedContent = document.querySelector('#info-anim-content');
var btnSearchInfo = document.querySelector('#btn-searchInfo');

// tmp removed collapsible events from btnSearchInfo
// btnSearchInfo.addEventListener('show.bs.collapse', function () {
//   animatedContent.style.backgroundColor = 'rgba(13, 110, 253, 0.3)';
// });

// btnSearchInfo.addEventListener('hidden.bs.collapse', function () {
//   animatedContent.style.backgroundColor = 'transparent';
// });

// does nothing i guess for now
let versionDropdown = document.getElementById('version-dropdown');


// search column result download handler
cmcDownloads = document.querySelectorAll('.download-icon-btn');
cmcDownloads.forEach(element => {
    element.addEventListener('click', (e)=>{
        e.preventDefault();
        let tableType = e.target.dataset.tableType;
        console.log(e.target);
        $.ajax({
            url: '/download_column',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: tables[tableType].columns().data()[0], filename: `search_${tableType}` }), // Send the query as data in the request
            success: function(response) {
                var blob = new Blob([response], {type: 'text/csv'});

                var url = window.URL.createObjectURL(blob);

                var a = document.createElement('a');
                a.href = url;
                a.download = `search_${tableType}`;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            error: function(xhr) {
                alert(xhr.responseText);
            }
        });
    });
});

// ajdusted validation of search form

(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
})()
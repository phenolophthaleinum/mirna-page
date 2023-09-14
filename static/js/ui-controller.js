var resElem = document.getElementById("ajax-res");
var sForm = document.getElementById("search-form");
// var badTable = null;
// var cmcTable = null;
// var ncmcTable = null;
var tables = {
    'bad': null,
    'CMC': null,
    'nCMC': null
}
// MIRAS; MIR21, MIR505, MIR1247, miR-101
sForm.addEventListener('submit', (e)=>{
    e.preventDefault();
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
            for(var [key, value] of Object.entries(tables)){
                try {
                    value.destroy();
                    tables[key] = null;
                    document.getElementById(`${key}-table`).innerHTML = "";
                    document.getElementById(`${key}-header`).style.display = 'none';
                } catch (error) {
                    console.log(error);
                }
            }
            for(var [key, value] of Object.entries(response)){
                document.getElementById(`${key}-header`).style.display = 'block';
                tables[key] = new DataTable(`#${key}-table`, {
                    responsive: true,
                    fixedHeader: true,
                    columns: [
                        {title: 'ID', data: 0},
                        // {data: null, defaultContent: "<button>Click!</button>"}
                    ],
                    // columns: response['bad'].map((e)=> {return {title: 'ID', data: e}}),
                    data: value
                });
                if (key != 'bad') {
                    var rows = document.getElementById(`${key}-table`).querySelectorAll("tbody > tr");
                    console.log(rows);
                    for (var row of rows) {
                        console.log(row)
                        row.addEventListener("click", (e) => {
                            console.log(e.target.innerText)
                            record_id = e.target.innerText.split("<")[0];
                            // var data = table.row(this).data();
                            window.open('/record/' + record_id, '_blank');
                        });
                    }
                }
            }
            // if (response['bad']){
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
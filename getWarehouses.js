let biz = document.querySelector("#ctl00_ContentPlaceHolder1_mainPanel > fieldset")
if (biz) {
    // create large input field right after biz
    let input = document.createElement("textarea");
    input.setAttribute("type", "text");
    input.setAttribute("id", "skus");
    input.setAttribute("placeholder", "put skus on new lines");
    biz.parentNode.insertBefore(input, biz.nextSibling);

    // create button for submitting skus
    let button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("id", "submit");
    button.innerHTML = "Submit";
    input.parentNode.insertBefore(button, input.nextSibling);

    // delay function
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // get skus from input when button is presses
    document.querySelector("#submit").addEventListener("click", async function() {
        // delete old warehouses element if it exists
        if (document.querySelector("#warehouses")) {
            document.querySelector("#warehouses").remove();
        }
        if (document.querySelector("#downloadButton")) {
            document.querySelector("#downloadButton").remove();
        }
        
        let skus = document.querySelector("#skus").value.split("\n");
        console.log(skus);
        // remove empty spaces from before skus
        skus = skus.map(sku => sku.trim());

        // get warehouse for each sku
        let warehouses = [];
        for (let i = 0; i < skus.length; i++) {
            let skuObject = {
                sku: skus[i]
            };
            document.querySelector("#ctl00_ContentPlaceHolder1_txtStyle").value = skus[i].split(" ")[0];
            document.querySelector("#ctl00_ContentPlaceHolder1_txtColor").value = skus[i].split(" ")[1];
            document.querySelector("#ctl00_ContentPlaceHolder1_btnSearchTemp").click();
            // wait a bit for the page to load
            await delay(1500);
            stock_selectors = ["#ctl00_ContentPlaceHolder1_ogList_ob_ogListBodyContainer_ctl02_ctl40_ctl00_lblink", "#ctl00_ContentPlaceHolder1_ogList_ob_ogListBodyContainer_ctl02_ctl62_ctl00_lblink"]
            try {
                
                let stock = document.querySelector(stock_selectors[0]);
                if (!stock) {
                    stock = document.querySelector(stock_selectors[1]);
                }
                stock.click();
                

                await delay(500);
                let iframe = document.querySelector("#PopupBox > div.drag-contentarea > iframe");
                let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                let warehouse = iframeDocument.querySelector("#ctl01_ogTabList_ob_ogTabListBodyContainer > div.ob_gBICont > table > tbody > tr > td.ob_gC.ob_gC_Fc").innerText;
                skuObject.warehouse = warehouse;
                skuObject.stock = stock.innerText;
                warehouses.push(skuObject);
                console.log(i, warehouses);
                document.querySelector("#PopupBox > div.drag-handle > div").click();
                await delay(200);
            } catch (e) {
                skuObject.warehouse = "not found";
                skuObject.stock = "not found";
                warehouses.push(skuObject);
                console.error("Could not find warehouse for sku", skus[i]);
            }
        }
        console.log(warehouses);
        // create a table with the skus, warehouses, and stock each on on a new line
        let table = document.createElement("table");
        table.setAttribute("id", "warehouses");
        let tableHead = document.createElement("thead");
        let tableHeadRow = document.createElement("tr");
        let tableHeadSku = document.createElement("th");
        tableHeadSku.innerHTML = "SKU";
        let tableHeadWarehouse = document.createElement("th");
        tableHeadWarehouse.innerHTML = "Warehouse";
        let tableHeadStock = document.createElement("th");
        tableHeadStock.innerHTML = "Stock";
        tableHeadRow.appendChild(tableHeadSku);
        tableHeadRow.appendChild(tableHeadWarehouse);
        tableHeadRow.appendChild(tableHeadStock);
        tableHead.appendChild(tableHeadRow);
        table.appendChild(tableHead);
        let tableBody = document.createElement("tbody");
        warehouses.forEach(warehouse => {
            let tableBodyRow = document.createElement("tr");
            let tableBodySku = document.createElement("td");
            tableBodySku.innerHTML = warehouse.sku;
            let tableBodyWarehouse = document.createElement("td");
            tableBodyWarehouse.innerHTML = warehouse.warehouse;
            let tableBodyStock = document.createElement("td");
            tableBodyStock.innerHTML = warehouse.stock;
            tableBodyRow.appendChild(tableBodySku);
            tableBodyRow.appendChild(tableBodyWarehouse);
            tableBodyRow.appendChild(tableBodyStock);
            tableBody.appendChild(tableBodyRow);
        });
        table.appendChild(tableBody);
        input.parentNode.insertBefore(table, input.nextSibling);

        // create download button
        let downloadButton = document.createElement("button");
        downloadButton.setAttribute("id", "downloadButton");
        downloadButton.innerHTML = "Download CSV";
        // insert download button next to submit button
        button.parentNode.insertBefore(downloadButton, button.nextSibling);


        function downloadCSV() {
            let csv = [];
            let rows = document.querySelectorAll("#warehouses tr");
        
            for (let i = 0; i < rows.length; i++) {
                let row = [], cols = rows[i].querySelectorAll("td, th");
        
                for (let j = 0; j < cols.length; j++) 
                    row.push(cols[j].innerText);
        
                csv.push(row.join(","));        
            }
        
            // Create CSV file and download
            let csvFile = new Blob([csv.join("\n")], {type: "text/csv"});
            let downloadLink = document.createElement("a");
            let url = URL.createObjectURL(csvFile);
            downloadLink.href = url;
            downloadLink.download = 'data.csv';
        
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
        document.getElementById("downloadButton").addEventListener("click", downloadCSV);
    });
} else {
    console.error("The element 'biz' could not be found");
}

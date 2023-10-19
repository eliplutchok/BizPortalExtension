let biz = document.querySelector("#ctl00_ContentPlaceHolder1_mainPanel > fieldset");
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
        // delete old costs element if it exists
        if (document.querySelector("#costs")) {
            document.querySelector("#costs").remove();
        }
        let skus = document.querySelector("#skus").value.split("\n");
        // remove empty spaces from before skus
        skus = skus.map(sku => sku.trim());

        // get costs for each sku
        let costs = [];
        for (let i = 0; i < skus.length; i++) {
            document.querySelector("#ctl00_ContentPlaceHolder1_txtStyle").value = skus[i].split(" ")[0];
            document.querySelector("#ctl00_ContentPlaceHolder1_txtColor").value = skus[i].split(" ")[1];
            document.querySelector("#ctl00_ContentPlaceHolder1_btnSearchTemp").click();
            // wait a bit for the page to load
            await delay(1500);
            try {
                let cost = document.querySelector("#ctl00_ContentPlaceHolder1_ogList_ob_ogListBodyContainer > div > table > tbody > tr > td:nth-child(17) > div > div").innerHTML;
                costs.push(cost);
                console.log(i, costs);
            } catch (e) {
                costs.push("not found");
                console.error("Could not find cost for sku", skus[i]);
            }
        }
        console.log(costs);
        // create a textarea with the costs each on on a new line
        let textarea = document.createElement("textarea");
        textarea.setAttribute("id", "costs");
        textarea.setAttribute("placeholder", "costs");
        textarea.innerHTML = costs.join("\n");
        input.parentNode.insertBefore(textarea, input.nextSibling);
    });
} else {
    console.error("The element 'biz' could not be found");
}

// ==UserScript==
// @name         Torn ItemMarket AutoPricer
// @namespace    http://tampermonkey.net/
// @version      2024-01-29
// @description  Automatically sets the price for item market listings
// @author       Thunderr
// @match        https://www.torn.com/imarket.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Credits go to PityYouWeak for majority of the code, I only adjusted it a bit to cater to my needs


    // SETTINGS
    const ApiKey = ""; // Put your public API key here
    const avgCount = 3; // How many items to calculate in the average price, set to 1 to always use cheapest price
    const underCutAmount = 0; // How much to undercut, set to 0 to NOT undercut

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!node.classList) continue;
                if (node.classList.contains("clearfix")) continue;

                const input = node.querySelector('li .actions-main-wrap .input-money-group .input-money[type=text]')
                if (!input) continue;
                const itemID = input.parentElement?.parentElement.parentElement.parentElement.parentElement.querySelector('img').src.split('items/')[1].replace("/large.png", "");
                if (!itemID) continue

                input.addEventListener('focus', async function(e) {
                    var data = await fetch(`https://api.torn.com/market/${itemID}?selections=itemmarket&key=${ApiKey}`);
                    var json = await data.json();

                    let total = 0;
                    let count = 0;
                    for (let i = 0; i < Math.min(json.itemmarket.length, avgCount); i++) {
                        total += json.itemmarket[i].cost;
                        count++;
                    }

                    if (count < avgCount) {
                        alert(`Too few in sale (${json.itemmarket.length})`);
                        return;
                    }

                    const price = Math.floor(total/count) - underCutAmount

                    let itemAmount = this.parentElement?.parentElement.parentElement.parentElement.parentElement.querySelector(".item-amount")?.textContent;
                    let amount = this.parentElement.parentElement.parentElement.querySelector('.clear-all');
                    sendInputEvent(this,price);
                    if (amount !== null && itemAmount !== '') {
                        sendInputEvent(amount,itemAmount);
                    }
                    this.blur();
                },{once: true})
            }
        }
    })


    const wrapper = document.querySelector('#mainContainer')
    observer.observe(wrapper, { subtree: true, childList: true })


    function sendInputEvent(inp,price)
    {
        const input = inp;
        input.value = price;
        let event = new Event('input', { bubbles: true });
        event.simulated = true;
        let tracker = input._valueTracker;
        if (tracker) {
            tracker.setValue(1);
        }
        input.dispatchEvent(event);
    }

})();



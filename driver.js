const escpos = require('escpos');
const request = require('request');

const debugDevice = new escpos.Console();
const printerOptions = { encoding: "GB18030" /* default */ }
const printer = new escpos.Printer(debugDevice, printerOptions);

(function loop() {
  setTimeout(function () {
    var dt = new Date();
    var date = dt.getFullYear() + '-' +
    ("0" + (dt.getMonth()+1)).slice(-2) + '-' +
    ("0" + dt.getDate()).slice(-2) + 'T' +
    ("0" + dt.getHours()).slice(-2) + ':' +
    ("0" + dt.getMinutes()).slice(-2) + ':' +
    ("0" + (dt.getSeconds()-3)).slice(-2) +'-06:00';
    //console.log(date);
    const options = {
      url: 'https://connect.squareup.com/v1/YWX343F40AM19/payments?begin_time=' + date,
      headers: {
        'Authorization': 'Bearer sq0atp-ZZt4RfHILmH2Bx3jqHXR5g'
      }
    };

    request(options, function (error, response, body) {
      var obj = JSON.parse(body);
      if (obj.length !== 0) {
        for (var orderIndex=0; orderIndex<obj.length; orderIndex++){
          //console.log("Order " + orderIndex);
          var orderObj = obj[orderIndex];
          for(var itemIndex = 0; itemIndex < orderObj.itemizations.length; itemIndex++) {
            //console.log("Item " + itemIndex);
            var itemObj = orderObj.itemizations[itemIndex];

            var modifiers = "";
            for(var modifierIndex = 0; modifierIndex < itemObj.modifiers.length; modifierIndex++) {
              var modifier = itemObj.modifiers[modifierIndex];
              modifiers = modifiers + "  - " + modifier.name + "\n";
            }

            for(var numOfDrinks = 0; numOfDrinks < parseInt(itemObj.quantity); numOfDrinks++){
              var labelObj = {
                title: itemObj.name,
                modifiers: modifiers,
                size: itemObj.item_variation_name
              };
              printLabel(labelObj);
            }
          }
        }
      }
    });

    function printLabel(obj) {
      console.log("\n--------------------\n")
      console.log(obj.size + " " + obj.title);
      console.log(obj.modifiers)

      console.log("--------------------\n")
      // debugDevice.open(function() {
      //   printer
      //   .text(obj.title)
      //   .cut()
      //   .close();
      // });
    }

    loop()
  }, 2000);
}());

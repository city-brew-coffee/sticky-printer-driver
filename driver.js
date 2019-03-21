const request = require('request');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

var db = admin.firestore();

(function loop() {
  setTimeout(function () {
    var currentDt = new Date();
    var dt = new Date(currentDt.getTime() - 2000)
    var date = dt.getFullYear() + '-' +
    ("0" + (dt.getMonth()+1)).slice(-2) + '-' +
    ("0" + dt.getDate()).slice(-2) + 'T' +
    ("0" + dt.getHours()).slice(-2) + ':' +
    ("0" + dt.getMinutes()).slice(-2) + ':' +
    ("0" + (dt.getSeconds())).slice(-2) +'-06:00';
    console.log(date);
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

            var modifiers = itemObj.modifiers.map((item) => item.name);

            for(var numOfDrinks = 0; numOfDrinks < parseInt(itemObj.quantity); numOfDrinks++){
              var labelObj = {
                title: itemObj.name,
                modifiers: modifiers,
                size: itemObj.item_variation_name
              };
              db.collection('items').doc('items').collection('YWX343F40AM19').add(labelObj).then((ref) => {
                console.log('Added document with ID: ', ref.id);
              }).catch((err) => {
                console.error(err);
              });
            }
          }
        }
      }
    });

    loop()
  }, 2000);
}());

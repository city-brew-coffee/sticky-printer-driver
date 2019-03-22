const request = require('request');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

var db = admin.firestore();

var locationId = process.argv[2];

if (locationId === undefined) {
  console.error('You need to enter a locationId');
  process.exit(1);
}

var lastDate;

(function loop() {
  setTimeout(function () {
    if(lastDate === undefined) {
      var currentDt = new Date();
      var dt = new Date(currentDt.getTime() - 3000)
      lastDate = dt.toISOString();
    }

    console.log(lastDate, new Date().toISOString());
    const options = {
      url: 'https://connect.squareup.com/v1/'+ locationId + '/payments?begin_time=' + lastDate,
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
                size: itemObj.item_variation_name,
                time: orderObj.created_at,
                bumped: false
              };
              db.collection('items').doc('items').collection('YWX343F40AM19').add(labelObj).then((ref) => {
                console.log('Added document with ID: ', ref.id);
              }).catch((err) => {
                console.error(err);
              });
              console.log(labelObj.title);
            }
          }
        }
      }
    });

    lastDate = new Date((new Date()).getTime() - 1000).toISOString();

    loop()
  }, 2000);
}());

let model
let predictions
let results
runserver()

async function getstuff()
{

model = await tf.loadLayersModel("http://localhost:8000/model.json");
predictme()


}

function runserver() {
  var static = require('node-static');

  var file = new static.Server(`${__dirname}/public`)
console.log (file)
  require('http').createServer(function (request, response) {
      var url = require('url');
      // response.setHeader ('Access-Control-Allow-Headers', request.header.origin)
      // request.addListener('end', function () {
      var name = url.parse(request.url, true).query['name'];
      // urlimg(name)
      file.serve(request, response)
      // }).resume()
  }).listen(8000)
  console.log("server running")

  // rundat(app.getPath("userData"))
  // mainWindow.loadURL(`${__dirname}/testform.html`)
  // mainWindow.openDevTools()
}

function preprocessImage(image, modelName) {

  // resize the input image to mobilenet's target size of (224, 224)
  let tensor = tf.browser.fromPixels(image)
    .resizeNearestNeighbor([224, 224])
    .toFloat();

  // if model is not available, send the tensor with expanded dimensions
  if (modelName === undefined) {
    return tensor.expandDims();
  } 

  // if model is mobilenet, feature scale tensor image to range [-1, 1]
  else if (modelName === "mobilenet") {
    let offset = tf.scalar(127.5);
    return tensor.sub(offset)
      .div(offset)
      .expandDims();
  } 

  // else throw an error
  else {
    alert("Unknown model name..")
  }
}


async function predictme(){
if (model == undefined) {
  alert("Please load the model first..")
}

// html-image element can be given to tf.fromPixels
let image  = document.getElementById("imageCanvas");
let tensor = preprocessImage(image, "mobilenet");

// make predictions on the preprocessed image tensor
predictions = await model.predict(tensor).data();

// get the model's prediction results
results = Array.from(predictions)
  .map(function (p, i) {
    return {
      probability: p,
      className: IMAGENET_CLASSES[i]
    };
  }).sort(function (a, b) {
    return b.probability - a.probability;
  }).slice(0, 5);

// display the top-1 prediction of the model
document.getElementById("prediction").innerHTML = "MobileNet prediction - <b>" + results[0].className + "</b>";
console.log (predictions)
// display top-5 predictions of the model
var ul = document.getElementById("predict-list");
ul.innerHTML = "";
results.forEach(function (p) {
  console.log(p.className + " " + p.probability.toFixed(6));
  var li = document.createElement("LI");
  li.innerHTML = p.className + " " + p.probability.toFixed(6);
  ul.appendChild(li);
});
}

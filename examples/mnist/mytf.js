<html>
    <img src="3520.jpg" id="cat"></img>
    <button onclick="getstuff()">get stuff</button>
</html>

<script>
const tf = require("@tensorflow/tfjs");

const MODEL_URL = './model.json';

// For Keras use tf.loadLayersModel().
const myf= async function (){
const model = await tf.loadLayersModel(MODEL_URL);
}

const cat = document.getElementById('cat');
model.predict(tf.browser.fromPixels(cat));
</script>
let body = document.querySelector("body");
function getValue() {
  const input = document.querySelector("#myanswer");
  const inputValue = input.value;
  console.log(inputValue);
  checkGrade(inputValue);
  input.value = "";
}

function checkGrade(score) {
  let answerBox = document.querySelector("#answer");
  answerBox.textContent = "";
  if (score > 30) {
    answerBox.textContent = "It's boiling, really hot!!!";
    body.style.backgroundColor = "crimson";
  } else if (score > 20 && score <= 30) {
    answerBox.textContent = "It feels warm and sunny!!!";
    body.style.backgroundColor = "orange";
  } else if (score > 10 && score <= 20) {
    answerBox.textContent = "It feels cool and breezy!!!";
    body.style.backgroundColor = "lightblue";
  } else {
    answerBox.textContent = "I am shivering!!!";
    body.style.backgroundColor = "gray";
  }
}
function getWeatherCategory(score) {
  if (score > 30) return 4;
  if (score > 20) return 3; // Score is between 21 and 30
  if (score > 10) return 2; // Score is between 11 and 20
  return 1; // Score is 10 or below
}

function checkWeather(score) {
  const category = getWeatherCategory(score);
  switch (category) {
    case 4:
      answerBox.textContent = "It's boiling, really hot!!!";
      body.style.backgroundColor = "crimson";
      break;
    case 3:
      answerBox.textContent = "You feels warm and sunny!!!";
      body.style.backgroundColor = "orange";
      break;
    case 2:
      answerBox.textContent = "You feels cool and breezy!!!";
      body.style.backgroundColor = "lightblue";
      break;
    case 1:
      answerBox.textContent = "I am shivering!!!";
      body.style.backgroundColor = "gray";
      break;
    default:
      answerBox.textContent = "Weather condition unknown.";
      body.style.backgroundColor = "white";
  }
}

// Usage: call `checkWeather(score);` where `score` is the temperature value.
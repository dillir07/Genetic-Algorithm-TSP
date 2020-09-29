var canvasMapElement = document.querySelector("canvas");
var citiesLimitElement = document.getElementById("rangeCities");
var initialPopulationLimitElement = document.getElementById("rangeInitialPopulationSize");
var generationsLimitElement = document.getElementById("rangeGenerationsAllowed");
var offspringsLimitElement = document.getElementById("rangeOffspringsAllowed");
var crossoverLimitElement = document.getElementById("rangeCrossOverPoint");
var evolveButtonElement = document.getElementById("btnEvolve");
var tbdLogTableElement = document.getElementById("tbdLog");
var citiesValueElement = document.getElementById("lblCitiesValue");
var initialPopulationValueElement = document.getElementById("lblInitialPopulationSizeValue");
var generationsValueElement = document.getElementById("lblGenerationsAllowedValue");
var offspringsValueElement = document.getElementById("lblOffspringsAllowedValue");
var crossoverValueElement = document.getElementById("lblCrossOverPointValue");
var bestTravelDistaceElement = document.getElementById("lblBestTravelDistance");
var worstTravelDistanceElement = document.getElementById("lblWorstTravelDistance");
var showBestTravelDistanceCheckBoxElement = document.getElementById("checkboxShowBestTravelDistance");
var showWorstTravelDistanceCheckBoxElement = document.getElementById("checkboxShowWorstTravelDistance");
var summaryHeaderElement = document.getElementById("summaryHeader");
var optionsDetailsElement = document.getElementById("options");
var logs = [];
var resetChromosome = false;
var resetCities = false;
var bodyClickListener;
var getRandomNumberInRange = function (min, max) { return Math.floor((Math.random() * max) + min); };
var numberOfCities = 5;
var numberOfChromosomesCreated = 5; // counter
var cities = [];
var chromosomes = [];
var initialPopulationSize = 5;
var numberOfGenerationsAllowed = 5;
var numberOfOffspringsAllowed = 5;
var randomPointForCrossOver = Math.floor(numberOfCities / 2);
function updateCanvasMapSize() {
    canvasMapElement.width = window.innerWidth - 5;
    canvasMapElement.height = (window.innerHeight - 30);
}
function modifyNumberOfCities() {
    var value = citiesLimitElement.valueAsNumber;
    crossoverLimitElement.max = (value - 1).toString();
    citiesValueElement.innerText = value.toString();
    numberOfCities = value;
    resetCities = true;
    resetChromosome = true;
}
function modifyInitialPopulationSize() {
    var value = initialPopulationLimitElement.valueAsNumber;
    initialPopulationValueElement.innerText = value.toString();
    initialPopulationSize = value;
    resetChromosome = true;
}
function modifyGenerationSize() {
    var value = generationsLimitElement.valueAsNumber;
    generationsValueElement.innerText = value.toString();
    numberOfGenerationsAllowed = value;
    resetChromosome = true;
}
function modifyOffspringSize() {
    var value = offspringsLimitElement.valueAsNumber;
    offspringsValueElement.innerText = value.toString();
    numberOfOffspringsAllowed = value;
    resetChromosome = true;
}
function modifyCrossOverValue() {
    var value = crossoverLimitElement.valueAsNumber;
    crossoverValueElement.innerText = value.toString();
    randomPointForCrossOver = value;
    resetChromosome = true;
}
window.addEventListener("resize", updateCanvasMapSize);
citiesLimitElement.addEventListener("change", modifyNumberOfCities);
initialPopulationLimitElement.addEventListener("change", modifyInitialPopulationSize);
generationsLimitElement.addEventListener("change", modifyGenerationSize);
offspringsLimitElement.addEventListener("change", modifyOffspringSize);
crossoverLimitElement.addEventListener("change", modifyCrossOverValue);
evolveButtonElement.addEventListener("click", evolve);
showBestTravelDistanceCheckBoxElement.addEventListener('change', updateUI);
showWorstTravelDistanceCheckBoxElement.addEventListener('change', updateUI);
updateCanvasMapSize();
var Chromosome = /** @class */ (function () {
    function Chromosome(id, route, travelDistance, rgbColor) {
        this.id = id;
        this.route = route;
        this.travelDistance = travelDistance;
        this.rgbColor = rgbColor;
    }
    return Chromosome;
}());
var City = /** @class */ (function () {
    function City(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
    return City;
}());
var Log = /** @class */ (function () {
    function Log(serialNumber, generationCount, chromosomeCount, bestTravelScore, worstTravelScore, bestTravelRoute, worstTravelRoute, timeStamp) {
        this.serialNumber = serialNumber;
        this.generationCount = generationCount;
        this.chromosomeCount = chromosomeCount;
        this.bestTravelScore = bestTravelScore;
        this.worstTravelScore = worstTravelScore;
        this.bestTravelRoute = bestTravelRoute;
        this.worstTravelRoute = worstTravelRoute;
        this.timeStamp = timeStamp;
    }
    return Log;
}());
function updateUI() {
    showBestTravelDistanceCheckBoxElement.hidden = false;
    showWorstTravelDistanceCheckBoxElement.hidden = false;
    pencil.beginPath();
    pencil.clearRect(0, 0, canvasMapElement.width, canvasMapElement.height);
    pencil.fillStyle = "#181a1b";
    pencil.fillRect(0, 0, canvasMapElement.width, canvasMapElement.height);
    pencil.closePath();
    drawCities(cities);
    if (showBestTravelDistanceCheckBoxElement.checked) {
        drawRoute(chromosomes[0].route, "#2196f3", 3);
    }
    if (showWorstTravelDistanceCheckBoxElement.checked) {
        drawRoute(chromosomes[chromosomes.length - 1].route, "red", 1);
    }
    bestTravelDistaceElement.innerText = "Best travel Distance:" + chromosomes[0].travelDistance;
    worstTravelDistanceElement.innerText = "Bad  travel Distance:" + chromosomes[chromosomes.length - 1].travelDistance;
}
function evolve() {
    if (cities.length == 0 || resetCities) {
        cities = generateCities(numberOfCities);
        resetCities = false;
    }
    if (chromosomes.length == 0 || resetChromosome) {
        generateInitialPopulation(initialPopulationSize);
        sortPopulationByFitness(chromosomes);
        resetChromosome = false;
    }
    for (var generation = 0; generation < numberOfGenerationsAllowed; generation++) {
        for (var counter = 0; counter < numberOfOffspringsAllowed; counter++) {
            var parentOneId = getRandomNumberInRange(0, chromosomes.length);
            var parentTwoId = getRandomNumberInRange(0, chromosomes.length);
            var offSpring = crossOver(chromosomes[parentOneId].route, chromosomes[parentTwoId].route);
            offSpring = mutateChromosome(offSpring);
            var strokeColor = "rgb(" + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + ")";
            chromosomes.push(new Chromosome(numberOfChromosomesCreated, offSpring, calculateTravelDistance(offSpring), strokeColor));
        }
        sortPopulationByFitness(chromosomes);
        logs.push(new Log(logs.length + 1, generation + 1, chromosomes.length * (generation + 1), chromosomes[0].travelDistance, chromosomes[chromosomes.length - 1].travelDistance, chromosomes[0].route, chromosomes[chromosomes.length - 1].route, new Date().getMilliseconds().toString()));
        chromosomes = chromosomes.slice(0, numberOfOffspringsAllowed);
    }
    updateLog();
    updateUI();
    // cities = []; to reset everytime...
}
function generateInitialPopulation(size) {
    chromosomes = [];
    for (var counter = 0; counter < size; counter++) {
        var chromosome = generateChromosome(numberOfCities);
        var strokeColor = "rgb(" + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + ")";
        chromosomes.push(new Chromosome(numberOfChromosomesCreated, chromosome, calculateTravelDistance(chromosome), strokeColor));
        // drawRoute(chromosome, strokeColor, 1);
    }
}
/**
 * Generates given number of city objects and returns a list.
 * @param {Number} numberOfCities - a positive Integer specifying number of cities.
 * @returns {Array} cities - array of cities
 */
function generateCities(numberOfCities) {
    var cities = [];
    var maxWidth = canvasMapElement.width;
    var maxHeight = canvasMapElement.height;
    for (var counter = 0; counter < numberOfCities; counter++) {
        var city = new City(counter, getRandomNumberInRange(0, maxWidth), getRandomNumberInRange(0, maxHeight));
        cities.push(city);
    }
    return cities;
}
var pencil = canvasMapElement.getContext("2d");
function drawCities(listOfCities) {
    listOfCities.forEach(function (city) {
        pencil.beginPath();
        pencil.strokeStyle = "yellow";
        pencil.lineWidth = 3;
        pencil.arc(city.x, city.y, 10, 0, 2 * Math.PI);
        pencil.fillStyle = "lightblue";
        pencil.fillText(city.id.toString(), city.x, city.y);
        pencil.stroke();
        pencil.closePath();
    });
}
function generateChromosome(numberOfCities) {
    var chromosome = [];
    var switchPosition = 0;
    var temp;
    for (var counter = 0; counter < numberOfCities; counter++) {
        chromosome.push(counter);
    }
    for (var counter = 0; counter < numberOfCities; counter++) {
        switchPosition = getRandomNumberInRange(0, numberOfCities);
        temp = chromosome[counter];
        chromosome[counter] = chromosome[switchPosition];
        chromosome[switchPosition] = temp;
    }
    numberOfChromosomesCreated++;
    return chromosome;
}
function drawRoute(chromosome, strokeColor, lineWidth) {
    pencil.beginPath();
    pencil.moveTo(cities[0].x, cities[0].y);
    pencil.lineWidth = lineWidth;
    chromosome.forEach(function (cityId) { return pencil.lineTo(cities[cityId].x, cities[cityId].y); });
    pencil.strokeStyle = strokeColor;
    pencil.stroke();
    pencil.closePath();
}
function getDistanceBetweenTwoCities(city1, city2) {
    return Math.sqrt(Math.pow((city2.x - city1.x), 2) + Math.pow((city2.y - city1.y), 2));
}
/**
 * Returns the distance between two cities (two points in a 2D plane)
 * ref: https://www.mathsisfun.com/algebra/distance-2-points.html (it really is)
 * @param {number} city1Id - a positive integer denoting a valid city id
 * @param {number} city2Id - a positive integer denoting a valid city id
 */
function getDistanceBetweenTwoCitiesByIds(city1Id, city2Id) {
    var city1 = cities[city1Id];
    var city2 = cities[city2Id];
    return Math.sqrt(Math.pow((city2.x - city1.x), 2) + Math.pow((city2.y - city1.y), 2));
}
function calculateTravelDistance(chromosome) {
    var travelDistance = 0.0; //yes float here
    for (var cityId = 0; cityId < chromosome.length - 1; cityId++) {
        var cityId1 = chromosome[cityId];
        var cityId2 = chromosome[cityId + 1];
        travelDistance += getDistanceBetweenTwoCitiesByIds(cityId1, cityId2);
    }
    // console.log(`chromesome ${chromosome}'s travel distance: ${travelDistance}`);
    return travelDistance;
}
function crossOver(parentOneChromosome, parentTwoChromosome) {
    var offSpring = [];
    var parentOneChromosomePart = [];
    parentOneChromosomePart = parentOneChromosome.slice(0, randomPointForCrossOver);
    offSpring = parentTwoChromosome.slice();
    parentOneChromosomePart.forEach(function (parentGene) {
        offSpring.splice(offSpring.indexOf(parentGene), 1);
    });
    return offSpring.concat(parentOneChromosomePart);
}
function mutateChromosome(chromosome) {
    var mutatedChromosome = chromosome.slice();
    var temp = 0;
    var switchPosition1 = 0;
    var switchPosition2 = 0;
    switchPosition1 = getRandomNumberInRange(0, mutatedChromosome.length);
    switchPosition2 = getRandomNumberInRange(0, mutatedChromosome.length);
    temp = mutatedChromosome[switchPosition1];
    mutatedChromosome[switchPosition1] = mutatedChromosome[switchPosition2];
    mutatedChromosome[switchPosition2] = temp;
    return mutatedChromosome;
}
function sortPopulationByFitness(chromosomes) {
    chromosomes.sort(function (cA, cB) { return cA.travelDistance - cB.travelDistance; });
}
function updateLog() {
    logs.reverse();
    var logHtml = "\n    <tr>\n        <th>Timestamp</th>\n        <th>Serial Number</th>\n        <th>Generation</th>\n        <th>Chromosomes Created</th>\n        <th>Best Travel Score</th>\n        <th>Worst Travel Score</th>\n        <th>Best Travel Route</th>\n        <th>Worst Travel Route</th>\n    </tr>\n    ";
    for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
        var log = logs_1[_i];
        logHtml +=
            "\n            <tr>\n                <td>" + log.timeStamp + "</td>\n                <td>" + log.serialNumber + "</td>\n                <td>" + log.generationCount + "</td>\n                <td>" + log.chromosomeCount + "</td>\n                <td class=\"bestScore\">" + log.bestTravelScore + "</td>\n                <td class=\"worstScore\">" + log.worstTravelScore + "</td>\n                <td class=\"bestScore\">" + log.bestTravelRoute + "</td>\n                <td class=\"worstScore\">" + log.worstTravelRoute + "</td>\n            </tr>\n            ";
    }
    tbdLogTableElement.innerHTML = logHtml;
    summaryHeaderElement.innerText = "Click Here & Scroll to see Complete Log: " + logs.length + " Items";
}
function init() {
    citiesLimitElement.value = numberOfCities.toString();
    initialPopulationLimitElement.value = initialPopulationSize.toString();
    generationsLimitElement.value = numberOfGenerationsAllowed.toString();
    offspringsLimitElement.value = numberOfOffspringsAllowed.toString();
    crossoverLimitElement.value = randomPointForCrossOver.toString();
    citiesValueElement.innerText = numberOfCities.toString();
    initialPopulationValueElement.innerText = initialPopulationSize.toString();
    generationsValueElement.innerText = numberOfGenerationsAllowed.toString();
    offspringsValueElement.innerText = numberOfOffspringsAllowed.toString();
    crossoverValueElement.innerText = randomPointForCrossOver.toString();
    showBestTravelDistanceCheckBoxElement.hidden = true;
    showWorstTravelDistanceCheckBoxElement.hidden = true;
    optionsDetailsElement.open = true;
}
init();

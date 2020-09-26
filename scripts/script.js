var numberOfCities = 5;
var map = document.querySelector("canvas");
var getRandomNumberInRange = function (min, max) { return Math.floor((Math.random() * max) + min); };
var numberOfChromosomesCreated = 0;
var cities;
var chromosomes = [];
var initialPopulationSize = 10;
var numberOfGenerationsAllowed = 10;
var numberOfOffsprintsAllowed = 5;
var randomPointForCrossOver = Math.floor(numberOfCities / 2);
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
function startUp() {
    console.log("startup");
    drawCities(cities);
    generateInitialPopulation(initialPopulationSize);
    evaluatePopulation(chromosomes);
    for (var counter = 0; counter < numberOfOffsprintsAllowed; counter++) {
        var parentOneId = getRandomNumberInRange(0, chromosomes.length);
        var parentTwoId = getRandomNumberInRange(0, chromosomes.length);
        var offSpring = crossOver(chromosomes[parentOneId].route, chromosomes[parentTwoId].route);
        offSpring = mutateChromosome(offSpring);
        var strokeColor = "rgb(" + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + ")";
        chromosomes.push(new Chromosome(numberOfChromosomesCreated, offSpring, calculateTravelDistance(offSpring), strokeColor));
        drawRoute(offSpring, strokeColor);
    }
    evaluatePopulation(chromosomes);
}
function generateInitialPopulation(size) {
    for (var counter = 0; counter < size; counter++) {
        var chromosome = generateChromosome(numberOfCities);
        var strokeColor = "rgb(" + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + "," + getRandomNumberInRange(0, 255) + ")";
        chromosomes.push(new Chromosome(numberOfChromosomesCreated, chromosome, calculateTravelDistance(chromosome), strokeColor));
        drawRoute(chromosome, strokeColor);
    }
}
/**
 * Generates given number of city objects and returns a list.
 * @param {Number} numberOfCities - a positive Integer specifying number of cities.
 * @returns {Array} cities - array of cities
 */
function generateCities(numberOfCities) {
    var cities = [];
    var maxWidth = map.width;
    var maxHeight = map.height;
    for (var counter = 0; counter < numberOfCities; counter++) {
        var city = new City(counter, getRandomNumberInRange(0, maxWidth), getRandomNumberInRange(0, maxHeight));
        cities.push(city);
    }
    return cities;
}
cities = generateCities(numberOfCities);
var pencil = map.getContext("2d");
function drawCities(listOfCities) {
    console.log("drawCities" + "is called");
    pencil.beginPath();
    listOfCities.forEach(function (city) { return pencil.fillRect(city.x, city.y, 5, 5 / 2); });
    pencil.stroke();
    pencil.closePath();
    return null; // typescript complains
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
    console.log('created chromosome #' + numberOfChromosomesCreated + ": " + chromosome);
    return chromosome;
}
function drawRoute(chromosome, strokeColor) {
    pencil.beginPath();
    pencil.moveTo(cities[0].x, cities[0].y);
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
    console.log("chromesome " + chromosome + "'s travel distance: " + travelDistance);
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
function evaluatePopulation(chromosomes) {
    chromosomes.sort(function (cA, cB) { return cA.travelDistance - cB.travelDistance; });
}
document.body.addEventListener("click", startUp);

const canvasMapElement = document.querySelector("canvas");
const citiesLimitElement = <HTMLInputElement>document.getElementById("rangeCities");
const initialPopulationLimitElement = <HTMLInputElement>document.getElementById("rangeInitialPopulationSize");
const generationsLimitElement = <HTMLInputElement>document.getElementById("rangeGenerationsAllowed");
const offspringsLimitElement = <HTMLInputElement>document.getElementById("rangeOffspringsAllowed");
const crossoverLimitElement = <HTMLInputElement>document.getElementById("rangeCrossOverPoint");
const evolveButtonElement = <HTMLInputElement>document.getElementById("btnEvolve");

const tbdLogTableElement = <HTMLTableElement>document.getElementById("tbdLog");


const citiesValueElement = <HTMLInputElement>document.getElementById("lblCitiesValue");
const initialPopulationValueElement = <HTMLLabelElement>document.getElementById("lblInitialPopulationSizeValue");
const generationsValueElement = <HTMLLabelElement>document.getElementById("lblGenerationsAllowedValue");
const offspringsValueElement = <HTMLLabelElement>document.getElementById("lblOffspringsAllowedValue");
const crossoverValueElement = <HTMLLabelElement>document.getElementById("lblCrossOverPointValue");

const bestTravelDistaceElement = <HTMLLabelElement>document.getElementById("lblBestTravelDistance");
const worstTravelDistanceElement = <HTMLLabelElement>document.getElementById("lblWorstTravelDistance");

const showBestTravelDistanceCheckBoxElement = <HTMLInputElement>document.getElementById("checkboxShowBestTravelDistance");
const showWorstTravelDistanceCheckBoxElement = <HTMLInputElement>document.getElementById("checkboxShowWorstTravelDistance");
const summaryHeaderElement = <HTMLDetailsElement>document.getElementById("summaryHeader");
const optionsDetailsElement = <HTMLDetailsElement>document.getElementById("options");

let logs: Log[] = [];
let resetChromosome: boolean = false;
let resetCities: boolean = false;
let bodyClickListener: any;
/**
 * Returns a random number between given lower and upperbounds
 * @param {Number} min - Lowerbound
 * @param {Number} max - Upperbound
 */
const getRandomNumberInRange = (min: number, max: number) => Math.floor((Math.random() * max) + min);
let numberOfCities: number = 5;
let numberOfChromosomesCreated: number = 5; // counter
let cities: City[] = [];
let chromosomes = [];
let initialPopulationSize: number = 5;
let numberOfGenerationsAllowed = 5;
let numberOfOffspringsAllowed = 5;
let randomPointForCrossOver = Math.floor(numberOfCities / 2);

/**
 * Updates the canvas size based on available screensize
 */
function updateCanvasMapSize(): void {
    canvasMapElement.width = window.innerWidth - 5;
    canvasMapElement.height = (window.innerHeight - 30);
}

function modifyNumberOfCities(): void {
    let value = citiesLimitElement.valueAsNumber;
    crossoverLimitElement.max = (value - 1).toString();
    citiesValueElement.innerText = value.toString();
    numberOfCities = value;
    resetCities = true;
    resetChromosome = true;
}

function modifyInitialPopulationSize(): void {
    let value = initialPopulationLimitElement.valueAsNumber;
    initialPopulationValueElement.innerText = value.toString();
    initialPopulationSize = value;
    resetChromosome = true;
}

function modifyGenerationSize(): void {
    let value = generationsLimitElement.valueAsNumber;
    generationsValueElement.innerText = value.toString();
    numberOfGenerationsAllowed = value;
    resetChromosome = true;
}

function modifyOffspringSize(): void {
    let value = offspringsLimitElement.valueAsNumber;
    offspringsValueElement.innerText = value.toString();
    numberOfOffspringsAllowed = value;
    resetChromosome = true;
}

function modifyCrossOverValue(): void {
    let value = crossoverLimitElement.valueAsNumber;
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

/**
 * Defines the structure of Chromosome
 */
interface ChromosomeInterface {
    id: number,
    route: number[];
    travelDistance: number;
    rgbColor: string;
}

/**
 * A Chromosome or individual
 */
class Chromosome implements ChromosomeInterface {
    id: number;
    route: number[];
    travelDistance: number;
    rgbColor: string;
    /**
     * Inits the Chromosome with given properties
     * @param id - unique id, normally incrementing integer
     * @param route - list of integers, denoting the sequence in which each city will be visited
     * @param travelDistance - denotes the travel distance required to visit all cities
     * @param rgbColor - A color denoting the path
     */
    constructor(id: number, route: number[], travelDistance: number, rgbColor: string) {
        this.id = id;
        this.route = route;
        this.travelDistance = travelDistance;
        this.rgbColor = rgbColor;
    }
}

interface CityInterface {
    id: number;
    x: number;
    y: number;
}

class City implements CityInterface {

    id: number;
    x: number;
    y: number;

    constructor(id: number, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

interface LogInterface {
    serialNumber: number;
    generationCount: number;
    chromosomeCount: number;
    bestTravelScore: number;
    worstTravelScore: number;
    bestTravelRoute: string;
    worstTravelRoute: string;
    timeStamp: string;
}

class Log implements LogInterface {
    serialNumber: number;
    generationCount: number;
    chromosomeCount: number;
    bestTravelScore: number;
    worstTravelScore: number;
    bestTravelRoute: string;
    worstTravelRoute: string;
    timeStamp: string;

    constructor(serialNumber: number, generationCount: number, chromosomeCount: number, bestTravelScore: number, worstTravelScore: number, bestTravelRoute: string, worstTravelRoute: string, timeStamp: string) {
        this.serialNumber = serialNumber;
        this.generationCount = generationCount;
        this.chromosomeCount = chromosomeCount;
        this.bestTravelScore = bestTravelScore;
        this.worstTravelScore = worstTravelScore;
        this.bestTravelRoute = bestTravelRoute;
        this.worstTravelRoute = worstTravelRoute;
        this.timeStamp = timeStamp;
    }
}

/**
 * Updates the UI components with updated values
 */
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

/**
 * like a main function, responsible for driving the whole genetic algorithm
 */
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

    for (let generation: number = 0; generation < numberOfGenerationsAllowed; generation++) {

        for (let counter: number = 0; counter < numberOfOffspringsAllowed; counter++) {
            let parentOneId: number = getRandomNumberInRange(0, chromosomes.length);
            let parentTwoId: number = getRandomNumberInRange(0, chromosomes.length);
            let offSpring = crossOver(chromosomes[parentOneId].route, chromosomes[parentTwoId].route);
            offSpring = mutateChromosome(offSpring);
            let strokeColor = `rgb(${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)})`;
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

/**
 * Generates the initial population of chromosomes as per given size
 * @param {Number} size - Number of chromosomes (individuals) to create
 */
function generateInitialPopulation(size: number) {
    chromosomes = [];
    for (let counter: number = 0; counter < size; counter++) {
        let chromosome = generateChromosome(numberOfCities);
        let strokeColor = `rgb(${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)})`;
        chromosomes.push(new Chromosome(numberOfChromosomesCreated, chromosome, calculateTravelDistance(chromosome), strokeColor));
        // drawRoute(chromosome, strokeColor, 1);
    }
}

/**
 * Generates given number of city objects and returns a list.
 * @param {Number} numberOfCities - a positive Integer specifying number of cities.
 * @returns {Array} cities - array of cities
 */
function generateCities(numberOfCities: number) {

    let cities: City[] = [];
    let maxWidth: number = canvasMapElement.width;
    let maxHeight: number = canvasMapElement.height;
    for (let counter: number = 0; counter < numberOfCities; counter++) {
        let city: City = new City(counter, getRandomNumberInRange(0, maxWidth),
            getRandomNumberInRange(0, maxHeight));
        cities.push(city);
    }
    return cities;
}

let pencil = canvasMapElement.getContext("2d");

/**
 * Draws Cities on the screen
 * @param listOfCities - List of City Objects
 */
function drawCities(listOfCities: City[]): void {

    listOfCities.forEach((city) => {
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

/**
 * Generates a random chromosome of give size
 * @param {Number} numberOfCities - size of cities
 */
function generateChromosome(numberOfCities): number[] {
    let chromosome: Array<number> = [];
    let switchPosition: number = 0;
    let temp: number;

    for (let counter = 0; counter < numberOfCities; counter++) {
        chromosome.push(counter);
    }

    for (let counter = 0; counter < numberOfCities; counter++) {
        switchPosition = getRandomNumberInRange(0, numberOfCities);
        temp = chromosome[counter];
        chromosome[counter] = chromosome[switchPosition];
        chromosome[switchPosition] = temp;
    }
    numberOfChromosomesCreated++;

    return chromosome;
}

/**
 * Draws the given route
 * @param chromosome - Chromosome which defines the path or route to be drawn
 * @param strokeColor - path color
 * @param lineWidth - path width
 */
function drawRoute(chromosome: number[], strokeColor: string, lineWidth: number) {
    pencil.beginPath();
    pencil.moveTo(cities[0].x, cities[0].y);
    pencil.lineWidth = lineWidth;
    chromosome.forEach(cityId => pencil.lineTo(cities[cityId].x, cities[cityId].y));
    pencil.strokeStyle = strokeColor;
    pencil.stroke();
    pencil.closePath();
}

/**
 * returns the distance between any two points in 2D plane
 * @param city1 - A coordinate denoting first point
 * @param city2 - A coordinate denoting second point
 */
function getDistanceBetweenTwoCities(city1: City, city2: City) {
    return Math.sqrt(Math.pow((city2.x - city1.x), 2) + Math.pow((city2.y - city1.y), 2));
}

/**
 * Returns the distance between two cities (two points in a 2D plane)
 * ref: https://www.mathsisfun.com/algebra/distance-2-points.html (it really is :)
 * @param {number} city1Id - a positive integer denoting a valid city id
 * @param {number} city2Id - a positive integer denoting a valid city id
 */
function getDistanceBetweenTwoCitiesByIds(city1Id: number, city2Id: number) {
    let city1: City = cities[city1Id];
    let city2: City = cities[city2Id];

    return Math.sqrt(Math.pow((city2.x - city1.x), 2) + Math.pow((city2.y - city1.y), 2));
}

/**
 * Calculates the travel distance for given path/chromosome
 * @param chromosome - A chromosome denoting a path
 */
function calculateTravelDistance(chromosome: number[]): number {
    let travelDistance: number = 0.0; //yes float here
    for (let cityId = 0; cityId < chromosome.length - 1; cityId++) {
        let cityId1: number = chromosome[cityId];
        let cityId2: number = chromosome[cityId + 1];
        travelDistance += getDistanceBetweenTwoCitiesByIds(cityId1, cityId2);
    }
    // console.log(`chromesome ${chromosome}'s travel distance: ${travelDistance}`);
    return travelDistance;
}

/**
 * Generates new offspring by doing a crossover between given two parents' chromosomes
 * Using Uni-Point crossover method here, to be simpler.
 * @param parentOneChromosome - Parent one's chromosome
 * @param parentTwoChromosome - Parent two's chromosome
 */
function crossOver(parentOneChromosome, parentTwoChromosome) {

    let offSpring = [];
    let parentOneChromosomePart = [];

    parentOneChromosomePart = parentOneChromosome.slice(0, randomPointForCrossOver);
    offSpring = parentTwoChromosome.slice();
    parentOneChromosomePart.forEach(parentGene => {
        offSpring.splice(offSpring.indexOf(parentGene), 1);
    });
    return offSpring.concat(parentOneChromosomePart);
}

/**
 * Mutates the given chromosome (offspring) by doing a swap of randomly choosen gene
 * @param chromosome - Offspring which needs to be mutated
 */
function mutateChromosome(chromosome: number[]): number[] {
    let mutatedChromosome: number[] = chromosome.slice();
    let temp: number = 0;
    let switchPosition1: number = 0;
    let switchPosition2: number = 0;
    switchPosition1 = getRandomNumberInRange(0, mutatedChromosome.length);
    switchPosition2 = getRandomNumberInRange(0, mutatedChromosome.length);
    temp = mutatedChromosome[switchPosition1];
    mutatedChromosome[switchPosition1] = mutatedChromosome[switchPosition2];
    mutatedChromosome[switchPosition2] = temp;
    return mutatedChromosome;
}

/**
 * Sorts the whole population or chromosomes by sorting
 * Chromosomes with less travel distance takes precendence
 * @param chromosomes - list of all chromosomes or entire population
 */
function sortPopulationByFitness(chromosomes: Chromosome[]): void {
    chromosomes.sort((cA, cB) => cA.travelDistance - cB.travelDistance);
}

/**
 * Updates the log in the UI in a tabular structure
 * Each entry denotes a generation
 */
function updateLog() {
    logs.reverse();
    let logHtml: string = `
    <tr>
        <th>Timestamp</th>
        <th>Serial Number</th>
        <th>Generation</th>
        <th>Chromosomes Created</th>
        <th>Best Travel Score</th>
        <th>Worst Travel Score</th>
        <th>Best Travel Route</th>
        <th>Worst Travel Route</th>
    </tr>
    `;

    for (let log of logs) {
        logHtml +=
            `
            <tr>
                <td>${log.timeStamp}</td>
                <td>${log.serialNumber}</td>
                <td>${log.generationCount}</td>
                <td>${log.chromosomeCount}</td>
                <td class="bestScore">${log.bestTravelScore}</td>
                <td class="worstScore">${log.worstTravelScore}</td>
                <td class="bestScore">${log.bestTravelRoute}</td>
                <td class="worstScore">${log.worstTravelRoute}</td>
            </tr>
            `
            ;
    }

    tbdLogTableElement.innerHTML = logHtml;
    summaryHeaderElement.innerText = `Click Here & Scroll to see Complete Log: ${logs.length} Items`;

}

/**
 * Initializer of Genetic algorithm
 */
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
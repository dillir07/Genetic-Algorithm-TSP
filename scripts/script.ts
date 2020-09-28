const canvasMapElement = document.querySelector("canvas");
const citiesLimitElement = <HTMLInputElement>document.getElementById("rangeCities");
const initialPopulationLimitElement = <HTMLInputElement>document.getElementById("rangeInitialPopulationSize");
const generationsLimitElement = <HTMLInputElement>document.getElementById("rangeGenerationsAllowed");
const offspringsLimitElement = <HTMLInputElement>document.getElementById("rangeOffspringsAllowed");
const crossoverLimitElement = <HTMLInputElement>document.getElementById("rangeCrossOverPoint");
const evolveButtonElement = <HTMLInputElement>document.getElementById("btnEvolve");

const randomCitiesCheckBoxElement = <HTMLInputElement>document.getElementById("checkboxRandomCities");

const citiesValueElement = <HTMLInputElement>document.getElementById("lblCitiesValue");
const initialPopulationValueElement = <HTMLLabelElement>document.getElementById("lblInitialPopulationSizeValue");
const generationsValueElement = <HTMLLabelElement>document.getElementById("lblGenerationsAllowedValue");
const offspringsValueElement = <HTMLLabelElement>document.getElementById("lblOffspringsAllowedValue");
const crossoverValueElement = <HTMLLabelElement>document.getElementById("lblCrossOverPointValue");

const bestTravelDistaceElement = <HTMLLabelElement>document.getElementById("lblBestTravelDistance");
const worstTravelDistanceElement = <HTMLLabelElement>document.getElementById("lblWorstTravelDistance");
let bodyClickListener: any;
const getRandomNumberInRange = (min: number, max: number) => Math.floor((Math.random() * max) + min);
let numberOfCities: number = 5;
let numberOfChromosomesCreated: number = 5; // counter
let cities: City[] = [];
let chromosomes = [];
let initialPopulationSize: number = 5;
let numberOfGenerationsAllowed = 5;
let numberOfOffspringsAllowed = 5;
let randomPointForCrossOver = Math.floor(numberOfCities / 2);

function updateCanvasMapSize(): void {
    canvasMapElement.width = window.innerWidth;
    canvasMapElement.height = window.innerHeight;
}

function modifyNumberOfCities(): void {
    let value = citiesLimitElement.valueAsNumber;
    crossoverLimitElement.max = (value - 1).toString();
    citiesValueElement.innerText = value.toString();
    numberOfCities = value;
}

function modifyInitialPopulationSize(): void {
    let value = initialPopulationLimitElement.valueAsNumber;
    initialPopulationValueElement.innerText = value.toString();
    initialPopulationSize = value;
}

function modifyGenerationSize(): void {
    let value = generationsLimitElement.valueAsNumber;
    generationsValueElement.innerText = value.toString();
    numberOfGenerationsAllowed = value;
}

function modifyOffspringSize(): void {
    let value = offspringsLimitElement.valueAsNumber;
    offspringsValueElement.innerText = value.toString();
    numberOfOffspringsAllowed = value;
}

function modifyCrossOverValue(): void {
    let value = crossoverLimitElement.valueAsNumber;
    crossoverValueElement.innerText = value.toString();
    randomPointForCrossOver = value;
}

window.addEventListener("resize", updateCanvasMapSize);
citiesLimitElement.addEventListener("change", modifyNumberOfCities);
initialPopulationLimitElement.addEventListener("change", modifyInitialPopulationSize);
generationsLimitElement.addEventListener("change", modifyGenerationSize);
offspringsLimitElement.addEventListener("change", modifyOffspringSize);
crossoverLimitElement.addEventListener("change", modifyCrossOverValue);
evolveButtonElement.addEventListener("click", evolve);

updateCanvasMapSize();

interface ChromosomeInterface {
    id: number,
    route: number[];
    travelDistance: number;
    rgbColor: string;
}

class Chromosome {
    id: number;
    route: number[];
    travelDistance: number;
    rgbColor: string;
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

function addClickLocationToCity(event) {
    console.log(event);
    if (cities.length >= numberOfCities) {
        document.body.removeEventListener("click", bodyClickListener);
        window.alert(numberOfCities + " cities are added");

        drawCities(cities);
        generateInitialPopulation(initialPopulationSize);
        sortPopulationByFitness(chromosomes);

        for (let generation: number = 0; generation < numberOfGenerationsAllowed; generation++) {
            console.log("Generation", generation);
            for (let counter: number = 0; counter < numberOfOffspringsAllowed; counter++) {
                let parentOneId: number = getRandomNumberInRange(0, chromosomes.length);
                let parentTwoId: number = getRandomNumberInRange(0, chromosomes.length);
                let offSpring = crossOver(chromosomes[parentOneId].route, chromosomes[parentTwoId].route);
                offSpring = mutateChromosome(offSpring);
                let strokeColor = `rgb(${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)})`;
                chromosomes.push(new Chromosome(numberOfChromosomesCreated, offSpring, calculateTravelDistance(offSpring), strokeColor));
                // drawRoute(offSpring, strokeColor, 1);
            }
            sortPopulationByFitness(chromosomes);
            drawRoute(chromosomes[0].route, "green", 5);
            drawRoute(chromosomes[chromosomes.length - 1].route, "red", 2);
            bestTravelDistaceElement.innerText = "Best travel Distance:" + chromosomes[0].travelDistance;
            worstTravelDistanceElement.innerText = "Bad  travel Distance:" + chromosomes[chromosomes.length - 1].travelDistance;
        }

    }
    if (event.target.id == "map") {
        cities.push(new City(cities.length + 1, event.clientX, event.clientY));
    }
}

function chooseCities() {
    numberOfCities = parseInt(window.prompt("How many cities you want?"));
    window.alert("Please click any where on screen, for " + numberOfCities + " times");
    bodyClickListener = document.body.addEventListener("click", addClickLocationToCity);
}

function evolve() {
    console.log("evolve");
    pencil.clearRect(0, 0, canvasMapElement.width, canvasMapElement.height);
    if (randomCitiesCheckBoxElement.checked) {
        cities = generateCities(numberOfCities);
    } else {
        chooseCities();
        return;
    }
    drawCities(cities);
    generateInitialPopulation(initialPopulationSize);
    sortPopulationByFitness(chromosomes);

    for (let generation: number = 0; generation < numberOfGenerationsAllowed; generation++) {
        console.log("Generation", generation);
        for (let counter: number = 0; counter < numberOfOffspringsAllowed; counter++) {
            let parentOneId: number = getRandomNumberInRange(0, chromosomes.length);
            let parentTwoId: number = getRandomNumberInRange(0, chromosomes.length);
            let offSpring = crossOver(chromosomes[parentOneId].route, chromosomes[parentTwoId].route);
            offSpring = mutateChromosome(offSpring);
            let strokeColor = `rgb(${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)},${getRandomNumberInRange(0, 255)})`;
            chromosomes.push(new Chromosome(numberOfChromosomesCreated, offSpring, calculateTravelDistance(offSpring), strokeColor));
            // drawRoute(offSpring, strokeColor, 1);
        }
        sortPopulationByFitness(chromosomes);
        drawRoute(chromosomes[0].route, "green", 5);
        drawRoute(chromosomes[chromosomes.length - 1].route, "red", 2);
        bestTravelDistaceElement.innerText = "Best travel Distance:" + chromosomes[0].travelDistance;
        worstTravelDistanceElement.innerText = "Bad  travel Distance:" + chromosomes[chromosomes.length - 1].travelDistance;
        chromosomes = chromosomes.slice(0, numberOfOffspringsAllowed);
    }
}

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

function drawCities(listOfCities: City[]) {
    console.log("drawCities" + "is called");
    pencil.beginPath();
    listOfCities.forEach((city) => pencil.fillRect(city.x, city.y, 5, 5 / 2));
    pencil.stroke();
    pencil.closePath();
    return null; // typescript complains
}

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
    console.log('created chromosome #' + numberOfChromosomesCreated + ": " + chromosome);
    return chromosome;
}

function drawRoute(chromosome: number[], strokeColor: string, lineWidth: number) {
    pencil.beginPath();
    pencil.moveTo(cities[0].x, cities[0].y);
    pencil.lineWidth = lineWidth;
    chromosome.forEach(cityId => pencil.lineTo(cities[cityId].x, cities[cityId].y));
    pencil.strokeStyle = strokeColor;
    pencil.stroke();
    pencil.closePath();
}

function getDistanceBetweenTwoCities(city1: City, city2: City) {
    return Math.sqrt(Math.pow((city2.x - city1.x), 2) + Math.pow((city2.y - city1.y), 2));
}

/**
 * Returns the distance between two cities (two points in a 2D plane)
 * ref: https://www.mathsisfun.com/algebra/distance-2-points.html (it really is)
 * @param {number} city1Id - a positive integer denoting a valid city id
 * @param {number} city2Id - a positive integer denoting a valid city id
 */
function getDistanceBetweenTwoCitiesByIds(city1Id: number, city2Id: number) {
    let city1: City = cities[city1Id];
    let city2: City = cities[city2Id];

    return Math.sqrt(Math.pow((city2.x - city1.x), 2) + Math.pow((city2.y - city1.y), 2));
}

function calculateTravelDistance(chromosome: number[]): number {
    let travelDistance: number = 0.0; //yes float here
    for (let cityId = 0; cityId < chromosome.length - 1; cityId++) {
        let cityId1: number = chromosome[cityId];
        let cityId2: number = chromosome[cityId + 1];
        travelDistance += getDistanceBetweenTwoCitiesByIds(cityId1, cityId2);
    }
    console.log(`chromesome ${chromosome}'s travel distance: ${travelDistance}`);
    return travelDistance;
}


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

function sortPopulationByFitness(chromosomes: Chromosome[]): void {
    chromosomes.sort((cA, cB) => cA.travelDistance - cB.travelDistance);
}
### A Pluto.jl notebook ###
# v0.11.14

using Markdown
using InteractiveUtils

# This Pluto notebook uses @bind for interactivity. When running this notebook outside of Pluto, the following 'mock version' of @bind gives bound variables a default value (instead of an error).
macro bind(def, element)
    quote
        local el = $(esc(element))
        global $(esc(def)) = Core.applicable(Base.get, el) ? Base.get(el) : missing
        el
    end
end

# ╔═╡ 99ae3694-04b0-11eb-0808-3f17e7bbf27c
using Plots

# ╔═╡ 689d4366-03fb-11eb-2b86-ad637921b2a4
html"<h1>Genetic Algorithm - Travelling Salesman Program</h1>"

# ╔═╡ e8b8fbd2-048f-11eb-2fec-dd76d6659b51
html"<b>City Count</b>"

# ╔═╡ 52384734-03b7-11eb-17e8-e79a7516aa5e
@bind binded_number_of_cities html"<input type='range' min='3' max='100' value='5'>"

# ╔═╡ 47445476-0490-11eb-0e67-dd8937c2ce40
html"<b>Initial Population Size</b>"

# ╔═╡ e2270a2c-03b6-11eb-341e-f9640bf68941
@bind binded_initial_population_size html"<input type='range' min='3' max='100' value='5'>"

# ╔═╡ 771cffda-0491-11eb-28c4-d59dac791746
html"<b>Number of Generations</b>"

# ╔═╡ e22d58b4-03b6-11eb-0b51-a15115c19be5
@bind binded_number_of_generations_allowed html"<input type='range' min='3' max='100' value='5'>"

# ╔═╡ 8a52c206-0491-11eb-0929-77e601fe4e56
html"<b>Number of Offsprings</b>"

# ╔═╡ e2325bac-03b6-11eb-35d6-4f88d15a3cdf
@bind binded_number_of_offsprings_allowed html"<input type='range' min='3' max='100' value='5'>"

# ╔═╡ 995be89a-0491-11eb-09a8-6b461f6134e8
html"<b>Crossover point</b>"

# ╔═╡ a4731e88-0491-11eb-3f2b-9b747815dda6
html"<b>Canvas size</b>"

# ╔═╡ b11a88b8-0416-11eb-1a29-6543ec12939f
@bind binded_canvas_limit html"<input type='range' min='100' max='500' value='5'>"

# ╔═╡ 82fe3e04-04af-11eb-3a92-e1b381cfa028
html"<b>Best Chromosome:</b>"

# ╔═╡ f669e996-03b6-11eb-1089-1bb011d1f9c3
initial_chromosome = [1:binded_number_of_cities;] # this is array

# ╔═╡ f2f86e0e-03b6-11eb-0c17-b1f5bc56493e
function generate_cities(number_of_cities, map_limit)
	cities = []
    for city_counter in 1:number_of_cities
        push!(cities, Dict("id" => city_counter, "x" => round(rand() * map_limit), "y" => round(rand() * map_limit)))
    end
	println("Cities Generated:", size(cities)[1])
	return cities
end

# ╔═╡ 0545de5c-03b7-11eb-0fa6-c9783f5ffe37
function shuffle_chromosome(chromosome)
    for i in 1:size(chromosome)[1]
        random_point = rand(chromosome)
        chromosome[i], chromosome[random_point] = chromosome[random_point], chromosome[i]
    end
	println("Created chromosome", chromosome)
    return chromosome
end

# ╔═╡ 05492ed8-03b7-11eb-1d0f-a9c8f58ac8ff
function calculate_distance_between_two_points(point1, point2)
    return sqrt((((point2[1] - point1[1]))^2) + (((point2[2] - point1[2]))^2))
end

# ╔═╡ 7f71180a-04b0-11eb-0538-790ab91b81a7
cities = generate_cities(binded_number_of_cities, binded_canvas_limit)

# ╔═╡ e2391adc-03b6-11eb-3382-2588fc700c42
binded_crossover_point = round(Int, size(cities)[1]/2)

# ╔═╡ 054f5ca2-03b7-11eb-1755-0b7eefc5405d
function calculate_chromosome_travel_distance(chromosome)
    travel_distance = 0
    for geneId in 1:size(chromosome)[1]-1
        point1 = (cities[chromosome[geneId]]["x"], cities[chromosome[geneId]]["y"])
        point2 = (cities[chromosome[geneId + 1]]["x"], cities[chromosome[geneId + 1]]["y"])
        travel_distance += calculate_distance_between_two_points(point1, point2)
    end
    return travel_distance
end

# ╔═╡ 054fee60-03b7-11eb-1b5f-ebeac6db21bb
function generate_initial_population(initial_population_size)
	"""
	Generates Initial Population
	"""
	chromosomes = []
    for population_counter in 1:initial_population_size
        chromosome = shuffle_chromosome(copy(initial_chromosome))
        calculate_chromosome_travel_distance(chromosome)
        push!(chromosomes, Dict("chromosome" => chromosome, "distance" => calculate_chromosome_travel_distance(chromosome)))
#         global chromosome_count = chromosome_count + 1
    end
	return chromosomes
end

# ╔═╡ 8351a3cc-04b0-11eb-25cb-2fca306c7751
chromosomes = generate_initial_population(binded_initial_population_size)

# ╔═╡ 8354232e-04b0-11eb-38b8-1123ff61b5c9
sort!(chromosomes, by=x->x["distance"], rev=true)

# ╔═╡ b6ed94da-040a-11eb-0ced-23c4153697e5
function crossover(parent_one_chromosome, parent_two_chromosome, crossover_point)
	offspring_part_one = parent_one_chromosome[1:crossover_point]
	for gene in offspring_part_one
		if gene in parent_two_chromosome
			gene_loc = findfirst(el->el==gene, parent_two_chromosome)
			splice!(parent_two_chromosome,gene_loc)
		end
	end
	return vcat(offspring_part_one,parent_two_chromosome)
end

# ╔═╡ 98aa190a-0414-11eb-17ff-a531ae8b0e5a
function mutate(offspring)
	random_mutation_point1 = rand(offspring)
	random_mutation_point2 = rand(offspring)
	offspring[random_mutation_point1],offspring[random_mutation_point2] = offspring[random_mutation_point2],offspring[random_mutation_point1]
	return offspring
end

# ╔═╡ a4722148-041b-11eb-0729-83658465033d
function evolve(generation_count, offsprings_count,crossover_point)
	for generation in 1:generation_count
		for offspring_count in 1:offsprings_count
			random_parent_one_id = rand(1:size(chromosomes)[1])
            random_parent_two_id = rand(1:size(chromosomes)[1])
            random_parent_one = copy(chromosomes[random_parent_one_id]["chromosome"])
            random_parent_two = copy(chromosomes[random_parent_two_id]["chromosome"])
			offspring = crossover(random_parent_one,random_parent_two,crossover_point)
			offspring = mutate(offspring)
        	push!(chromosomes, Dict("chromosome" => offspring, "distance" => calculate_chromosome_travel_distance(offspring)))
		end
		sort!(chromosomes, by=x->x["distance"], rev=false)
		splice!(chromosomes, (offsprings_count + 1):size(chromosomes)[1])
	end
end

# ╔═╡ 06e63bfe-041f-11eb-0215-553b6eaaf06a
evolve(binded_number_of_generations_allowed, binded_number_of_offsprings_allowed, binded_crossover_point)

# ╔═╡ abd2ecc0-04b0-11eb-29bc-9f946ae59ca2
Plots.gr()

# ╔═╡ 3b979306-04b1-11eb-0b1e-83f60ae393d4
city_xs = [city["x"] for city in cities]

# ╔═╡ 6e811e90-04b1-11eb-18d1-5f38e3df41da
city_ys = [city["y"] for city in cities]

# ╔═╡ b4b0374c-04b0-11eb-0582-6f3fd269db44
city_plot = scatter!(city_xs, city_ys)

# ╔═╡ bd968162-04b3-11eb-2310-fffc409bcdd9
best_xs = [cities[city]["x"] for city in chromosomes[1]["chromosome"]]

# ╔═╡ dc7be11a-04b5-11eb-38cb-ed27edd3d77c
best_ys = [cities[city]["y"] for city in chromosomes[1]["chromosome"]]

# ╔═╡ Cell order:
# ╟─689d4366-03fb-11eb-2b86-ad637921b2a4
# ╟─e8b8fbd2-048f-11eb-2fec-dd76d6659b51
# ╟─52384734-03b7-11eb-17e8-e79a7516aa5e
# ╟─47445476-0490-11eb-0e67-dd8937c2ce40
# ╟─e2270a2c-03b6-11eb-341e-f9640bf68941
# ╟─771cffda-0491-11eb-28c4-d59dac791746
# ╟─e22d58b4-03b6-11eb-0b51-a15115c19be5
# ╟─8a52c206-0491-11eb-0929-77e601fe4e56
# ╟─e2325bac-03b6-11eb-35d6-4f88d15a3cdf
# ╟─995be89a-0491-11eb-09a8-6b461f6134e8
# ╟─a4731e88-0491-11eb-3f2b-9b747815dda6
# ╟─b11a88b8-0416-11eb-1a29-6543ec12939f
# ╠═b4b0374c-04b0-11eb-0582-6f3fd269db44
# ╟─82fe3e04-04af-11eb-3a92-e1b381cfa028
# ╠═f669e996-03b6-11eb-1089-1bb011d1f9c3
# ╠═e2391adc-03b6-11eb-3382-2588fc700c42
# ╠═f2f86e0e-03b6-11eb-0c17-b1f5bc56493e
# ╠═0545de5c-03b7-11eb-0fa6-c9783f5ffe37
# ╠═05492ed8-03b7-11eb-1d0f-a9c8f58ac8ff
# ╠═054f5ca2-03b7-11eb-1755-0b7eefc5405d
# ╠═054fee60-03b7-11eb-1b5f-ebeac6db21bb
# ╠═7f71180a-04b0-11eb-0538-790ab91b81a7
# ╠═8351a3cc-04b0-11eb-25cb-2fca306c7751
# ╠═8354232e-04b0-11eb-38b8-1123ff61b5c9
# ╠═b6ed94da-040a-11eb-0ced-23c4153697e5
# ╠═98aa190a-0414-11eb-17ff-a531ae8b0e5a
# ╠═a4722148-041b-11eb-0729-83658465033d
# ╠═06e63bfe-041f-11eb-0215-553b6eaaf06a
# ╠═99ae3694-04b0-11eb-0808-3f17e7bbf27c
# ╠═abd2ecc0-04b0-11eb-29bc-9f946ae59ca2
# ╠═3b979306-04b1-11eb-0b1e-83f60ae393d4
# ╠═6e811e90-04b1-11eb-18d1-5f38e3df41da
# ╠═bd968162-04b3-11eb-2310-fffc409bcdd9
# ╠═dc7be11a-04b5-11eb-38cb-ed27edd3d77c

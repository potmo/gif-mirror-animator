'use strict';
const debruijn = require('./debruijn');
const disc_mapper = require('./disc-mapper');
const color_convert = require('./color-convert');
const color_distance = require('./color-distance');
const colors = require('colors');
const PNGImage = require('pngjs-image');
const leftPad = require('left-pad');
const fs = require('fs-extra');
const path = require('path');
const entropy = require('binary-shannon-entropy');
const shannon_entropy = (string) => entropy(Buffer.from(string));
const square_image_loader = require('./square-image-loader');
const hex_loader = require('./hex-drawer');
const leven = require('leven');

//const color_map = {
//	0xffffffff: '0',
//	0xff000000: '1'
//}

//const color_map = {
//	0xFFFF0000: 'R',
//	0xFF00FF00: 'G',
//	0xFF0000FF: 'B'
//}


run()
  .then(()=>{
    console.log('done'.green);
  })
  .catch((err)=>{
    console.error(`${err.stack}`.red);
    return process.exit(1);
  });

async function run() {


	console.log(`loading images`.gray);

	//const {subsequence_length, pixels, image_size} = await square_image_loader.load(color_map, './images/color2/')
	const {subsequence_length, pixels, image_size, color_map} = await hex_loader.load();


	printStatsForSequenceCount(pixels);

	// find bitshift equal
	let shift_equal = reuseLoopingPermutationSequences(pixels);

	console.log('before pruning'.red)
	let shift_equal_keys = sortSequenceKeys(shift_equal);

	const reverse_color_map = Object.keys(color_map)
		.reduce( (map, color) => {
			map[color_map[color]] = color;
			return map;
		}, {});
	console.log(`reverse color map ${Object.keys(reverse_color_map).length}`);
	Object.keys(reverse_color_map).forEach(key => console.log(key.yellow, color_convert.toHexString(reverse_color_map[key]).green))

	let shift_equal_pruned = reduceNumberOfSequences(shift_equal, reverse_color_map, 30);

	console.log('pruned'.green)
	let shift_equal_pruned_keys = sortSequenceKeys(shift_equal_pruned);

	console.log(`Worst case palette sequences: ${Math.pow(Object.keys(color_map).length, subsequence_length)}.`.red)
	console.log(`Reduced palette sequences: ${Object.keys(shift_equal_pruned).length}`.yellow)
	console.log(`Default palette palette sequences: ${Object.keys(shift_equal).length}`.green)
	console.log(`Number of pixels: ${pixels.length}`);


	await disc_mapper.map(pixels, shift_equal_pruned, shift_equal_pruned_keys, reverse_color_map, image_size, subsequence_length);

}

function sortSequenceKeys(shift_equal) {
	console.log(`Permutations where shifting works makes ${Object.keys(shift_equal).length} keys`);
	const sorted_shift_equal = Object.keys(shift_equal)
									 .sort((a,b) => shannon_entropy(a) - shannon_entropy(b));

	sorted_shift_equal.forEach( key => {
		console.log(key.yellow + ' (' + shannon_entropy(key).toFixed(8).red + ') ' + shift_equal[key].map(a => `\n  ${a.string} (<<${a.offset + (a.original_main_key ? '*' : '')} ${shiftString(a.string, a.offset)})`.white + ` occurrences: ${a.occurences}`.green).join(''));
	});

	return sorted_shift_equal;
}


function reuseLoopingPermutationSequences(pixels) {
	console.log(`finding bithsifts`.gray);
	return pixels
		.map(obj => obj.pixel_colors.join(''))
		.reduce( (output, string) => {

			// check already check if it is the same
			for (let test of Object.keys(output)) {
				const key = test;
				let offset = 0;
				for (let i = 0; i < test.length; i++) {
					// shift
					test = test.charAt(test.length - 1) + test.substring(0, test.length - 1);
					offset++;

					// check if loop permutation found
					if (test === string) {
						output[key] = output[key] || [];

						let index = output[key].findIndex(a => a.string === string);

						if (index >= 0 ){
							// it already exist
							output[key][index].occurences++;
						} else {
							// add a new permutation to the key
							output[key].push({string, offset, occurences: 1, main_key: key});
						}
						return output;
					}
				}
			}
			// If we got here then this is a unique sequence that can't be looped and does not exist yet-
			output[string] = [{string, offset: 0, occurences: 1, main_key: string}];
			return output;
		}, {});
}

function reduceNumberOfSequences(shift_equal, reverse_color_map, max_sequences) {

	console.log(`reduce number of sequneces to ${max_sequences}`.yellow);											 

	let sequences = Object.keys(shift_equal)
												 .map(key => {
												 		let occurences = shift_equal[key].reduce( (t,n) => t+n.occurences, 0);
												 		let permutations = shift_equal[key];
												 		return {key, occurences, permutations}
												 }).
												 sort( (a,b) => b.occurences - a.occurences);


	while( sequences.length > max_sequences) {

		let candidate = sequences.pop();

		// find closest
		let best_match = sequences.reduce( (best, curr) => {
			var permutation_key = candidate.key;

			for (let permutation_offset = 0; permutation_offset < permutation_key.length-1; permutation_offset++) {
				// check all permutations
				permutation_key = shiftString(candidate.key, permutation_offset);

				//console.log(`shifting ${candidate.key} << ${permutation_offset}`, permutation_key);

				//stringColorDistance
				const current_distance = stringDistance(curr.key, permutation_key, reverse_color_map);

				if (current_distance < best.value) {
					best.value = current_distance;
					best.string = permutation_key;
					best.key = curr.key;
					best.offset = permutation_offset;
				}
			}

		 	return best;
	 	},{value: Number.MAX_VALUE, string: '', key: '', offset: 0});

	 	// insert
	 	let index = sequences.findIndex( (s) => s.key === best_match.key );

	 	for (let permutation of candidate.permutations) {
	 		let new_permutation = {
	 			original_main_key: permutation.main_key,
	 			main_key: sequences[index].key,
	 			offset: (permutation.offset + best_match.offset) % permutation.string.length,
	 			string: permutation.string,
	 			occurences: permutation.occurences,
	 		};

	 		sequences[index].permutations.push(new_permutation);	
	 	}

	 	sequences[index].occurences += candidate.occurences;

	}

	var output = {}
	for (let sequence of sequences) {
		output[sequence.key] = sequence.permutations;
	}

	console.log(`reduce number of sequneces to ${max_sequences} from ${sequences.length}`.green);											 

	return output;

}

function shiftString(string, steps) {
	return string.slice(steps, string.length) + string.slice(0, steps);
}

function removeUncommonSequences(shift_equal, reverse_color_map, min_occurences) {

	// find sequences with fre occurences
	const sequences_with_few_appearences = Object.keys(shift_equal)
																							 .filter(key => {
																							 		let occurences = shift_equal[key].reduce( (t,n) => t+n.occurences, 0);
																							 		return occurences < min_occurences && !isSolidColor(key);
																							 });

	console.log(`there are ${sequences_with_few_appearences.length} sequences that has less than ${min_occurences} occurences and can be pruned`);
	console.log(sequences_with_few_appearences.join(', '))


 	// get unaltered elements with enough occurences
	let shift_equal_cleaned = Object.keys(shift_equal)
									.filter( key => sequences_with_few_appearences.indexOf(key) < 0 )
									.reduce( (obj, key) => {
										obj[key] = shift_equal[key];
										return obj;
									}, {});

	const replacements = sequences_with_few_appearences.map( key => {
		const best_match = [].concat(...Object.values(shift_equal_cleaned))
							 .reduce( (best, curr) => {
								 	const current_distance = stringColorDistance(key, curr.string, reverse_color_map);
								 	if (best.value < current_distance || current_distance === 0) return best;
								 	return {value: current_distance, string: curr.string, key: curr.main_key, offset: curr.offset};
							 }, {value: Number.MAX_VALUE, string: '', key: ''});
		return {original_key: key, match: best_match}
	})
	.peekEach( val => {
		//console.log(`${val.key} can be replaced with ${val.match.string} (${val.match.value})`.red);
	})

	for (let replacement of replacements) {

		console.log(`adding all permutations of ${replacement.original_key} to ${replacement.match.key}`);
		let modified = shift_equal[replacement.original_key].map( sequence => {
			sequence.offset = (sequence.offset + replacement.match.offset) % replacement.match.key.length;
			sequence.original_main_key = sequence.main_key;
			sequence.main_key = replacement.match.key;
			return sequence;
		});
		shift_equal_cleaned[replacement.match.key] = shift_equal_cleaned[replacement.match.key].concat(modified);
	}

	return shift_equal_cleaned;

}

function stringDistance(a, b) {
	var distance = a.length;
	for (let i = 0; i < a.length; i++) {
		if (a.charAt(i) === b.charAt(i)) {
			distance--;
		}
	}
	return distance;
}

function stringColorDistance(a, b, reverse_color_map) {

	var distance = 0;
	for (let i = 0; i < a.length; i++) {
		let aChar = a.charAt(i)
		let bChar = b.charAt(i);
		let aColorHex = reverse_color_map[aChar];
		let bColorHex = reverse_color_map[bChar];

		let aColor = color_convert.toARGBObject(aColorHex);
		let bColor = color_convert.toARGBObject(bColorHex);

		let abDistance = color_distance.distance(aColor, bColor);

		//console.log(aChar, bChar, aColorHex, bColorHex, aColor, bColor, abDistance);

		distance += abDistance;
	}
	return distance;
}

function printStatsForSequenceCount(pixels) {
	// Print stats
	console.log(`creating stats`.gray);
	const stats = pixels
		.map(obj => obj.pixel_colors.join(''))
		.reduce( (stats, string) => {
			stats[string] = stats[string] || 0;
			stats[string]++;
			return stats;
		}, {});
	console.log('Counts of sequence:');
	Object.keys(stats).sort((a,b) => stats[a] - stats[b]).forEach(key => {
		console.log(key.yellow, stats[key]);
	});
}

function isSolidColor(colorString){
	let arr = colorString.split('').sort();
	return arr[0] == arr[arr.length -1 ];
}


// UNUSED
function findSubsequenceOffsetInSequence(subsequence, sequence){
	for (var i = 0; i <= sequence.length - subsequence.length; i++) {
		let found = true;
		for (var j = 0; j < subsequence.length; j++) {
			if (sequence[i + j] !== subsequence[j]) {
				found = false;
				break;
			}
		}
		if (found) return i;
	}
	throw new Error(`No sequence found for ${subsequence.join('')}`);
}

function colorizeSequenceFromOffsets(sequence, offsets, subsequence_length) {
	let hits = Array(sequence.length).fill(0);
	for (let offset of offsets) {
		for (let i = offset; i < offset + subsequence_length; i++) {
			hits[i] = 1;
		}
	}

	let output = '';
	for (let i = 0; i < sequence.length; i++) {
		if (hits[i]) {
			output += sequence[i].yellow.underline;
		} else {
			output += sequence[i].gray;
		}
	}
	return output;
}

function createSequenceImage(reverse_color_map, sequence, height) {
	const scale = 50;
	const width = sequence.length;
	var image = PNGImage.createImage(width * scale, height * scale);
	for (var x = 0; x < width * scale; x++) {
		const sequence_character = sequence[Math.floor(x / scale)];
		const argb = reverse_color_map[sequence_character];
		const abgr = color_convert.ARGBtoABGR(argb);

		//// note that the colors are backwards for pngjs ABGR
		//const red = hex_color & 0x000000FF;
		//const green = hex_color & 0x0000FF00 >> 8;
		//const blue = hex_color & 0x00FF0000 >> 16;
		//const color = { red, green, blue, alpha: 255 };
		for (var y = 0; y < height * scale; y++) {
			image.setAt(x, y, abgr);
		}
	}
	return image;
}



async function calculateDeBruijSequences(shift_equal, sorted_shift_equal) {
	console.log(`creating debruijn sequence`.gray);
	const sequence = Array.from(debruijn.sequence(alphabet, subsequence_length));

	console.log(`creating permutation map`.gray);
	const permutation_map = Object.keys(shift_equal)
		.reduce((stat, key) => {
			shift_equal[key].forEach( item => stat[item.string] = key);
			return stat;
		}, {});

	//calculate offsets
	console.log(`calcualating offsets`.gray);
	const offsets = pixels.map( obj => {
		const offset = findSubsequenceOffsetInSequence(obj.pixel_colors, sequence);
		obj.offset = offset;
		obj.xoffset = (offset + 0.5) / sequence.length;
		obj.yoffset = 0.5;
		return obj;
	});

	// Print permutation stats
	const perm_stats = pixels
		.map(obj => obj.pixel_colors.join(''))
		.reduce( (stats, string) => {
			const key = permutation_map[string];
			stats[key] = stats[key] || 0;
			stats[key]++;
			return stats;
		}, {});
	console.log(`Counts of permutation sequence (${Object.keys(perm_stats).length}):`);
	Object.keys(perm_stats).sort().forEach(key => {
		console.log(key.yellow, stats[key]);
	});

	// compute mapping (for x-y coords)
	//const mapping = Array(width).fill().map((_ , x) =>
	//	Array(height).fill().map((_, y) =>
	//		offsets[y * width + x]
	//	)
	//);
	console.log('de Bruijn Sequence:');
	const colorized = colorizeSequenceFromOffsets(sequence, offsets.map(obj => obj.offset), subsequence_length);
	console.log(colorized);
	console.log(`Alphabet with size ${alphabet.length} and sequence length ${subsequence_length} makes a ${sequence.length} character long de Bruijn sequence`.white);
	console.log(`Unique sequences: ${Object.keys(stats).length} worst case is: ${Math.pow(alphabet.length, subsequence_length)}`.white);

	let image = createSequenceImage(reverse_color_map, sequence, 5);
	await fs.writeFile('output/array-mappings.json', JSON.stringify(offsets, null, ' '), {encoding: 'utf8'});
	await writeImage(image, 'sequence.png');
}


async function writeImage(image, path) {
	return new Promise((resolve, reject) => {
		image.writeImage(path, function (err) {
    	if (err) return reject(err);
    	console.log(`saved ${path}`.yellow);
			resolve();
		});
	});
}


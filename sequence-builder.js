'use strict';

import entropy from 'binary-shannon-entropy';
import cliProgress from 'cli-progress';
const shannon_entropy = (string) => entropy(Buffer.from(string));
import * as color_convert from './color-convert.js';
import * as color_distance from './color-distance.js';
import * as debruijn from './debruijn.js';


export {
	build,
}

async function build(settings, pixels, color_map, frames) {

  const unduplicated_frames = frames / settings.input.duplicate_frames;

  if (settings.print.sequence_count) {
    printStatsForSequenceCount(pixels);  
  }

  const reverse_color_map = Object.keys(color_map)
    .reduce( (map, color) => {
      map[color_map[color]] = color;
      return map;
    }, {});

  if (settings.print.reverse_color_map) {
    console.log(`reverse color map ${Object.keys(reverse_color_map).length}`);
    Object.keys(reverse_color_map).forEach(key => console.log(key.yellow, color_convert.toHexString(reverse_color_map[key]).green))
  }  

  console.log(`Calculating De Briujn sequence`.gray);
  let alphabet = Object.keys(reverse_color_map).join('');
  let debruijnSequence = Array.from(debruijn.sequence(alphabet, 3)).join('');
  console.log(`De Briujn sequence of ${alphabet.yellow}: ${colorizeString(debruijnSequence, reverse_color_map)}`);
	

  var sequences = getSequences(pixels);

  if (settings.print.sequence_count) {
    console.log(`Original sequences: ${Object.keys(sequences).length}`.red);  
  }
  
  if (settings.optimization.reuse_permutations) {
    sequences = reuseLoopingPermutationSequences(sequences, unduplicated_frames);  
    if (settings.print.sequence_count) {
      console.log(`After reducing permutations: ${Object.keys(sequences).length}`.yellow);
    }
  }
	
	var sequence_keys = sortSequenceKeys(sequences, settings);

  if (settings.optimization.prune) {
    sequences = reduceNumberOfSequences(settings, sequences, reverse_color_map, settings.optimization.prune.max_sequences, unduplicated_frames);  
    sequence_keys = sortSequenceKeys(sequences, settings);

    if (settings.print.sequence_count) {
      console.log(`After reducing sequences: ${Object.keys(sequences).length}`.green);
    }
  }

  console.log(sequences)

  if (!!settings.optimization.shift_sequences) {
    for (let number of Object.keys(settings.optimization.shift_sequences)) {
      let key = sequence_keys[number];
      let offset = settings.optimization.shift_sequences[number];
      let new_main_key = shiftString(sequence_keys[number], offset);
      var new_sequences = sequences[key];


      
      for (let sequence of new_sequences) {
        console.log(sequence, offset)
        sequence.offset = (sequence.offset + offset) % unduplicated_frames;
        //sequence.string = shiftString(sequence.string, offset);
        sequence.main_key = new_main_key;
        console.log(sequence)
      }

      delete sequences[key];
      sequences[new_main_key] = new_sequences;
      sequence_keys[number] = new_main_key;

    }
  }
	
	
  if (settings.print.sequence_occurencies) {
    sequence_keys.forEach( (key, i) => {

      let entropy = shannon_entropy(key).toFixed(8).red;
      let subsequences = sequences[key].map(a => {
        let moved = a.original_main_key ? '*' : '';
        let shifted = shiftString(a.string, a.offset);
        let colored = colorizeString(shifted, reverse_color_map);
        return `\n   ${colored}  ${shifted} ${a.string} << ${a.offset}${moved} occurences: ${a.occurences}`
      }).join('')

      console.log(`${i.toString().padStart(2)}.${colorizeString(key, reverse_color_map)} ${key.yellow}(${entropy}) ${subsequences}`);
    });  
  }

  if (settings.print.number_of_pixels) {
	 console.log(`Number of pixels: ${pixels.length}`.green);
  }

  return {sequences, sequence_keys, reverse_color_map}
}

function reduceNumberOfSequences(settings, input_sequences, reverse_color_map, max_sequences, unduplicated_frames) {


  let sequences = Object.keys(input_sequences)
                         .map(key => {
                            let occurences = input_sequences[key].reduce( (t,n) => t+n.occurences, 0);
                            let permutations = input_sequences[key];
                            return {key, occurences, permutations}
                         }).
                         sort( (a,b) => b.occurences - a.occurences);

  console.log(`reduce number of sequneces to ${max_sequences} from ${sequences.length} using comparator ${settings.optimization.prune.comparator}`.gray);

  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  let iterations = (sequences.length - max_sequences);
  bar1.start(iterations, 0);

  while( sequences.length > max_sequences) {

    bar1.update(iterations - (sequences.length-max_sequences));

    let candidate = sequences.pop();

    // find closest
    let best_match = sequences.reduce( (best, curr) => {
      var permutation_key = candidate.key;

      var max_permutation_offset = settings.optimization.reuse_permutations ? permutation_key.length-1 : 1;

      for (let permutation_offset = 0; permutation_offset < max_permutation_offset; permutation_offset++) {
        // check all permutations
        permutation_key = shiftString(candidate.key, permutation_offset);

        //console.log(`shifting ${candidate.key} << ${permutation_offset}`, permutation_key);

        //stringDistance
        let current_distance;
        if (settings.optimization.prune.comparator == 'color_distance') {
          current_distance = stringColorDistance(curr.key, permutation_key, reverse_color_map);
        } else if (settings.optimization.prune.comparator == 'sequence_string_distance') {
          current_distance = stringDistance(curr.key, permutation_key, reverse_color_map);
        }

        if (current_distance < best.value) {
          best.value = current_distance;
          best.string = permutation_key;
          best.key = curr.key;
          best.offset = permutation_offset % unduplicated_frames;
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
        offset: (permutation.offset + best_match.offset) % permutation.string.length % unduplicated_frames,
        string: permutation.string,
        occurences: permutation.occurences,
      };

      sequences[index].permutations.push(new_permutation);  
    }

    sequences[index].occurences += candidate.occurences;

  }

  bar1.stop();

  var output = {}
  for (let sequence of sequences) {
    output[sequence.key] = sequence.permutations;
  }

  

  return output;

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


function reuseLoopingPermutationSequences(sequences, unduplicated_frames) {
  console.log(`finding bithsifts`.gray);
  return Object.values(sequences)
               .map(a => a[0]) // the sequences comes in in the same format they go out
               .reduce( (output, sequence) => {
      // check already check if it is the same
      for (let test of Object.keys(output)) {
        const key = test;
        let offset = 0;
        for (let i = 0; i < test.length; i++) {
          // shift
          test = test.charAt(test.length - 1) + test.substring(0, test.length - 1);
          offset++;

          // check if loop permutation found
          if (test === sequence.string) {
            output[key] = output[key] || [];

            let index = output[key].findIndex(a => a.string === sequence.string);

            if (index >= 0 ){
              // it already exist
              output[key][index].occurences += sequence.occurences;
            } else {
              // add a new permutation to the key
              output[key].push({string: sequence.string, 
                                offset: offset % unduplicated_frames , 
                                occurences: sequence.occurences, 
                                main_key: key});
            }
            return output;
          }
        }
      }
      // If we got here then this is a unique sequence that can't be looped and does not exist yet-
      output[sequence.string] = [{string: sequence.string, 
                                  offset: 0, 
                                  occurences: sequence.occurences, 
                                  main_key: sequence.string}];
      return output;
    }, {});
}

function sortSequenceKeys(sequences, settings) {
  if (settings.optimization.sort_sequnece.algo === 'shannon') {
    if (settings.optimization.sort_sequnece.acending) {
      return Object.keys(sequences).sort((a,b) => shannon_entropy(a) - shannon_entropy(b));      
    } else {
      return Object.keys(sequences).sort((a,b) => shannon_entropy(b) - shannon_entropy(a));  
    }
  } else {
    return Object.keys(sequences);
  }
}

function getSequences(pixels) {
  let sequences = pixels
            .map(obj => obj.pixel_colors.join(''))
            .reduce( (output, string)  => {
              if (output[string]) {
                output[string].occurences++;
              } else {
                output[string] = {string, offset: 0, occurences: 1, main_key: string};
              }
              return output;
            }, {});

  return Object.keys(sequences).reduce((output, key) => {
    output[key] = [sequences[key]];
    return output;
  },{});

}

function shiftString(string, steps) {
  return string.slice(steps, string.length) + string.slice(0, steps);
}

function printStatsForSequenceCount(pixels) {
  // Print stats
  const stats = pixels
    .map(obj => obj.pixel_colors.join(''))
    .reduce( (stats, string) => {
      stats[string] = stats[string] || 0;
      stats[string]++;
      return stats;
    }, {});
  console.log('Counts of sequence:');
  Object.keys(stats).sort((a,b) => stats[a] - stats[b]).forEach(key => {
    console.log(key.yellow, `${stats[key]}`.green);
  });
}

function colorizeString(string, reverse_color_map) {
  return string
  .split('')
  .map(char => reverse_color_map[char])
  .map(color => color_convert.toConsoleString(color, ' '))
  .join('');
}

function getColoredString(color) {
  var hex = parseInt(color, 16);
  let r = hex >> 16;
  let g = hex >> 8 & 0xff;
  let b = hex & 0xff;

  return "\x1B[48;2;"+r+";"+g+";"+b+"m" + ' ' + '\x1B[49m';
}



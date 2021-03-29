'use strict';

function* deBruijnSequence(alphabet, subsequence_length) {
  let lookup = Array(alphabet.length * subsequence_length).fill(0);
  const alphabet_lookup = alphabet.split('');

  for (const n of deBruijn(1,1, lookup, alphabet, subsequence_length)) {
    yield alphabet_lookup[n];
  }

  // append looping part
  for (let i = 0; i < subsequence_length - 1; i++) {
    yield alphabet_lookup[0];
  }
}

function* deBruijn(t, p, lookup, alphabet, subsequence_length) {
  if (t > subsequence_length) {
    if (subsequence_length % p === 0) {
      for (let i = 1; i <= p; i++) {
        yield lookup[i];
      }
    }
  } else {
    lookup[t] = lookup[t - p];
    yield * deBruijn(t + 1, p, lookup, alphabet, subsequence_length);
    for (let i = lookup[t - p] + 1; i < alphabet.length; i++) {
      lookup[t] = i;
      yield * deBruijn(t + 1, t, lookup, alphabet, subsequence_length);
    }
  }
}

module.exports = {
  sequence: deBruijnSequence,
}
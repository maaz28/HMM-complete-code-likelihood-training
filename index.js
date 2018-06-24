var hmm = require('./hidden-markov-model');

var hmm = hmm();
 
hmm.setInitialStateVector([0.99, 0.01]); // 1. Unique, 2. Common 
 
hmm.setTransitionMatrix([
    // A, B
    [0.99, 0.01], // A 
    [0.01, 0.99]  // B
]);

hmm.setEmissionMatrix([
    // O1, O2, O3 
    [0.8, 0.2, 0], // A 
    [0.1, 0.9, 0]  // B
]);

  var alpha = [];
  var beta = [];
  var gamma = [];
  var etta = [];
  var updatedTransitionMatrix = [];
  var updatedEmissionMatrix = [];
  var forwardProbability = hmm.forward([0, 1, 0], alpha);
  var backwardProbability = hmm.backward([0, 1, 0], beta);
  hmm.gamma([0, 1, 0] ,alpha, beta, gamma);
  hmm.etta([0, 1, 0] ,alpha, beta, etta);
  hmm.transitionMatrix([0, 1, 0], etta, updatedTransitionMatrix);
  hmm.emissionMatrix([0, 1, 0], gamma, updatedEmissionMatrix);
  console.log( "\nLikelihood (backward) of the observed sequence 0 1 0 :" , backwardProbability); // 0.125214707
  console.log( "Likelihood (forward) of the observed sequence 0 1 0 :" , forwardProbability); // 0.125214707

console.log('\nALPHA')
  console.log(alpha);
//   [ [ 0.792, 0.001 ],
//   [ 0.156818, 0.008019 ],
//   [ 0.12426400800000001, 0.0009506989999999999 ] ]

console.log('\nBETA')
  console.log(beta);
//   [ [ 0.157977, 0.09692300000000001 ],
//   [ 0.793, 0.10700000000000001 ],
//   [ 1, 1 ] ]

console.log('\nGAMMA')
  console.log(gamma);
  // [ [ 0.9992259455592545, 0.0007740544407455268 ],
  // [ 0.9931475062270442, 0.00685249377295592 ],
  // [ 0.9924074493901104, 0.007592550609889619 ] ]

console.log('\nEETA')
console.log(etta);
// [ t=1
//   [ [ 0.9931348399832938, 0.0060911055759608175 ],
//     [ 0.000012666243750424623, 0.0007613881969951022 ] ],
//   t=2
//   [ [ 0.9918951134070857, 0.0012523928199584416 ],
//     [ 0.0005123359830247416, 0.006340157789931178 ] ] 
// ]

console.log('\nUpdated Transition Matrix')
console.log(updatedTransitionMatrix);
// [ [ 0.9963141958203994, 0.0036858041796006226 ],
//   [ 0.06883877372360611, 0.931161226276394 ] ]

console.log('\nUpdated Emission Matrix')
console.log(updatedEmissionMatrix);
// [ [ 0.6672628447080959, 0.33273715529190406, 0 ],
//   [ 0.5497437888809884, 0.4502562111190116, 0 ] ]
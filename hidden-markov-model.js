(function (root) {
  'use strict';

  function HiddenMarkovModel() {
    if (!(this instanceof HiddenMarkovModel)) {
      return new HiddenMarkovModel();
    }

    this.initialStateVector = [];
    this.currentStateVector = [];
    this.transitionStateMatrix = [];
    this.emissionStateMatrix = [];
    this.iterationsCount = 0;
  }

  HiddenMarkovModel.prototype.setInitialStateVector = function (vector) {
    this.initialStateVector = vector;
    this.currentStateVector = vector;
  };

  HiddenMarkovModel.prototype.getInitialStateVector = function () {
    return this.initialStateVector;
  };

  HiddenMarkovModel.prototype.setTransitionMatrix = function (matrix) {
    this.transitionStateMatrix = matrix;
  };

  HiddenMarkovModel.prototype.getTransitionMatrix = function () {
    return this.transitionStateMatrix;
  };

  HiddenMarkovModel.prototype.setEmissionMatrix = function (matrix) {
    this.emissionStateMatrix = matrix;
  };

  HiddenMarkovModel.prototype.getEmissionMatrix = function () {
    return this.emissionStateMatrix;
  };

  // ***** ALPHA *****
  HiddenMarkovModel.prototype.forward = function (observedSequence, alpha) {
    alpha = alpha || [];
    var PI = this.initialStateVector;
    var A = this.transitionStateMatrix;
    var B = this.emissionStateMatrix;
    var O = observedSequence || [];
    var T = O.length;
    var N = A.length;
    var probability = 0;

    if (!Array.isArray(O)) {
      throw new TypeError('Emssion sequence must be an array');
    }

    if (!Array.isArray(alpha)) {
      throw new TypeError('Alpha must be an array');
    }

    if (!O.length) {
      return probability;
    }
    // Initialization
    for (var i = 0; i < N; i++) {
      alpha[i] = [];
      /*
       * alpha[0][0] = P(U|S) * P(Rej|U)
       * alpha[0][1] = P(C|S) * P(Rej|C)
       */
      alpha[0][i] = PI[i] * B[i][O[0]];
    }
    // Recursion
    for (var i = 1; i < T; i++) {
      alpha[i] = [];
      for (var j = 0; j < N; j++) {
        /*
         * ALPHA[1][0] = (alpha1(U) * P(U|U) * P(App|U)) + (alpha1(C) + P(U|C) * P(App|U))
         * ALPHA[1][1] = (alpha1(U) * P(C|C) * P(App|C)) + (alpha1(C) + P(C|C) * P(App|C))
         * 
         * ALPHA[2][0] = (alpha2(U) * P(U|U) * P(Acp|U)) + (alpha2(C) + P(U|C) * P(Acp|U))
         * ALPHA[2][1] = (alpha2(U) * P(C|U) * P(Acp|C)) + (alpha2(C) + P(C|C) * P(Acp|C))
         * 
         */
        var result = 0;
        for (var l = 0; l < N; l++) {
          result += alpha[i - 1][l] * A[l][j] * B[j][O[i]];
        }
        alpha[i][j] = result;
      }
    }
    // Termination
    /*
     * Probability = alpha3(U) + alpha3(C) 
     */
    for (var i = 0; i < N; i++) {
      probability += alpha[T - 1][i];
    }
    return probability;
  };

  // ***** GAMMA *****
  HiddenMarkovModel.prototype.gamma = function (observedSequence, alpha, beta, gamma) {
    gamma = gamma || [];
    var A = this.transitionStateMatrix;
    var B = this.emissionStateMatrix;
    var N = A.length;
    var O = observedSequence || [];
    var T = O.length;

    if (!Array.isArray(O)) {
      throw new TypeError('Emssion sequence must be an array');
    }

    if (!Array.isArray(alpha)) {
      throw new TypeError('Alpha must be an array');
    }

    if (!O.length) {
      return null;
    }
    // Recursion
    for (var t = 0; t < T; t++) {
      var sum = 0.0;
      gamma[t] = [];
      for (var i = 0; i < N; i++) {
        sum += alpha[t][i] * beta[t][i];
      }
      for (var j = 0; j < N; j++) {
        gamma[t][j] = alpha[t][j] * beta[t][j] / sum
      }
    }
  };

  // ***** transitionMatrix *****
  HiddenMarkovModel.prototype.transitionMatrix = function (observedSequence, etta, updatedTransitionMatrix) {
    updatedTransitionMatrix = updatedTransitionMatrix || [];
    var A = this.transitionStateMatrix;
    var B = this.emissionStateMatrix;
    var N = A.length;
    var O = observedSequence || [];
    var T = O.length;

    if (!Array.isArray(O)) {
      throw new TypeError('Emssion sequence must be an array');
    }

    if (!Array.isArray(updatedTransitionMatrix)) {
      throw new TypeError('Alpha must be an array');
    }

    if (!O.length) {
      return null;
    }
    for (var i = 0; i < N; i++) {
      updatedTransitionMatrix[i] = [];
      for (var j = 0; j < N; j++) {
        // Numerator
        var numerator = 0.0;
        for (var t = 0; t < T - 1; t++) {
          numerator += etta[t][i][j]
        }
        var denominator = 0.0;
        for (var t = 0; t < T - 1; t++) {
          for (var k = 0; k < N; k++) {
            denominator += etta[t][i][k]
          }
        }
        updatedTransitionMatrix[i][j] = numerator / denominator;
      }
    }
  };

   // ***** emissionMatrix *****
   HiddenMarkovModel.prototype.emissionMatrix = function (observedSequence, gamma, updatedEmissionMatrix) {
    updatedEmissionMatrix = updatedEmissionMatrix || [];
    var A = this.transitionStateMatrix;
    var B = this.emissionStateMatrix;
    var N = A.length;
    var O = observedSequence || [];
    var T = O.length;

    if (!Array.isArray(O)) {
      throw new TypeError('Emssion sequence must be an array');
    }

    if (!Array.isArray(updatedEmissionMatrix)) {
      throw new TypeError('Alpha must be an array');
    }

    if (!O.length) {
      return null;
    }
    var numerator = [];
    for (var j = 0; j < N; j++) {
      updatedEmissionMatrix[j] = [];
      var denominator = 0.0;
      // Numerator
      for(var i=0; i<T; i++){
        numerator[i] = 0; //Numerator Row wise array initialization
      }
      for (var t = 0; t < T; t++) {
          let obs = O[t];
          numerator[obs] += gamma[t][j];
          denominator += gamma[t][j];
        }
          for (var k = 0; k < T; k++) {
            updatedEmissionMatrix[j][k] = numerator[k] / denominator;
          }
      }
  };

  // ***** ETTA *****
  HiddenMarkovModel.prototype.etta = function (observedSequence, alpha, beta, etta) {
    etta = etta || [];
    var A = this.transitionStateMatrix;
    var B = this.emissionStateMatrix;
    var N = A.length;
    var O = observedSequence || [];
    var T = O.length;

    if (!Array.isArray(O)) {
      throw new TypeError('Emssion sequence must be an array');
    }

    if (!Array.isArray(alpha)) {
      throw new TypeError('Alpha must be an array');
    }

    if (!O.length) {
      return null;
    }
    // Recursion
    for (var t = 0; t < T - 1; t++) {
      var sum = 0.0;
      etta[t] = [];
      for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          // sum += alpha[t][i] * beta[t][j];
          // console.log(sum, 'sum')
          sum += alpha[t][i] * A[i][j] * B[j][O[t + 1]] * beta[t + 1][j];
        }
      }
      for (var i = 0; i < N; i++) {
        etta[t][i] = []
        for (var j = 0; j < N; j++) {
          etta[t][i][j] = alpha[t][i] * A[i][j] * B[j][O[t + 1]] * beta[t + 1][j] / sum
        }
      }
    }
  };

  // ***** BETA *****
  HiddenMarkovModel.prototype.backward = function (observedSequence, beta) {
    beta = beta || [];
    var PI = this.initialStateVector;
    var A = this.transitionStateMatrix;
    var B = this.emissionStateMatrix;
    var O = observedSequence || [];
    var T = O.length;
    var N = A.length;
    var probability = 0;

    if (!Array.isArray(O)) {
      throw new TypeError('Emssion sequence must be an array');
    }

    if (!Array.isArray(beta)) {
      throw new TypeError('beta must be an array');
    }

    if (!O.length) {
      return probability;
    }

    for (var row = 0; row < T; row++) {
      beta[row] = [];
    }
    // Initialization
    for (var i = 0; i < N; i++) {
      beta[T - 1][i] = 1;
    }
    // Recursion
    for (var time = T - 2; time >= 0; time--) {
      for (var column = 0; column < N; column++) {
        var result = 0;
        for (var l = 0; l < N; l++) {
          result += beta[time + 1][l] * A[column][l] * B[l][O[time + 1]];
        }
        beta[time][column] = result;
      }
    }
    // Termination
    for (var i = 0; i < N; i++) {
      probability += beta[0][i] * PI[i] * B[i][O[0]];
    }
    return probability;
  };
  


  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = HiddenMarkovModel;
    }
    exports.HiddenMarkovModel = HiddenMarkovModel;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return HiddenMarkovModel;
    });
  } else {
    root.HiddenMarkovModel = HiddenMarkovModel;
  }

})(this);
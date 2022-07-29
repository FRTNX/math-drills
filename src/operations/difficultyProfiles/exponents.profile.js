module.exports = {
    0: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2], // squares; the first exponent must always be 1, for all levels
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 7000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Square up!\n'
    },
    1: {
        numberOfTerms: [1, 2],
        factorRange: [1, 15],
        exponents: [1, 3], // + cubes
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 8000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Everything cubes.\n'
    },
    2: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2, 3, 0, -1, -2, -3], // + negatives and 0
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 15000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Sqaures, cubes, negatives, and zero as an exponent. Such fun.\n'
    },
    3: {
        numberOfTerms: [1, 2],
        factorRange: [1, 10], // multiplicands, including decimals
        exponents: [-9, 10], // range of powers of 10
        ops: ['multiplication', 'division'],
        override: 'SCIENTIFIC_NOTATION',
        obfuscation: ['none'],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Powers of 10 aka combat squads aka scientific notation.\n'
    },
    4: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 'fraction'],
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        indexRange: [-3, -2, -1, 1, 2, 3, 4], // required where 'fraction' is an exponent
        rootRange: [-3, -2, -1, 1, 2, 3, 4], // required where 'fraction' is an exponent
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Fractional exponents. As above, so not below. Power over roots. Roots before power.\n'
    },
    5: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2, 3, 0, -1, -2, -3, 'fraction'], // all together now
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        indexRange: [-3, -2, -1, 1, 2, 3, 4],
        rootRange: [-3, -2, -1, 1, 2, 3, 4],
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'The whole enchelada.\n'
    }
};

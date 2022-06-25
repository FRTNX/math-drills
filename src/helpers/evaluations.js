
// a heavy lifter function that will be responsible for custom evaluations
// for all question types. returns either false or the correct answer
const evaluateAnswer = (question, answer) => {
    if (question.question_type == 'prime_factorization') {
        const userAnswer = answer.user_answer.match(/\d+/g).map((prime) => Number(prime)).sort();
        const formattedCorrectAnswer = JSON.parse(question.correct_answer).join('\\cdot');

        if (JSON.stringify(userAnswer) !== question.correct_answer) {
            return { isCorrect: false, correctAnswer: formattedCorrectAnswer };
        }

        return { isCorrect: true, correctAnswer: formattedCorrectAnswer };
    }

    if (Number(answer.user_answer) !== Number(question.correct_answer)) {
        return { isCorrect: false, correctAnswer: question.correct_answer };
    }

    return { isCorrect: true, correctAnswer: question.correct_answer };
};

module.exports = {
    evaluateAnswer
};
export { };

const { config } = require('./../../config/config');

const errorHandler = require('./../helpers/db.error.handler');

import { IRequest, IResponse } from './controller.types';

const got = require('got');

const splitLines = (text: string, limit: number = 60): Array<string> => {
    let line: string = '';

    const lines: Array<string> = [];

    const wordsArray: Array<string> = text.split(' ');

    wordsArray.map((word, index) => {
        let newLine: string = `${line} ${word}`;
        const isLastWord: boolean = index === wordsArray.length - 1;
        if (newLine.length > limit || isLastWord) {
            isLastWord ? lines.push(newLine) : lines.push(line);
            line = word;
        }

        if (newLine.length <= limit) {
            line = newLine;
        }
    });

    return lines
}

const processTerminalInput = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId: string = request.query.user_id;

        const userInput: string = request.query.input;

        let result: Array<string> = ['DrillBot Unavailable'];

        const drillBotResponse = await got(`${config.drillBotServer}?text=${userInput}&&sessionId=${userId}`);
        console.log(drillBotResponse.body)

        result = splitLines(JSON.parse(drillBotResponse.body));

        return response.json({ lines: result });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

module.exports = {
    processTerminalInput
};

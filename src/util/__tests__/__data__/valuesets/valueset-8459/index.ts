import * as fs from 'fs';

export const Valueset = JSON.parse(fs.readFileSync(__dirname + '/valueset.json').toString());
export const GroupRepeatWithAnswer = JSON.parse(fs.readFileSync(__dirname + '/group-repeatable-answer.json').toString());
export const GroupRepeatWithNoAnswer = JSON.parse(fs.readFileSync(__dirname + '/group-repeatable.json').toString());

import process from 'node:process';
import {inspect} from 'node:util';
import {TimekeeperMessage} from './messages/index.ts';
import {LogMessage, type LogLevel} from './messages/log.ts';

function createLogger(level: LogLevel) {
	return (...items: unknown[]) => {
		process.send!(
			new TimekeeperMessage(
				new LogMessage(
					level,
					items.map((i) => (typeof i === 'string' ? i : inspect(i))),
				),
			),
		);
	};
}

export const output = {
	trace: createLogger('trace'),
	debug: createLogger('debug'),
	info: createLogger('info'),
	warn: createLogger('warn'),
	error: createLogger('error'),
};

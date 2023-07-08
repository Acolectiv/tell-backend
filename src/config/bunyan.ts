import { LogLevel } from "bunyan";

let getStreams = () => {
    return [{
        level: 'debug' as LogLevel,
        type: 'raw',
        stream: {
            write: (logEntry: any) => {
                const timestamp = new Date(logEntry.time).toISOString();
                const level = logEntry.level === 50 ? 'ERROR' : 'DEBUG'; // Simplified, you might want to handle other levels
                const message = `${timestamp} ${level}: [${logEntry.event}] ${logEntry.msg}`;

                console.log(message);
            }
        }
    }]
} 

export {getStreams};
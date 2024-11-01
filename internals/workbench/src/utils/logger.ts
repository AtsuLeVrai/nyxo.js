import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logType = ["info", "error", "debug", "warn"];
const logFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.splat(),
    format.colorize(),
    format.errors({ stack: true }),
    format.printf((info) => `${info.level}: ${info.message}`)
);

const filesRotateTransport: DailyRotateFile[] = [];
for (const type of logType) {
    filesRotateTransport.push(
        new DailyRotateFile({
            filename: `logs/application-%DATE%-${type}.log`,
            datePattern: "YYYY-MM-DD",
            level: type,
            maxSize: "20m",
            maxFiles: "14d",
        })
    );
}

export const logger = createLogger({
    level: "debug",
    format: logFormat,
    transports: [new transports.Console({ format: logFormat }), ...filesRotateTransport],
});

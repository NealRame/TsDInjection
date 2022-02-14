/* eslint-disable @typescript-eslint/no-use-before-define */
import {
    Container,
    Default,
    Inject,
    Service,
    ServiceLifecycle,
    Token,
} from "../src"

enum LogLevel {
    Error,
    Warning,
    Notice,
    Debug,
}

const loggerToken = new Token<Logger>("logger")
const loggerLevel = new Token<LogLevel>("logger.level")
const loggerFormat = new Token<string>("logger.format")

@Service({ lifecycle: ServiceLifecycle.Singleton })
class Logger {
    private formatMessage_(message: string, level: LogLevel)
        : string {
        const levels = ["ERROR", "WARNING", "NOTICE", "DEBUG"]
        const date = new Date()
        return this.format_
            .replace("%day", `${date.getDate()}`.padStart(2, "0"))
            .replace("%month", `${date.getMonth() + 1}`.padStart(2, "0"))
            .replace("%year", `${date.getFullYear()}`)
            .replace("%seconds", `${date.getSeconds()}`.padStart(2, "0"))
            .replace("%minutes", `${date.getMinutes()}`.padStart(2, "0"))
            .replace("%hours", `${date.getHours()}`.padStart(2, "0"))
            .replace("%message", message)
            .replace("%level", `${levels[level]}`)
            .replace("%%", "%")
    }

    constructor(
        @Inject(loggerFormat)
        @Default("%level[%day/%month/%year - %hours:%minutes:%seconds] %message")
        private format_: string,

        @Inject(loggerLevel)
        private level_: LogLevel,
    ) { }

    error(message: string)
        : this {
        console.error(this.formatMessage_(
            message,
            LogLevel.Error
        ))
        return this
    }

    warning(message: string)
        : this {
        if (this.level_ >= LogLevel.Warning) {
            console.warn(this.formatMessage_(
                message,
                LogLevel.Warning
            ))
        }
        return this
    }

    log(message: string)
        : void {
        if (this.level_ >= LogLevel.Notice) {
            console.log(this.formatMessage_(
                message,
                LogLevel.Notice
            ))
        }
    }

    debug(message: string)
        : void {
        if (this.level_ >= LogLevel.Debug) {
            console.log(this.formatMessage_(
                message,
                LogLevel.Debug
            ))
        }
    }
}

@Service({ lifecycle: ServiceLifecycle.Transient })
class Unit {
    constructor(
        @Default(3.14) private x_: number,
        @Default(1.41) private y_: number,
        @Inject(loggerToken) public logger: Logger,
    ) { }

    get position()
        : { x: number, y: number} {
        return {
            x: this.x_,
            y: this.y_,
        }
    }

    move(position: { x: number, y: number })
        : this {
        this.logger.debug(`unit: move (${this.x_}, ${this.y_}) => (${position.x}, ${position.y})`)
        this.x_ = position.x
        this.y_ = position.y
        return this
    }
}

class Building {
    private x_: number
    private y_: number

    constructor(
        @Inject(Logger) private logger_: Logger,
    ) {
        this.x_ = 0
        this.y_ = 0
    }

    repair()
        : void {
        this.logger_.debug(`building: repair (${this.x_}, ${this.y_})`)
    }
}

@Service({ lifecycle: ServiceLifecycle.Singleton })
class LandFactory {
    constructor(
        @Inject(loggerToken) private logger_: Logger
    ) { }

    create(): Land {
        this.logger_.debug("LandFactory create a new Land")
        return new Land(0, 0, this.logger_)
    }
}


@Service({
    factoryClass: LandFactory
})
class Land {
    constructor(
        private width_: number,
        private height_: number,
        private logger_: Logger,
    ) { }
}

const container = new Container()

container
    .set(loggerLevel, LogLevel.Debug)
    .set(loggerToken, Logger)

const logger = container.get(Logger)

logger.log("core: a core message")

const unit = container.get(Unit)
unit.move({ x: 1, y: 2 })
unit.move({ x: 2, y: 2 })
unit.move({ x: 3, y: 3 })

const building = container.get(Building)
building.repair()
building.repair()
building.repair()

const land = container.get(Land)

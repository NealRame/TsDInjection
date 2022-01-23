import {
    Container,
    Default,
    Inject,
    Service,
    ServiceLifecycle,
    Token,
} from "../src"

let loggerId = 0

const loggerToken = new Token<Logger>("logger")
const loggerFormat = new Token<string>("logger.format")

@Service({ lifecycle: ServiceLifecycle.Singleton })
class Logger {
    private id_: number
    constructor(
        @Inject(loggerFormat) private format_: string
    ) {
        this.id_ = ++loggerId
    }

    log(message: string)
        : void {
        const date = new Date()
        console.log(this.format_
            .replace("%D", `${date.getDate()}`.padStart(2, "0"))
            .replace("%M", `${date.getMonth() + 1}`.padStart(2, "0"))
            .replace("%Y", `${date.getFullYear()}`)
            .replace("%s", `${date.getSeconds()}`.padStart(2, "0"))
            .replace("%m", `${date.getMinutes()}`.padStart(2, "0"))
            .replace("%h", `${date.getHours()}`.padStart(2, "0"))
            .replace("%i", `${this.id_}`)
            .replace("%l", message)
            .replace("%%", "%")
        )
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
        this.logger.log(`unit: move (${this.x_}, ${this.y_}) => (${position.x}, ${position.y})`)
        this.x_ = position.x
        this.y_ = position.y
        return this
    }
}

const container = new Container()

container
    .set(loggerFormat, "LOG#%i[%D/%M/%Y - %h:%m:%s] %l")
    .set(loggerToken, Logger)

const unit = container.get(Unit)
unit.move({ x: 1, y: 2})

const logger = container.get(Logger)
logger.log("core: a message")

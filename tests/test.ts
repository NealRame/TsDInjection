import {
    Container,
    Default,
    Inject,
    Service,
    ServiceLifecycle,
    ServiceToken,
} from "../src"

let loggerId = 0
const loggerToken = new ServiceToken<Logger>("logger")

@Service({ lifecycle: ServiceLifecycle.Singleton })
class Logger {
    private id_: number
    constructor() {
        this.id_ = ++loggerId
    }
    log(message: string) {
        console.log(`[${this.id_}@${Date.now()}] ${message}`)
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

container.alias(loggerToken, Logger)

const unit = container.get(Unit)
unit.move({ x: 1, y: 2})

const logger = container.get(Logger)
logger.log("core: a message")

import {
    Container,
    Default,
    Inject,
    Service,
    ServiceLifecycle,
    Token,
} from "../src"

let loggerId = 0

@Service({ lifecycle: ServiceLifecycle.Singleton })
class Logger {
    public static token = new Token<Logger>("logger")
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
        @Inject(Logger.token) public logger: Logger,
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
const valueToken = new Token<number>("value")

container
    .set(Logger.token, Logger)
    .set(valueToken, 42)

const unit = container.get(Unit)
unit.move({ x: 1, y: 2})

const logger = container.get(Logger)
logger.log("core: a message")

logger.log(`value: ${container.get(valueToken)}`)
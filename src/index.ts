import "reflect-metadata"

import { isNil } from "lodash"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

type ServiceInjectionParametersMap = Map<number, TConstructor>
type ServiceDefaultParametersMap = Map<number, unknown>

enum ServiceLifecycle {
    Singleton,
    Transient,
}

const ServiceLifecyclePropertyKey = Symbol("service:lifecycle")
const ServiceDefaultKey = Symbol("service:default")
const ServiceInjectKey = Symbol("service:inject")

/******************************************************************************
 * Decorators
 *****************************************************************************/

function Service(lifecycle: ServiceLifecycle)
    : ClassDecorator {
    return Reflect.metadata(ServiceLifecyclePropertyKey, lifecycle)
}

function getServiceInjectionParameterMap(service: TConstructor):
    ServiceInjectionParametersMap {
    if (!Reflect.hasMetadata(ServiceInjectKey, service)) {
        Reflect.defineMetadata(ServiceInjectKey, new Map(), service)
    }
    return Reflect.getMetadata(ServiceInjectKey, service)
}

function getServiceDefaultParameterMap(service: TConstructor):
    ServiceDefaultParametersMap {
    if (!Reflect.hasMetadata(ServiceDefaultKey, service)) {
        Reflect.defineMetadata(ServiceDefaultKey, new Map(), service)
    }
    return Reflect.getMetadata(ServiceDefaultKey, service)
}

function Inject(service: TConstructor)
    : ParameterDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, _: any, parameterIndex: number) => {
        const paramsMap = getServiceInjectionParameterMap(target)
        paramsMap.set(parameterIndex, service)
    }
}

function Default(value: unknown)
    : ParameterDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, _: any, parameterIndex: number) => {
        const paramsMap = getServiceDefaultParameterMap(target)
        paramsMap.set(parameterIndex, value)
    }
}

/******************************************************************************
 * Container
 *****************************************************************************/

class Container {
    private singletons_ = new WeakMap<TConstructor, unknown>()

    private injectTransient_(service: TConstructor, args: Array<unknown>) {
        return Reflect.construct(service, args)
    }

    private injectSingleton_(service: TConstructor, args: Array<unknown>) {
        if (!this.singletons_.has(service)) {
            this.singletons_.set(service, this.injectTransient_(service, args))
        }
        return this.singletons_.get(service)
    }

    private getServiceLifecyle_(service: TConstructor)
        : ServiceLifecycle {
        const lifecycle = Reflect.getMetadata(ServiceLifecyclePropertyKey, service)
        if (isNil(lifecycle)) {
            throw new Error("Unknown service.")
        }
        return lifecycle
    }

    private injectServiceParameters_(service: TConstructor) {
        const parametersMeta = Reflect.getMetadata("design:paramtypes", service)
        const injectedParamsMap = getServiceInjectionParameterMap(service)
        const defaultParamsMap = getServiceDefaultParameterMap(service)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (parametersMeta ?? []).map((type: any, index: number) => {
            if (injectedParamsMap.has(index)) {
                return this.get(injectedParamsMap.get(index) as TConstructor)
            }
            if (defaultParamsMap.has(index)) {
                return defaultParamsMap.get(index)
            }
            return type()
        })
    }

    get<T>(service: TConstructor<T>)
        : T {
        const lifecycle = this.getServiceLifecyle_(service)
        const params = this.injectServiceParameters_(service)
        return (lifecycle === ServiceLifecycle.Singleton
            ? this.injectSingleton_(service, params)
            : this.injectTransient_(service, params)) as T
    }
}

/******************************************************************************
 * App
 *****************************************************************************/

let loggerId = 0

@Service(ServiceLifecycle.Singleton)
class Logger {
    private id_: number
    constructor() {
        this.id_ = ++loggerId
    }
    log(message: string) {
        console.log(`[${this.id_}@${Date.now()}] ${message}`)
    }
}

@Service(ServiceLifecycle.Transient)
class Unit {
    constructor(
        @Default(3.14) private x_: number,
        @Default(1.41) private y_: number,
        @Inject(Logger) public logger: Logger,
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

const unit = container.get(Unit)
unit.move({ x: 1, y: 2})

const logger = container.get(Logger)
logger.log("core: a message")

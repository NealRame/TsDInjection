import "reflect-metadata"

import {
    ServiceMetadataKey,
} from "./constants"

import {
    ServiceIdentifier,
    ServiceLifecycle,
    ServiceMetadata,
} from "./types"

import {
    getServiceDefaultParameterMap,
    getServiceInjectionParameterMap,
} from "./utils"

export function Service(metadata?: Partial<ServiceMetadata>)
    : ClassDecorator {
    return Reflect.metadata(
        ServiceMetadataKey,
        Object.assign({
            lifecycle: ServiceLifecycle.Transient
        }, metadata)
    )
}

export function Inject(service: ServiceIdentifier)
    : ParameterDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, _: any, parameterIndex: number) => {
        const paramsMap = getServiceInjectionParameterMap(target)
        paramsMap.set(parameterIndex, service)
    }
}

export function Default(value: boolean | number | string | symbol)
    : ParameterDecorator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, _: any, parameterIndex: number) => {
        const paramsMap = getServiceDefaultParameterMap(target)
        paramsMap.set(parameterIndex, value)
    }
}

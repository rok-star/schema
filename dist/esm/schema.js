export const isPrototypeOf = (value, proto) => {
    if (!value || !proto)
        return false;
    let next = value.__proto__;
    while (next && next !== Object) {
        if (next === proto)
            return true;
        next = next.__proto__;
    }
    return false;
};
export const isPromise = (value) => (toString.call(value) === '[object Promise]');
export const isObject = (value) => (toString.call(value) === '[object Object]');
export const isArray = (value) => Array.isArray(value);
export const isFunction = (value) => ((toString.call(value) === '[object Function]') || (toString.call(value) === '[object AsyncFunction]'));
export const isString = (value) => (toString.call(value) === '[object String]');
export const isNumber = (value) => ((toString.call(value) === '[object Number]') && Number.isFinite(value.valueOf()) && (value !== Number.POSITIVE_INFINITY) && (value !== Number.NEGATIVE_INFINITY));
export const isInteger = (value) => (isNumber(value) && Number.isInteger(value.valueOf()));
export const isDate = (value) => (toString.call(value) === '[object Date]');
export const isBool = (value) => (toString.call(value) === '[object Boolean]');
export const isSet = (value) => (value !== null && value !== undefined);
export const isNotSet = (value) => (value === null || value === undefined);
export const isEmpty = (value) => (value === null || value === undefined || value === '');
export const isNonEmpty = (value) => (isString(value) && value !== '');
export const ifNotSet = (value, value2) => isSet(value) ? value : value2;
export const ifEmpty = (value, value2) => isNonEmpty(value) ? value : value2;
export const isCyclic = (value) => {
    // This is the only right approach as the whole thing is eventually about serializing data to JSON back and forth...
    try {
        JSON.stringify(value);
        return false;
    }
    catch (e) {
        return true;
    }
};
export const isDeepEqual = (value, value2) => {
    if (value === value2) {
        return true;
    }
    if (isCyclic(value)) {
        return false;
    }
    if (isCyclic(value2)) {
        return false;
    }
    const proc = (value, value2) => {
        if (value === value2) {
            return true;
        }
        if ((value === undefined)
            || (value === null)) {
            return false;
        }
        else if (isObject(value)) {
            if (isObject(value2)) {
                const ents = Object.entries(value);
                const ents2 = Object.entries(value2);
                if (ents.length === ents2.length) {
                    for (let i = 0; i < ents.length; i++) {
                        const [prop, val] = ents[i];
                        const [prop2, val2] = ents2[i];
                        if (prop !== prop2) {
                            return false;
                        }
                        if (proc(val, val2) === false) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else if (isArray(value)) {
            if (isArray(value2)) {
                if (value.length === value2.length) {
                    for (let i = 0; i < value.length; i++) {
                        if (proc(value[i], value2[i]) === false) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return (value === value2);
        }
    };
    return proc(value, value2);
};
export const validate = (value, schema, options) => {
    const proc = (obj, prop, schema, path) => {
        var _a, _b;
        if ((obj[prop] !== null) && (obj[prop] !== undefined)) {
            let ret = [];
            if (schema.type === 'string') {
                if (isString(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop] === '')) {
                        ret = [...ret, { path, message: 'empty string is not allowed' }];
                    }
                    if (isSet(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [...ret, { path, message: `string length is less than ${schema.minLength}` }];
                    }
                    if (isSet(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [...ret, { path, message: `string length is greater than ${schema.maxLength}` }];
                    }
                    if (isSet(schema.matches) && !schema.matches.test(obj[prop])) {
                        ret = [...ret, { path, message: `string does not match regexp "${schema.matches.toString()}"` }];
                    }
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a string' }];
                }
            }
            else if ((schema.type === 'number') || schema.type === 'integer') {
                const name = ((schema.type === 'number') ? 'a number' : 'an integer');
                const isType = ((schema.type === 'number') ? isNumber : isInteger);
                if (isType(obj[prop])) {
                    if (isSet(schema.minValue) && (obj[prop] < schema.minValue)) {
                        ret = [...ret, { path, message: `value is less than ${schema.minValue}` }];
                    }
                    if (isSet(schema.maxValue) && (obj[prop] > schema.maxValue)) {
                        ret = [...ret, { path, message: `value is greater than ${schema.maxValue}` }];
                    }
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not ' + name }];
                }
            }
            else if (schema.type === 'object') {
                if (isObject(obj[prop])) {
                    const objProps = Object.entries(obj[prop]);
                    const schProps = Object.entries((_a = schema.props) !== null && _a !== void 0 ? _a : {});
                    const arbitrary = (_b = schema.arbitrary) !== null && _b !== void 0 ? _b : (isSet(schema.props) === false);
                    for (const [propName, propSchema] of schProps) {
                        ret = [...ret, ...proc(obj[prop], propName, propSchema, `${path}.${propName}`)];
                    }
                    if (arbitrary === false) {
                        for (const [propName] of objProps) {
                            if (schProps.some(([pn]) => pn === propName)) {
                                continue;
                            }
                            else {
                                ret = [...ret, { path, message: `arbitrary property "${propName}" is not allowed` }];
                            }
                        }
                    }
                    if (isSet(schema.entry)) {
                        for (const [propName] of objProps) {
                            ret = [...ret, ...proc(obj[prop], propName, schema.entry, `${path}.${propName}`)];
                        }
                    }
                    if (isSet(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected object` }];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected objects` }];
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not an object' }];
                }
            }
            else if (schema.type === 'tuple') {
                if (isArray(obj[prop])) {
                    if (isSet(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected tuples` }];
                    }
                    if (isSet(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected tuple` }];
                    }
                    if (obj[prop].length !== schema.items.length) {
                        ret = [...ret, { path, message: 'wrong number of items in tuple' }];
                    }
                    for (let i = 0; i < schema.items.length; i++) {
                        ret = [...ret, ...proc(obj[prop], i, schema.items[i], `${path}[${i}]`)];
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a tuple' }];
                }
            }
            else if (schema.type === 'array') {
                if (isArray(obj[prop])) {
                    if ((schema.allowEmpty !== true) && (obj[prop].length === 0)) {
                        ret = [...ret, { path, message: 'empty array is not allowed' }];
                    }
                    if (isSet(schema.minLength) && (obj[prop].length < schema.minLength)) {
                        ret = [...ret, { path, message: `array length is less than ${schema.minLength}` }];
                    }
                    if (isSet(schema.maxLength) && (obj[prop].length > schema.maxLength)) {
                        ret = [...ret, { path, message: `array length is greater than ${schema.maxLength}` }];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.some(i => isDeepEqual(i, obj[prop]))) {
                        ret = [...ret, { path, message: `value is not one of expected arrays` }];
                    }
                    if (isSet(schema.equal) && !isDeepEqual(schema.equal, obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to expected array` }];
                    }
                    if (isSet(schema.item)) {
                        for (let i = 0; i < obj[prop].length; i++) {
                            ret = [...ret, ...proc(obj[prop], i, schema.item, `${path}[${i}]`)];
                        }
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not an array' }];
                }
            }
            else if (schema.type === 'boolean') {
                if (isBool(obj[prop])) {
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a boolean' }];
                }
            }
            else if (schema.type === 'function') {
                if (isFunction(obj[prop])) {
                    if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                        ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                    }
                    if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                        ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                    }
                    if (isSet(schema.validate)) {
                        ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                    }
                }
                else {
                    ret = [{ path, message: 'value is not a function' }];
                }
            }
            else if (schema.type === 'any') {
                if (isSet(schema.equal) && (schema.equal !== obj[prop])) {
                    ret = [...ret, { path, message: `value is not equal to ${schema.equal}` }];
                }
                if (isSet(schema.oneOf) && !schema.oneOf.includes(obj[prop])) {
                    ret = [...ret, { path, message: `value is not one of [${schema.oneOf.join(', ')}]` }];
                }
                if (isSet(schema.validate)) {
                    ret = [...ret, ...schema.validate(obj[prop]).map(i => (Object.assign(Object.assign({}, i), { path: (isNonEmpty(path) ? `${path}.${i.path}` : i.path) })))];
                }
            }
            return ret;
        }
        else {
            if (obj[prop] === null) {
                if (schema.nullable === true) {
                    return [];
                }
                else {
                    return [{ path, message: 'value can\'t be null' }];
                }
            }
            else if (obj[prop] === undefined) {
                if ((schema.optional === true)
                    || ((options === null || options === void 0 ? void 0 : options.partial) === true)) {
                    return [];
                }
                else {
                    if (schema.fallback && ((options === null || options === void 0 ? void 0 : options.fallback) === true)) {
                        obj[prop] = schema.fallback;
                        return proc(obj, prop, schema, path);
                    }
                    else {
                        return [{ path, message: 'value can\'t be undefined' }];
                    }
                }
            }
            return [];
        }
    };
    return proc({ root: value }, 'root', schema, '');
};
export const compare = (src, dst, schema, options) => {
    const proc = (src, dst, schema) => {
        var _a;
        if ((schema.type === 'string')
            || (schema.type === 'number')
            || (schema.type === 'integer')
            || (schema.type === 'boolean')
            || (schema.type === 'function')
            || (schema.type === 'any')) {
            if (src === dst) {
                return undefined;
            }
            else if (src === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                    return {
                        type: schema.type,
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                    };
                }
                else {
                    return undefined;
                }
            }
            else if (dst === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                    return {
                        type: schema.type,
                        schema: schema,
                        action: 'unset',
                        oldValue: src,
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                return {
                    type: schema.type,
                    schema: schema,
                    action: 'modify',
                    oldValue: src,
                    newValue: dst
                };
            }
        }
        else if (schema.type === 'object') {
            const diffs = {};
            const srcObj = (src !== null && src !== void 0 ? src : {});
            const dstObj = (dst !== null && dst !== void 0 ? dst : {});
            for (const [propName, propSchema] of Object.entries((_a = schema.props) !== null && _a !== void 0 ? _a : {})) {
                const diff = proc(srcObj[propName], dstObj[propName], propSchema);
                if (isSet(diff)) {
                    diffs[propName] = diff;
                }
            }
            if (src === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                        props: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else if (dst === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'unset',
                        oldValue: src,
                        props: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                if (Object.keys(diffs).length > 0) {
                    return {
                        type: 'object',
                        schema: schema,
                        action: 'modify',
                        oldValue: src,
                        newValue: dst,
                        props: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        else if (schema.type === 'tuple') {
            const diffs = [];
            const srcTpl = (src !== null && src !== void 0 ? src : []);
            const dstTpl = (dst !== null && dst !== void 0 ? dst : []);
            for (let i = 0; i < schema.items.length; i++) {
                diffs.push(proc(srcTpl[i], dstTpl[i], schema.items[i]));
            }
            if (src === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'add',
                        newValue: dst,
                        items: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else if (dst === undefined) {
                if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'unset',
                        oldValue: src,
                        items: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
            else {
                if (Object.keys(diffs).length > 0) {
                    return {
                        type: 'tuple',
                        schema: schema,
                        action: 'modify',
                        oldValue: src,
                        newValue: dst,
                        items: diffs
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        else if (schema.type === 'array') {
            const diffs = [];
            const srcArr = (src !== null && src !== void 0 ? src : []);
            const dstArr = (dst !== null && dst !== void 0 ? dst : []);
            if (isSet(schema.item)) {
                if ((schema.item.type === 'string')
                    || (schema.item.type === 'number')
                    || (schema.item.type === 'integer')
                    || (schema.item.type === 'boolean')
                    || (schema.item.type === 'function')
                    || (schema.item.type === 'any')) {
                    for (const srcItem of srcArr) {
                        if (!dstArr.some((i) => i === srcItem)) {
                            diffs.push({
                                type: schema.item.type,
                                schema: schema.item,
                                action: 'unset',
                                oldValue: srcItem
                            });
                        }
                    }
                    for (const dstItem of dstArr) {
                        if (!srcArr.some((i) => i === dstItem)) {
                            diffs.push({
                                type: schema.item.type,
                                schema: schema.item,
                                action: 'add',
                                newValue: dstItem
                            });
                        }
                    }
                }
                else if (schema.item.type === 'object') {
                    if (isSet(schema.key)) {
                        const __key = schema.key;
                        for (const srcItem of srcArr) {
                            const dstItem = dstArr.find((i) => i[__key] === srcItem[__key]);
                            const diff = proc(srcItem, dstItem, schema.item);
                            if (isSet(diff)) {
                                diffs.push(diff);
                            }
                        }
                        for (const dstItem of dstArr) {
                            if (!srcArr.some((i) => i[__key] === dstItem[__key])) {
                                const diff = proc(undefined, dstItem, schema.item);
                                if (isSet(diff)) {
                                    diffs.push(diff);
                                }
                            }
                        }
                    }
                    else {
                        const max = Math.max(srcArr.length, dstArr.length);
                        for (let i = 0; i < max; i++) {
                            const diff = proc(srcArr[i], dstArr[i], schema.item);
                            if (isSet(diff)) {
                                diffs.push(diff);
                            }
                        }
                    }
                }
                else if (schema.item.type === 'array') {
                    const max = Math.max(srcArr.length, dstArr.length);
                    for (let i = 0; i < max; i++) {
                        const diff = proc(srcArr[i], dstArr[i], schema.item);
                        if (isSet(diff)) {
                            diffs.push(diff);
                        }
                    }
                }
                if (diffs.length > 0) {
                    if (src === undefined) {
                        if ((options === null || options === void 0 ? void 0 : options.srcPartial) !== true) {
                            return {
                                type: schema.type,
                                schema: schema,
                                action: 'add',
                                newValue: dst,
                                items: diffs
                            };
                        }
                        else {
                            return undefined;
                        }
                    }
                    else if (dst === undefined) {
                        if ((options === null || options === void 0 ? void 0 : options.dstPartial) !== true) {
                            return {
                                type: schema.type,
                                schema: schema,
                                action: 'unset',
                                oldValue: src,
                                items: diffs
                            };
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return {
                            type: schema.type,
                            schema: schema,
                            action: 'modify',
                            oldValue: src,
                            newValue: dst,
                            items: diffs
                        };
                    }
                }
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    };
    return proc(src, dst, schema);
};
export const assert = (value, schema, options) => {
    const value_ = ((value === undefined) ? ((options === null || options === void 0 ? void 0 : options.fallback) === true ? schema.fallback : undefined) : value);
    const issues = validate(value_, schema, options);
    if (issues.length > 0) {
        throw new Error(`${(options === null || options === void 0 ? void 0 : options.description) ? `${options.description} ` : ''}assertion failed: ${issues.map(({ path, message }) => `${path.length > 0 ? `${path}: ` : ''}${message}`).join(', ')}`);
    }
    else {
        return value_;
    }
};
export const INTEGER_RGEXP = /^-?\d+$/;
export const NUMBER_REGEXP = /^-?\d*(\.\d+)?$/;
export const POSITIVE_INTEGER_RGEXP = /^\d+$/;
export const POSITIVE_NUMBER_REGEXP = /^\d*(\.\d+)?$/;
export const NEGATIVE_INTEGER_RGEXP = /^-\d+$/;
export const NEGATIVE_NUMBER_REGEXP = /^-\d*(\.\d+)?$/;
export const ISO_DATE_REGEXP = /^\d{4}-(([0][0-9])|([1][012]))-(([012][1-9])|([3][01]))$/;
export const ISO_DATE_HHMM_REGEXP = /^\d{4}-(([0][0-9])|([1][012]))-(([012][0-9])|([3][01]))(T|\ )(([01][0-9])|([2][0-3]))\:[0-5][0-9]$/;
export const ISO_DATE_HHMMSS_REGEXP = /^\d{4}-(([0][0-9])|([1][012]))-(([012][0-9])|([3][01]))(T|\ )(([01][0-9])|([2][0-3]))\:[0-5][0-9]\:[0-5][0-9]$/;
export const DATETIME_REGEXP = /^[+-]?\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d?(:[0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?$/;
export const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const URL_REGEXP = /^(?:http|https):\/\/[A-Za-z0-9\-]{0,63}(\.[A-Za-z0-9\-]{0,63})+(:\d{1,4})?\/*(\/*[A-Za-z0-9\-._]+\/*)*(\?.*)?(#.*)?$/;
export const IPV4_REGEXP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
export const IPV6_REGEXP = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
export const SLUG_REGEXP = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const NAME_REGEXP = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
export const PATH_REGEXP = /^((\/|\\|\/\/)?[a-z0-9 _@\-^!#$%&+={}.\/\\\[\]]+)+(\.[a-z]+)?$/;
export const UNIX_PATH_REGEXP = /^((\/)?[a-z0-9 _@\-^!#$%&+={}.\/]+)+(\.[a-z]+)?$/;
export const WIN32_PATH_REGEXP = /^((\\|\\\\)?[a-z0-9 _@\-^!#$%&+={}.\\\[\]]+)+(\.[a-z]+)?$/;
export const USERNAME_REGEXP = /^[a-z0-9_-]{3,16}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long...
export const COMPLEX_PASSWORD_REGEXP = /^(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long...
export const MODERATE_PASSWORD_REGEXP = /^(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;

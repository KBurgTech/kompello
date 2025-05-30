/* tslint:disable */
/* eslint-disable */
/**
 * django-allauth: Headless API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1
 * Contact: info@allauth.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { ProviderTokenToken } from './ProviderTokenToken';
import {
    ProviderTokenTokenFromJSON,
    ProviderTokenTokenFromJSONTyped,
    ProviderTokenTokenToJSON,
    ProviderTokenTokenToJSONTyped,
} from './ProviderTokenToken';
import type { Process } from './Process';
import {
    ProcessFromJSON,
    ProcessFromJSONTyped,
    ProcessToJSON,
    ProcessToJSONTyped,
} from './Process';

/**
 * 
 * @export
 * @interface ProviderToken
 */
export interface ProviderToken {
    /**
     * The provider ID.
     * 
     * @type {string}
     * @memberof ProviderToken
     */
    provider: string;
    /**
     * 
     * @type {Process}
     * @memberof ProviderToken
     */
    process: Process;
    /**
     * 
     * @type {ProviderTokenToken}
     * @memberof ProviderToken
     */
    token: ProviderTokenToken;
}



/**
 * Check if a given object implements the ProviderToken interface.
 */
export function instanceOfProviderToken(value: object): value is ProviderToken {
    if (!('provider' in value) || value['provider'] === undefined) return false;
    if (!('process' in value) || value['process'] === undefined) return false;
    if (!('token' in value) || value['token'] === undefined) return false;
    return true;
}

export function ProviderTokenFromJSON(json: any): ProviderToken {
    return ProviderTokenFromJSONTyped(json, false);
}

export function ProviderTokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): ProviderToken {
    if (json == null) {
        return json;
    }
    return {
        
        'provider': json['provider'],
        'process': ProcessFromJSON(json['process']),
        'token': ProviderTokenTokenFromJSON(json['token']),
    };
}

export function ProviderTokenToJSON(json: any): ProviderToken {
    return ProviderTokenToJSONTyped(json, false);
}

export function ProviderTokenToJSONTyped(value?: ProviderToken | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'provider': value['provider'],
        'process': ProcessToJSON(value['process']),
        'token': ProviderTokenTokenToJSON(value['token']),
    };
}


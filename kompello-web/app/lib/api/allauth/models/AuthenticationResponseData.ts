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
import type { Flow } from './Flow';
import {
    FlowFromJSON,
    FlowFromJSONTyped,
    FlowToJSON,
    FlowToJSONTyped,
} from './Flow';

/**
 * 
 * @export
 * @interface AuthenticationResponseData
 */
export interface AuthenticationResponseData {
    /**
     * 
     * @type {Array<Flow>}
     * @memberof AuthenticationResponseData
     */
    flows: Array<Flow>;
}

/**
 * Check if a given object implements the AuthenticationResponseData interface.
 */
export function instanceOfAuthenticationResponseData(value: object): value is AuthenticationResponseData {
    if (!('flows' in value) || value['flows'] === undefined) return false;
    return true;
}

export function AuthenticationResponseDataFromJSON(json: any): AuthenticationResponseData {
    return AuthenticationResponseDataFromJSONTyped(json, false);
}

export function AuthenticationResponseDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthenticationResponseData {
    if (json == null) {
        return json;
    }
    return {
        
        'flows': ((json['flows'] as Array<any>).map(FlowFromJSON)),
    };
}

export function AuthenticationResponseDataToJSON(json: any): AuthenticationResponseData {
    return AuthenticationResponseDataToJSONTyped(json, false);
}

export function AuthenticationResponseDataToJSONTyped(value?: AuthenticationResponseData | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'flows': ((value['flows'] as Array<any>).map(FlowToJSON)),
    };
}


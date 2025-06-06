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
import type { AuthenticationResponseData } from './AuthenticationResponseData';
import {
    AuthenticationResponseDataFromJSON,
    AuthenticationResponseDataFromJSONTyped,
    AuthenticationResponseDataToJSON,
    AuthenticationResponseDataToJSONTyped,
} from './AuthenticationResponseData';
import type { AuthenticationMeta } from './AuthenticationMeta';
import {
    AuthenticationMetaFromJSON,
    AuthenticationMetaFromJSONTyped,
    AuthenticationMetaToJSON,
    AuthenticationMetaToJSONTyped,
} from './AuthenticationMeta';

/**
 * An authentication related response.
 * 
 * @export
 * @interface AuthenticationResponse
 */
export interface AuthenticationResponse {
    /**
     * 
     * @type {number}
     * @memberof AuthenticationResponse
     */
    status: AuthenticationResponseStatusEnum;
    /**
     * 
     * @type {AuthenticationResponseData}
     * @memberof AuthenticationResponse
     */
    data: AuthenticationResponseData;
    /**
     * 
     * @type {AuthenticationMeta}
     * @memberof AuthenticationResponse
     */
    meta: AuthenticationMeta;
}


/**
 * @export
 */
export const AuthenticationResponseStatusEnum = {
    NUMBER_401: 401
} as const;
export type AuthenticationResponseStatusEnum = typeof AuthenticationResponseStatusEnum[keyof typeof AuthenticationResponseStatusEnum];


/**
 * Check if a given object implements the AuthenticationResponse interface.
 */
export function instanceOfAuthenticationResponse(value: object): value is AuthenticationResponse {
    if (!('status' in value) || value['status'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    if (!('meta' in value) || value['meta'] === undefined) return false;
    return true;
}

export function AuthenticationResponseFromJSON(json: any): AuthenticationResponse {
    return AuthenticationResponseFromJSONTyped(json, false);
}

export function AuthenticationResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthenticationResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'status': json['status'],
        'data': AuthenticationResponseDataFromJSON(json['data']),
        'meta': AuthenticationMetaFromJSON(json['meta']),
    };
}

export function AuthenticationResponseToJSON(json: any): AuthenticationResponse {
    return AuthenticationResponseToJSONTyped(json, false);
}

export function AuthenticationResponseToJSONTyped(value?: AuthenticationResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'status': value['status'],
        'data': AuthenticationResponseDataToJSON(value['data']),
        'meta': AuthenticationMetaToJSON(value['meta']),
    };
}


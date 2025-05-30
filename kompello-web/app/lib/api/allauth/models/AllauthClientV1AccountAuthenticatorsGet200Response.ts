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
import type { AuthenticatorListInner } from './AuthenticatorListInner';
import {
    AuthenticatorListInnerFromJSON,
    AuthenticatorListInnerFromJSONTyped,
    AuthenticatorListInnerToJSON,
    AuthenticatorListInnerToJSONTyped,
} from './AuthenticatorListInner';
import type { StatusOK } from './StatusOK';
import {
    StatusOKFromJSON,
    StatusOKFromJSONTyped,
    StatusOKToJSON,
    StatusOKToJSONTyped,
} from './StatusOK';

/**
 * 
 * @export
 * @interface AllauthClientV1AccountAuthenticatorsGet200Response
 */
export interface AllauthClientV1AccountAuthenticatorsGet200Response {
    /**
     * 
     * @type {StatusOK}
     * @memberof AllauthClientV1AccountAuthenticatorsGet200Response
     */
    status: StatusOK;
    /**
     * 
     * @type {Array<AuthenticatorListInner>}
     * @memberof AllauthClientV1AccountAuthenticatorsGet200Response
     */
    data: Array<AuthenticatorListInner>;
}



/**
 * Check if a given object implements the AllauthClientV1AccountAuthenticatorsGet200Response interface.
 */
export function instanceOfAllauthClientV1AccountAuthenticatorsGet200Response(value: object): value is AllauthClientV1AccountAuthenticatorsGet200Response {
    if (!('status' in value) || value['status'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function AllauthClientV1AccountAuthenticatorsGet200ResponseFromJSON(json: any): AllauthClientV1AccountAuthenticatorsGet200Response {
    return AllauthClientV1AccountAuthenticatorsGet200ResponseFromJSONTyped(json, false);
}

export function AllauthClientV1AccountAuthenticatorsGet200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AllauthClientV1AccountAuthenticatorsGet200Response {
    if (json == null) {
        return json;
    }
    return {
        
        'status': StatusOKFromJSON(json['status']),
        'data': ((json['data'] as Array<any>).map(AuthenticatorListInnerFromJSON)),
    };
}

export function AllauthClientV1AccountAuthenticatorsGet200ResponseToJSON(json: any): AllauthClientV1AccountAuthenticatorsGet200Response {
    return AllauthClientV1AccountAuthenticatorsGet200ResponseToJSONTyped(json, false);
}

export function AllauthClientV1AccountAuthenticatorsGet200ResponseToJSONTyped(value?: AllauthClientV1AccountAuthenticatorsGet200Response | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'status': StatusOKToJSON(value['status']),
        'data': ((value['data'] as Array<any>).map(AuthenticatorListInnerToJSON)),
    };
}


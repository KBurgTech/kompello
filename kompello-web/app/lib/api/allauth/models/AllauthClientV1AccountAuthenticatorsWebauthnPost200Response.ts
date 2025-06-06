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
import type { WebAuthnAuthenticator } from './WebAuthnAuthenticator';
import {
    WebAuthnAuthenticatorFromJSON,
    WebAuthnAuthenticatorFromJSONTyped,
    WebAuthnAuthenticatorToJSON,
    WebAuthnAuthenticatorToJSONTyped,
} from './WebAuthnAuthenticator';
import type { AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMeta } from './AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMeta';
import {
    AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMetaFromJSON,
    AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMetaFromJSONTyped,
    AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMetaToJSON,
    AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMetaToJSONTyped,
} from './AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMeta';
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
 * @interface AllauthClientV1AccountAuthenticatorsWebauthnPost200Response
 */
export interface AllauthClientV1AccountAuthenticatorsWebauthnPost200Response {
    /**
     * 
     * @type {StatusOK}
     * @memberof AllauthClientV1AccountAuthenticatorsWebauthnPost200Response
     */
    status: StatusOK;
    /**
     * 
     * @type {WebAuthnAuthenticator}
     * @memberof AllauthClientV1AccountAuthenticatorsWebauthnPost200Response
     */
    data: WebAuthnAuthenticator;
    /**
     * 
     * @type {AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMeta}
     * @memberof AllauthClientV1AccountAuthenticatorsWebauthnPost200Response
     */
    meta: AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMeta;
}



/**
 * Check if a given object implements the AllauthClientV1AccountAuthenticatorsWebauthnPost200Response interface.
 */
export function instanceOfAllauthClientV1AccountAuthenticatorsWebauthnPost200Response(value: object): value is AllauthClientV1AccountAuthenticatorsWebauthnPost200Response {
    if (!('status' in value) || value['status'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    if (!('meta' in value) || value['meta'] === undefined) return false;
    return true;
}

export function AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseFromJSON(json: any): AllauthClientV1AccountAuthenticatorsWebauthnPost200Response {
    return AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseFromJSONTyped(json, false);
}

export function AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AllauthClientV1AccountAuthenticatorsWebauthnPost200Response {
    if (json == null) {
        return json;
    }
    return {
        
        'status': StatusOKFromJSON(json['status']),
        'data': WebAuthnAuthenticatorFromJSON(json['data']),
        'meta': AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMetaFromJSON(json['meta']),
    };
}

export function AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseToJSON(json: any): AllauthClientV1AccountAuthenticatorsWebauthnPost200Response {
    return AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseToJSONTyped(json, false);
}

export function AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseToJSONTyped(value?: AllauthClientV1AccountAuthenticatorsWebauthnPost200Response | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'status': StatusOKToJSON(value['status']),
        'data': WebAuthnAuthenticatorToJSON(value['data']),
        'meta': AllauthClientV1AccountAuthenticatorsWebauthnPost200ResponseMetaToJSON(value['meta']),
    };
}


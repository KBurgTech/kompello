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
/**
 * The token.
 * 
 * @export
 * @interface ProviderTokenToken
 */
export interface ProviderTokenToken {
    /**
     * The client ID (in case of OAuth2 or OpenID Connect based providers)
     * 
     * @type {string}
     * @memberof ProviderTokenToken
     */
    clientId: string;
    /**
     * The ID token.
     * 
     * @type {string}
     * @memberof ProviderTokenToken
     */
    idToken?: string;
    /**
     * The access token.
     * 
     * @type {string}
     * @memberof ProviderTokenToken
     */
    accessToken?: string;
}

/**
 * Check if a given object implements the ProviderTokenToken interface.
 */
export function instanceOfProviderTokenToken(value: object): value is ProviderTokenToken {
    if (!('clientId' in value) || value['clientId'] === undefined) return false;
    return true;
}

export function ProviderTokenTokenFromJSON(json: any): ProviderTokenToken {
    return ProviderTokenTokenFromJSONTyped(json, false);
}

export function ProviderTokenTokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): ProviderTokenToken {
    if (json == null) {
        return json;
    }
    return {
        
        'clientId': json['client_id'],
        'idToken': json['id_token'] == null ? undefined : json['id_token'],
        'accessToken': json['access_token'] == null ? undefined : json['access_token'],
    };
}

export function ProviderTokenTokenToJSON(json: any): ProviderTokenToken {
    return ProviderTokenTokenToJSONTyped(json, false);
}

export function ProviderTokenTokenToJSONTyped(value?: ProviderTokenToken | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'client_id': value['clientId'],
        'id_token': value['idToken'],
        'access_token': value['accessToken'],
    };
}


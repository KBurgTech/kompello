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

/**
 * @type UserId
 * The user ID.
 * 
 * @export
 */
export type UserId = number | string;

export function UserIdFromJSON(json: any): UserId {
    return UserIdFromJSONTyped(json, false);
}

export function UserIdFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserId {
    if (json == null) {
        return json;
    }

    return {} as any;
}

export function UserIdToJSON(json: any): any {
    return UserIdToJSONTyped(json, false);
}

export function UserIdToJSONTyped(value?: UserId | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {};
}


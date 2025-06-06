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
import type { UserId } from './UserId';
import {
    UserIdFromJSON,
    UserIdFromJSONTyped,
    UserIdToJSON,
    UserIdToJSONTyped,
} from './UserId';

/**
 * 
 * @export
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {UserId}
     * @memberof User
     */
    id?: UserId;
    /**
     * The display name for the user.
     * 
     * @type {string}
     * @memberof User
     */
    display?: string;
    /**
     * Whether or not the account has a password set.
     * 
     * @type {boolean}
     * @memberof User
     */
    hasUsablePassword?: boolean;
    /**
     * The email address.
     * 
     * @type {string}
     * @memberof User
     */
    email?: string;
    /**
     * The username.
     * 
     * @type {string}
     * @memberof User
     */
    username?: string;
}

/**
 * Check if a given object implements the User interface.
 */
export function instanceOfUser(value: object): value is User {
    return true;
}

export function UserFromJSON(json: any): User {
    return UserFromJSONTyped(json, false);
}

export function UserFromJSONTyped(json: any, ignoreDiscriminator: boolean): User {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : UserIdFromJSON(json['id']),
        'display': json['display'] == null ? undefined : json['display'],
        'hasUsablePassword': json['has_usable_password'] == null ? undefined : json['has_usable_password'],
        'email': json['email'] == null ? undefined : json['email'],
        'username': json['username'] == null ? undefined : json['username'],
    };
}

export function UserToJSON(json: any): User {
    return UserToJSONTyped(json, false);
}

export function UserToJSONTyped(value?: User | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': UserIdToJSON(value['id']),
        'display': value['display'],
        'has_usable_password': value['hasUsablePassword'],
        'email': value['email'],
        'username': value['username'],
    };
}


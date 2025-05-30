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
 * The type of authenticator.
 * 
 * @export
 */
export const AuthenticatorType = {
    RecoveryCodes: 'recovery_codes',
    Totp: 'totp'
} as const;
export type AuthenticatorType = typeof AuthenticatorType[keyof typeof AuthenticatorType];


export function instanceOfAuthenticatorType(value: any): boolean {
    for (const key in AuthenticatorType) {
        if (Object.prototype.hasOwnProperty.call(AuthenticatorType, key)) {
            if (AuthenticatorType[key as keyof typeof AuthenticatorType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function AuthenticatorTypeFromJSON(json: any): AuthenticatorType {
    return AuthenticatorTypeFromJSONTyped(json, false);
}

export function AuthenticatorTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthenticatorType {
    return json as AuthenticatorType;
}

export function AuthenticatorTypeToJSON(value?: AuthenticatorType | null): any {
    return value as any;
}

export function AuthenticatorTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): AuthenticatorType {
    return value as AuthenticatorType;
}


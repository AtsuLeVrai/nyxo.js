import {describe, expect, it} from 'vitest';
import {ApiVersions, Boolean, GatewayOpcodes, Locales, Oauth2Scopes, Oauth2Urls, TimestampStyles} from '../src';

describe('ApiVersions Enum', () => {
    it('should have correct API versions', () => {
        expect(ApiVersions.V3).toBe(3);
        expect(ApiVersions.V10).toBe(10);
    });
});

describe('TimestampStyles Enum', () => {
    it('should have correct timestamp styles', () => {
        expect(TimestampStyles.LongDate).toBe('D');
        expect(TimestampStyles.ShortTime).toBe('t');
    });
});

describe('Boolean Type', () => {
    it('should allow valid boolean values', () => {
        const validValues: Boolean[] = ['True', 'False', 0, 1, false, true];
        validValues.forEach(value => {
            expect(value).toBeTypeOf(typeof value);
        });
    });
});

describe('Locales Enum', () => {
    it('should have correct locale codes', () => {
        expect(Locales.EnglishUs).toBe('en-US');
        expect(Locales.French).toBe('fr');
        expect(Locales.Japanese).toBe('ja');
        expect(Locales.SpanishLatam).toBe('es-419');
    });
});

describe('Oauth2Urls Enum', () => {
    it('should have correct OAuth2 URLs', () => {
        expect(Oauth2Urls.Authorize).toBe('https://discord.com/oauth2/authorize');
        expect(Oauth2Urls.Revoke).toBe('https://discord.com/api/oauth2/token/revoke');
        expect(Oauth2Urls.Token).toBe('https://discord.com/api/oauth2/token');
    });
});

describe('GatewayOpcodes Enum', () => {
    it('should have correct opcode values', () => {
        expect(GatewayOpcodes.Dispatch).toBe(0);
        expect(GatewayOpcodes.Heartbeat).toBe(1);
        expect(GatewayOpcodes.Identify).toBe(2);
        expect(GatewayOpcodes.Resume).toBe(6);
        expect(GatewayOpcodes.InvalidSession).toBe(9);
    });
});

describe('Oauth2Scopes Enum', () => {
    it('should have correct OAuth2 scopes', () => {
        expect(Oauth2Scopes.ActivitiesRead).toBe('activities.read');
        expect(Oauth2Scopes.ApplicationsBuildsRead).toBe('applications.builds.read');
    });
});
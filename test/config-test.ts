// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as config from '../lib/config';
import * as app from '../lib/application';
import * as host from '../lib/host';
import * as path from 'path';
import { metric } from 'napajs';

describe('winery/config', () => {
    describe('ObjectTypeConfig', () => {
        it('#fromConfigObject: good config', () => {
            let configObject = [
                {
                    typeName: "TypeA",
                    description: "Type A",
                    moduleName: "module",
                    functionName: "function",
                    exampleObjects: [{
                        _type: "TypeA",
                        value: 1
                    }]
                }
            ]
            let defs = config.ObjectTypeConfig.fromConfigObject(configObject, true);
            assert.deepEqual(defs, [
                {
                    typeName: "TypeA",
                    description: "Type A",
                    moduleName: "module",
                    functionName: "function",
                    // Set default property.
                    override: false,
                    exampleObjects: [{
                        _type: "TypeA",
                        value: 1
                    }]
                }
            ])
        });

        it('#fromConfigObject: not conform with schema', () => {
            let configObject = [
                {
                    // Should be typeName, missing exampleObjects
                    type: "TypeA",
                    moduleName: "module",
                    functionName: "function"
                }
            ]
            assert.throws(() => {
                 config.ObjectTypeConfig.fromConfigObject(configObject, true);
            });
        });

        it ('#fromConfig', () => {
            assert.doesNotThrow(() => {
                config.ObjectTypeConfig.fromConfig(
                    path.resolve(__dirname, "test-app/object-types.json"));
            });
        });
    });

    describe('ObjectProviderConfig', () => {
        it('#fromConfigObject: good config', () => {
            let configObject = [
                {
                    protocol: "protocolA",
                    description: "Protocol A",
                    moduleName: "module",
                    functionName: "function",
                    exampleUri: ["protocolA://abc"]

                }
            ]
            let defs = config.ObjectProviderConfig.fromConfigObject(configObject, true);
            assert.deepEqual(defs, [
                {
                    protocol: "protocolA",
                    description: "Protocol A",
                    moduleName: "module",
                    functionName: "function",
                    exampleUri: ["protocolA://abc"],
                    // Set default property.
                    override: false
                }
            ])
        });

        it('#fromConfigObject: not conform with schema', () => {
            let configObject = [
                {
                    protocol: "protocolA",
                    // Should be moduleName, and missing exampleUri.
                    module: "module",
                    functionName: "function"
                }
            ]
            assert.throws( () => {
                 config.ObjectProviderConfig.fromConfigObject(configObject, true);
            });
        });

        it ('#fromConfig', () => {
            assert.doesNotThrow(() => {
                config.ObjectProviderConfig.fromConfig(
                    path.resolve(__dirname, "test-app/object-providers.json"));
            });
        });
    });

    describe('NamedObjectConfig', () => {
        it('#fromConfigObject: good config', () => {
            let configObject = [
                {
                    name: "object1",
                    value: {
                        _type: "TypeA",
                        value: 1
                    }
                },
                {
                    name: "object2",
                    value: 1
                }
            ]
            
            let defs = config.NamedObjectConfig.fromConfigObject(configObject, true);
            assert.deepEqual(defs, [
                {
                    name: "object1",
                    value: {
                        _type: "TypeA",
                        value: 1
                    },
                    // Set default values.
                    override: false,
                    private: false
                },
                {
                    name: "object2",
                    value: 1,
                    override: false,
                    private: false
                }
            ])    
        });

        it('#fromConfigObject: not conform with schema', () => {
            let configObject = [
                {
                    name: "object1",
                    // Should be value.
                    valueDef: 1
                }
            ]
            assert.throws( () => {
                config.NamedObjectConfig.fromConfigObject(configObject, true);
            });    
        });

        it ('#fromConfig', () => {
            assert.doesNotThrow(() => {
                config.NamedObjectConfig.fromConfig(
                    path.resolve(__dirname, "test-app/objects.json"));
            });
        });
    });

    describe('MetricConfig', () => {
        it('#fromConfigObject: good config', () => {
            let configObject = [
                {
                    name: "myCounter1",
                    displayName: "My counter1",
                    description: "Counter description",
                    type: "Percentile",
                    dimensionNames: ["d1", "d2"]
                },
                {
                    name: "myCounter2",
                    displayName: "My counter2",
                    description: "Counter description",
                    type: "Rate",
                    dimensionNames: []
                },
                {
                    name: "myCounter3",
                    displayName: "My counter3",
                    description: "Counter description",
                    type: "Number",
                    dimensionNames: []
                }
            ]
            let defs = config.MetricConfig.fromConfigObject("DefaultSection", configObject);
            assert.deepEqual(defs, [
                {
                    name: "myCounter1",
                    sectionName: "DefaultSection",
                    displayName: "My counter1",
                    description: "Counter description",
                    type: metric.MetricType.Percentile,
                    dimensionNames: ["d1", "d2"]
                },
                {
                    name: "myCounter2",
                    sectionName: "DefaultSection",
                    displayName: "My counter2",
                    description: "Counter description",
                    type: metric.MetricType.Rate,
                    dimensionNames: []
                },
                {
                    name: "myCounter3",
                    sectionName: "DefaultSection",
                    displayName: "My counter3",
                    description: "Counter description",
                    type: metric.MetricType.Number,
                    dimensionNames: []
                }
            ])
        });

        it ('#fromConfig', () => {
            assert.doesNotThrow(() => {
                config.MetricConfig.fromConfig("DefaultSection",
                    path.resolve(__dirname, "test-app/metrics.json"));
            });
        });
    });

    let hostSettings: host.HostSettings = undefined;
    describe('HostConfig', () => {
        it('#fromConfig', () => {
            hostSettings = config.HostConfig.fromConfig(
                require.resolve("../config/host.json"));

            assert.equal(hostSettings.allowPerRequestOverride, true);
            assert.deepEqual(hostSettings.defaultExecutionStack, [
                "finalizeResponse",
                "executeEntryPoint"
            ]);
            assert.equal(hostSettings.baseDir, path.dirname(require.resolve('../config/host.json')));
            assert.equal(hostSettings.throwExceptionOnError, true);
        });
    });
    
    describe('ApplicationConfig', () => {
        let appSettings: app.ApplicationSettings = undefined;
        it('#fromConfig', () => {
            appSettings = config.ApplicationConfig.fromConfig(hostSettings,
                path.resolve(__dirname, "test-app/app.json"));

        });

        it('#getters', () => {
            assert.equal(appSettings.metrics.length, 1);
        })
    });
});

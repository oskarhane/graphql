/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Driver } from "neo4j-driver";
import { Neo4jGraphQL } from "../classes";
import { Context } from "../types";
import execute from "./execute";

describe("execute", () => {
    test("should execute return records.toObject", async () => {
        await Promise.all(
            ["READ", "WRITE"].map(async (access) => {
                const defaultAccessMode = access as "READ" | "WRITE";

                const cypher = `
                    CREATE (u:User {title: $title})
                    RETURN u { .title } as u
                `;

                const title = "some title";
                const params = { title };
                const records = [{ toObject: () => ({ title }) }];
                const database = "neo4j";
                const bookmarks = ["test"];

                // @ts-ignore
                const driver: Driver = {
                    // @ts-ignore
                    session: (options) => {
                        expect(options).toMatchObject({ defaultAccessMode, database, bookmarks });

                        const tx = {
                            run: (paramCypher, paramParams) => {
                                expect(paramCypher).toEqual(cypher);
                                expect(paramParams).toEqual(params);

                                return { records };
                            },
                        };

                        return {
                            readTransaction: (fn) => {
                                // @ts-ignore
                                return fn(tx);
                            },
                            writeTransaction: (fn) => {
                                // @ts-ignore
                                return fn(tx);
                            },
                            close: () => true,
                        };
                    },
                };

                // @ts-ignore
                const neoSchema: Neo4jGraphQL = {
                    // @ts-ignore
                    options: {},
                    debug: (message) => {
                        expect(message).toEqual(`Cypher: ${cypher}\nParams: ${JSON.stringify(params, null, 2)}`);
                    },
                };

                const result = await execute({
                    cypher,
                    params,
                    defaultAccessMode,
                    context: { driverConfig: { database, bookmarks }, neoSchema, driver } as Context,
                });

                expect(result).toEqual([{ title }]);
            })
        );
    });
});

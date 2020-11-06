import { Auth, Node } from "../../../src/classes";
import createAuthAndParams from "../../../src/translate/create-auth-and-params";

describe("createAuthAndParams", () => {
    test("should return the correct auth and params", () => {
        const auth: Auth = {
            type: "JWT",
            rules: [{ allow: { id: "sub" } }],
        };

        // @ts-ignore
        const node: Node = {
            name: "Movie",
            primitiveFields: [
                {
                    fieldName: "id",
                    typeMeta: {
                        name: "ID",
                        array: true,
                        required: false,
                        pretty: "ID!",
                    },
                    otherDirectives: [],
                    arguments: [],
                },
            ],
            relationFields: [],
            auth,
        };

        // @ts-ignore
        const neoSchema: NeoSchema = {
            nodes: [node],
        };

        const [str, params] = createAuthAndParams({
            jwt: { sub: "123" },
            neoSchema,
            node,
            rules: auth.rules,
            varName: "this",
        });

        expect(str).toEqual(`CALL apoc.util.validate(NOT(this.id = $this_auth0_id), "Forbidden", [0])`);
        expect(params).toMatchObject({ this_auth0_id: "123" });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const _1 = require(".");
const test = () => {
    const test1 = _1.filePathUtils.combineFolderPath("protected", {
        orgScope: "timely-gpt",
        spaceId: "1234567890",
        userId: "1234567890",
    });
    console.log("combineFolderPath", test1);
    const test11 = _1.filePathUtils.combineFolderPath("protected", {
        orgScope: "timely-gpt",
        spaceId: "1234567890",
        userId: "1234567890",
        subjects: [["group", "group-id123"]],
        spaceMemberId: "smid_191292",
    });
    console.log("combineFolderPath", test11);
    const test2 = _1.filePathUtils.combineFilePath("protected", {
        orgScope: "timely-gpt",
        spaceId: "1234567890",
        userId: "1234567890",
    }, ".txt");
    console.log("combineFilePath", test2);
    const test3 = _1.filePathUtils.combineFilePath("protected", {
        orgScope: "timely-gpt",
        spaceId: "sid_19213",
        userId: "uid_128723",
        subjects: [["group", "group-id123"]],
        purpose: "CHAT",
        spaceMemberId: "smid_191292",
    }, ".txt");
    console.log("combineFilePath", test3);
};
exports.test = test;
(0, exports.test)();
//# sourceMappingURL=test.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const _1 = require(".");
const test = () => {
    // const test1 = filePathUtils.combineFolderPath("protected", {
    //   orgScope: "timely-gpt",
    //   spaceId: "1234567890",
    //   userId: "1234567890",
    // });
    // console.log("combineFolderPath", test1);
    const test11 = _1.filePathUtils.combineFolderPath("protected", {
        orgScope: "timely-gpt",
        spaceId: "1234567890",
        userId: "1234567890",
        subjects: [["groupid", "group-id123"]],
        spaceMemberId: "smid_191292",
    });
    console.log("combineFolderPath", test11);
    const reverted11 = _1.filePathUtils.revertFilePath(test11);
    console.log("reverted11", JSON.stringify(reverted11, null, 2));
    const test2 = _1.filePathUtils.combineFilePath("protected", {
        orgScope: "timely-gpt",
        spaceId: "1234567890",
        userId: "1234567890",
        purpose: "CH_-AT",
    }, ".txt");
    console.log("combineFilePath", test2);
    const reverted2 = _1.filePathUtils.revertFilePath(test2);
    console.log("reverted2", JSON.stringify(reverted2, null, 2));
    const test3 = _1.filePathUtils.buildUploadInfo({
        file: {
            name: "test.txt",
            type: "text/plain",
            size: 100,
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZjMyMWRiZS1kMTQ3LTRiNGEtYmI1Yi1jNTc4M2JjZDViZTEiLCJybCI6IlJPTEVfTUFTVEVSIiwic3BhY2VJZCI6IjczMjBlM2NiLWMwNTctNDYyZi1iZDEyLWNmYzU0NzA4NGU3OCIsInNwYWNlTWVtYmVySWQiOiIxIiwic3BhY2VSb2xlIjoiUk9MRV9TUEFDRV9BRE1JTiIsInQiOiJBIiwic2Vzc2lvblNjb3BlZCI6ZmFsc2UsImlhdCI6MTc3NTAwODQ3NiwiZXhwIjoxODA2NTQ0NDc2LCJpc3MiOiJ0aW1lbHlncHQifQ.HBsM0XczYigpZnP0wESrMF7L3pAbP1SeygZWQeT8DXE",
        pathType: "org/space/user",
    });
    console.log("buildUploadInfo", test3);
    // const test3 = filePathUtils.combineFilePath(
    //   "protected",
    //   {
    //     orgScope: "timely-gpt",
    //     spaceId: "sid_19213",
    //     userId: "uid_128723",
    //     subjects: [["group-id", "group-id123"]],
    //     purpose: "CHAT",
    //     spaceMemberId: "smid_191292",
    //   },
    //   ".txt",
    // );
    // console.log("combineFilePath", test3);
    // const reverted = filePathUtils.revertFilePath(test3);
    // console.log("reverted", JSON.stringify(reverted, null, 2));
    // const reverted1 = filePathUtils.revertFilePath(test11);
    // console.log("reverted1", JSON.stringify(reverted1, null, 2));
    // const reverted2 = filePathUtils.revertFilePath(test2);
    // console.log("reverted2", JSON.stringify(reverted2, null, 2));
    // const reverted3 = filePathUtils.revertFilePath(test3);
    // console.log("reverted3", JSON.stringify(reverted3, null, 2));
};
exports.test = test;
(0, exports.test)();
//# sourceMappingURL=test.js.map
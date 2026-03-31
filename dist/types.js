"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATH_TYPES = exports.SUBJECT_KEY_PREFIX_REGEX = exports.FILE_NAME_DELIMETER = exports.DIRECTORY_DELIMETER = exports.prefixMap = exports.CONTAINERS = void 0;
exports.CONTAINERS = ["protected", "public", "temp"];
exports.prefixMap = {
    orgScope: "o",
    spaceId: "s",
    userId: "u",
    subjects: "sub",
    spaceMemberId: "sm",
    purpose: "p",
};
exports.DIRECTORY_DELIMETER = "-";
exports.FILE_NAME_DELIMETER = "_";
exports.SUBJECT_KEY_PREFIX_REGEX = /^[a-z_]+$/;
exports.PATH_TYPES = ["org/space/user", "org/space", "org/user"];
//# sourceMappingURL=types.js.map
import { filePathUtils } from ".";

export const test = () => {
  const test1 = filePathUtils.combineFolderPath("protected", {
    orgScope: "timely-gpt",
    spaceId: "1234567890",
    userId: "1234567890",
  });
  console.log("combineFolderPath", test1);
  const test11 = filePathUtils.combineFolderPath("protected", {
    orgScope: "timely-gpt",
    spaceId: "1234567890",
    userId: "1234567890",
    subjects: [["group", "group-id123"]],
    spaceMemberId: "smid_191292",
  });
  console.log("combineFolderPath", test11);

  const test2 = filePathUtils.combineFilePath(
    "protected",
    {
      orgScope: "timely-gpt",
      spaceId: "1234567890",
      userId: "1234567890",
    },
    ".txt",
  );
  console.log("combineFilePath", test2);

  const test3 = filePathUtils.combineFilePath(
    "protected",
    {
      orgScope: "timely-gpt",
      spaceId: "sid_19213",
      userId: "uid_128723",
      subjects: [["group", "group-id123"]],
      purpose: "CHAT",
      spaceMemberId: "smid_191292",
    },
    ".txt",
  );
  console.log("combineFilePath", test3);
};

test();

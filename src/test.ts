import { filePathUtils } from ".";

export const test = () => {
  const test1 = filePathUtils.combineFolderPath("protected", {
    orgScope: "timely-gpt",
    spaceId: "1234567890",
    userId: "1234567890",
  });
  console.log("combineFolderPath", test1);

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
};

test();

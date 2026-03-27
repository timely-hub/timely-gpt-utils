import { filePathUtils } from ".";

export const test = () => {
  const result = filePathUtils.deleteTargetByPathType(
    "protected",
    {
      orgScope: "timely-gpt",
      spaceId: "1234567890",
      userId: "1234567890",
    },
    "org/space",
  );
  console.log(result);
};

test();

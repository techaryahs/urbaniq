import type { Park } from "../services/parkService";

export const getParkConditionStats = (parks: Park[]) => {
  let good = 0;
  let fair = 0;
  let poor = 0;

  parks.forEach((park) => {
    if (park.condition === "Good") good++;
    else if (park.condition === "Fair") fair++;
    else if (park.condition === "Poor") poor++;
  });

  return { good, fair, poor, total: parks.length };
};

export const getUserPair = (user1: number, user2: number) => {
  return {
    u1: Math.min(user1, user2),
    u2: Math.max(user1, user2),
  };
};

import { getMe, listUsers, createUser, updateUserStatus } from "./user.service.js";

export const getMeController = async (req, res) => {
  const user = await getMe(req.user.userId);

  res.json({ success: true, data: { user } });
};

export const listUsersController = async (req, res) => {
  const users = await listUsers(req.restaurantId);

  res.json({ success: true, data: { users } });
};

export const createUserController = async (req, res) => {
  const user = await createUser(req.restaurantId, req.body);

  res.status(201).json({ success: true, data: { user } });
};

export const updateUserStatusController = async (req, res) => {
  const user = await updateUserStatus(
    req.restaurantId,
    req.user.userId,
    req.params.id,
    req.body.actif
  );

  res.json({ success: true, data: { user } });
};
import {
  listTables,
  createTable,
  deleteTable,
} from "./table.service.js";

export const listTablesController = async (req, res) => {
  const tables = await listTables(req.restaurantId);

  res.json({ success: true, data: { tables } });
};

export const createTableController = async (req, res) => {
  const table = await createTable(req.restaurantId, req.body);

  res.status(201).json({ success: true, data: { table } });
};

export const deleteTableController = async (req, res) => {
  const result = await deleteTable(req.restaurantId, req.params.id);

  res.json({ success: true, data: result });
};

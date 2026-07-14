import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes, { meRouter } from "./modules/users/user.routes.js";
import adminRestaurantRoutes from "./modules/admin/admin.routes.js";
import categoryRoutes from "./modules/menu/category.routes.js";
import dishRoutes from "./modules/menu/dish.routes.js";
import tableRoutes from "./modules/menu/table.routes.js";
import publicMenuRoutes from "./modules/menu/public.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/admin/restaurants", adminRestaurantRoutes);
app.use("/api/v1/menu/categories", categoryRoutes);
app.use("/api/v1/menu/dishes", dishRoutes);
app.use("/api/v1/tables", tableRoutes);

// Routes publiques — hors de tout middleware d'authentification
app.use("/api/v1/public", publicMenuRoutes);

app.use(errorHandler);

export default app;

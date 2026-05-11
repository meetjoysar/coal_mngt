import { Router } from "express";
import { coalSizeRoutes, customerRoutes, firmRoutes, supplierRoutes, transporterRoutes } from "./masterRoutes";
import { dispatchRoutes } from "./dispatchRoutes";
import { purchaseOrderRoutes } from "./purchaseOrderRoutes";
import { authRoutes } from "./authRoutes";
import { requireAdminForMutations, requireAuth } from "../middleware/auth";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "coal-mngt-backend" });
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use(requireAuth);
apiRoutes.use(requireAdminForMutations);

apiRoutes.use("/firms", firmRoutes);
apiRoutes.use("/customers", customerRoutes);
apiRoutes.use("/suppliers", supplierRoutes);
apiRoutes.use("/transporters", transporterRoutes);
apiRoutes.use("/coal-sizes", coalSizeRoutes);
apiRoutes.use("/purchase-orders", purchaseOrderRoutes);
apiRoutes.use("/dispatches", dispatchRoutes);
